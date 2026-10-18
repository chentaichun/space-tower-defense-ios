import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const context = vm.createContext({});
vm.runInContext(read('turret-catalog.js')+'\n'+read('ranked-enemy-catalog.js')+'\n'+read('ranked-battle-core.js'),context);
const C=context.SpaceTowerCatalog,R=context.SpaceTowerRanked;
const ids=['gatling','vip_star_phoenix','shield_generator','time_slow','vip_abyssal_tide'];
const create=seed=>R.create({loadout:ids,seed});
const unit=(id,star=1,slot=0)=>({uid:1000+slot,id,star,slot,hp:C.health(id),maxHp:C.health(id),timer:0,attacks:0,kills:0,born:0,angle:0,firedAt:-1,hitAt:-1});
test('all 49 turrets have finite role-based HP; workshop and ranked share one catalog',()=>{
  assert.equal(C.turrets.length,49);assert.equal(new Set(C.turrets.map(t=>t.id)).size,49);
  for(const t of C.turrets){assert.ok(Number.isInteger(C.health(t)));assert.ok(C.health(t)>=80&&C.health(t)<=350);assert.ok(C.roles[t.healthRole]);}
  assert.equal(C.health('gatling'),135);assert.equal(C.health('vip_star_phoenix'),168);
  assert.equal(C.health('shield_generator'),192);assert.equal(C.health('time_slow'),158);assert.equal(C.health('vip_abyssal_tide'),231);
  assert.equal(C.loadoutHealth(ids),884);
  assert.ok(C.health('shield_generator')>C.health('annihilation_laser'));
  assert.ok(C.health('vip_nebula_hymn')>C.health('vip_solar_judgment'));
  assert.match(read('v2-features.js'),/V2_TURRET_DEFS = SpaceTowerCatalog.turrets/);
  assert.match(read('v2-features.js'),/baseHp: SpaceTowerCatalog.health\(turret\)/);
});
test('health policy rejects unknown, missing and repeated loadout entries',()=>{
  for(const invalid of [[],ids.slice(1),[...ids,'frost_core'],['gatling',...ids.slice(0,4)],['missing',...ids.slice(1)]]) assert.throws(()=>C.loadoutHealth(invalid));
  assert.throws(()=>C.health('missing'));
});
test('ranked treats former auxiliary weapons as equal deployable units',()=>{
  const aux=C.turrets.filter(t=>t.role==='auxiliary').slice(0,5).map(t=>t.id);
  const m=R.create({loadout:aux});m.sides[0].coins=10000;
  for(let i=0;i<13;i++)assert.ok(R.summon(m,0).ok);
  assert.equal(m.sides[0].units.filter(Boolean).length,13);
  assert.ok(m.sides[0].units.every(u=>aux.includes(u.id)));
});
test('successful summons cost 10,20,30 and fail atomically on funds or the 13-slot cap',()=>{
  const m=create(42),s=m.sides[0];assert.equal(s.coins,150);
  for(const cost of [10,20,30,40,50])assert.equal(R.summon(m,0).cost,cost);
  assert.equal(s.coins,0);const before=JSON.stringify(s);assert.equal(R.summon(m,0).ok,false);assert.equal(JSON.stringify(s),before);
  s.coins=10000;while(s.units.some(u=>!u))assert.ok(R.summon(m,0).ok);
  const full=JSON.stringify(s);assert.equal(R.summon(m,0).ok,false);assert.equal(JSON.stringify(s),full);
  assert.equal(s.draws,13);
});
test('summons reach every turret and every slot with approximately equal probabilities',()=>{
  const counts=Object.fromEntries(ids.map(id=>[id,0])), slots=Array(13).fill(0);const m=create(6383);
  for(let i=0;i<10000;i++){const s=m.sides[0];s.units.fill(null);s.coins=10;s.draws=0;const r=R.summon(m,0);counts[r.id]++;slots[r.slot]++;}
  for(const n of Object.values(counts))assert.ok(n>1800&&n<2200,String(counts));
  for(const n of slots)assert.ok(n>630&&n<900,slots.join(','));
});
test('only same-kind same-star pairs merge, producing one random higher-star turret without changing initial HP',()=>{
  const m=create(12),s=m.sides[0];s.units[0]=unit('gatling',1,0);s.units[1]=unit('time_slow',1,1);
  assert.equal(R.merge(m,0,0,1).ok,false);s.units[1]=unit('gatling',2,1);assert.equal(R.merge(m,0,0,1).ok,false);
  s.units[1]=unit('gatling',1,1);const r=R.merge(m,0,0,1);assert.ok(r.ok);assert.equal(s.units[0],null);assert.equal(s.units[1].star,2);assert.ok(ids.includes(r.id));
  assert.equal(s.hp,884);assert.equal(s.initialHp,884);assert.equal(s.coins,150);
  s.units[0]=unit('gatling',10,0);s.units[1]=unit('gatling',10,1);assert.equal(R.merge(m,0,0,1).ok,false);assert.equal(R.merge(m,0,0,0).ok,false);
});
test('fusion outcomes cover all five selected types uniformly, including former supports',()=>{
  const m=create(913),s=m.sides[0],counts=Object.fromEntries(ids.map(id=>[id,0]));
  for(let i=0;i<10000;i++){s.units[0]=unit('gatling',1,0);s.units[1]=unit('gatling',1,1);counts[R.merge(m,0,0,1).id]++;}
  for(const count of Object.values(counts))assert.ok(count>1800&&count<2200);
  assert.equal(R.starRate(1),1);assert.equal(R.starRate(10),4.6);assert.equal(R.starRate(999),4.6);
});
test('HP upgrade changes one random loadout type, all deployed copies, and the core by the same delta',()=>{
  const m=create(1),s=m.sides[0];s.coins=10000;s.hp=400;
  for(let i=0;i<13;i++){s.units[i]=unit(ids[i%5],1,i);s.units[i].hp-=20;}
  for(const key of ['speed','physical','magic'])assert.equal(R.upgrade(m,0,key).cost,10);
  for(let i=1;i<=10;i++){
    const before={...s.typeHp},core=s.hp,max=s.maxHp,health=s.units.map(u=>u.hp),result=R.upgrade(m,0,'hp');
    assert.equal(result.cost,10*i);const h=result.health;
    assert.equal(Object.keys(before).filter(id=>before[id]!==s.typeHp[id]).length,1);
    assert.equal(h.delta,Math.round(C.health(h.id)*.1));assert.equal(h.after,h.before+h.delta);
    assert.equal(s.maxHp,max+h.delta);assert.equal(s.hp,core+h.delta);
    assert.equal(s.maxHp,Object.values(s.typeHp).reduce((a,b)=>a+b,0));
    s.units.forEach((u,j)=>assert.equal(u.hp,health[j]+(u.id===h.id?h.delta:0)));
  }
  assert.equal(s.initialHp,884);const before=JSON.stringify(s);assert.equal(R.upgrade(m,0,'hp').ok,false);assert.equal(JSON.stringify(s),before);
  assert.equal(R.upgrade(m,0,'unknown').ok,false);s.coins=0;assert.equal(R.upgrade(m,0,'speed').ok,false);
});
test('three simultaneous kills produce exactly three arrivals, which can bounce back repeatedly',()=>{
  const m=create(2),s=m.sides[0],other=m.sides[1];
  for(let i=0;i<3;i++)R.spawn(m,0,{kind:['basic','runner','tank'][i]});
  for(let pass=0;pass<12;pass++){
    const index=pass%2,from=m.sides[index],to=m.sides[1-index],batch=from.enemies.filter(e=>e.hp>0);
    assert.equal(batch.length,3);
    const before=to.enemies.filter(e=>e.hp>0).length;
    batch.forEach(e=>R.damage(m,index,e,1e6));
    assert.equal(to.enemies.filter(e=>e.hp>0).length-before,3);
    assert.deepEqual([...to.enemies.filter(e=>e.hp>0).map(e=>e.kind)].sort(),['basic','runner','tank']);
    for(const e of to.enemies.filter(e=>e.hp>0)){assert.equal(e.generation,pass+1);assert.equal(e.hp,e.maxHp);}
  }
  assert.equal(s.sent,18);assert.equal(other.sent,18);assert.equal(s.coins,150+18*8);
  const dead=s.enemies.find(e=>e.hp===0);const coins=s.coins;R.damage(m,0,dead,1e6);assert.equal(s.coins,coins);
});
test('incoming pressure is never silently discarded at the former 72-enemy cap',()=>{
  const m=create(4);for(let i=0;i<150;i++)R.spawn(m,1);
  for(let i=0;i<5;i++)R.damage(m,0,R.spawn(m,0),9999);
  assert.equal(m.sides[1].enemies.length,155);assert.equal(m.sides[0].sent,5);
});
test('enemies pass through turrets and only damage the core',()=>{
  const m=create(3),s=m.sides[0];s.wave=1;s.spawnTimer=999;s.spawnRemaining=0;
  const u=s.units[5]=unit('shield_generator',1,5),e=R.spawn(m,0);e.x=R.positions[5][0];e.y=R.positions[5][1];u.hp=1;
  const radius=Math.hypot(e.x,e.y);
  R.tick(m,.05,{opponentAI:false});assert.equal(s.units[5],u);assert.equal(u.hp,1);assert.equal(s.lost,0);assert.equal(s.hp,s.initialHp);assert.ok(Math.hypot(e.x,e.y)<radius);assert.ok(R.effects(s).shield>0);
  e.x=.001;e.y=0;R.tick(m,.05,{opponentAI:false});assert.equal(s.hp,s.initialHp-e.damage);assert.equal(s.kills,0);
});
test('a core collision grants eight recovery coins once without a kill or transfer',()=>{
  const m=create(3),s=m.sides[0];s.wave=1;s.spawnRemaining=0;s.spawnTimer=999;R.spawn(m,0);const enemy=s.enemies[0];enemy.x=.001;enemy.y=0;const damage=enemy.damage;
  R.tick(m,.05,{opponentAI:false});assert.equal(s.hp,s.initialHp-damage);assert.equal(s.kills,0);assert.equal(s.sent,0);assert.equal(s.coins,158);
  R.tick(m,.05,{opponentAI:false});assert.equal(s.coins,158);
});
test('ranged and boss attacks target the core while deployed turrets stay intact',()=>{
  for(const kind of ['ranged','boss_ufo','boss_mothership','boss_destroyer']){
    const m=create(3),s=m.sides[0];s.wave=1;s.spawnTimer=999;s.spawnRemaining=0;
    s.units[5]=unit('shield_generator',1,5);const e=R.spawn(m,0,{kind});e.x=0;e.y=-.62;e.bossTimer=0;e.beam=true;e.attackTimer=0;
    const before=JSON.stringify(s.units),hp=s.hp,radius=Math.hypot(e.x,e.y);
    R.tick(m,.05,{opponentAI:false});
    assert.ok(s.hp<hp,kind);assert.equal(s.units[5].hp,JSON.parse(before)[5].hp);assert.equal(s.lost,0);
    assert.ok(s.beams.filter(b=>b.enemy).every(b=>b.tx===0&&b.ty===0));
    assert.ok(Math.hypot(e.x,e.y)<radius,'attacking does not block forward movement');
  }
});
test('an empty board can rebuild from core collision income, including reflected damage',()=>{
  const m=create(3),s=m.sides[0];s.coins=2;s.wave=1;s.spawnRemaining=0;s.spawnTimer=999;
  const e=R.spawn(m,0);e.x=.001;e.y=0;R.tick(m,.05,{opponentAI:false});assert.equal(s.coins,10);assert.equal(R.summon(m,0).ok,true);
  s.units.fill(null);s.units[5]=unit('reflect_bastion',1,5);const before=s.coins,enemy=R.spawn(m,0);enemy.x=.001;enemy.y=0;enemy.hp=.01;
  R.tick(m,.05,{opponentAI:false});assert.equal(s.coins,before+8);assert.equal(s.kills,0);assert.equal(s.sent,0);
});
test('shield/control/crit effects cap rather than stacking to invulnerability or a frozen match',()=>{
  const m=create(8),s=m.sides[0];s.units=Array.from({length:13},(_,slot)=>unit('vip_nebula_hymn',10,slot));let e=R.effects(s);assert.equal(e.shield,.24);assert.equal(e.crit,.25);
  s.units=Array.from({length:13},(_,slot)=>unit('vip_chrono_axis',10,slot));e=R.effects(s);assert.equal(e.slow,.35);
});
test('every turret can simulate at maximum star without non-finite values or mutable catalog stats',()=>{
  const before=JSON.stringify(C.turrets);
  for(const d of C.turrets){const m=create(9);m.sides[0].units=Array.from({length:13},(_,slot)=>unit(d.id,10,slot));
    for(let i=0;i<600;i++)R.tick(m,.05);
    for(const s of m.sides){assert.ok(Number.isFinite(s.hp)&&s.hp>=0&&s.hp<=s.maxHp,d.id);for(const e of s.enemies)assert.ok(Number.isFinite(e.hp)&&Number.isFinite(e.x)&&Number.isFinite(e.y),d.id);assert.ok(s.projectiles.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.value)),d.id);}
  }assert.equal(JSON.stringify(C.turrets),before);
});
test('seeded simulations are reproducible and completed matches freeze economy and health',()=>{
  const a=create(719),b=create(719);
  for(let i=0;i<6000;i++){R.tick(a,.05,{playerAI:true});R.tick(b,.05,{playerAI:true});}
  assert.equal(JSON.stringify(a),JSON.stringify(b));a.sides[0].hp=0;R.tick(a,.05);assert.equal(a.status,'finished');const before=JSON.stringify(a);
  R.tick(a,.05);R.summon(a,0);R.upgrade(a,0,'hp');R.merge(a,0,0,1);assert.equal(JSON.stringify(a),before);
});
test('new runtime and catalog scripts are included in the packaging manifest and load in dependency order',()=>{
  const html=read('index.html'),ranked=read('ranked.html'),release=read('tools/ios-release.mjs');
  assert.ok(html.indexOf('src="turret-catalog.js')<html.indexOf('src="v2-features.js'));
  for(const file of ['turret-catalog.js','ranked.html','ranked-mode.css','ranked-mode.js','ranked-battle-core.js','ranked-turret-art.js','ranked-enemy-catalog.js','ranked-battle-art.js'])assert.ok(release.includes(`'${file}'`));
  assert.ok(ranked.indexOf('src="turret-catalog.js')<ranked.indexOf('src="ranked-battle-core.js'));
});

