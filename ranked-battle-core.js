/* Deterministic ranked combat shared by the tutorial and authoritative rooms. */
(() => {
  'use strict';
  const C = globalThis.SpaceTowerCatalog, E = globalThis.SpaceTowerRankedEnemies;
  // 4 columns × 4 rows of turret pads (16 slots).
  const SLOT_COUNT = 16, MAX_STAR = 10, MAX_UPGRADE = 10, WAVE_SECONDS = 20;
  // A 4 x 3 turret grid inside a square loop. Enemies enter at the gate on the
  // edge facing the rival, run one clockwise lap and strike the core at its end.
  const positions = Object.freeze(Array.from({length:SLOT_COUNT},(_,i)=>Object.freeze([(-1.5+i%4)*.33,(-1.5+Math.floor(i/4))*.3])));
  const TRACK = Object.freeze({w:.78,h:.76,start:.12,end:-.26});
  const CORE = Object.freeze([TRACK.end-.02,-TRACK.h]);
  const CORNER = .1, PATH_SPEED = 2.1, COUNTER_KILLS = 12, MAX_COUNTERS = 3, CORE_DAMAGE = .35;
  // More, smaller shots: twice the fire rate at half damage (and half armour per hit) keeps DPS while filling the sky.
  const FIRE_RATE = 2, SHOT_SCALE = .5, BASE_CRIT = .08, CRIT_PER_LEVEL = .015, LUCKY_SUMMON = .08;
  const segments = (()=>{const {w,h,start,end}=TRACK,points=[[start,-h],[w,-h],[w,h],[-w,h],[-w,-h],[end,-h]],list=[];let at=0;
    for(let i=0;i<points.length-1;i++){const [x1,y1]=points[i],[x2,y2]=points[i+1],length=Math.hypot(x2-x1,y2-y1);list.push({x1,y1,dx:(x2-x1)/length,dy:(y2-y1)/length,at,length});at+=length;}
    return Object.freeze(list);})();
  const PATH_LENGTH = segments[segments.length-1].at+segments[segments.length-1].length;
  const MAX_TRANSFER_LOAD = 200;
  // Distance from a slot to the nearest point of the track, plus a little, so an orbit centred there sweeps the lane.
  const orbitCache=new Map();
  function orbitRadius(x,y){const key=x.toFixed(3)+','+y.toFixed(3);if(orbitCache.has(key))return orbitCache.get(key);let best=9;for(let d=0;d<=PATH_LENGTH;d+=.02){const q=pathPoint(d);best=Math.min(best,Math.hypot(q.x-x,q.y-y));}const r=best+.06;orbitCache.set(key,r);return r;}
  function pathPoint(distance) {
    const d=Math.max(0,Math.min(PATH_LENGTH,distance));let seg=segments[0];
    for(const item of segments)if(d>=item.at)seg=item;
    const t=d-seg.at,i=segments.indexOf(seg);
    // Corners are rounded (matching the drawn track) so ships bank smoothly
    // instead of snapping 90 degrees; lanes follow the same curve.
    const prev=t<CORNER&&i>0?segments[i-1]:null,next=!prev&&t>seg.length-CORNER&&i<segments.length-1?segments[i+1]:null;
    if(prev||next){const a=prev||seg,b=prev?seg:next,cx=b.x1,cy=b.y1,u=prev?.5+t/(2*CORNER):(t-(seg.length-CORNER))/(2*CORNER);
      const p0x=cx-a.dx*CORNER,p0y=cy-a.dy*CORNER,p2x=cx+b.dx*CORNER,p2y=cy+b.dy*CORNER,v=1-u;
      return {x:v*v*p0x+2*u*v*cx+u*u*p2x,y:v*v*p0y+2*u*v*cy+u*u*p2y,heading:Math.atan2(v*(cy-p0y)+u*(p2y-cy),v*(cx-p0x)+u*(p2x-cx))};}
    return {x:seg.x1+seg.dx*t,y:seg.y1+seg.dy*t,heading:Math.atan2(seg.dy,seg.dx)};
  }
  function place(e) {const p=pathPoint(e.s),lane=e.lane||0;e.heading=p.heading;e.x=p.x-Math.sin(p.heading)*lane;e.y=p.y+Math.cos(p.heading)*lane;}
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  function random(m) {m.seed=(Math.imul(m.seed,1664525)+1013904223)>>>0;return m.seed/4294967296;}
  const pick=(m,list)=>list[Math.floor(random(m)*list.length)];
  const starRate=star=>1+.4*(clamp(Math.floor(Number(star)||1),1,MAX_STAR)-1);
  const summonCost=s=>10*(s.draws+1), upgradeCost=(s,key)=>10*(s.upgrades[key]+1);
  function side(loadout,bot=null) {
    const typeHp=Object.fromEntries(loadout.map(id=>[id,Math.max(1,Math.round(C.health(id)*(bot?.hpScale??1)))]));
    const initialHp=Object.values(typeHp).reduce((a,b)=>a+b,0);
    return {loadout:[...loadout],typeHp,bot,initialHp,maxHp:initialHp,hp:initialHp,
      coins:150,draws:0,units:Array(SLOT_COUNT).fill(null),enemies:[],projectiles:[],spentProjectiles:[],beams:[],voids:[],walls:[],phoenixes:[],pentas:[],shurikens:[],freezes:[],moons:[],constellations:[],leviathans:[],crowns:[],singularities:[],sunrays:[],hymns:[],fires:[],mines:[],impacts:[],popups:[],aiActions:{summon:0,merge:0,upgrade:0},
      upgrades:{speed:0,physical:0,hp:0,magic:0,crit:0},kills:0,sent:0,received:0,leaked:0,lost:0,counters:0,counterKills:0,countersUsed:0,
      wave:0,spawnRemaining:0,spawnTimer:.7,aiTimer:.6,shieldsUsed:false,shieldCharges:0,healBudget:0,lastHpUpgrade:null};
  }
  function create({loadout,opponentLoadout=loadout,seed=20261017,ratings=[1200,1200],streaks=[{wins:0,losses:0},{wins:0,losses:0}],bots=[null,null]}={}) {
    return {seed:Number(seed)>>>0,elapsed:0,wave:1,status:'playing',winner:null,nextId:1,sides:[side(loadout,bots[0]),side(opponentLoadout,bots[1])],transferEvents:[],
      ratings:ratings.map(v=>Math.max(0,Math.round(Number(v)||0))),streaks:streaks.map(s=>({wins:Math.max(0,Math.floor(s.wins||0)),losses:Math.max(0,Math.floor(s.losses||0))})),results:null};
  }
  function resultFor(rating,opponentRating,streak,outcome) {
    const expected=1/(1+Math.pow(10,clamp((opponentRating-rating)/400,-4,4)));
    const rebound=outcome==='win'?Math.min(24,Math.round(3.5*Math.pow(streak.losses,1.35))):0;
    const reversal=outcome==='loss'?Math.min(32,Math.round(4*Math.pow(streak.wins,1.4))):0;
    const base=outcome==='win'?Math.round(clamp(48*(1-expected),12,36)):outcome==='loss'?Math.ceil(clamp(48*expected,12,36)*(1+Math.min(.35,Math.max(0,rating-1000)/6000))):0;
    const delta=outcome==='win'?base+rebound:outcome==='loss'?-base-reversal:0,ratingAfter=Math.max(0,rating+delta);
    return {outcome,ratingBefore:rating,ratingAfter,cups:ratingAfter-rating,obsidian:outcome==='win'?100:25,rebound,reversal,
      streak:outcome==='win'?{wins:streak.wins+1,losses:0}:outcome==='loss'?{wins:0,losses:streak.losses+1}:{wins:0,losses:0}};
  }
  function makeUnit(m,s,id,star,slot,ratio=1) {
    const maxHp=s.typeHp[id];
    return {uid:m.nextId++,id,star,slot,maxHp,hp:Math.max(1,Math.round(maxHp*ratio)),timer:.15,attacks:0,kills:0,born:m.elapsed,angle:-Math.PI/2,firedAt:-1,hitAt:-1};
  }
  function summon(m,index) {
    const s=m.sides[index];if(m.status!=='playing'||!s)return {ok:false,reason:'戰鬥已結束'};
    const empty=s.units.map((u,i)=>u?-1:i).filter(i=>i>=0),cost=summonCost(s);
    if(!empty.length)return {ok:false,reason:'場上已滿，請融合砲台'};
    if(s.coins<cost)return {ok:false,reason:'金幣不足'};
    const slot=pick(m,empty),id=pick(m,s.loadout),lucky=random(m)<LUCKY_SUMMON,star=lucky?2:1;s.coins-=cost;s.draws++;s.units[slot]=makeUnit(m,s,id,star,slot);
    impact(m,s,...positions[slot],id,lucky?'lucky':'summon');return {ok:true,slot,id,cost,star,lucky};
  }
  function merge(m,index,from,to) {
    const s=m.sides[index];if(m.status!=='playing'||!s||from===to)return {ok:false,reason:'請選擇另一座相同砲台'};
    const a=s.units[from],b=s.units[to];
    if(!a||!b||a.id!==b.id||a.star!==b.star)return {ok:false,reason:'需要同種類、同星級的兩座砲台'};
    if(a.star>=MAX_STAR)return {ok:false,reason:'已達 10 星上限'};
    const id=pick(m,s.loadout),star=a.star+1,ratio=((a.hp/a.maxHp)+(b.hp/b.maxHp))/2;
    s.units[from]=null;s.units[to]=makeUnit(m,s,id,star,to,ratio);impact(m,s,...positions[to],id,'merge');
    popup(m,s,...positions[to],`★ ${star}`,'#ffe2a3',true);return {ok:true,id,star,slot:to};
  }
  function upgrade(m,index,key) {
    const s=m.sides[index];if(m.status!=='playing'||!s||!Object.hasOwn(s.upgrades,key))return {ok:false,reason:'無法升級'};
    if(s.upgrades[key]>=MAX_UPGRADE)return {ok:false,reason:'已達強化上限'};
    const cost=upgradeCost(s,key);if(s.coins<cost)return {ok:false,reason:'金幣不足'};
    s.coins-=cost;s.upgrades[key]++;
    let health=null;
    if(key==='hp') {
      const id=pick(m,s.loadout),before=s.typeHp[id],delta=Math.max(1,Math.round(C.health(id)*.1));
      s.typeHp[id]+=delta;s.maxHp+=delta;s.hp=Math.min(s.maxHp,s.hp+delta);
      for(const u of s.units)if(u?.id===id){u.maxHp+=delta;u.hp+=delta;popup(m,s,...positions[u.slot],`+${delta} HP`,'#9affcd',true);}
      health={id,before,after:s.typeHp[id],delta,at:m.elapsed};s.lastHpUpgrade=health;
    }
    return {ok:true,cost,health};
  }
  // Normal-mode wave-one base values, early-wave pacing and enemy type multipliers.
  function waveStats(wave) {
    const w=Math.max(0,wave-1),factor=wave<=20?.5+w/38:1;
    const rawCount=Math.round(Math.min(240,8+w*.055+Math.sqrt(w)*2.8+Math.floor(w/100)*1.8));
    return {hp:Math.max(1,Math.round((E.base.hp+w*5+Math.pow(w,1.3)*.6)*factor))*2*(1+Math.min(1.5,Math.max(0,wave-60)*.02)),
      speed:(E.base.speed+Math.floor(w/7))/180,damage:Math.round(E.base.collisionDamage+w*.24+Math.pow(w,1.07)*.04),
      physicalDefense:Math.floor(w/7+Math.pow(w,1.08)*.12),magicDefense:Math.floor(w/10+Math.pow(w,1.05)*.08),
      count:Math.round((wave<=20?Math.min(240,Math.max(rawCount+2,Math.round(rawCount/factor))):rawCount)*1.2),
      interval:Math.max(.24,(.78-Math.floor(w/75)*.018)*(wave<=20?Math.max(.58,factor*.88):1))};
  }
  // Ranked matches use the existing type weights from wave one; long solo-mode
  // unlock gates do not fit a duel. Relative weight growth and caps are retained.
  function enemyPool(wave) {
    const age=Math.max(0,Math.floor(Number(wave)||1)-1);
    // Special ships join one or two kinds per wave (rankedUnlockWave), so early waves stay readable.
    const pool=Object.entries(E.types).map(([key,t])=>({key,weight:(Number(wave)||1)<(t.rankedUnlockWave||1)?0:clamp(t.weight+age*(t.weightGrowth||0),t.minWeight??0,t.maxWeight??Infinity)}));
    const total=pool.reduce((sum,e)=>sum+e.weight,0);
    return pool.map(e=>({...e,probability:e.weight/total}));
  }
  function enemyKind(m,wave) {
    const pool=enemyPool(wave);
    let roll=random(m)*pool.reduce((sum,e)=>sum+e.weight,0);
    for(const e of pool){roll-=e.weight;if(roll<=0&&e.weight)return e.key;}return 'basic';
  }
  function spawn(m,index,options={}) {
    const s=m.sides[index];if(!s)return null;
    if(typeof options!=='object')options={};
    const template=options.template,kind=template?.kind||options.kind||enemyKind(m,m.wave),isBoss=kind.startsWith('boss_'),d=(isBoss?E.bosses[kind.slice(5)]:E.types[kind])||E.types.basic;
    const stats=waveStats(options.wave||m.wave),angle=random(m)*Math.PI*2;
    const maxHp=template?.maxHp||Math.max(1,Math.round(stats.hp*d.hpScale));
    const enemy={...d,id:m.nextId++,lineage:template?.lineage||m.nextId,kind,isBoss,wave:template?.wave||m.wave,
      s:options.s??0,lane:0,x:0,y:0,heading:0,hp:maxHp,maxHp,
      damage:template?.damage||Math.max(1,Math.round(stats.damage*d.collisionScale*(isBoss?5:1))),speed:template?.speed||stats.speed*d.speedScale,
      physicalDefense:template?.physicalDefense??Math.round(stats.physicalDefense*(d.physicalDefenseScale||1))+(d.physicalDefenseBonus||0),
      magicDefense:template?.magicDefense??Math.round(stats.magicDefense*(d.magicDefenseScale||1)),
      generation:template?template.generation+1:0,entered:m.elapsed,slow:0,slowUntil:0,burn:0,burnUntil:0,burnOwner:null,
      vulnerability:0,markUntil:0,weakUntil:0,weaken:0,attackTimer:0,abilityTimer:2,bossTimer:10,escortTimer:3,flash:0,hitKick:0,wobble:angle,trail:[],
      shieldHp:d.shieldScale?maxHp*d.shieldScale:0,maxShieldHp:d.shieldScale?maxHp*d.shieldScale:0};
    if(options.hpScale)enemy.maxHp=enemy.hp=Math.max(1,Math.round(enemy.maxHp*options.hpScale));
    if(options.counter)enemy.counter=true;
    place(enemy);s.enemies.push(enemy);
    if(template){s.received++;impact(m,s,enemy.x,enemy.y,null,'arrival');}
    return enemy;
  }
  function popup(m,s,x,y,text,color,large=false,tier=0) {s.popups.push({x,y,text:String(text),color,large,tier,born:m.elapsed,until:m.elapsed+(tier?1:.85)});}
  function impact(m,s,x,y,id,kind='hit') {s.impacts.push({x,y,id,kind,born:m.elapsed,until:m.elapsed+(kind==='hit'?.7:.95)});}
  function effects(s,at=null) {
    let shield=0,slow=0,crit=0,speed=0,resonance=false;
    for(const u of s.units)if(u&&u.hp>0){const d=C.byId.get(u.id),scale=1+.08*(u.star-1),p=positions[u.slot];
      if(d.shield)shield+=(d.rankedShield??.02)*scale;
      if(d.slowAura&&(!at||Math.hypot(p[0]-at[0],p[1]-at[1])<.48))slow+=(d.rankedSlowAura??d.slowAura)*scale;
      if(d.vitalAura&&at){const r=Math.hypot(p[0]-at[0],p[1]-at[1]);if(r>.001&&r<.42)speed+=d.vitalAura*scale;}
      if(d.critAura&&(!at||Math.hypot(p[0]-at[0],p[1]-at[1])<.42)){crit+=(d.rankedCritAura??d.critAura)*scale;if(d.resonance&&at)resonance=true;}
    }
    return {resonance,shield:Math.min(.3,shield),slow:Math.min(.35,slow),crit:Math.min(.25,crit),speed:Math.min(.3,speed)};
  }
  function damage(m,index,e,value,owner,area=false,crit=false,dot=false) {
    if(e.hp<=0)return;
    const s=m.sides[index],d=C.byId.get(owner?.id),defense=d?.damageType==='magic'?e.magicDefense:e.physicalDefense;
    let amount=Math.max(dot?0:.5,value*(s.bot?.damageScale??1)-(dot?0:(defense||0)*SHOT_SCALE))*(1+(e.markUntil>m.elapsed?e.vulnerability:0));
    if(e.ability==='frontal_shield'&&!area&&owner){const p=positions[owner.slot],a=Math.atan2(p[1]-e.y,p[0]-e.x),face=e.heading||0;if(Math.cos(a-face)>.48)amount*=.25;}
    if(e.shieldHp>0){const absorbed=Math.min(e.shieldHp,amount);e.shieldHp-=absorbed;amount-=absorbed;}
    e.hp-=amount;e.flash=.07;e.hitKick=.6;
    if(s.timeStop&&s.timeStop.until>m.elapsed&&!s.timeStop.releasing)e.stopDmg=(e.stopDmg||0)+amount;
    // Quantum entanglement: damage to one entangled ship echoes (a share) into every other entangled ship.
    if(!dot&&!m.mirroring&&e.entUntil>m.elapsed&&amount>=1){m.mirroring=true;const share=amount*(s.entShare||.25);let any=false;for(const o of s.enemies)if(o!==e&&o.hp>0&&o.entUntil>m.elapsed){damage(m,index,o,share,owner,true,false,true);any=true;}m.mirroring=false;if(any)s.entPulse=m.elapsed;}
    // Execution mark: a marked non-boss ship that drops under the threshold is finished off.
    if(e.hp>0&&!e.isBoss&&e.markExecute&&e.markUntil>m.elapsed&&e.hp<e.maxHp*e.markExecute){impact(m,s,e.x,e.y,'vulnerability_mark','execute');popup(m,s,e.x,e.y-.05,'處決','#ff6f91');e.hp=0;}
    // Every hit shows its own number. Plain hits are tiny, short-lived "chip"
    // numbers sized by damage; crits keep the big tiered popup.
    if(!dot&&amount>=.5){if(crit){const tier=amount>=e.maxHp*.5?2:1;popup(m,s,e.x,e.y,`${tier===2?'致命 ':'暴擊 '}${Math.round(amount)}`,tier===2?'#ff5d7a':'#ffe7a0',true,tier);}
      else s.popups.push({x:e.x,y:e.y,text:String(Math.max(1,Math.round(amount))),color:d?.damageType==='magic'?'#e3ccff':'#ffffff',chip:Math.round(amount),born:m.elapsed,until:m.elapsed+.42});}
    if(e.hp>0)return;
    if(e.breached){e.hp=0;return;}
    e.hp=0;e.diedAt=m.elapsed;e.killedBy=owner;s.kills++;s.coins+=behind(m,index)?12:8;if(owner)owner.kills++;
    if(s.counters<MAX_COUNTERS){if(++s.counterKills>=COUNTER_KILLS){s.counters++;s.counterKills=0;}}
    impact(m,s,e.x,e.y,owner?.id,'kill');
    // Spreading flame: a burning ship that dies passes its fire to the nearest ship.
    if(e.burnUntil>m.elapsed&&e.burnOwner&&C.byId.get(e.burnOwner.id)?.burnSpread){const next=s.enemies.filter(o=>o.hp>0&&o!==e&&!(o.s<0)).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];
      if(next&&Math.hypot(next.x-e.x,next.y-e.y)<.45){next.burn=Math.max(next.burn||0,e.burn);next.burnUntil=m.elapsed+4;next.burnOwner=e.burnOwner;s.beams.push({x:e.x,y:e.y,tx:next.x,ty:next.y,id:e.burnOwner.id,arc:true,born:m.elapsed,until:m.elapsed+.3});}}
    // Every kill transfers exactly one revived enemy, including enemies received earlier.
    // Safety valve: a board already holding MAX_TRANSFER_LOAD ships receives no more transfers, so heavy-control
    // mirrors cannot snowball into thousands of ships (unplayable on phones).
    if(m.sides[1-index].enemies.length<MAX_TRANSFER_LOAD){spawn(m,1-index,{template:e});s.sent++;m.transferEvents.push({side:index,lineage:e.lineage,at:m.elapsed,until:m.elapsed+.65});}
    if(e.ability==='splitter')for(let i=0;i<2;i++){const child=spawn(m,index,{kind:'runner',wave:e.wave,s:Math.max(0,e.s+(i?-.05:.05))});child.hp=child.maxHp=Math.max(1,e.maxHp*.21);}
    if(d?.lifeSteal){const heal=Math.min(s.maxHp*(d.rankedLifeSteal??d.lifeSteal),s.healBudget);s.hp=Math.min(s.maxHp,s.hp+heal);s.healBudget-=heal;
      // The soul visibly flies from the wreck to the core.
      s.beams.push({x:e.x,y:e.y,tx:CORE[0],ty:CORE[1],id:owner?.id,soul:true,born:m.elapsed,until:m.elapsed+.7});if(heal>=1)popup(m,s,CORE[0],CORE[1]+.2,`+${Math.round(heal)}`,'#85ffb6');}
  }
  function hit(m,index,p,target) {
    const s=m.sides[index],u=p.owner,d=C.byId.get(p.id);
    impact(m,s,p.x,p.y,p.id,d.swordVolley?'ink':'hit');if(d.antimatter){impact(m,s,p.x,p.y,p.id,'annihilate');const amB=(d.antimatterBase||0)*32*(1+.1*s.upgrades.magic)*SHOT_SCALE;for(const o of s.enemies)if(o!==target&&o.hp>0&&!(o.s<0)&&Math.hypot(o.x-p.x,o.y-p.y)<(d.antimatterRadius||.22))damage(m,index,o,o.maxHp*d.antimatter*(o.isBoss?.5:1)+amB,u,true);}if(d.tideEvery&&p.charged){impact(m,s,p.x,p.y,p.id,'tide');if(target?.hp>0){target.knock=(target.knock||0)+.07;target.splashAt=m.elapsed;}}if(p.variant==='charged'){impact(m,s,p.x,p.y,p.id,'surge');
      // Capacitor pulse wave: the surge also ripples out to nearby ships.
      if(d.capacitorPulse)for(const o of s.enemies)if(o!==target&&o.hp>0&&!(o.s<0)&&Math.hypot(o.x-p.x,o.y-p.y)<.24)damage(m,index,o,p.value/(1+d.capacitorBonus)*d.capacitorPulse*2.5,u,true);}
    // Quantum Crown: the struck ship becomes entangled for 5 s (at most `entangle` ships per board).
    if(d.entangle&&target?.hp>0){target.entUntil=m.elapsed+5;const ent=s.enemies.filter(e=>e.hp>0&&e.entUntil>m.elapsed).sort((a,b)=>b.entUntil-a.entUntil);for(const e of ent.slice(d.entangle))e.entUntil=0;s.entShare=d.entangleShare||.25;}
    // Star Phoenix: each molten feather lodges in the ship (up to starFeather of them, lasting 8 s).
    if(d.starFeather&&target?.hp>0){target.feathers=Math.min(d.starFeather,(target.featherUntil>m.elapsed?target.feathers||0:0)+1);target.featherUntil=m.elapsed+8;}
    // Frostbite: each hit grows an ice crystal on the ship (a stack, slowing a little more each time);
    // at full stacks the ship is frozen solid and later shatters (see frostbite()).
    if(d.frostbite&&target?.hp>0&&!(target.frozenUntil>m.elapsed))frostbite(m,index,target,u,d);
    if(target?.hp>0){const shatter=d.shatter&&target.slowUntil>m.elapsed;damage(m,index,target,p.value*(shatter?1+d.shatter:1)+(d.maxHpBonus?target.maxHp*d.maxHpBonus*(target.isBoss?.25:1):0),u,false,p.crit||shatter);
      if(d.burn){target.burn=32*.14*(1+.08*(u.star-1));target.burnUntil=m.elapsed+4;target.burnOwner=u;target.burnGreen=false;}
      if(d.emeraldBurn){target.burn=Math.max(target.burn||0,32*.14);target.burnUntil=m.elapsed+3;target.burnOwner=u;target.burnGreen=true;}
      if(d.frost){target.slow=Math.min(.4,(d.rankedFrost??d.frost)*(1+.08*(u.star-1)));target.slowUntil=m.elapsed+2.5;}
      if(d.weaken){target.weaken=d.rankedWeaken??d.weaken;target.weakUntil=m.elapsed+3;}
      if(d.stunChain){target.slow=Math.max(target.slowUntil>m.elapsed?target.slow:0,.7);target.slowUntil=m.elapsed+d.stunChain;target.stunUntil=m.elapsed+d.stunChain;}
      if(d.vulnerability){target.vulnerability=Math.min(.3,d.rankedVulnerability??d.vulnerability);target.markUntil=m.elapsed+3;target.markExecute=d.execute||0;}
      if(d.knockback&&target.hp>0)target.knock=(target.knock||0)+d.knockback*(d.shockwave?.0026:.0013);
      // Heavy shells: a shockwave also shoves nearby ships back (half strength).
      if(d.shockwave){impact(m,s,p.x,p.y,p.id,'shockwave');for(const o of s.enemies)if(o!==target&&o.hp>0&&!(o.s<0)&&Math.hypot(o.x-p.x,o.y-p.y)<.17)o.knock=(o.knock||0)+d.knockback*.0013;}
    }
    if(d.area||d.cluster||(d.tideEvery&&p.charged)){
      const radius=Math.min(.55,(d.area||d.tideRadius||72)/260);
      for(const other of s.enemies)if(other.hp>0&&other!==target&&Math.hypot(other.x-p.x,other.y-p.y)<radius){
        damage(m,index,other,p.value*(d.tideDamage||.45)+(d.maxHpBonus?other.maxHp*d.maxHpBonus*(other.isBoss?.25:1):0),u,true);
        if(d.frost||d.tideSlow){other.slow=d.frost||d.rankedTideSlow||d.tideSlow;other.slowUntil=m.elapsed+2.5;}
        if(d.tidePush&&p.charged){other.knock=(other.knock||0)+.07;other.splashAt=m.elapsed;}
        if(d.burn){other.burn=32*.14;other.burnUntil=m.elapsed+4;other.burnOwner=u;}
      }
      // Bomb Sub-cannon: the blast rocks ships outward, and every ship it destroys
      // detonates in turn (up to bombChain wrecks per bomb, one level deep).
      if(d.bombChain){impact(m,s,p.x,p.y,p.id,'bombBlast');let wrecks=0;
        for(const w of s.enemies)if(w.hp<=0&&w.diedAt===m.elapsed&&w.killedBy===u&&Math.hypot(w.x-p.x,w.y-p.y)<radius+.02&&wrecks<d.bombChain){wrecks++;impact(m,s,w.x,w.y,p.id,'bombChain');
          for(const o of s.enemies)if(o.hp>0&&!(o.s<0)&&Math.hypot(o.x-w.x,o.y-w.y)<.2)damage(m,index,o,p.value*.35+o.maxHp*.02*(o.isBoss?.25:1),u,true);}
        for(const o of s.enemies)if(o.hp>0&&!(o.s<0)&&Math.hypot(o.x-p.x,o.y-p.y)<radius)o.knock=(o.knock||0)+.03;}
    }
    if(d.chain&&!p.chained){let from=target||p;const visited=new Set([target?.id]);
      for(let i=1;i<d.chain;i++){const next=s.enemies.filter(e=>e.hp>0&&!visited.has(e.id)).sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y))[0];if(!next)break;
        s.beams.push({x:from.x,y:from.y,tx:next.x,ty:next.y,id:p.id,arc:true,born:m.elapsed,until:m.elapsed+.24});visited.add(next.id);damage(m,index,next,p.value*.55,u);if(d.stunChain&&next.hp>0){next.slow=Math.max(next.slowUntil>m.elapsed?next.slow:0,.7);next.slowUntil=m.elapsed+d.stunChain;next.stunUntil=m.elapsed+d.stunChain;}if(d.emeraldBurn&&next.hp>0){next.burn=Math.max(next.burn||0,32*.14);next.burnUntil=m.elapsed+3;next.burnOwner=u;next.burnGreen=true;}from=next;}
    }
    // Phase Echo: the turret's phantom twin fires a ghost round at the same ship a beat later
    // (if that ship is gone, the echo seeks the nearest one).
    if(d.phaseEcho&&!d.beam&&!p.echo&&u){const [ux,uy]=positions[u.slot],a=Math.atan2(p.y-uy,p.x-ux),ox=ux+.16,oy=uy-.13;s.projectiles.push({uid:m.nextId++,id:p.id,owner:u,targetId:target?.hp>0?target.id:p.targetId,x:ox,y:oy,originX:ox,originY:oy,born:m.elapsed,tx:p.x,ty:p.y,angle:a,age:0,speed:2.4,value:p.value*d.phaseEcho,crit:false,echo:true,variant:'echo'});}
    // Twin Resonance: the second round of a pair landing on the same ship adds a bonus.
    if(d.twinResonance&&p.pair&&target?.hp>0){if(target.twinPair===p.pair){impact(m,s,p.x,p.y,p.id,'resonance');damage(m,index,target,p.value*d.twinResonance,u);target.twinPair=0;}else target.twinPair=p.pair;}
    // Cluster Bomb: the shell splits into 3 bomblets that scatter and detonate a beat later.
    // Chain Minefield: plant a mine on the track a little ahead of the struck ship (max 4 per turret).
    if(d.mines&&u&&target){const ahead=pathPoint(Math.min(PATH_LENGTH-.2,(target.s||0)+.18)),mine=(s.mines||(s.mines=[]));const mineCount=mine.filter(n=>n.owner===u);if(mineCount.length>=d.mines)mine.splice(mine.indexOf(mineCount[0]),1);
      mine.push({x:ahead.x,y:ahead.y,owner:u,value:p.value*1.6,born:m.elapsed,armed:m.elapsed+.35,until:m.elapsed+10,seed:m.nextId++});}
    // Flame Sprayer: the fuel bomb bursts into a fire patch on the track (max 3 per turret).
    if(d.firePatch&&u){const mine=(s.fires||(s.fires=[])).filter(f=>f.owner===u);if(mine.length>=d.firePatch)s.fires.splice(s.fires.indexOf(mine[0]),1);s.fires.push({x:p.x,y:p.y,born:m.elapsed,until:m.elapsed+3,r:.13,owner:u,next:m.elapsed+.25,value:p.value*.55,seed:m.nextId++});}
    // Pulse Quantum: every hit releases a small quantum pulse around the target.
    if(p.id==='pulse_quantum'&&!p.chained){impact(m,s,p.x,p.y,p.id,'pulse');for(const o of s.enemies)if(o!==target&&o.hp>0&&!(o.s<0)&&Math.hypot(o.x-p.x,o.y-p.y)<.19)damage(m,index,o,p.value*.28,u,true);}
    // Void Devourer: every 5 kills opens a 3 s black hole that holds and grinds ships.
    if(d.void&&u.kills>=5){u.kills-=5;impact(m,s,p.x,p.y,p.id,'void');(s.voids||(s.voids=[])).push({x:p.x,y:p.y,born:m.elapsed,until:m.elapsed+3,r:.3,owner:u,next:m.elapsed+.25,value:p.value*.45});}
  }
  // Flying-sword motion: each leg is a quadratic curve from where the sword is to its (moving) target,
  // bowed to one side; progress eases in so the sword glides off and darts home. The heading is the
  // curve's tangent, so the blade always points along its flight.
  function swordStep(m,index,p,dt){const s=m.sides[index];
    if(p.age<p.delay)return;const t0=p.age-p.delay;
    const live=e=>e&&e.hp>0&&!(e.s<0);
    if(p.hover&&t0<p.hover.until){const k=1-Math.pow(1-Math.min(1,t0/.3),3),tg=s.enemies.find(e=>e.id===p.targetId);p.x=p.originX+(p.hover.x-p.originX)*k+Math.sin(m.elapsed*6+p.uid)*.004;p.y=p.originY+(p.hover.y-p.originY)*k;
      if(live(tg)){const want=Math.atan2(tg.y-p.y,tg.x-p.x),diff=Math.atan2(Math.sin(want-p.angle),Math.cos(want-p.angle));p.angle+=diff*Math.min(1,dt*10);}return;}
    let tg=s.enemies.find(e=>e.id===p.targetId);
    if(!live(tg)||p.hitIds.includes(tg.id)){tg=null;let bd=1.4;for(const e of s.enemies){if(!live(e)||p.hitIds.includes(e.id))continue;const dd=Math.hypot(e.x-p.x,e.y-p.y);if(dd<bd){bd=dd;tg=e;}}
      if(!tg){p.done=true;return;}p.targetId=tg.id;p.seg=null;}
    if(!p.seg){const dx=tg.x-p.x,dy=tg.y-p.y,L=Math.hypot(dx,dy)||1,hx=Math.cos(p.angle),hy=Math.sin(p.angle);
      // The bend keeps the sword's current heading, so a new leg flows on from the last one.
      const bend=p.hits?.45:1,cx=p.x+hx*L*.45*bend+(-dy/L)*L*p.side*(p.hits?.3:1),cy=p.y+hy*L*.45*bend+(dx/L)*L*p.side*(p.hits?.3:1);
      p.seg={x0:p.x,y0:p.y,cx,cy,t:0,dur:Math.max(.28,Math.min(.9,L/1.5))*(p.pace||1)};}
    const g=p.seg;g.t=Math.min(1,g.t+dt/g.dur);const e=Math.pow(g.t,1.45),u1=1-e;
    let tx=2*u1*(g.cx-g.x0)+2*e*(tg.x-g.cx),ty=2*u1*(g.cy-g.y0)+2*e*(tg.y-g.cy);const tl=Math.hypot(tx,ty)||1;
    // A gentle serpentine sway across the flight line, fading out as the sword strikes.
    const sw=(p.sway||0)*Math.sin(g.t*Math.PI*2)*(1-g.t);
    p.x=u1*u1*g.x0+2*u1*e*g.cx+e*e*tg.x-ty/tl*sw;p.y=u1*u1*g.y0+2*u1*e*g.cy+e*e*tg.y+tx/tl*sw;
    const swd=(p.sway||0)*Math.PI*2*Math.cos(g.t*Math.PI*2)*(1-g.t)*.35;tx-=ty/tl*swd;ty+=tx/tl*swd;if(tx||ty)p.angle=Math.atan2(ty,tx);
    if(g.t>=1||Math.hypot(tg.x-p.x,tg.y-p.y)<.03){p.hitIds.push(tg.id);hit(m,index,p,tg);p.hits++;p.seg=null;if(p.hits>=p.pierce)p.done=true;}
  }
  // Frost Bloom full moon: a great moon rises over the board; every ship on it takes damage, is slowed and
  // blooms with a frost flower.
  function fullMoon(m,index,u,d,value){const s=m.sides[index];(s.moons||(s.moons=[])).push({id:u.id,born:m.elapsed,until:m.elapsed+2.2});
    for(const e of s.enemies){if(e.hp<=0||e.s<0)continue;damage(m,index,e,value*(d.fullMoonDamage||2),u,true);if(e.hp>0){e.slow=Math.max(e.slowUntil>m.elapsed?e.slow:0,(d.fullMoonSlow||.5)*(e.isBoss?.5:1));e.slowUntil=Math.max(e.slowUntil||0,m.elapsed+2);e.moonBloomAt=m.elapsed;}}}
  function frostbite(m,index,e,u,d){const s=m.sides[index];e.fb=(e.fbUntil>m.elapsed?e.fb||0:0)+1;e.fbUntil=m.elapsed+4;
    e.slow=Math.max(e.slowUntil>m.elapsed?e.slow:0,.06*e.fb);e.slowUntil=Math.max(e.slowUntil||0,m.elapsed+2);
    if(e.fb>=d.frostbite){e.fb=0;const hold=(d.frostbiteFreeze||1)*(e.isBoss?.35:1);e.frozenUntil=m.elapsed+hold;e.slow=1;e.slowUntil=m.elapsed+hold;impact(m,s,e.x,e.y,u.id,'freeze');
      (s.freezes||(s.freezes=[])).push({enemyId:e.id,at:m.elapsed+hold,owner:u,id:u.id});}}
  function projectile(m,s,u,target,value,extra={}) {
    const [x,y]=positions[u.slot];
    s.projectiles.push({uid:m.nextId++,id:u.id,owner:u,targetId:target.id,x,y,originX:x,originY:y,born:m.elapsed,tx:target.x,ty:target.y,angle:Math.atan2(target.y-y,target.x-x),age:0,
      speed:u.id==='gatling'?2.6:u.id==='antimatter'?.9:u.id==='rookie_guard'?1.2:u.id==='heavy_cannon'?1.3:u.id.includes('tide')?1.25:1.75,value,...extra});
  }
  function attack(m,index,u) {
    const s=m.sides[index],d=C.byId.get(u.id),p=positions[u.slot];if(!d.damage&&!d.antimatter)return;
    const targets=s.enemies.filter(e=>e.hp>0&&!(e.s<0)).sort((a,b)=>d.highestHp?b.hp-a.hp:b.s-a.s);
    if(!targets.length){if(d.spinUp)u.spin=Math.max(0,(u.spin||0)-.25);return;}
    // Gatling: each shot spins the barrels up a little (full speed after ~25 shots).
    if(d.spinUp)u.spin=Math.min(1,(u.spin||0)+.04);
    // Wild-fire turrets never aim: each shot picks a random live enemy.
    // Priority turrets lock one target (most max HP, then furthest along) and
    // stay on it until it dies, instead of re-picking every shot.
    let locked=d.highestHp?targets.find(e=>e.id===u.lockId):null;
    if(d.highestHp&&!locked){locked=[...targets].sort((a,b)=>(d.bossBonus?(b.isBoss-a.isBoss):0)||b.maxHp-a.maxHp||b.s-a.s)[0];u.lockId=locked.id;}
    const target=locked||(d.randomTarget?targets[Math.floor(random(m)*targets.length)]:targets[0]),aura=effects(s,p);u.attacks++;u.firedAt=m.elapsed;u.angle=Math.atan2(target.y-p[1],target.x-p[0]);
    const base=32*(1+.1*s.upgrades[d.damageType==='magic'?'magic':'physical'])*(behind(m,index)?1.15:1);
    // Antimatter: a share of max HP (half for bosses) plus extra base damage; SHOT_SCALE is undone for the HP part.
    const amBase=d.antimatter?(d.antimatterBase||0)*base*SHOT_SCALE:0;
    let value=d.antimatter?target.maxHp*d.antimatter*(target.isBoss?.5:1)/SHOT_SCALE+amBase/SHOT_SCALE:(d.rankedDamage??d.damage)*base;
    // Shadow Replica: mirror the strongest damage turret on the board — its rounds, its effects, a share of its damage.
    if(d.shadow){const best=s.units.filter(v=>v&&v!==u&&!C.byId.get(v.id).shadow&&(C.byId.get(v.id).rankedDamage??C.byId.get(v.id).damage)>0).sort((a,b)=>(C.byId.get(b.id).rankedDamage??C.byId.get(b.id).damage)*starRate(b.star)-(C.byId.get(a.id).rankedDamage??C.byId.get(a.id).damage)*starRate(a.star))[0];
      u.shadowOf=best?best.id:null;
      if(best){const pd=C.byId.get(best.id),c2=random(m)<BASE_CRIT+aura.crit+CRIT_PER_LEVEL*(s.upgrades.crit||0);let v2=(pd.rankedDamage??pd.damage)*base*(d.rankedShadow??.2)*SHOT_SCALE;if(c2)v2*=1.5;projectile(m,s,u,target,v2,{crit:c2,shadowCopy:true,id:best.id});return;}}
    const crit=d.alwaysCrit||random(m)<BASE_CRIT+aura.crit+CRIT_PER_LEVEL*(s.upgrades.crit||0)+(d.critBonus||0);if(crit)value*=aura.resonance?2:1.5;
    value*=SHOT_SCALE;
    const charged=!!(d.tideEvery&&u.attacks%d.tideEvery===0);
    const capacitor=!!(d.capacitorEvery&&u.attacks%d.capacitorEvery===0);if(capacitor)value*=1+d.capacitorBonus;
    if(d.phaseEcho&&d.beam)value*=1+d.phaseEcho;
    // Sniper: a hitscan shot lands instantly (bosses take a bonus) with a tracer line.
    if(d.hitscan){projectile(m,s,u,target,value*(target.isBoss?1+(d.bossBonus||0):1),{crit,charged,speed:7});return;}
    // Prism Lancer — light relay: the beam is first thrown to allied turrets, refracting through a crystal
    // node above each (up to prismRelay of them, always closing in on the enemy), then leaves the last node
    // to pierce through the enemy line. Every relay adds prismBoost damage and briefly hastens that turret.
    if(d.prismRelay){let from=[p[0],p[1]];const used=new Set([u]),hops=[];
      for(let k=0;k<d.prismRelay;k++){const here=Math.hypot(target.x-from[0],target.y-from[1]);let best=null,bd=9;
        for(const v of s.units){if(!v||v.hp<=0||used.has(v))continue;const q=positions[v.slot],step=Math.hypot(q[0]-from[0],q[1]-from[1]);if(step>.5||Math.hypot(target.x-q[0],target.y-q[1])>=here-.02)continue;if(step<bd){bd=step;best=v;}}
        if(!best)break;used.add(best);const q=positions[best.slot];hops.push(best);s.beams.push({x:from[0],y:from[1],tx:q[0],ty:q[1],id:u.id,relay:C.byId.get(best.id).color,born:m.elapsed,until:m.elapsed+.34});
        impact(m,s,q[0],q[1],u.id,'prismNode');s.impacts[s.impacts.length-1].color=C.byId.get(best.id).color;best.prismHasteUntil=m.elapsed+2;from=q;}
      const boost=1+(d.prismBoost||.25)*hops.length,v=value*boost;
      s.beams.push({x:from[0],y:from[1],tx:target.x,ty:target.y,id:u.id,relayEnd:hops.length,born:m.elapsed,until:m.elapsed+.3});
      hit(m,index,{id:u.id,owner:u,x:target.x,y:target.y,value:v,crit,charged},target);
      const dx=target.x-from[0],dy=target.y-from[1],length=Math.hypot(dx,dy)||1;for(const e of targets.slice(1)){const dot=((e.x-from[0])*dx+(e.y-from[1])*dy)/length,dist=Math.abs((e.x-from[0])*dy-(e.y-from[1])*dx)/length;if(dot>0&&dist<.065)damage(m,index,e,v*.72,u);}
      return;}
    if(d.fullMoon&&u.attacks%d.fullMoon===0)fullMoon(m,index,u,d,value);
    // Abyssal Tide leviathan: every leviathan-th attack a sea leviathan breaches on the most crowded stretch
    // of the track and swims back along it against the flow, striking every ship it passes and dragging
    // it back down the track (the undertow), then slowing it.
    if(d.leviathan&&u.attacks%d.leviathan===0){const live=s.enemies.filter(e=>e.hp>0&&!(e.s<0)).map(e=>e.s).sort((a,b)=>a-b);if(live.length){let best=live[0],bn=0;for(let i=0,j=0;i<live.length;i++){while(live[j]<live[i]-.9)j++;if(i-j+1>bn){bn=i-j+1;best=live[i];}}
      const top=Math.min(PATH_LENGTH-.05,best+.15),low=Math.max(.05,best-1.05);(s.leviathans||(s.leviathans=[])).push({id:u.id,owner:u,born:m.elapsed,until:m.elapsed+1.4,top,low,hit:[],value:value*(d.leviathanDamage||3),pull:d.leviathanPull||.22});impact(m,s,pathPoint(top).x,pathPoint(top).y,u.id,'breach');}}
    // Chrono Axis: every timeStop-th attack stops time - every ship freezes (bosses briefly) while damage dealt to
    // them is stored; when time resumes each ship takes an extra timeStopEcho share of what it stored.
    if(d.timeStop&&u.attacks%d.timeStop===0&&!(s.timeStop&&s.timeStop.until>m.elapsed)){const until=m.elapsed+(d.timeStopFor||1.5);s.timeStop={id:u.id,owner:u,born:m.elapsed,until,echo:d.timeStopEcho||.5};
      for(const e of s.enemies){if(e.hp<=0||e.s<0)continue;e.stopUntil=e.isBoss?m.elapsed+.6:until;e.stopDmg=0;}}
    // Solar Judgment: every sunJudgment-th attack a sun rises above the board and sweeps a colossal ray across
    // the field; every ship it touches is scorched and branded with a sun sigil that detonates 1.2 s later.
    if(d.sunJudgment&&u.attacks%d.sunJudgment===0)(s.sunrays||(s.sunrays=[])).push({id:u.id,owner:u,born:m.elapsed,until:m.elapsed+1.3,a0:Math.PI*.98,a1:Math.PI*.5,ox:.72,oy:-.98,hit:[],value,mark:d.sunMark||1.8});
    // Singularity King: every collapse-th attack tears open a black hole on the most crowded stretch of track.
    // For 2.4 s it gathers nearby ships along the track into its core (grinding them), then goes supernova.
    if(d.collapse&&u.attacks%d.collapse===0){const live=s.enemies.filter(e=>e.hp>0&&!(e.s<0)).map(e=>e.s).sort((a,b)=>a-b);if(live.length){let best=live[0],bn=0;for(let i=0,j=0;i<live.length;i++){while(live[j]<live[i]-.6)j++;if(i-j+1>bn){bn=i-j+1;best=live[i]-.3;}}
      const sc=Math.max(.1,Math.min(PATH_LENGTH-.15,best)),pp=pathPoint(sc);(s.singularities||(s.singularities=[])).push({id:u.id,owner:u,born:m.elapsed,until:m.elapsed+2.4,sc,x:pp.x,y:pp.y,next:m.elapsed+.25,value,hp:d.collapseHp||.08,boom:d.collapseDamage||3});}}
    // Quantum Crown coronation: a crown descends on the toughest ship and the entanglement collapses -
    // a beam from the crown to every entangled ship.
    if(d.coronation&&u.attacks%d.coronation===0){const crowned=[...targets].sort((a,b)=>b.hp-a.hp)[0];if(crowned){crowned.entUntil=m.elapsed+5;const ent=s.enemies.filter(e=>e.hp>0&&!(e.s<0)&&e.entUntil>m.elapsed);
      (s.crowns||(s.crowns=[])).push({id:u.id,born:m.elapsed,until:m.elapsed+1.3,x:crowned.x,y:crowned.y,pts:ent.map(e=>[e.x,e.y])});
      for(const e of ent)damage(m,index,e,value*(d.coronationDamage||2),u,true);}}
    // Star Phoenix constellation: every starIgnite-th attack joins every feathered ship into one constellation
    // (in track order) and ignites it - each feather strikes its ship, splashes neighbours and sets it burning.
    if(d.starIgnite&&u.attacks%d.starIgnite===0){const lit=s.enemies.filter(e=>e.hp>0&&!(e.s<0)&&e.featherUntil>m.elapsed&&e.feathers>0).sort((a,b)=>b.s-a.s);
      if(lit.length){(s.constellations||(s.constellations=[])).push({id:u.id,born:m.elapsed,until:m.elapsed+1.2,pts:lit.map(e=>[e.x,e.y])});
        for(const e of lit){const n=e.feathers;e.feathers=0;impact(m,s,e.x,e.y,u.id,'starBurst');{const im=s.impacts[s.impacts.length-1];im.born+=.34;im.until+=.34;}damage(m,index,e,value*(d.starBlast||1.5)*n,u,true);
          for(const o of s.enemies)if(o!==e&&o.hp>0&&!(o.s<0)&&Math.hypot(o.x-e.x,o.y-e.y)<.12)damage(m,index,o,value*.5*n,u,true);
          if(e.hp>0){e.burn=Math.max(e.burn||0,32*.16);e.burnUntil=m.elapsed+3;e.burnOwner=u;e.burnGreen=false;}}}}
    // Thunder Throne: lightning falls from the sky onto the locked ship and forks along the ground to
    // more ships (the chain). Every skyJudgment-th attack is the Throne's Judgment: three bolts strike the
    // three toughest ships at once, each forking, and stun them.
    if(d.skyBolt){const judg=u.attacks%(d.skyJudgment||3)===0,picks=judg?[target,...targets.filter(e=>e!==target).sort((a,b)=>b.hp-a.hp).slice(0,2)]:[target];
      picks.forEach((e,i)=>{s.beams.push({x:e.x,y:-1.2,tx:e.x,ty:e.y,id:u.id,sky:true,judg,seed:m.nextId++,born:m.elapsed,until:m.elapsed+(judg?.45:.32)});impact(m,s,e.x,e.y,u.id,'thunderStrike');s.impacts[s.impacts.length-1].judg=judg;
        hit(m,index,{id:u.id,owner:u,x:e.x,y:e.y,value:judg?value*1.2:value,crit,charged},e);
        if(judg&&e.hp>0){const st=(d.skyStun||.6)*(e.isBoss?.4:1);e.slow=Math.max(e.slowUntil>m.elapsed?e.slow:0,.95);e.slowUntil=Math.max(e.slowUntil||0,m.elapsed+st);}});
      return;}
    if(d.beam||u.id==='chain_arc'||u.id==='vip_thunder_throne'){
      // Channelled beams (Annihilation Laser) stay on and pulse damage along the line.
      if(d.channel){s.beams=s.beams.filter(b=>!(b.channel&&b.owner===u));s.beams.push({x:p[0],y:p[1],tx:target.x,ty:target.y,id:u.id,born:m.elapsed,until:m.elapsed+d.channel,channel:true,owner:u,targetId:target.id,next:m.elapsed+.15,pulses:0,value:value*(d.channelPulse??.35),ramp:d.channelRamp??.15,frost:d.rankedFrost??d.frost??0});return;}
      s.beams.push({x:p[0],y:p[1],tx:target.x,ty:target.y,id:u.id,arc:!d.beam,born:m.elapsed,until:m.elapsed+.24});
      hit(m,index,{id:u.id,owner:u,x:target.x,y:target.y,value,crit,charged},target);
      if(d.beam){const dx=target.x-p[0],dy=target.y-p[1],length=Math.hypot(dx,dy)||1;for(const e of targets.slice(1)){const dot=((e.x-p[0])*dx+(e.y-p[1])*dy)/length,dist=Math.abs((e.x-p[0])*dy-(e.y-p[1])*dx)/length;if(dot>0&&dist<.065)damage(m,index,e,value*.72,u);}}

    }else if(d.shuriken){
      // Hexagram Shuriken Cannon: six spinning shuriken each fly a petal-shaped loop out from the turret
      // and back, together tracing a six-petal flower; they can cut a ship once going out and once coming back.
      const [x,y]=positions[u.slot],aim=Math.atan2(target.y-y,target.x-x),reach=Math.min(.5,Math.max(.36,Math.hypot(target.x-x,target.y-y)+.04));
      for(let i=0;i<d.shuriken;i++)(s.shurikens||(s.shurikens=[])).push({id:u.id,owner:u,cx:x,cy:y,a:aim+i*Math.PI*2/d.shuriken,born:m.elapsed,t:0,dur:1.15,reach,width:.13,hit:[],left:d.shurikenHits||4,value,x,y});
    }else if(d.pentagram){
      // Pentagram Missile Pod: five missiles fly out holding a regular pentagon, slowly turning, to the
      // target; there they drop on the five points and the pentagram seal detonates (see tick).
      const [x,y]=positions[u.slot];(s.pentas||(s.pentas=[])).push({id:u.id,owner:u,x0:x,y0:y,x,y,targetId:target.id,tx:target.x,ty:target.y,born:m.elapsed,dur:.75,spin:u.attacks*.6,value:value*d.pentagram,r:d.pentaRadius||.2,stun:d.pentaStun||.5});
    }else if(d.swordVolley){
      // Thousand-Blade Case — sword control in the wuxia style. A normal volley is a sword river: the
      // swords leave the case one after another and stream along one graceful curve onto the enemy,
      // speeding up as they close in. Every swordFormEvery-th volley is the Sword Array: the golden
      // swords rise into a fan behind the turret, hover with their tips on the enemy, then loose together.
      const n=d.swordVolley,form=u.attacks%(d.swordFormEvery||3)===0,[x,y]=positions[u.slot],side=u.attacks%2?1:-1,aim=Math.atan2(target.y-y,target.x-x);
      for(let i=0;i<n;i++){const fan=(i-(n-1)/2)/((n-1)/2),ha=aim+Math.PI+fan*1.4,hr=.24+.04*Math.cos(fan*3);
        s.projectiles.push({uid:m.nextId++,id:u.id,owner:u,sword:true,x,y,originX:x+1e-4,originY:y,born:m.elapsed+(form?0:i*.08),delay:form?0:i*.08,age:0,angle:aim,
          targetId:target.id,hitIds:[],hits:0,pierce:d.pierce||1,value:value*(form?d.swordFormBonus||1.5:1),crit,variant:form?'gold':undefined,
          hover:form?{x:x+Math.cos(ha)*hr,y:y+Math.sin(ha)*hr*.9,until:.45+i*.012}:null,side:side*(.26+.1*Math.sin(i*1.7)),sway:.022*Math.sin(i*2.3+u.attacks),pace:.9+.2*((i*7)%5)/4,seg:null});}
    }else if(d.afterimage){
      // Afterimage Cannon fires nothing: its orbiting afterimages do the damage (see tick).
    }else{
      const count=d.missiles||d.pellets||1;
      // Parallel turrets: two homing rounds side by side, sharing a pair id.
      if(d.parallel&&count>1){const [x,y]=positions[u.slot],a=Math.atan2(target.y-y,target.x-x),pair=m.nextId;for(let i=0;i<count;i++){const off=(i-(count-1)/2)*.07;const px=x-Math.sin(a)*off,py=y+Math.cos(a)*off;s.projectiles.push({uid:m.nextId++,id:u.id,owner:u,free:true,x:px,y:py,originX:px,originY:py,born:m.elapsed,angle:a,age:0,life:.9,pierce:(d.pierce||1)-1,hitIds:[],speed:2.2,value,crit,charged,pair});}return;}
      // Fan turrets (spread): pellets fly straight along a fan and hit whatever they
      // run into, optionally piercing; they no longer all home onto one target.
      if(d.spread&&count>1&&!d.randomTarget){const aim=Math.atan2(target.y-p[1],target.x-p[0]),[x,y]=positions[u.slot];
        const step=d.pierce?d.spread:Math.min(d.spread,1.8/(count-1));for(let i=0;i<count;i++){const angle=aim+(i-(count-1)/2)*step;s.projectiles.push({uid:m.nextId++,id:u.id,owner:u,free:true,x,y,originX:x,originY:y,born:m.elapsed,angle,age:0,life:d.pellets&&!d.pierce&&d.pellets<=8?.5:.95,pierce:d.pierce||0,hitIds:[],speed:1.9,value,crit,charged});}
        return;}
      for(let i=0;i<count;i++)projectile(m,s,u,d.randomTarget&&i?targets[Math.floor(random(m)*targets.length)]:d.missiles?targets[i%targets.length]:target,value,{crit,charged,variant:capacitor?'charged':undefined,split:!!d.split,spread:d.airburst?(i-(count-1)/2)*.09+(i%2?.04:-.04):count>1?(i-(count-1)/2)*.025:d.firePatch?(u.attacks%2?.13:-.13):d.homing?(u.attacks%2?.07:-.07):0,air:!!d.airburst});
    }
  }
  function hurt(m,index,enemy) {
    const s=m.sides[index],aura=effects(s,CORE),amount=enemy.damage*CORE_DAMAGE*(1-aura.shield)*(1-(enemy.weakUntil>m.elapsed?enemy.weaken:0));
      if(s.shieldCharges>0){s.shieldCharges--;impact(m,s,CORE[0],CORE[1],'emergency_shield','shield');popup(m,s,CORE[0]+.05,CORE[1]+.26,'護盾抵擋','#9ff0ff',true);}
      else{s.hp=Math.max(0,s.hp-amount);popup(m,s,CORE[0],CORE[1]+.12,`−${Math.round(amount)}`,'#ff8d9e',true);impact(m,s,CORE[0],CORE[1],null,'core');}
      // Reflective Bastion: absorb each ram into a prism charge; at full charge,
      // release a prism shockwave that pays the stored damage back many times over.
      for(const v of s.units)if(v&&C.byId.get(v.id).counterCharge){const rd=C.byId.get(v.id),[vx,vy]=positions[v.slot];v.store=(v.store||0)+amount;v.charge=(v.charge||0)+1;
        if(v.charge>=rd.counterCharge){// Grade-scaled: stored damage x8 plus a strike worth (grade x 3) of this turret's own shots.
          const shot=32*(1+.1*s.upgrades.physical)*SHOT_SCALE*(rd.rankedDamage??rd.damage),value=(v.store*(rd.rankedReflect||8)+shot*(rd.strengthGrade||1)*3)*(1+.08*(v.star-1));impact(m,s,vx,vy,v.id,'counter');popup(m,s,vx,vy-.06,'反擊！','#bff6ff',true,1);
          for(const o of s.enemies)if(o.hp>0&&!(o.s<0)&&Math.hypot(o.x-vx,o.y-vy)<.62){s.beams.push({x:vx,y:vy,tx:o.x,ty:o.y,id:v.id,born:m.elapsed,until:m.elapsed+.35});damage(m,index,o,value,v,true);}
          v.store=0;v.charge=0;}}
  }
  // Three lanes keep a crowd readable: a ship that would sit on top of the one
  // ahead moves to a free lane (overtaking), or queues one ship-length behind.
  const LANES=[0,-.065,.065];
  const shipScale=e=>e.isBoss?(1.45+(e.sizeScale-3.1)*.2)*(e.counter?.6:1):e.sizeScale||1;
  function spaceOut(s){
    const list=s.enemies.filter(e=>e.hp>0&&!e.breached).sort((a,b)=>b.s-a.s),front=[null,null,null];
    for(const e of list){
      const size=shipScale(e),gap=f=>.04*(f.size+size),current=Math.max(0,LANES.indexOf(e.laneTarget||0));
      const order=[current,...[0,1,2].filter(i=>i!==current).sort((a,b)=>Math.abs(LANES[a]-LANES[current])-Math.abs(LANES[b]-LANES[current]))];
      let lane=order.find(i=>!front[i]||front[i].s-e.s>=gap(front[i]));
      if(lane===undefined){lane=current;const f=front[lane],limit=f.s-gap(f);if(e.s>limit&&limit>0){e.s=limit;place(e);}}
      e.laneTarget=LANES[lane];front[lane]={s:e.s,size};
    }
  }
  function moveEnemy(m,index,e,dt) {
    const s=m.sides[index];if(e.burnUntil>m.elapsed){damage(m,index,e,e.burn*dt,e.burnOwner,false,false,true);
      // Burn damage is summed and shown as an orange number twice a second.
      e.burnShown=(e.burnShown||0)+e.burn*dt;e.burnTick=(e.burnTick||0)+dt;if(e.burnTick>=.5){if(e.burnShown>=1){popup(m,s,e.x,e.y-.04,String(Math.round(e.burnShown)),e.burnGreen?'#7dffb0':'#ff9a4d');s.popups[s.popups.length-1].dot=true;}e.burnFlashAt=m.elapsed;e.burnShown=0;e.burnTick=0;}}
      if(e.hp<=0)return;
    e.flash=Math.max(0,e.flash-dt);e.hitKick=Math.max(0,e.hitKick-dt*4);e.wobble+=dt*3;e.attackTimer-=dt;e.abilityTimer-=dt;
    if(e.isBoss){e.bossTimer-=dt;e.escortTimer-=dt;
      if(e.escortCarrier&&e.escortTimer<=0){e.escortTimer=3;const count=s.enemies.filter(o=>o.carrier===e.id).length;for(let i=0;i<Math.min(e.escortBatch||3,(e.maxEscorts||12)-count);i++){const child=spawn(m,index,{kind:'runner',wave:e.wave,s:Math.max(0,e.s-.05*(i+1))});child.carrier=e.id;}}
      if(e.bossTimer<=0&&(e.beam||e.pulseAttack)){e.bossTimer=10;s.beams.push({x:e.x,y:e.y,tx:CORE[0],ty:CORE[1],id:null,enemy:true,born:m.elapsed,until:m.elapsed+.35});hurt(m,index,{...e,damage:e.damage*.35});}
    }
    if(e.ability==='ranged'&&e.s>PATH_LENGTH*.55){if(e.attackTimer<=0){s.beams.push({x:e.x,y:e.y,tx:CORE[0],ty:CORE[1],id:null,enemy:true,born:m.elapsed,until:m.elapsed+.25});hurt(m,index,e);e.attackTimer=2.4;}}
    if(e.abilityTimer<=0){e.abilityTimer=2.2;
      if(e.ability==='healer')for(const o of s.enemies)if(o.hp>0&&Math.hypot(o.x-e.x,o.y-e.y)<.35){const heal=Math.min(o.maxHp*.06,o.maxHp-o.hp);o.hp+=heal;if(heal>=1)popup(m,s,o.x,o.y,`+${Math.round(heal)}`,'#86ffc3');}
      if(e.ability==='buffer')for(const o of s.enemies)if(Math.hypot(o.x-e.x,o.y-e.y)<.4)o.buffUntil=m.elapsed+2.8;
    }
    // Knockback plays out as a quick backward slide instead of a teleport.
    // Knockback stacks but is capped, and each ship slides back at most ~0.6 path units per second,
    // so crowds can be pushed around without being pinned in place forever.
    // A refilling budget limits net pushback to ~0.08 path/s, so even slow bosses keep advancing.
    e.knockBudget=Math.min(.12,(e.knockBudget??.12)+dt*.08);
    if(e.knock>0){e.knock=Math.min(e.knock,.12)*(e.isBoss?.3:1);const k=Math.min(e.knock,dt*.6,e.knockBudget);e.s=Math.max(0,e.s-k);e.knockBudget-=k;e.knock=Math.max(0,e.knock-k)*.85;}
    const held=(s.voids||[]).some(v=>v.until>m.elapsed&&Math.hypot(e.x-v.x,e.y-v.y)<v.r);
    let speed=e.speed*(1-effects(s,[e.x,e.y]).slow)*(held?.25:1)*(1-(e.slowUntil>m.elapsed?e.slow:0));
    if(e.ability==='berserker')speed*=1+(1-e.hp/e.maxHp)*.8;
    if(e.buffUntil>m.elapsed)speed*=1.2;
    // Lanes glide toward the slot spaceOut() picked; erratic ships weave on top.
    e.laneNow=(e.laneNow||0)+((e.laneTarget||0)-(e.laneNow||0))*Math.min(1,dt*5);
    e.lane=e.laneNow+(e.ability==='erratic'?Math.sin(e.wobble)*.035:0);
    if(e.wallUntil>m.elapsed||e.stopUntil>m.elapsed)speed=0;
    let step=speed*PATH_SPEED*dt;
    for(const w of s.walls||[])if(w.until>m.elapsed&&e.s<=w.ps&&e.s+step>w.ps&&!w.held.includes(e.id)){w.held.push(e.id);step=Math.max(0,w.ps-.005-e.s);e.wallUntil=m.elapsed+w.hold*(e.isBoss?.35:1);e.slow=Math.max(e.slowUntil>m.elapsed?e.slow:0,.4);e.slowUntil=m.elapsed+w.hold+2.5;impact(m,s,e.x,e.y,w.id,'iceHold');}
    e.s+=step;place(e);
    if(e.s>=PATH_LENGTH){e.breached=true;hurt(m,index,e);e.hp=0;s.leaked++;s.coins+=8;popup(m,s,CORE[0]+.14,CORE[1]+.06,'+8','#f2d590');return;}
    if(e.ability==='buffer'){e.trail.push({x:e.x,y:e.y});if(e.trail.length>12)e.trail.shift();}
  }
  function ai(m,index) {
    const s=m.sides[index],pairs=[];
    const strengthen=key=>{const result=upgrade(m,index,key);if(result.ok){s.aiActions.upgrade++;s.aiNext='summon';if(s.bot){impact(m,s,0,0,null,'upgrade');popup(m,s,0,-.16,`${{speed:'攻速',physical:'物攻',magic:'魔攻',hp:'血量',crit:'暴擊'}[key]} Lv.${s.upgrades[key]}`,'#b5ddec',true);}}return result.ok;};
    if(s.counters>0&&(s.counters>=MAX_COUNTERS||random(m)<(s.bot?.counterChance??.2))){if(counter(m,index).ok)s.aiActions.counter=(s.aiActions.counter||0)+1;}
    for(let a=0;a<SLOT_COUNT;a++)for(let b=a+1;b<SLOT_COUNT;b++)if(s.units[a]&&s.units[b]&&s.units[a].id===s.units[b].id&&s.units[a].star===s.units[b].star&&s.units[a].star<10)pairs.push([a,b]);
    if(pairs.length&&(s.units.filter(Boolean).length>=9||s.units.filter(Boolean).length>=6&&random(m)<(s.bot?.mergeChance??.18))){if(merge(m,index,...pick(m,pairs)).ok)s.aiActions.merge++;}
    const units=s.units.filter(Boolean),urgent=s.bot&&s.hp/s.maxHp<.45&&s.upgrades.hp<10&&s.coins>=upgradeCost(s,'hp');
    if(urgent){strengthen('hp');return;}
    const hasRoom=s.units.some(u=>!u),saveForSummon=hasRoom&&(units.length<6||s.aiNext!=='upgrade');
    if(saveForSummon){if(s.coins>=summonCost(s)&&summon(m,index).ok){s.aiActions.summon++;s.aiNext='upgrade';}return;}
    if(units.length&&(!s.bot||random(m)<s.bot.upgradeChance)){
      const types=new Set(units.map(u=>C.byId.get(u.id).damageType));
      const keys=['speed',...(types.has('physical')?['physical']:[]),...(types.has('magic')?['magic']:[]),'hp','crit'].filter(k=>s.upgrades[k]<10&&s.coins>=upgradeCost(s,k));
      if(keys.length)strengthen(pick(m,keys));
    }
  }
  // The trailing side earns more per kill and hits harder, so a lead can be clawed back.
  function behind(m,index) {const s=m.sides[index],o=m.sides[1-index];return !!(s&&o&&s.hp/s.maxHp+.15<o.hp/o.maxHp);}
  // Stored counter-attacks: every 12 kills banks one (up to 3); the player
  // chooses when to launch an elite raider through the rival's gate.
  function counter(m,index) {
    const s=m.sides[index];if(m.status!=='playing'||!s)return {ok:false,reason:'戰鬥已結束'};
    if(s.counters<1)return {ok:false,reason:`再擊破 ${COUNTER_KILLS-s.counterKills} 隻可獲得反擊`};
    s.counters--;s.countersUsed++;
    const raider=spawn(m,1-index,{kind:'boss_ufo',hpScale:.45,counter:true});
    m.transferEvents.push({side:index,lineage:raider.lineage,counter:true,at:m.elapsed,until:m.elapsed+.9});
    return {ok:true,counters:s.counters};
  }
  function tick(m,dt,{opponentAI=true,playerAI=false}={}) {
    if(m.status!=='playing'||!Number.isFinite(dt)||dt<=0)return;
    dt=Math.min(.1,dt);m.elapsed+=dt;m.wave=1+Math.floor(m.elapsed/WAVE_SECONDS);
    m.transferEvents=m.transferEvents.filter(e=>e.until>m.elapsed);
    for(let index=0;index<2;index++){
      const s=m.sides[index];s.healBudget=Math.min(s.maxHp*.03,s.healBudget+s.maxHp*.03*dt);
      if(s.wave!==m.wave){
        if(s.wave)for(const u of s.units)if(u&&C.byId.get(u.id).mining){const amount=12+2*(u.star-1);s.coins+=amount;popup(m,s,...positions[u.slot],`+${amount}`,'#f5d47f');}
        s.wave=m.wave;s.spawnRemaining+=waveStats(m.wave).count;s.spawnTimer=.7;
        const boss=m.wave%1000===0?'omegaCrystal':m.wave%500===0?'starRing':m.wave%100===0?'destroyer':m.wave%50===0?'mothership':m.wave%10===0?'ufo':null;
        if(boss)spawn(m,index,{kind:'boss_'+boss});
      }
      s.spawnTimer-=dt;
      if(s.spawnRemaining>0&&s.spawnTimer<=0){const kind=enemyKind(m,m.wave),d=E.types[kind],count=Math.min(s.spawnRemaining,d.countPerSpawn||1);
        for(let i=0;i<count;i++)spawn(m,index,{kind,s:-i*.07});s.spawnRemaining-=count;s.spawnTimer+=waveStats(m.wave).interval;
      }
      if((index===1&&opponentAI)||(index===0&&playerAI)){s.aiTimer-=dt;if(s.aiTimer<=0){ai(m,index);s.aiTimer=s.bot?s.bot.reaction*(.85+random(m)*.3):.85;}}
      for(const u of s.units)if(u&&u.hp>0){const d=C.byId.get(u.id);u.timer-=dt;
        // Gold Mining: dig up a pouch of coins every few seconds.
        if(d.mineEvery){u.mineT=(u.mineT||0)+dt;if(u.mineT>=d.mineEvery){u.mineT=0;const amount=2+u.star;s.coins+=amount;popup(m,s,positions[u.slot][0],positions[u.slot][1]-.06,`+${amount}`,'#ffd36e');impact(m,s,positions[u.slot][0],positions[u.slot][1],u.id,'coins');}}
        // Sniper keeps its barrel trained on the locked target between shots.
        if(d.hitscan&&u.lockId){const t=s.enemies.find(e=>e.id===u.lockId&&e.hp>0);if(t){const [ux,uy]=positions[u.slot];u.angle=Math.atan2(t.y-uy,t.x-ux);}}// Afterimage Cannon: eleven afterimages circle the turret on a ring wide enough to sweep the track;
        // each one that touches a ship cuts a share of its max HP (bosses take a quarter), once per 0.4 s per ship.
        if(d.afterimage){const [px,py]=positions[u.slot];if(!u.orbitR)u.orbitR=Math.min(.34,orbitRadius(px,py));
          const base=32*(1+.1*s.upgrades.magic)*SHOT_SCALE*(d.rankedDamage??d.damage)*(1+.15*(u.star-1)),key='ai'+u.slot;
          for(let i=0;i<d.afterimage;i++){const a=m.elapsed*1.8+i*Math.PI*2/d.afterimage,ox=px+Math.cos(a)*u.orbitR,oy=py+Math.sin(a)*u.orbitR;
            for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&!(e[key]>m.elapsed)&&Math.hypot(e.x-ox,e.y-oy)<.06){e[key]=m.elapsed+.4;damage(m,index,e,base+e.maxHp*d.afterimageHp*(1+.1*(u.star-1))*(e.isBoss?.25:1),u,true);}}}
        // Nebula Hymn: a beat every hymnBeat seconds; every hymnChorus-th beat is the chorus - every other turret on
        // the board fires again at once, and a nebula score flows through them all.
        if(d.hymnBeat&&(u.beatT=(u.beatT||0)+dt)>=d.hymnBeat){u.beatT=0;u.beat=(u.beat||0)+1;const [hx,hy]=positions[u.slot];impact(m,s,hx,hy,u.id,'hymnBeat');
          if(u.beat%(d.hymnChorus||4)===0){const singers=s.units.filter(v=>v&&v!==u&&v.hp>0&&!C.byId.get(v.id).hymnBeat).sort((a,b)=>a.slot-b.slot);for(const v of singers){v.timer=Math.min(v.timer,0);const [vx,vy]=positions[v.slot];impact(m,s,vx,vy,u.id,'chorus');}
            if(singers.length)(s.hymns||(s.hymns=[])).push({id:u.id,born:m.elapsed,until:m.elapsed+1.3,pts:[[hx,hy],...singers.map(v=>positions[v.slot])]});}}
        // Phoenix Blaze: every phoenixDive seconds a great phoenix sweeps the whole track against the flow,
        // scorching and igniting every ship it passes once.
        if(d.phoenixDive&&(u.dive=(u.dive||0)+dt)>=d.phoenixDive){if(s.enemies.some(e=>e.hp>0&&!(e.s<0))){u.dive=0;(s.phoenixes||(s.phoenixes=[])).push({id:u.id,owner:u,born:m.elapsed,until:m.elapsed+1.4,hit:[],value:32*(1+.1*s.upgrades.magic)*SHOT_SCALE*(d.rankedDamage??d.damage)*d.phoenixDamage*(1+.15*(u.star-1))});}else u.dive=d.phoenixDive;}
        // Ice Wall Barrier: every iceWallEvery seconds a crystal wall rises across the track just ahead of the
        // lead ship. Each ship that reaches it is held in place (bosses briefly), then slowed 40%; when the wall
        // expires it shatters, hitting and chilling everything still near it.
        if(d.iceWall&&(u.wall=(u.wall||0)+dt)>=d.iceWallEvery){const lead=s.enemies.filter(e=>e.hp>0&&!(e.s<0)&&e.s<PATH_LENGTH-.2).sort((a,b)=>b.s-a.s)[0];
          if(lead){u.wall=0;const ps=Math.min(PATH_LENGTH-.1,lead.s+.16),pt=pathPoint(ps),value=32*(1+.1*s.upgrades.magic)*SHOT_SCALE*(d.rankedDamage??d.damage)*(d.iceWallShatter||5)*(1+.15*(u.star-1));
            (s.walls||(s.walls=[])).push({ps,x:pt.x,y:pt.y,heading:pt.heading,id:u.id,born:m.elapsed,until:m.elapsed+d.iceWall,hold:(d.iceWallHold||1)*(1+.1*(u.star-1)),value,owner:u,held:[]});}
          else u.wall=d.iceWallEvery;}
        if(d.vitalHeal&&(u.vital=(u.vital||0)+dt)>=d.vitalEvery){u.vital=0;const want=s.maxHp*d.vitalHeal*(1+.08*(u.star-1)),heal=Math.min(want,s.healBudget,s.maxHp-s.hp);s.hp=Math.min(s.maxHp,s.hp+heal);s.healBudget-=heal;const [vx,vy]=positions[u.slot];
          // Spirit Charger: the full orb streams to the core; with nothing to heal it bursts on enemies near the core instead.
          if(heal>=1){s.beams.push({x:vx,y:vy,tx:CORE[0],ty:CORE[1],id:u.id,vital:true,born:m.elapsed,until:m.elapsed+.6});popup(m,s,CORE[0],CORE[1]+.2,`+${Math.round(heal)}`,'#9dff6a');}
          else{impact(m,s,CORE[0],CORE[1],u.id,'vitalBurst');const burst=32*(1+.1*s.upgrades.magic)*SHOT_SCALE*(d.rankedDamage??d.damage)*4;for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.hypot(e.x-CORE[0],e.y-CORE[1])<.5)damage(m,index,e,burst,u,true);}}if(u.timer<=0){attack(m,index,u);const rate=FIRE_RATE*(d.cooldown?1/d.cooldown:(d.rankedSpeed??d.speed)/.65),full=(d.fullHpRate&&s.hp===s.maxHp?1+(d.rankedFullHpRate??d.fullHpRate):1)*(d.spinUp?1+d.spinUp*(u.spin||0):1);u.timer=1/Math.max(.033,Math.min(16,rate*starRate(u.star)*(1+.08*s.upgrades.speed)*full*(1+effects(s,positions[u.slot]).speed)*(u.prismHasteUntil>m.elapsed?1.2:1)));u.timerMax=u.timer;}}
      const emergency=s.units.find(u=>u?.id==='emergency_shield');if(emergency&&!s.shieldsUsed&&s.hp/s.maxHp<.3){s.shieldsUsed=true;impact(m,s,CORE[0],CORE[1],'emergency_shield','shieldUp');popup(m,s,CORE[0]+.05,CORE[1]+.3,'殘血護盾啟動','#c9f8ff',true,1);s.shieldCharges=Math.min(5,emergency.star);}
      const flying=s.projectiles;s.projectiles=[];
      for(const p of flying){p.age+=dt;
        if(p.sword){swordStep(m,index,p,dt);if(p.done)s.spentProjectiles.push({...p,ended:m.elapsed});else s.projectiles.push(p);continue;}
        if(p.free){p.x+=Math.cos(p.angle)*p.speed*dt;p.y+=Math.sin(p.angle)*p.speed*dt;let ended=p.age>=p.life||Math.abs(p.x)>1.15||Math.abs(p.y)>1.05;
          if(!ended&&!p.bomblet)for(const e of s.enemies){if(e.hp<=0||e.s<0||p.hitIds.includes(e.id))continue;if(Math.hypot(e.x-p.x,e.y-p.y)<.05+.03*(e.sizeScale||1)){p.hitIds.push(e.id);hit(m,index,p,e);if(p.pierce-->0)continue;ended=true;break;}}
          if(ended&&p.bomblet){impact(m,s,p.x,p.y,p.id,'bomblet');s.impacts[s.impacts.length-1].blast=p.blast||.12;for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.hypot(e.x-p.x,e.y-p.y)<(p.blast||.12))damage(m,index,e,p.value,p.owner,true);}
          if(ended)s.spentProjectiles.push({...p,ended:m.elapsed});else s.projectiles.push(p);continue;}
        let target=s.enemies.find(e=>e.id===p.targetId&&e.hp>0);if(!target&&p.echo){target=s.enemies.filter(e=>e.hp>0&&!(e.s<0)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(target)p.targetId=target.id;}if(target){p.tx=target.x;p.ty=target.y;}
        const dx=p.tx-p.x,dy=p.ty-p.y,dist=Math.hypot(dx,dy);p.angle=Math.atan2(dy,dx);
        if(p.split&&p.age>.16&&dist>.08){impact(m,s,p.x,p.y,p.id,'split');const nearby=s.enemies.filter(e=>e.hp>0&&!(e.s<0)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));for(let i=0;i<2;i++){const t=nearby[i]||target;const x=p.x-Math.sin(p.angle)*(i?-.035:.035),y=p.y+Math.cos(p.angle)*(i?-.035:.035);s.projectiles.push({...p,uid:m.nextId++,split:false,child:true,value:p.value*.7,targetId:t?.id||p.targetId,x,y,originX:x,originY:y,born:m.elapsed,age:0});}s.spentProjectiles.push({...p,ended:m.elapsed});continue;}
        if(dist<p.speed*dt+.02){p.x=p.tx;p.y=p.ty;s.spentProjectiles.push({...p,ended:m.elapsed});hit(m,index,p,target);continue;}
        p.x+=dx/dist*p.speed*dt;p.y+=dy/dist*p.speed*dt;if(p.age<2.4)s.projectiles.push(p);
      }
      for(const e of [...s.enemies])if(e.hp>0)moveEnemy(m,index,e,dt);
      spaceOut(s);
      s.hp=clamp(s.hp,0,s.maxHp);s.enemies=s.enemies.filter(e=>e.hp>0);
      s.spentProjectiles=s.spentProjectiles.filter(p=>p.ended>m.elapsed-.6).slice(-180);
      for(const b of s.beams)if(b.channel&&b.until>m.elapsed){const t=s.enemies.find(e=>e.id===b.targetId&&e.hp>0)||s.enemies.filter(e=>e.hp>0&&!(e.s<0)).sort((a,c)=>c.s-a.s)[0];if(t){b.targetId=t.id;b.tx=t.x;b.ty=t.y;if(b.owner)b.owner.angle=Math.atan2(t.y-b.y,t.x-b.x);}
        while(t&&m.elapsed>=b.next&&b.next<b.until){const dx=b.tx-b.x,dy=b.ty-b.y,L=Math.hypot(dx,dy)||1,heat=1+(b.ramp??.15)*b.pulses;b.pulses++;b.next+=.15;
          for(const e of s.enemies){if(e.hp<=0||e.s<0)continue;const dot=((e.x-b.x)*dx+(e.y-b.y)*dy)/L,dist=Math.abs((e.x-b.x)*dy-(e.y-b.y)*dx)/L;if(dot>0&&dist<.07){damage(m,index,e,b.value*heat,b.owner);if(b.frost&&e.hp>0){e.slow=Math.max(e.slowUntil>m.elapsed?e.slow:0,Math.min(.4,b.frost));e.slowUntil=m.elapsed+2.5;}}}}}
      for(const v of s.voids||[])while(v.until>m.elapsed&&m.elapsed>=v.next){v.next+=.25;for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.hypot(e.x-v.x,e.y-v.y)<v.r)damage(m,index,e,v.value,v.owner,true);}
      s.voids=(s.voids||[]).filter(v=>v.until>m.elapsed);
      // Frozen ships shatter: a share of max HP, and ice shards burst into nearby ships, adding a frostbite stack each.
      for(const fz of s.freezes||[]){if(fz.at>m.elapsed||fz.done)continue;fz.done=true;const e=s.enemies.find(o=>o.id===fz.enemyId);if(!e||e.hp<=0)continue;const d=C.byId.get(fz.id);
        const base=32*(1+.1*s.upgrades.magic)*SHOT_SCALE*(d.rankedDamage??d.damage)*(1+.15*((fz.owner?.star||1)-1));impact(m,s,e.x,e.y,fz.id,'iceCrack');
        damage(m,index,e,e.maxHp*(d.frostbiteHp||.12)*(e.isBoss?.25:1)+base*2,fz.owner,true);
        for(const o of s.enemies)if(o!==e&&o.hp>0&&!(o.s<0)&&Math.hypot(o.x-e.x,o.y-e.y)<.17){damage(m,index,o,base*1.5,fz.owner,true);if(o.hp>0&&!(o.frozenUntil>m.elapsed))frostbite(m,index,o,fz.owner,d);}}
      s.freezes=(s.freezes||[]).filter(fz=>!fz.done);s.moons=(s.moons||[]).filter(mo=>mo.until>m.elapsed);s.constellations=(s.constellations||[]).filter(k=>k.until>m.elapsed);
      for(const sh of s.shurikens||[]){if(sh.t>=1)continue;sh.t=Math.min(1,sh.t+dt/sh.dur);const k=sh.t,f=sh.reach*Math.sin(Math.PI*k),l=sh.width*Math.sin(2*Math.PI*k),ca=Math.cos(sh.a),sa=Math.sin(sh.a);
        sh.x=sh.cx+ca*f-sa*l;sh.y=sh.cy+sa*f+ca*l;const leg=k<.5?'o':'b';
        if(sh.left>0)for(const e of s.enemies){if(e.hp<=0||e.s<0||sh.hit.includes(e.id+leg))continue;if(Math.hypot(e.x-sh.x,e.y-sh.y)<.06){sh.hit.push(e.id+leg);sh.left--;impact(m,s,e.x,e.y,sh.id,'shuriken');damage(m,index,e,sh.value,sh.owner);if(sh.left<=0)break;}}}
      s.shurikens=(s.shurikens||[]).filter(sh=>sh.t<1);
      for(const pt of s.pentas||[]){if(pt.done)continue;const tg=s.enemies.find(e=>e.id===pt.targetId&&e.hp>0&&!(e.s<0));if(tg){pt.tx=tg.x;pt.ty=tg.y;}
        const k=Math.min(1,(m.elapsed-pt.born)/pt.dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;pt.x=pt.x0+(pt.tx-pt.x0)*e;pt.y=pt.y0+(pt.ty-pt.y0)*e;
        if(k>=1){pt.done=true;pt.at=m.elapsed;impact(m,s,pt.x,pt.y,pt.id,'pentagram');s.impacts[s.impacts.length-1].spin=pt.spin;s.impacts[s.impacts.length-1].r=pt.r;
          for(const o of s.enemies)if(o.hp>0&&!(o.s<0)&&Math.hypot(o.x-pt.x,o.y-pt.y)<pt.r){damage(m,index,o,pt.value,pt.owner,true);if(o.hp>0){const st=pt.stun*(o.isBoss?.4:1);o.slow=Math.max(o.slowUntil>m.elapsed?o.slow:0,.95);o.slowUntil=Math.max(o.slowUntil||0,m.elapsed+st);o.stunUntil=m.elapsed+st;}}}}
      s.pentas=(s.pentas||[]).filter(pt=>!pt.done);
      if(s.timeStop&&!s.timeStop.done&&m.elapsed>=s.timeStop.until){const ts=s.timeStop;ts.done=true;ts.releasing=true;impact(m,s,0,0,ts.id,'timeResume');s.impacts[s.impacts.length-1].center=true;
        for(const e of s.enemies){const stored=e.stopDmg||0;e.stopDmg=0;e.stopUntil=0;if(stored>=1&&e.hp>0&&!(e.s<0)){impact(m,s,e.x,e.y,ts.id,'timeCrack');damage(m,index,e,stored*ts.echo,ts.owner,true);}}ts.releasing=false;}
      for(const sr of s.sunrays||[]){if(sr.until<=m.elapsed)continue;const k=Math.min(1,(m.elapsed-sr.born)/1.1),a=sr.a0+(sr.a1-sr.a0)*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2),dx=Math.cos(a),dy=Math.sin(a);
        for(const e of s.enemies){if(e.hp<=0||e.s<0||sr.hit.includes(e.id))continue;const px=e.x-sr.ox,py=e.y-sr.oy,along=px*dx+py*dy,off=Math.abs(px*dy-py*dx);if(along>0&&off<.08){sr.hit.push(e.id);damage(m,index,e,sr.value*.8,sr.owner,true);if(e.hp>0){e.sunMarkAt=m.elapsed+1.2;e.sunMarkValue=sr.value*sr.mark;e.sunMarkOwner=sr.owner;}}}}
      s.sunrays=(s.sunrays||[]).filter(sr=>sr.until>m.elapsed);s.hymns=(s.hymns||[]).filter(h=>h.until>m.elapsed);
      for(const e of s.enemies)if(e.sunMarkAt&&e.sunMarkAt<=m.elapsed){const v=e.sunMarkValue,ow=e.sunMarkOwner;e.sunMarkAt=0;if(e.hp<=0||e.s<0)continue;impact(m,s,e.x,e.y,ow?.id||'vip_solar_judgment','sunFlare');damage(m,index,e,v,ow,true);
        if(e.hp>0){e.burn=Math.max(e.burn||0,32*.18);e.burnUntil=m.elapsed+3;e.burnOwner=ow;e.burnGreen=false;}for(const o of s.enemies)if(o!==e&&o.hp>0&&!(o.s<0)&&Math.hypot(o.x-e.x,o.y-e.y)<.1)damage(m,index,o,v*.5,ow,true);}
      for(const sg of s.singularities||[]){if(sg.done)continue;
        for(const e of s.enemies){if(e.hp<=0||e.s<0)continue;const dd=sg.sc-e.s;if(Math.abs(dd)<.6)e.s+=Math.sign(dd)*Math.min(Math.abs(dd),(e.isBoss?.12:.5)*dt);}
        while(m.elapsed>=sg.next&&sg.next<sg.until){sg.next+=.25;for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.abs(e.s-sg.sc)<.2)damage(m,index,e,sg.value*.3,sg.owner,true,false,true);}
        if(m.elapsed>=sg.until){sg.done=true;impact(m,s,sg.x,sg.y,sg.id,'supernova');for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.abs(e.s-sg.sc)<.35)damage(m,index,e,sg.value*sg.boom+e.maxHp*sg.hp*(e.isBoss?.25:1),sg.owner,true);}}
      s.singularities=(s.singularities||[]).filter(sg=>!sg.done);
      for(const lv of s.leviathans||[]){if(lv.until<=m.elapsed)continue;const k=Math.min(1,(m.elapsed-lv.born)/1.1),head=lv.top-(lv.top-lv.low)*k;
        for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.abs(e.s-head)<.13&&!lv.hit.includes(e.id)){lv.hit.push(e.id);damage(m,index,e,lv.value,lv.owner,true);if(e.hp>0){if(!e.undertow){e.undertow=true;e.s=Math.max(0,e.s-lv.pull*(e.isBoss?.2:1));}e.slow=Math.max(e.slowUntil>m.elapsed?e.slow:0,.4);e.slowUntil=Math.max(e.slowUntil||0,m.elapsed+2);e.splashAt=m.elapsed;}}}
      s.leviathans=(s.leviathans||[]).filter(lv=>lv.until>m.elapsed);s.crowns=(s.crowns||[]).filter(k=>k.until>m.elapsed);
      for(const f of s.phoenixes||[]){if(f.until<=m.elapsed)continue;const ps=PATH_LENGTH*(1-Math.min(1,(m.elapsed-f.born)/1.4));
        for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.abs(e.s-ps)<.14&&!f.hit.includes(e.id)){f.hit.push(e.id);damage(m,index,e,f.value*(e.isBoss?.6:1),f.owner,true);if(e.hp>0){e.burn=Math.max(e.burn||0,32*.2);e.burnUntil=m.elapsed+4;e.burnOwner=f.owner;e.burnGreen=false;}}}
      s.phoenixes=(s.phoenixes||[]).filter(f=>f.until>m.elapsed-.3);
      for(const w of s.walls||[])if(w.until<=m.elapsed&&!w.shattered){w.shattered=true;impact(m,s,w.x,w.y,w.id,'iceShatter');for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.abs(e.s-w.ps)<.16){damage(m,index,e,w.value,w.owner,true);if(e.hp>0){e.slow=Math.max(e.slowUntil>m.elapsed?e.slow:0,.4);e.slowUntil=m.elapsed+2.5;}}}
      s.walls=(s.walls||[]).filter(w=>w.until>m.elapsed-.05);
      for(const f of s.fires||[])while(f.until>m.elapsed&&m.elapsed>=f.next){f.next+=.25;for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.hypot(e.x-f.x,e.y-f.y)<f.r){damage(m,index,e,f.value,f.owner,false,false,true);e.burn=Math.max(e.burn||0,32*.14);e.burnUntil=m.elapsed+2;e.burnOwner=f.owner;e.burnGreen=false;}}
      s.fires=(s.fires||[]).filter(f=>f.until>m.elapsed);
      // Mines: a ship touching an armed mine sets it off; each blast detonates mines within reach (chain).
      const mines=s.mines||[];let blasts=mines.filter(n=>m.elapsed>=n.armed&&s.enemies.some(e=>e.hp>0&&!(e.s<0)&&Math.hypot(e.x-n.x,e.y-n.y)<.07));
      const boomed=new Set();while(blasts.length){const next=[];for(const n of blasts){if(boomed.has(n))continue;boomed.add(n);impact(m,s,n.x,n.y,n.owner?.id||'cluster_bomb','mine');for(const e of s.enemies)if(e.hp>0&&!(e.s<0)&&Math.hypot(e.x-n.x,e.y-n.y)<.16)damage(m,index,e,n.value,n.owner,true);
        for(const o of mines)if(!boomed.has(o)&&Math.hypot(o.x-n.x,o.y-n.y)<.26){next.push(o);s.beams.push({x:n.x,y:n.y,tx:o.x,ty:o.y,id:'cluster_bomb',fuse:true,born:m.elapsed,until:m.elapsed+.25});}}blasts=next;}
      s.mines=mines.filter(n=>!boomed.has(n)&&n.until>m.elapsed);
      s.beams=s.beams.filter(e=>e.until>m.elapsed-.4);s.impacts=s.impacts.filter(e=>e.until>m.elapsed).slice(-100);s.popups=s.popups.filter(e=>e.until>m.elapsed).slice(-90);
    }
    if(m.sides.some(s=>s.hp<=0)){m.status='finished';m.winner=m.sides.every(s=>s.hp<=0)?'draw':m.sides[0].hp>0?0:1;
      m.results=m.sides.map((s,i)=>resultFor(m.ratings[i],m.ratings[1-i],m.streaks[i],m.winner==='draw'?'draw':m.winner===i?'win':'loss'));
    }
  }
  globalThis.SpaceTowerRanked=Object.freeze({create,summon,merge,upgrade,counter,behind,tick,spawn,damage,effects,ai,starRate,summonCost,upgradeCost,waveStats,enemyPool,resultFor,pathPoint,pathLength:PATH_LENGTH,positions,TRACK,CORE,CORE_DAMAGE,PATH_LENGTH,PATH_SPEED,COUNTER_KILLS,MAX_COUNTERS,SLOT_COUNT,MAX_STAR,MAX_UPGRADE,WAVE_SECONDS});
})();
