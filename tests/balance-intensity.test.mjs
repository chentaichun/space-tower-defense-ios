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
    ${['getTierDifficulty','getBasicEnemyStats','getEnemyStats','getEscortStats','getBossStats','updateBossSpecial','scaleMinorSummonCount','isTargetable'].map(fn).join('\n')}
    ${v2.match(/const v2BaseGetBasicEnemyStats = getBasicEnemyStats;[\s\S]*?^\};/m)[0]}
    ${v2.match(/Object.assign\(ENEMY_TYPES, \{[\s\S]*?^\}\);/m)[0]}
  `,context);
  return expression => vm.runInContext(expression,context);
}

test('minor HP doubles and counts rise 20 percent across early pacing and late waves',()=>{
  const run=runtime();
  for(const [wave,hp,count] of [[1,10,19],[10,96,28],[50,698,36],[100,1482,49],[500,8872,126],[1000,19530,202],[1500,31144,269]]) {
    assert.equal(run(`getEnemyStats(${wave},ENEMY_TYPES.basic).hp`),hp);
    assert.equal(run(`getBasicEnemyStats(${wave}).count`),count);
  }
  assert.equal(run('getEnemyStats(100,ENEMY_TYPES.tank).hp'),4816);
  assert.equal(run('getEnemyStats(100,ENEMY_TYPES.tank).collisionDamage'),65);
  assert.equal(run('getEscortStats(100).hp'),1068);
});

test('minor HP change does not double Boss HP and Boss contact damage increases fivefold',()=>{
  const run=runtime();
  for(const [key,wave,hp] of [['ufo',10,2400],['mothership',50,90740],['destroyer',100,889200],['starRing',500,14195200],['omegaCrystal',1000,85932000]]) {
    assert.equal(run(`getBossStats(${wave},BOSS_TYPES.${key}).hp`),hp);
  }
  assert.equal(run('getBossStats(100,BOSS_TYPES.destroyer).collisionDamage'),285);
  run('towerStats.maxHp=10');
  assert.equal(run('getBossStats(100,BOSS_TYPES.destroyer).collisionDamage'),20);
});

test('Boss beams fire outside player targeting range at three times the old damage and scaled cap',()=>{
  const run=runtime();
  run('var boss={...getBossStats(100,BOSS_TYPES.destroyer),x:1000,y:1000,size:50,beamTimer:0}');
  assert.equal(run('isTargetable(boss)'),false);
  run('updateBossSpecial(boss,0.1)');
  assert.equal(run('hits[0]'),105);
  assert.equal(run('laserBeams.length'),1);
  run('wave=100000000;boss.beamTimer=0;updateBossSpecial(boss,0.1)');
  assert.equal(run('hits[1]'),240);
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
