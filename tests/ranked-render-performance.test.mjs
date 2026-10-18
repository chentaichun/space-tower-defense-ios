import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import '../ranked-render-performance.js';

const {RenderBudget,text,attr}=globalThis.SpaceTowerRankedRendering;

test('ranked rendering respects high-refresh screens and resumes without catch-up bursts',()=>{
  for(const [quality,cap,ratio] of [['low',30,1],['medium',60,1.25],['high',60,1.5]]){
    for(const hz of [30,60,90,120,144]){
      const budget=new RenderBudget(quality);let draws=0;
      for(let frame=0;frame<hz*10;frame++)draws+=budget.shouldDraw(frame*1000/hz);
      assert.ok(draws<=cap*10+1&&draws>=Math.min(hz,cap)*10-2,`${quality} / ${hz} Hz: ${draws}`);
      assert.equal(budget.pixelRatio,ratio);
      assert.equal(budget.shouldDraw(60000),true);
      assert.equal(budget.shouldDraw(60001),false);
    }
  }
  const idle=new RenderBudget();let draws=0;
  for(let frame=0;frame<1200;frame++)draws+=idle.shouldDraw(frame*1000/120,false);
  assert.ok(draws>=149&&draws<=151);
  assert.equal(idle.shouldDraw(10000,true),true);
});

test('sustained expensive frames lower visual resolution without changing gameplay',()=>{
  const budget=new RenderBudget('high');
  for(let i=0;i<120;i++)budget.record(30,i*16.67);
  assert.equal(budget.pixelRatio,1.5,'brief spikes do not trigger repeated resolution changes');
  for(let i=120;i<1000;i++)budget.record(30,i*16.67);
  assert.equal(budget.pixelRatio,1);assert.equal(budget.fps,30);
  for(let i=1000;i<2000;i++)budget.record(30,i*16.67);
  assert.equal(budget.pixelRatio,1);assert.equal(budget.fps,30);
});

test('unchanged HUD values do not restart translation or replace translated labels',()=>{
  let textWrites=0,attrWrites=0,content='';const attributes=new Map();
  const node={set textContent(value){textWrites++;content=value;},get textContent(){return content;},setAttribute(key,value){attrWrites++;attributes.set(key,value);}};
  text(node,'召喚砲台');attr(node,'aria-label','欄位 1，空位');
  // The localization observer changes the DOM after the canonical text is set.
  content='Summon turret';attributes.set('aria-label','Slot 1, empty');
  for(let frame=0;frame<600;frame++){text(node,'召喚砲台');attr(node,'aria-label','欄位 1，空位');}
  assert.equal(textWrites,1);assert.equal(attrWrites,1);assert.equal(content,'Summon turret');
  assert.equal(attributes.get('aria-label'),'Slot 1, empty');
  text(node,'已部署');attr(node,'aria-label','欄位 1，基礎砲台');
  assert.equal(textWrites,2);assert.equal(attrWrites,2);
});

test('arena cache keeps every projectile and its weapon art without rebuilding static layers',()=>{
  const layers=[],weaponDraws=[];
  function canvas(){
    const item={width:0,height:0,blits:[]};
    const context=new Proxy({canvas:item,drawImage(...args){item.blits.push(args);},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}},{get(target,key){return key in target?target[key]:()=>{};}});
    item.getContext=()=>context;return item;
  }
  const definitions=[{id:'shield',color:'#abcdef',shield:true},{id:'gatling',color:'#ffffff'},{id:'phoenix',color:'#ffaa00'}];
  const scope={SpaceTowerCatalog:{byId:new Map(definitions.map(d=>[d.id,d]))},SpaceTowerRanked:{positions:Array.from({length:13},()=>[0,0])},document:{createElement(){const c=canvas();layers.push(c);return c;}},drawRankedProjectile(c,d){weaponDraws.push(d.id);},drawRankedEnemies(){},drawRankedEnemyOverlay(){}};
  vm.runInNewContext(readFileSync(new URL('../ranked-battle-art.js',import.meta.url),'utf8'),scope);
  const board=canvas(),g={w:400,h:300,cx:200,cy:165,sx:248,sy:150,size:36,dpr:1.25};
  const unit={id:'shield',slot:0,star:1,hp:100,maxHp:100,angle:0,firedAt:-1,hitAt:-1};
  const state={units:[unit,...Array(12).fill(null)],enemies:[],beams:[],impacts:[],popups:[],projectiles:Array.from({length:80},(_,i)=>({id:i%2?'gatling':'phoenix',x:.2,y:.3,angle:.5,age:.1,born:0}))};
  const before=JSON.stringify(state),portrait=canvas();
  scope.SpaceTowerRankedArt.draw(board.getContext(),g,state,{elapsed:1},0,()=>portrait);
  const allocated=layers.length,firstBlits=board.blits.length;
  assert.deepEqual([...new Set(weaponDraws)].sort(),['gatling','phoenix']);
  assert.equal(weaponDraws.length,2,'each weapon is rasterized once per animation tick');
  board.blits.length=0;
  scope.SpaceTowerRankedArt.draw(board.getContext(),g,state,{elapsed:1.01},0,()=>portrait);
  assert.equal(layers.length,allocated);assert.equal(weaponDraws.length,2);
  assert.equal(board.blits.length,firstBlits);assert.ok(board.blits.length>=80,'no projectiles are omitted');
  scope.SpaceTowerRankedArt.draw(board.getContext(),g,state,{elapsed:1.05},0,()=>portrait);
  assert.equal(layers.length,allocated);assert.equal(weaponDraws.length,4,'animated weapon signatures refresh');
  assert.equal(JSON.stringify(state),before,'rendering never mutates combat state');
  scope.SpaceTowerRankedArt.draw(board.getContext(),{...g,w:420},state,{elapsed:1.06},0,()=>portrait);
  assert.ok(layers.length>allocated,'a resized arena gets correctly sized artwork');
});
