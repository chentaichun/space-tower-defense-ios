import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const v2 = readFileSync(new URL('../v2-features.js', import.meta.url), 'utf8');
const constant = name => html.match(new RegExp(`    const ${name} = \\{[\\s\\S]*?^    \\};`, 'm'))[0];
const oneLine = name => html.match(new RegExp(`    const ${name} = [^\\n]+`))[0];
const fn = name => html.match(new RegExp(`    function ${name}\\([^]*?^    \\}`, 'm'))[0];
function runtime() {
  const context = vm.createContext({});
  vm.runInContext(`let activeRunTier=1, wave=100, coreHp=1000;
    const towerStats={maxHp:1000}; const tower={x:0,y:0,radius:20};
    const clampTier=t=>Math.max(1,Math.min(20,t));
    const getWaveGoldScale=()=>1; const getLocalizedBossName=b=>b.title;
    const getTowerRange=()=>100; const width=500,height=500;
    const rand=(a,b)=>(a+b)/2; const laserBeams=[], shockwaves=[], scorePopups=[], hits=[];
    const pushVisualEffect=(list,limit,item)=>list.push(item);
    const applyCoreDamageV2=(damage)=>hits.push(damage);
    const createTowerImpact=()=>{}; const endRun=()=>{}; const getExtraText=()=>({starBeam:'beam'});
    ${['MINOR_ENEMY_BALANCE','BOSS_ATTACK_BALANCE','minorSummonRemainders'].map(oneLine).join('\n')}
    ${['RUNTIME_BALANCE','BASIC_ENEMY','ENEMY_TYPES','BOSS_TYPES'].map(constant).join('\n')}
    ${['getTierDifficulty','getBasicEnemyStats','getMinorEnemyLateHpMultiplier','getEnemyStats','getEscortStats','getBossStats','updateBossSpecial','scaleMinorSummonCount','isTargetable'].map(fn).join('\n')}
    ${v2.match(/const v2BaseGetBasicEnemyStats = getBasicEnemyStats;[\s\S]*?^\};/m)[0]}
    ${v2.match(/Object.assign\(ENEMY_TYPES, \{[\s\S]*?^\}\);/m)[0]}
  `,context);
  return expression => vm.runInContext(expression,context);
}

test('minor HP rises after wave 60 while spawn counts and contact damage stay stable',()=>{
  const run=runtime();
  for(const [wave,hp,count] of [[1,10,19],[10,96,28],[50,698,36],[100,2668,49],[500,22180,126],[1000,48825,202],[1500,77860,269]]) {
    assert.equal(run(`getEnemyStats(${wave},ENEMY_TYPES.basic).hp`),hp);
    assert.equal(run(`getBasicEnemyStats(${wave}).count`),count);
  }
  assert.equal(run('getMinorEnemyLateHpMultiplier(60)'),1);
  assert.equal(run('getMinorEnemyLateHpMultiplier(100)'),1.8);
  assert.equal(run('getMinorEnemyLateHpMultiplier(135)'),2.5);
  assert.equal(run('getEnemyStats(100,ENEMY_TYPES.tank).hp'),8669);
  assert.equal(run('getEnemyStats(100,ENEMY_TYPES.tank).collisionDamage'),65);
  assert.equal(run('getEscortStats(100).hp'),1922);
});

test('Boss HP increases independently of minor HP while contact damage stays fixed',()=>{
  const run=runtime();
  for(const [key,wave,hp] of [['ufo',10,3600],['mothership',50,181480],['destroyer',100,1778400],['starRing',500,21292800],['omegaCrystal',1000,128898000]]) {
    assert.equal(run(`getBossStats(${wave},BOSS_TYPES.${key}).hp`),hp);
  }
  assert.equal(run('getBossStats(100,BOSS_TYPES.destroyer).collisionDamage'),285);
  run('towerStats.maxHp=10');
  assert.equal(run('getBossStats(100,BOSS_TYPES.destroyer).collisionDamage'),20);
});

test('wave 100 red beam deals five times its former damage without losing its range',()=>{
  const run=runtime();
  run('var boss={...getBossStats(100,BOSS_TYPES.destroyer),x:1000,y:1000,size:50,beamTimer:0}');
  assert.equal(run('isTargetable(boss)'),false);
  run('updateBossSpecial(boss,0.1)');
  assert.equal(run('hits[0]'),525);
  assert.equal(run('laserBeams.length'),1);
  run('wave=100000000;boss.beamTimer=0;updateBossSpecial(boss,0.1)');
  assert.equal(run('hits[1]'),1200);
});

test('wave 50 mothership gains a ranged beam and replenishes larger escort waves quickly',()=>{
  const run=runtime();
  run('var mother={...getBossStats(50,BOSS_TYPES.mothership),x:1000,y:1000,size:50,beamTimer:0}');
  assert.equal(run('mother.hp'),181480);
  assert.equal(run('mother.escortInterval[0]'),1);
  assert.equal(run('mother.escortInterval[1]'),1.6);
  assert.equal(run('mother.escortBatch'),4);
  assert.equal(run('mother.maxEscorts'),22);
  run('wave=50;updateBossSpecial(mother,0.1)');
  assert.equal(run('hits[0]'),200);
});

test('ranged minor enemies fire harder and faster without increasing contact damage',()=>{
  const source = v2.match(/function updateV2EnemyAbilitiesAfter\(dt\) \{[\s\S]*?^\}/m)[0];
  const hits = [];
  const enemy = { ability:'ranged', abilityTimer:0, blindTime:0, v2BuffTimer:0,
    v2BurnTime:0, speed:20, _v2BaseSpeed:20, collisionDamage:40, _v2BaseCollision:40, x:10, y:10 };
  const context = { enemies:[enemy], laserBeams:[], tower:{x:0,y:0}, activeRunTier:1,
    getV2UiText:()=>({rangedShot:'SHOT'}), applyCoreDamageV2:raw=>hits.push(raw) };
  vm.runInNewContext(source, context);
  context.updateV2EnemyAbilitiesAfter(0.1);
  assert.equal(hits[0],50);
  assert.equal(enemy.abilityTimer,3.84);
  assert.equal(enemy.collisionDamage,40);
  assert.equal(context.laserBeams.length,1);
});

test('Boss pulses increase fivefold and retain their cadence',()=>{
  const run=runtime();
  run('var boss={...getBossStats(500,BOSS_TYPES.starRing),x:1000,y:1000,size:50,pulseTimer:0}; updateBossSpecial(boss,0.1)');
  assert.equal(run('hits[0]'),125);
  assert.equal(run('boss.pulseTimer'),12);
});

test('summoned minor enemies retain fractional extras rather than rounding away the increase',()=>{
  const run=runtime();
  assert.equal(run('Array.from({length:5},()=>scaleMinorSummonCount(2,"splitter")).reduce((a,b)=>a+b,0)'),12);
  assert.equal(run('Array.from({length:5},()=>scaleMinorSummonCount(3,"escort")).reduce((a,b)=>a+b,0)'),18);
});
