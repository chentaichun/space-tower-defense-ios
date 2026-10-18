/* Deterministic ranked combat shared by the tutorial and authoritative rooms. */
(() => {
  'use strict';
  const C = globalThis.SpaceTowerCatalog, E = globalThis.SpaceTowerRankedEnemies;
  const SLOT_COUNT = 13, MAX_STAR = 10, MAX_UPGRADE = 10, WAVE_SECONDS = 20;
  const positions = Object.freeze([[0,0],[-.23,-.26],[.23,-.26],[.23,.26],[-.23,.26],
    ...Array.from({length:8},(_,i)=>[Math.cos(i*Math.PI/4-Math.PI/2)*.54,Math.sin(i*Math.PI/4-Math.PI/2)*.62])]);
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  function random(m) {m.seed=(Math.imul(m.seed,1664525)+1013904223)>>>0;return m.seed/4294967296;}
  const pick=(m,list)=>list[Math.floor(random(m)*list.length)];
  const starRate=star=>1+.4*(clamp(Math.floor(Number(star)||1),1,MAX_STAR)-1);
  const summonCost=s=>10*(s.draws+1), upgradeCost=(s,key)=>10*(s.upgrades[key]+1);
  function side(loadout,bot=null) {
    const typeHp=Object.fromEntries(loadout.map(id=>[id,Math.max(1,Math.round(C.health(id)*(bot?.hpScale??1)))]));
    const initialHp=Object.values(typeHp).reduce((a,b)=>a+b,0);
    return {loadout:[...loadout],typeHp,bot,initialHp,maxHp:initialHp,hp:initialHp,
      coins:150,draws:0,units:Array(SLOT_COUNT).fill(null),enemies:[],projectiles:[],spentProjectiles:[],beams:[],impacts:[],popups:[],aiActions:{summon:0,merge:0,upgrade:0},
      upgrades:{speed:0,physical:0,hp:0,magic:0},kills:0,sent:0,received:0,leaked:0,lost:0,
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
    const slot=pick(m,empty),id=pick(m,s.loadout);s.coins-=cost;s.draws++;s.units[slot]=makeUnit(m,s,id,1,slot);
    impact(m,s,...positions[slot],id,'summon');return {ok:true,slot,id,cost};
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
    const pool=Object.entries(E.types).map(([key,t])=>({key,weight:clamp(t.weight+age*(t.weightGrowth||0),t.minWeight??0,t.maxWeight??Infinity)}));
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
    const stats=waveStats(options.wave||m.wave),angle=options.angle??random(m)*Math.PI*2;
    const maxHp=template?.maxHp||Math.max(1,Math.round(stats.hp*d.hpScale));
    const enemy={...d,id:m.nextId++,lineage:template?.lineage||m.nextId,kind,isBoss,wave:template?.wave||m.wave,
      x:Math.cos(angle)*1.08,y:Math.sin(angle)*1.08,hp:maxHp,maxHp,
      damage:template?.damage||Math.max(1,Math.round(stats.damage*d.collisionScale*(isBoss?5:1))),speed:template?.speed||stats.speed*d.speedScale,
      physicalDefense:template?.physicalDefense??Math.round(stats.physicalDefense*(d.physicalDefenseScale||1))+(d.physicalDefenseBonus||0),
      magicDefense:template?.magicDefense??Math.round(stats.magicDefense*(d.magicDefenseScale||1)),
      generation:template?template.generation+1:0,entered:m.elapsed,slow:0,slowUntil:0,burn:0,burnUntil:0,burnOwner:null,
      vulnerability:0,markUntil:0,weakUntil:0,weaken:0,attackTimer:0,abilityTimer:2,bossTimer:10,escortTimer:3,flash:0,hitKick:0,wobble:angle,trail:[],
      shieldHp:d.shieldScale?maxHp*d.shieldScale:0,maxShieldHp:d.shieldScale?maxHp*d.shieldScale:0};
    s.enemies.push(enemy);
    if(template){s.received++;impact(m,s,enemy.x,enemy.y,null,'arrival');}
    return enemy;
  }
  function popup(m,s,x,y,text,color,large=false) {s.popups.push({x,y,text:String(text),color,large,born:m.elapsed,until:m.elapsed+.85});}
  function impact(m,s,x,y,id,kind='hit') {s.impacts.push({x,y,id,kind,born:m.elapsed,until:m.elapsed+(kind==='hit'?.7:.95)});}
  function effects(s,at=null) {
    let shield=0,slow=0,crit=0;
    for(const u of s.units)if(u&&u.hp>0){const d=C.byId.get(u.id),scale=1+.08*(u.star-1),p=positions[u.slot];
      if(d.shield&&(!at||Math.hypot(p[0]-at[0],p[1]-at[1])<.42))shield+=.02*scale;
      if(d.slowAura&&(!at||Math.hypot(p[0]-at[0],p[1]-at[1])<.48))slow+=d.slowAura*scale;
      if(d.critAura&&(!at||Math.hypot(p[0]-at[0],p[1]-at[1])<.42))crit+=d.critAura*scale;
    }
    return {shield:Math.min(.24,shield),slow:Math.min(.35,slow),crit:Math.min(.25,crit)};
  }
  function damage(m,index,e,value,owner,area=false,crit=false,dot=false) {
    if(e.hp<=0)return;
    const s=m.sides[index],d=C.byId.get(owner?.id),defense=d?.damageType==='magic'?e.magicDefense:e.physicalDefense;
    let amount=Math.max(dot?0:.5,value*(s.bot?.damageScale??1)-(dot?0:(defense||0)))*(1+(e.markUntil>m.elapsed?e.vulnerability:0));
    if(e.ability==='frontal_shield'&&!area&&owner){const p=positions[owner.slot],a=Math.atan2(p[1]-e.y,p[0]-e.x),face=Math.atan2(-e.y,-e.x);if(Math.cos(a-face)>.48)amount*=.25;}
    if(e.shieldHp>0){const absorbed=Math.min(e.shieldHp,amount);e.shieldHp-=absorbed;amount-=absorbed;}
    e.hp-=amount;e.flash=.07;e.hitKick=.6;
    if(amount>=1&&(!e.lastText||m.elapsed-e.lastText>.28)){popup(m,s,e.x,e.y,`${crit?'暴擊 ':''}${Math.round(amount)}`,crit?'#ffe7a0':d?.damageType==='magic'?'#d9b7ff':'#ffffff',crit);e.lastText=m.elapsed;}
    if(e.hp>0)return;
    if(e.breached){e.hp=0;return;}
    e.hp=0;s.kills++;s.coins+=8;if(owner)owner.kills++;
    impact(m,s,e.x,e.y,owner?.id,'kill');
    // Every kill transfers exactly one revived enemy, including enemies received earlier.
    spawn(m,1-index,{template:e});s.sent++;m.transferEvents.push({side:index,lineage:e.lineage,at:m.elapsed,until:m.elapsed+.65});
    if(e.ability==='splitter')for(let i=0;i<2;i++){const child=spawn(m,index,{kind:'runner',wave:e.wave});child.x=e.x+(i?-.04:.04);child.y=e.y;child.hp=child.maxHp=Math.max(1,e.maxHp*.21);}
    if(d?.lifeSteal){const heal=Math.min(s.maxHp*d.lifeSteal,s.healBudget);s.hp=Math.min(s.maxHp,s.hp+heal);s.healBudget-=heal;}
  }
  function hit(m,index,p,target) {
    const s=m.sides[index],u=p.owner,d=C.byId.get(p.id);
    impact(m,s,p.x,p.y,p.id);
    if(target?.hp>0){damage(m,index,target,p.value,u,false,p.crit);
      if(d.burn){target.burn=32*.14*(1+.08*(u.star-1));target.burnUntil=m.elapsed+4;target.burnOwner=u;}
      if(d.frost){target.slow=Math.min(.4,d.frost*(1+.08*(u.star-1)));target.slowUntil=m.elapsed+2.5;}
      if(d.weaken){target.weaken=d.weaken;target.weakUntil=m.elapsed+3;}
      if(d.vulnerability){target.vulnerability=Math.min(.3,d.vulnerability);target.markUntil=m.elapsed+3;}
      if(d.knockback&&target.hp>0){const r=Math.hypot(target.x,target.y)||1,n=Math.min(1.06,r+d.knockback*.00065);target.x*=n/r;target.y*=n/r;}
    }
    if(d.area||d.cluster||(d.tideEvery&&p.charged)){
      const radius=Math.min(.55,(d.area||d.tideRadius||72)/260);
      for(const other of s.enemies)if(other.hp>0&&other!==target&&Math.hypot(other.x-p.x,other.y-p.y)<radius){
        damage(m,index,other,p.value*(d.tideDamage||(d.cluster?.65:.45)),u,true);
        if(d.frost||d.tideSlow){other.slow=d.frost||d.tideSlow;other.slowUntil=m.elapsed+2.5;}
        if(d.burn){other.burn=32*.14;other.burnUntil=m.elapsed+4;other.burnOwner=u;}
      }
    }
    if(d.chain&&!p.chained){let from=target||p;const visited=new Set([target?.id]);
      for(let i=1;i<d.chain;i++){const next=s.enemies.filter(e=>e.hp>0&&!visited.has(e.id)).sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y))[0];if(!next)break;
        s.beams.push({x:from.x,y:from.y,tx:next.x,ty:next.y,id:p.id,arc:true,born:m.elapsed,until:m.elapsed+.24});visited.add(next.id);damage(m,index,next,p.value*.55,u);from=next;}
    }
    if(d.void&&u.kills>=5){u.kills-=5;impact(m,s,p.x,p.y,p.id,'void');for(const e of s.enemies)if(e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<.65){e.x+=(p.x-e.x)*.28;e.y+=(p.y-e.y)*.28;damage(m,index,e,6.4,u,true);}}
  }
  function projectile(m,s,u,target,value,extra={}) {
    const [x,y]=positions[u.slot];
    s.projectiles.push({uid:m.nextId++,id:u.id,owner:u,targetId:target.id,x,y,originX:x,originY:y,born:m.elapsed,tx:target.x,ty:target.y,angle:Math.atan2(target.y-y,target.x-x),age:0,
      speed:u.id==='gatling'?2.6:u.id.includes('tide')?1.25:1.75,value,...extra});
  }
  function attack(m,index,u) {
    const s=m.sides[index],d=C.byId.get(u.id),p=positions[u.slot];if(!d.damage&&!d.antimatter)return;
    const targets=s.enemies.filter(e=>e.hp>0).sort((a,b)=>d.highestHp?b.hp-a.hp:Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y));
    if(!targets.length)return;
    const target=targets[0],aura=effects(s,p);u.attacks++;u.firedAt=m.elapsed;u.angle=Math.atan2(target.y-p[1],target.x-p[0]);
    const base=32*(1+.1*s.upgrades[d.damageType==='magic'?'magic':'physical']);
    let value=d.antimatter?target.maxHp*d.antimatter:(d.rankedDamage??d.damage)*base;
    if(d.shadow)value=Math.max(value,...s.units.filter(Boolean).map(v=>C.byId.get(v.id).damage*base*.2));
    const crit=random(m)<aura.crit;if(crit)value*=1.5;
    const charged=!!(d.tideEvery&&u.attacks%d.tideEvery===0);
    if(d.capacitorEvery&&u.attacks%d.capacitorEvery===0)value*=1+d.capacitorBonus;
    if(d.phaseEcho)value*=1+d.phaseEcho;
    if(d.beam||u.id==='chain_arc'||u.id==='vip_thunder_throne'){
      s.beams.push({x:p[0],y:p[1],tx:target.x,ty:target.y,id:u.id,arc:!d.beam,born:m.elapsed,until:m.elapsed+.24});
      hit(m,index,{id:u.id,owner:u,x:target.x,y:target.y,value,crit,charged},target);
      if(d.beam){const dx=target.x-p[0],dy=target.y-p[1],length=Math.hypot(dx,dy)||1;for(const e of targets.slice(1)){const dot=((e.x-p[0])*dx+(e.y-p[1])*dy)/length,dist=Math.abs((e.x-p[0])*dy-(e.y-p[1])*dx)/length;if(dot>0&&dist<.065)damage(m,index,e,value*.72,u);}}
    }else{
      const count=d.missiles||d.pellets||1;
      for(let i=0;i<count;i++)projectile(m,s,u,d.missiles?targets[i%targets.length]:target,value,{crit,charged,split:!!d.split,spread:count>1?(i-(count-1)/2)*.025:0});
    }
  }
  function hurt(m,index,enemy) {
    const s=m.sides[index],aura=effects(s,[0,0]),amount=enemy.damage*(1-aura.shield)*(1-(enemy.weakUntil>m.elapsed?enemy.weaken:0));
      if(s.shieldCharges>0)s.shieldCharges--;else s.hp=Math.max(0,s.hp-amount);
      popup(m,s,0,0,`−${Math.round(amount)}`,'#ff8d9e',true);impact(m,s,0,0,null,'core');
      for(const v of s.units)if(v&&C.byId.get(v.id).reflect)damage(m,index,enemy,amount*C.byId.get(v.id).reflect,v);
  }
  function moveEnemy(m,index,e,dt) {
    const s=m.sides[index];if(e.burnUntil>m.elapsed)damage(m,index,e,e.burn*dt,e.burnOwner,false,false,true);if(e.hp<=0)return;
    e.flash=Math.max(0,e.flash-dt);e.hitKick=Math.max(0,e.hitKick-dt*4);e.wobble+=dt*3;e.attackTimer-=dt;e.abilityTimer-=dt;
    if(e.isBoss){e.bossTimer-=dt;e.escortTimer-=dt;
      if(e.escortCarrier&&e.escortTimer<=0){e.escortTimer=3;const count=s.enemies.filter(o=>o.carrier===e.id).length;for(let i=0;i<Math.min(e.escortBatch||3,(e.maxEscorts||12)-count);i++){const child=spawn(m,index,{kind:'runner',wave:e.wave});child.x=e.x+(i-1)*.06;child.y=e.y;child.carrier=e.id;}}
      if(e.bossTimer<=0&&(e.beam||e.pulseAttack)){e.bossTimer=10;s.beams.push({x:e.x,y:e.y,tx:0,ty:0,id:null,enemy:true,born:m.elapsed,until:m.elapsed+.35});hurt(m,index,{...e,damage:e.damage*.35});}
    }
    const radius=Math.hypot(e.x,e.y);
    if(radius<.09){e.breached=true;hurt(m,index,e);e.hp=0;s.leaked++;s.coins+=8;popup(m,s,.12,.04,'+8','#f2d590');return;}
    if(e.ability==='ranged'&&radius<.82){if(e.attackTimer<=0){s.beams.push({x:e.x,y:e.y,tx:0,ty:0,id:null,enemy:true,born:m.elapsed,until:m.elapsed+.25});hurt(m,index,e);e.attackTimer=2.4;}}
    if(e.abilityTimer<=0){e.abilityTimer=2.2;
      if(e.ability==='healer')for(const o of s.enemies)if(o.hp>0&&Math.hypot(o.x-e.x,o.y-e.y)<.35){const heal=Math.min(o.maxHp*.06,o.maxHp-o.hp);o.hp+=heal;if(heal>=1)popup(m,s,o.x,o.y,`+${Math.round(heal)}`,'#86ffc3');}
      if(e.ability==='buffer')for(const o of s.enemies)if(Math.hypot(o.x-e.x,o.y-e.y)<.4)o.buffUntil=m.elapsed+2.8;
    }
    let speed=e.speed*(1-effects(s,[e.x,e.y]).slow)*(1-(e.slowUntil>m.elapsed?e.slow:0));
    if(e.ability==='berserker')speed*=1+(1-e.hp/e.maxHp)*.8;
    if(e.buffUntil>m.elapsed)speed*=1.2;
    const turn=e.ability==='erratic'?Math.sin(e.wobble)*.5:0,angle=Math.atan2(-e.y,-e.x)+turn;
    e.x+=Math.cos(angle)*speed*dt;e.y+=Math.sin(angle)*speed*dt;
    if(e.ability==='buffer'){e.trail.push({x:e.x,y:e.y});if(e.trail.length>12)e.trail.shift();}
  }
  function ai(m,index) {
    const s=m.sides[index],pairs=[];
    const strengthen=key=>{const result=upgrade(m,index,key);if(result.ok){s.aiActions.upgrade++;s.aiNext='summon';if(s.bot){impact(m,s,0,0,null,'upgrade');popup(m,s,0,-.16,`${{speed:'攻速',physical:'物攻',magic:'魔攻',hp:'血量'}[key]} Lv.${s.upgrades[key]}`,'#b5ddec',true);}}return result.ok;};
    for(let a=0;a<13;a++)for(let b=a+1;b<13;b++)if(s.units[a]&&s.units[b]&&s.units[a].id===s.units[b].id&&s.units[a].star===s.units[b].star&&s.units[a].star<10)pairs.push([a,b]);
    if(pairs.length&&(s.units.filter(Boolean).length>=9||s.units.filter(Boolean).length>=6&&random(m)<(s.bot?.mergeChance??.18))){if(merge(m,index,...pick(m,pairs)).ok)s.aiActions.merge++;}
    const units=s.units.filter(Boolean),urgent=s.bot&&s.hp/s.maxHp<.45&&s.upgrades.hp<10&&s.coins>=upgradeCost(s,'hp');
    if(urgent){strengthen('hp');return;}
    const hasRoom=s.units.some(u=>!u),saveForSummon=hasRoom&&(units.length<6||s.aiNext!=='upgrade');
    if(saveForSummon){if(s.coins>=summonCost(s)&&summon(m,index).ok){s.aiActions.summon++;s.aiNext='upgrade';}return;}
    if(units.length&&(!s.bot||random(m)<s.bot.upgradeChance)){
      const types=new Set(units.map(u=>C.byId.get(u.id).damageType));
      const keys=['speed',...(types.has('physical')?['physical']:[]),...(types.has('magic')?['magic']:[]),'hp'].filter(k=>s.upgrades[k]<10&&s.coins>=upgradeCost(s,k));
      if(keys.length)strengthen(pick(m,keys));
    }
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
      if(s.spawnRemaining>0&&s.spawnTimer<=0){const kind=enemyKind(m,m.wave),d=E.types[kind],count=Math.min(s.spawnRemaining,d.countPerSpawn||1),angle=random(m)*Math.PI*2;
        for(let i=0;i<count;i++)spawn(m,index,{kind,angle:angle+(i-(count-1)/2)*.07});s.spawnRemaining-=count;s.spawnTimer+=waveStats(m.wave).interval;
      }
      if((index===1&&opponentAI)||(index===0&&playerAI)){s.aiTimer-=dt;if(s.aiTimer<=0){ai(m,index);s.aiTimer=s.bot?s.bot.reaction*(.85+random(m)*.3):.85;}}
      for(const u of s.units)if(u&&u.hp>0){const d=C.byId.get(u.id);u.timer-=dt;if(u.timer<=0){attack(m,index,u);const rate=d.cooldown?1/d.cooldown:(d.rankedSpeed??d.speed)/.65,full=d.fullHpRate&&s.hp===s.maxHp?1+d.fullHpRate:1;u.timer=1/Math.max(.033,Math.min(16,rate*starRate(u.star)*(1+.08*s.upgrades.speed)*full));}}
      const emergency=s.units.find(u=>u?.id==='emergency_shield');if(emergency&&!s.shieldsUsed&&s.hp/s.maxHp<.3){s.shieldsUsed=true;s.shieldCharges=Math.min(5,emergency.star);}
      const flying=s.projectiles;s.projectiles=[];
      for(const p of flying){p.age+=dt;const target=s.enemies.find(e=>e.id===p.targetId&&e.hp>0);if(target){p.tx=target.x;p.ty=target.y;}
        const dx=p.tx-p.x,dy=p.ty-p.y,dist=Math.hypot(dx,dy);p.angle=Math.atan2(dy,dx);
        if(p.split&&p.age>.16&&dist>.08){const nearby=s.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));for(let i=0;i<2;i++){const t=nearby[i]||target;const x=p.x-Math.sin(p.angle)*(i?-.035:.035),y=p.y+Math.cos(p.angle)*(i?-.035:.035);s.projectiles.push({...p,uid:m.nextId++,split:false,value:p.value*.7,targetId:t?.id||p.targetId,x,y,originX:x,originY:y,born:m.elapsed,age:0});}s.spentProjectiles.push({...p,ended:m.elapsed});continue;}
        if(dist<p.speed*dt+.02){p.x=p.tx;p.y=p.ty;s.spentProjectiles.push({...p,ended:m.elapsed});hit(m,index,p,target);continue;}
        p.x+=dx/dist*p.speed*dt;p.y+=dy/dist*p.speed*dt;if(p.age<2.4)s.projectiles.push(p);
      }
      for(const e of [...s.enemies])if(e.hp>0)moveEnemy(m,index,e,dt);
      s.hp=clamp(s.hp,0,s.maxHp);s.enemies=s.enemies.filter(e=>e.hp>0);
      s.spentProjectiles=s.spentProjectiles.filter(p=>p.ended>m.elapsed-.6).slice(-180);
      s.beams=s.beams.filter(e=>e.until>m.elapsed-.4);s.impacts=s.impacts.filter(e=>e.until>m.elapsed).slice(-100);s.popups=s.popups.filter(e=>e.until>m.elapsed).slice(-90);
    }
    if(m.sides.some(s=>s.hp<=0)){m.status='finished';m.winner=m.sides.every(s=>s.hp<=0)?'draw':m.sides[0].hp>0?0:1;
      m.results=m.sides.map((s,i)=>resultFor(m.ratings[i],m.ratings[1-i],m.streaks[i],m.winner==='draw'?'draw':m.winner===i?'win':'loss'));
    }
  }
  globalThis.SpaceTowerRanked=Object.freeze({create,summon,merge,upgrade,tick,spawn,damage,effects,ai,starRate,summonCost,upgradeCost,waveStats,enemyPool,resultFor,positions,SLOT_COUNT,MAX_STAR,MAX_UPGRADE,WAVE_SECONDS});
})();