test('Gatling fires traveling rounds while Phoenix splits projectiles instead of drawing beams',()=>{
  for(const id of ['gatling','vip_star_phoenix','vip_abyssal_tide']){
    const m=create(34),s=m.sides[0];s.wave=1;s.spawnRemaining=0;s.spawnTimer=999;s.units[0]=unit(id);const e=R.spawn(m,0);e.x=.85;e.y=.6;e.hp=e.maxHp=1000;
    R.tick(m,.05,{opponentAI:false});assert.ok(s.projectiles.length>0,id);assert.equal(s.beams.length,0,id);assert.equal(e.hp,1000,id);
    for(let i=0;i<20;i++)R.tick(m,.05,{opponentAI:false});assert.ok(e.hp<1000,id);
    if(id==='gatling')assert.ok(s.units[0].attacks>=3);
  }
});
test('normal-mode enemy archetypes and abilities use a mixed ranked pool while bosses keep their cadence',()=>{
  const catalog=context.SpaceTowerRankedEnemies;assert.equal(Object.keys(catalog.types).length,13);
  assert.equal(catalog.types.runner.unlockWave,3);assert.equal(catalog.types.swarm.countPerSpawn,5);assert.ok(catalog.types.tank.hpScale>catalog.types.basic.hpScale);
  const m=create(11);m.elapsed=40;R.tick(m,.05,{opponentAI:false});assert.equal(m.wave,3);
  assert.equal(R.enemyPool(1).length,13);assert.ok(R.enemyPool(1).every(e=>e.probability>0));
  const shield=R.spawn(m,0,{kind:'full_shield'}),hp=shield.hp;R.damage(m,0,shield,2);assert.equal(shield.hp,hp);assert.ok(shield.shieldHp<shield.maxShieldHp);
  m.elapsed=180;R.tick(m,.05,{opponentAI:false});assert.equal(m.wave,10);assert.ok(m.sides.every(s=>s.enemies.some(e=>e.kind==='boss_ufo')));
});

