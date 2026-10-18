import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const ux = read('progression-ux.js');
const v2 = read('v2-features.js');
const ultimate = read('ultimate-system.js');
const slice = (source, start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const definitions = source => vm.runInNewContext(source.match(/const (?:V2_TURRET_DEFS|ULTIMATE_DEFS) = (?:Object.freeze\()?(\[[\s\S]*?\])\)?;/)[1]);
const turrets = definitions(read('turret-catalog.js')), ultimates = definitions(ultimate);
const profiles = slice(ux, 'const ULTIMATE_PREVIEW_EFFECTS', 'let stopEquipmentAnimation');
const frameFunction = slice(ux, 'function drawEquipmentBattleFrame', 'function addEquipmentPreviewButtons');
function canvasContext() {
  let operations = 0;
  const c = new Proxy({}, {get: (_, key) => ['createRadialGradient','createLinearGradient'].includes(key) ? () => ({addColorStop() {}}) : (...args) => {
    operations++;
    for (const value of args) if (typeof value === 'number') assert.ok(Number.isFinite(value), `${String(key)} got ${value}`);
    if (key === 'arc') assert.ok(args[2] >= 0);
  }, set: () => true});
  return { c, count: () => operations };
}
test('all 49 turrets and 26 ultimates render complete loops without gameplay globals or input mutation', () => {
  const context = vm.createContext({ULTIMATE_GRADE_COLOR:{A:'#ff6b8d',B:'#ff9b61',C:'#ffe06a',D:'#77f4b5',E:'#70dcff',F:'#c290ff'}});
  vm.runInContext(slice(v2, 'function tracePreviewPolygon(', 'function drawTurretPreviewCanvas(')
    + slice(v2, 'function drawVipProjectileSignature(', 'const vipShowcase =')
    + slice(v2, 'function drawVipCombatPreview(', 'function drawVipShowcaseFrame(')
    + profiles + frameFunction, context);
  assert.equal(turrets.length, 49);
  assert.equal(ultimates.length, 26);
  for (const id of ultimates.map(item => item.id)) assert.ok(vm.runInContext(`ULTIMATE_PREVIEW_EFFECTS[${JSON.stringify(id)}]`, context), id);
  for (const [items, isUltimate] of [[turrets, false], [ultimates, true]]) {
    for (const item of items) {
      const before = JSON.stringify(item), drawing = canvasContext();
      Object.freeze(item);
      for (let t = 0; t <= 20; t += .125) context.drawEquipmentBattleFrame(drawing.c, {}, item, isUltimate, t);
      assert.equal(JSON.stringify(item), before);
      assert.ok(drawing.count() > 1000, item.id);
    }
  }
});
test('preview animation cancels on pause, backgrounding, replacement and close', () => {
  let next = 0, draws = 0;
  const frames = new Map(), listeners = new Map(), attrs = {};
  const playback = {setAttribute: (key, value) => attrs[key] = value};
  const document = {hidden:false, createElement:()=>({}), addEventListener:(name,fn)=>listeners.set(name,fn), removeEventListener:(name)=>listeners.delete(name)};
  const dialogListeners = {};
  const context = vm.createContext({document, currentLanguage:'en', window:{}, V2_TURRET_DEFS:turrets,
    equipmentPreview:{open:true, querySelector:()=>playback, addEventListener:(name, fn)=>dialogListeners[name]=fn},
    drawTurretPreviewCanvas(){}, drawEquipmentBattleFrame(){draws++;}, requestAnimationFrame:fn=>{frames.set(++next,fn); return next;}, cancelAnimationFrame:id=>frames.delete(id)});
  vm.runInContext(slice(ux, 'let stopEquipmentAnimation', 'function drawEquipmentBattleFrame'), context);
  const start = () => context.startEquipmentAnimation({getContext:()=>({})}, turrets[0], false);
  start(); assert.equal(frames.size,1); assert.equal(draws,1);
  playback.onclick(); assert.equal(frames.size,0); assert.equal(attrs['aria-pressed'],'true');
  playback.onclick(); assert.equal(frames.size,1);
  document.hidden=true; listeners.get('visibilitychange')(); assert.equal(frames.size,0);
  document.hidden=false; listeners.get('visibilitychange')(); assert.equal(frames.size,1);
  start(); assert.equal(frames.size,1); assert.equal(listeners.size,1);
  dialogListeners.close(); assert.equal(frames.size,0); assert.equal(listeners.size,0);
});

test('both VIP preview entry points render identical attack frames for every weapon', () => {
  const context = vm.createContext({});
  vm.runInContext(slice(v2, 'function tracePreviewPolygon(', 'function drawTurretPreviewCanvas(')
    + slice(v2, 'function drawVipProjectileSignature(', 'const vipShowcase =')
    + slice(v2, 'function drawVipCombatPreview(', 'function drawVipShowcaseFrame(')
    + profiles + frameFunction, context);
  let trace = [];
  const c = new Proxy({}, {set:(_,key,value)=>{trace.push([key,value]);return true;}, get:(_,key)=>
    ['createRadialGradient','createLinearGradient'].includes(key) ? () => ({addColorStop(){}}) : (...args)=>trace.push([key,...args])});
  for(const turret of turrets.filter(t=>t.vipExclusive)) {
    const phases=new Set();
    for(const seconds of [.3,.72,1.1,1.48,1.8,2.8]) {
      trace=[];context.drawVipCombatPreview(c,turret,seconds);const showcase=JSON.stringify(trace);
      trace=[];context.drawEquipmentBattleFrame(c,{},turret,false,seconds);
      assert.equal(JSON.stringify(trace),showcase,turret.id);
      phases.add(showcase);
    }
    assert.ok(phases.size>=5,`${turret.id} must animate throughout its attack cycle`);
  }
});
test('formation renders one main and three supports per unlocked Tier, retaining repeated equipment', () => {
  const output = {innerHTML:''};
  const dialog = { className:'', setAttribute(){}, addEventListener(){}, classList:{add(){},remove(){}}, querySelector(){ return null; } };
  const document = {createElement:()=>dialog,body:{append(){}},addEventListener(){}};
  const active = Object.fromEntries(turrets.map(t => [t.id,0]));
  active.emergency_shield = 2; active[turrets.find(t=>t.role==='auxiliary').id] = 5;
  const context = vm.createContext({document,currentLanguage:'zh',workshopCommandCenter:output,V2_TURRET_DEFS:turrets,v2Progress:{active,loadoutPresets:{},slotOrder:{main:[],auxiliary:[]}},
    selectedTier:1,unlockedTier:1,getMainSlotCap:t=>t,getTurretRoleSlotCap:role=>role==='main'?context.unlockedTier:context.unlockedTier*3,getWorkshopCommandText:()=>({presets:['progress','boss','resource']}),
    escapeHtml:x=>String(x||''),renderTurretPortrait:t=>`<canvas data-turret-preview="${t.id}"></canvas>`,
    workshopCompareIds:[],workshopFilters:{},drawWorkshopTurretPreviews(){}});
  vm.runInContext(slice(v2,'function renderWorkshopCommandCenter','function saveWorkshopPreset'),context);
  for (const tier of [1,2,5,20]) {
    context.selectedTier=tier; context.unlockedTier=tier; context.renderWorkshopCommandCenter();
    assert.equal((output.innerHTML.match(/class="formation-slot main"/g)||[]).length,tier);
    assert.equal((output.innerHTML.match(/class="formation-slot auxiliary"/g)||[]).length,tier*3);
    assert.equal((output.innerHTML.match(/data-turret-preview="emergency_shield"/g)||[]).length,Math.min(tier,2));
    assert.equal((output.innerHTML.match(/data-turret-preview="missile_nest"/g)||[]).length,Math.min(tier*3,5));
  }
  assert.equal(active.emergency_shield,2); assert.equal(active.missile_nest,5);
});
