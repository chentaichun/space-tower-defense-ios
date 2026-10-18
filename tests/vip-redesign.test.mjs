import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../v2-features.js', import.meta.url), 'utf8');
const slice = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const definitions = vm.runInNewContext(readFileSync(new URL('../turret-catalog.js', import.meta.url), 'utf8').match(/const V2_TURRET_DEFS = (\[[\s\S]*?\]);/)[1]);

test('equipped main weapons replace starter rendering and attacks; unequipping restores the starter', () => {
  let baseDraws = 0, equippedDraws = 0, baseShots = 0;
  const context = vm.createContext({
    v2WorkshopMainTurrets: [], bullets: [], cardEffects: { extraRowLevel: 0 },
    drawTower() { baseDraws++; }, drawWorkshopMainTurrets() { equippedDraws++; },
    fireAt() { baseShots++; context.bullets.push({ source: 'main' }); }
  });
  vm.runInContext(slice('const v2BaseDrawTower =', 'drawAuxTurrets ='), context);
  vm.runInContext(slice('const v2BaseFireAt =', 'function spawnSplitterChildren'), context);
  context.drawTower(); context.fireAt({});
  assert.deepEqual([baseDraws, equippedDraws, baseShots], [1, 0, 1]);
  for (const main of definitions.filter(d => d.role === 'main')) {
    context.v2WorkshopMainTurrets = [{ kind: main.id }];
    context.bullets.length = 0;
    context.drawTower(); context.fireAt({});
    assert.equal(baseDraws, 1, main.id);
    assert.equal(baseShots, 1, main.id);
    assert.equal(context.bullets.length, 0, main.id);
  }
  context.v2WorkshopMainTurrets.push({ kind: 'vip_quantum_crown' });
  context.drawTower(); context.fireAt({});
  assert.equal(baseShots, 1); assert.equal(baseDraws, 1);
  context.v2WorkshopMainTurrets = [];
  context.drawTower(); context.fireAt({});
  assert.equal(baseShots, 2); assert.equal(baseDraws, 2);
});

test('equipped weapons still aim and fire once each without adding a starter shot', () => {
  const fired = [];
  const context = vm.createContext({
    v2WorkshopMainTurrets: [{kind:'vip_prism_lancer',fireTimer:0}, {kind:'vip_quantum_crown',fireTimer:0}],
    V2_TURRET_DEFS: definitions, towerStats:{maxHp:100}, coreHp:100,
    getWorkshopMainPosition: i => ({x:i*10,y:0,angle:0}),
    getWorkshopTurretTarget: () => ({x:100,y:100}), clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),
    fireWorkshopTurret:(def,pos,target,source)=>fired.push([def.id,source]),
    getFireDelay:()=>1, getV2TurretRateMultiplier:()=>1
  });
  vm.runInContext(slice('function updateWorkshopMainTurrets(', 'function updateWorkshopProjectiles('), context);
  context.updateWorkshopMainTurrets(.016);
  assert.deepEqual(fired, [['vip_prism_lancer','main-workshop'],['vip_quantum_crown','main-workshop']]);
  context.updateWorkshopMainTurrets(.016); assert.equal(fired.length,2);
});

test('all ten VIP silhouettes are distinct, finite and use the same renderer in combat', () => {
  const context = vm.createContext({});
  vm.runInContext(slice('function tracePreviewPolygon(', 'function drawTurretPreviewCanvas('), context);
  const traces = new Set();
  for (const turret of definitions.filter(d => d.vipExclusive)) {
    const trace = []; let depth = 0;
    const c = new Proxy({}, {set:()=>true, get:(_,method)=>method==='createLinearGradient'?()=>({addColorStop(){}}):(...args)=>{
      for(const value of args) if(typeof value === 'number') assert.ok(Number.isFinite(value),`${turret.id}: ${method}`);
      if(method === 'save') depth++;
      if(method === 'restore') {depth--; assert.ok(depth>=0);}
      trace.push([method,...args]);
    }});
    context.drawVipTurretEmblem(c,turret,12,1);
    assert.equal(depth,0); const portrait=JSON.stringify(trace); traces.add(portrait);
    trace.length=0; context.drawVipBattleArt(c,turret,12,1);
    assert.equal(depth,0); assert.ok(JSON.stringify(trace).endsWith(portrait.slice(1)), 'combat retains the same hull after the live aura');
  }
  assert.equal(traces.size,10);
});

test('VIP store and workshop portraits use game geometry instead of fantasy image assets', () => {
  const context=vm.createContext({escapeHtml:s=>s,getMainTurretVisual:t=>t.id});
  vm.runInContext(slice('function renderTurretPortrait(', 'function tracePreviewPolygon('),context);
  for(const turret of definitions.filter(d=>d.vipExclusive)) {
    const html=context.renderTurretPortrait(turret);
    assert.match(html,new RegExp(`data-turret-preview="${turret.id}"`));
    assert.match(html,/vip-portrait/); assert.doesNotMatch(html,/<img/);
  }
});