test('ranked random spawns follow original relative weights for all 13 types from wave one',()=>{
  const pool=R.enemyPool(1),m=create(8457),counts=Object.fromEntries(pool.map(e=>[e.key,0]));
  assert.ok(Math.abs(pool.reduce((sum,e)=>sum+e.probability,0)-1)<1e-12);
  for(const item of pool)assert.equal(item.weight,context.SpaceTowerRankedEnemies.types[item.key].weight);
  for(let i=0;i<30000;i++){counts[R.spawn(m,0).kind]++;m.sides[0].enemies.length=0;}
  for(const item of pool)assert.ok(Math.abs(counts[item.key]/30000-item.probability)<.012,`${item.key}: ${counts[item.key]}`);
  const later=R.enemyPool(40);assert.ok(later.find(e=>e.key==='basic').probability<pool.find(e=>e.key==='basic').probability);
  assert.ok(later.find(e=>e.key==='tank').probability>pool.find(e=>e.key==='tank').probability);
});

test('waves add new mixed batches without deleting surviving enemies or transferred types',()=>{
  const m=create(82);for(const s of m.sides)s.hp=s.maxHp=1e8;
  for(let i=0;i<200;i++)R.tick(m,.05,{opponentAI:false});
  assert.equal(m.wave,1);assert.ok(new Set(m.sides[0].enemies.map(e=>e.kind)).size>=4);
  const carried=R.spawn(m,0,{kind:'healer'});carried.speed=0;carried.x=1;carried.y=0;
  m.elapsed=19.96;R.tick(m,.05,{opponentAI:false});assert.equal(m.wave,2);assert.ok(m.sides[0].enemies.some(e=>e.id===carried.id));
  assert.equal(m.sides[0].spawnRemaining,R.waveStats(2).count);
  const shield=R.spawn(m,0,{kind:'full_shield'});R.damage(m,0,shield,1e6);const arrival=m.sides[1].enemies.find(e=>e.lineage===shield.lineage);
  assert.equal(arrival.kind,'full_shield');assert.equal(arrival.ability,'full_shield');assert.equal(arrival.shieldHp,arrival.maxShieldHp);
});
test('burn uses time-integrated damage, not a minimum per-frame hit',()=>{
  const m=create(15),s=m.sides[0];s.wave=1;s.spawnRemaining=0;s.spawnTimer=999;const e=R.spawn(m,0);e.hp=e.maxHp=100;e.x=.9;e.y=0;e.speed=0;e.burn=4.48;e.burnUntil=2;
  for(let i=0;i<20;i++)R.tick(m,.05,{opponentAI:false});assert.ok(Math.abs(e.hp-95.52)<1e-7);
});

test('rating rewards rebound after losses and reversals grow after wins within bounded curves',()=>{
  const baseWin=R.resultFor(1200,1200,{wins:0,losses:0},'win'),baseLoss=R.resultFor(1200,1200,{wins:0,losses:0},'loss');
  assert.equal(baseWin.cups,24);assert.equal(baseLoss.cups,-25);
  let previousWin=baseWin.cups,previousLoss=baseLoss.cups;
  for(let n=1;n<=20;n++){
    const win=R.resultFor(1200,1200,{wins:0,losses:n},'win'),loss=R.resultFor(1200,1200,{wins:n,losses:0},'loss');
    assert.ok(win.cups>=previousWin&&win.cups<=48);assert.ok(loss.cups<=previousLoss&&loss.cups>=-57);
    assert.equal(win.streak.wins,1);assert.equal(win.streak.losses,0);assert.equal(loss.streak.wins,0);assert.equal(loss.streak.losses,1);
    assert.equal(win.obsidian,100);assert.equal(loss.obsidian,25);previousWin=win.cups;previousLoss=loss.cups;
  }
  assert.equal(R.resultFor(1200,1200,{wins:0,losses:3},'win').cups,39);
  assert.equal(R.resultFor(1200,1200,{wins:3,losses:0},'loss').cups,-44);
});