test('all ten VIPs use main slots; old support loadouts retain ownership, stars and existing main priority', () => {
  const vips=definitions.filter(d=>d.vipExclusive);
  assert.equal(vips.length,10);
  assert.ok(vips.every(d=>d.role==='main'));
  const context=vm.createContext({V2_TURRET_DEFS:definitions,V2_FRAGMENT_PITY_TARGET:100,
    clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),getV2TurretMaxStars:()=>5,
    getTurretRoleSlotCap:(role,tier)=>role==='main'?tier:tier*3});
  vm.runInContext(readFileSync(new URL('../ranked-progression.js',import.meta.url),'utf8'),context);
  vm.runInContext(slice('function createDefaultV2Progress(', 'function loadV2Progress(')
    +slice('function reconcileV2Equipment(', 'function getActiveEnvironment('),context);
  const old=context.createDefaultV2Progress();
  const ids=['vip_solar_judgment','vip_frost_bloom','vip_abyssal_tide','vip_nebula_hymn','vip_chrono_axis'];
  ids.forEach((id,i)=>{old.assembled[id]=2;old.active[id]=1;old.stars[id]=i+1;old.fragments[id]=87;old.cores[id]=3;old.loadoutPresets.boss[id]=1;});
  old.slotOrder.main=['vip_solar_judgment'];old.slotOrder.auxiliary=ids.slice(1);
  const snapshot=JSON.stringify(old);
  context.v2Progress=context.normalizeV2Progress(old);
  assert.equal(JSON.stringify(old),snapshot,'migration must not mutate its source');
  assert.deepEqual(Array.from(context.v2Progress.slotOrder.main),ids);
  assert.ok(context.v2Progress.slotOrder.auxiliary.every(id=>!id));
  context.reconcileV2Equipment(2);
  assert.equal(context.v2Progress.active.vip_solar_judgment,1);
  assert.equal(context.v2Progress.active.vip_frost_bloom,1);
  assert.equal(Object.values(context.v2Progress.active).reduce((a,b)=>a+b,0),2);
  for(const bucket of ['assembled','stars','fragments','cores'])
    assert.equal(JSON.stringify(context.v2Progress[bucket]),JSON.stringify(old[bucket]),bucket);
  for(const preset of ['progress','boss','resource'])for(const def of definitions)
    assert.equal(context.v2Progress.loadoutPresets[preset][def.id],old.loadoutPresets[preset][def.id]||0);
  const once=JSON.stringify(context.v2Progress);
  context.v2Progress=context.normalizeV2Progress(context.v2Progress);context.reconcileV2Equipment(2);
  assert.equal(JSON.stringify(context.v2Progress),once,'migration is idempotent');
});

test('old active-run VIP supports move to available main sockets and never render twice', () => {
  const context=vm.createContext({V2_TURRET_DEFS:definitions,getMainSlotCap:tier=>tier});
  vm.runInContext(slice('function migrateV2CheckpointTurrets(', 'function restoreActiveRunCheckpoint('),context);
  const checkpoint={v2WorkshopMainTurrets:[{kind:'vip_prism_lancer',fireTimer:.7}],
    auxiliaryTurrets:[{kind:'vip_abyssal_tide',fireTimer:.2},{kind:'vip_nebula_hymn'},{kind:'missile_nest'}]};
  const before=JSON.stringify(checkpoint),full=context.migrateV2CheckpointTurrets(checkpoint,3);
  assert.deepEqual(Array.from(full.main,u=>u.kind),['vip_prism_lancer','vip_abyssal_tide','vip_nebula_hymn']);
  assert.deepEqual(Array.from(full.auxiliary,u=>u.kind),['missile_nest']);
  assert.equal(full.main[1].fireTimer,.2);
  const capped=context.migrateV2CheckpointTurrets(checkpoint,1);
  assert.deepEqual(Array.from(capped.main,u=>u.kind),['vip_prism_lancer']);
  assert.deepEqual(Array.from(capped.auxiliary,u=>u.kind),['missile_nest']);
  assert.equal(JSON.stringify(checkpoint),before);
});

test('VIP support passives remain active from their new main sockets', () => {
  const context=vm.createContext({V2_TURRET_DEFS:definitions,auxiliaryTurrets:[],
    v2WorkshopMainTurrets:[{kind:'vip_nebula_hymn'},{kind:'vip_chrono_axis'}],
    getCritChance:()=>.1,getV2TurretEffectMultiplier:()=>1,CRIT_CHANCE_MAX:1,
    clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),getActiveEnvironment:()=>null,
    enemies:[{speed:100,collisionDamage:10,hp:100,maxHp:100}],tower:{x:0,y:0}});
  vm.runInContext(slice('const v2BaseGetCritChance =', '// ---------- Early-wave pacing'),context);
  assert.ok(Math.abs(context.getCritChance()-.18)<1e-9);
  // Evaluate the same aura expression used before enemy movement.
  const slow=source.match(/const slowAura = (clamp\(\[\.\.\.auxiliaryTurrets,[\s\S]*?0\.5\));/)[1];
  assert.equal(vm.runInContext(slow,context),.09);
  context.v2WorkshopMainTurrets=[];
  assert.equal(context.getCritChance(),.1);assert.equal(vm.runInContext(slow,context),0);
});