test('rating curve accounts for opponents and high ratings while never producing negative rating',()=>{
  const s={wins:0,losses:0};
  assert.ok(R.resultFor(1000,1400,s,'win').cups>R.resultFor(1400,1000,s,'win').cups);
  assert.ok(R.resultFor(1000,1400,s,'loss').cups>R.resultFor(1400,1000,s,'loss').cups);
  assert.ok(R.resultFor(4000,4000,s,'loss').cups<R.resultFor(1200,1200,s,'loss').cups);
  const floor=R.resultFor(3,1200,{wins:20,losses:0},'loss');assert.equal(floor.ratingAfter,0);assert.equal(floor.cups,-3);
  const draw=R.resultFor(1200,1200,s,'draw');assert.equal(draw.cups,0);assert.equal(draw.ratingAfter,1200);
});

test('settlement snapshots each side once and a rematch can carry its rating and streak',()=>{
  const m=R.create({loadout:ids,ratings:[1200,1200],streaks:[{wins:0,losses:3},{wins:3,losses:0}]});m.sides[1].hp=0;R.tick(m,.05,{opponentAI:false});
  assert.equal(m.winner,0);assert.equal(m.results[0].cups,39);assert.equal(m.results[1].cups,-44);
  const before=JSON.stringify(m.results);for(let i=0;i<100;i++)R.tick(m,.05);assert.equal(JSON.stringify(m.results),before);
  const result=m.results[0],next=R.create({loadout:ids,ratings:[result.ratingAfter,1200],streaks:[result.streak,{wins:0,losses:0}]});
  assert.equal(next.ratings[0],1239);assert.equal(next.streaks[0].wins,1);assert.equal(next.streaks[0].losses,0);assert.equal(next.results,null);
});
