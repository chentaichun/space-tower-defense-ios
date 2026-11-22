import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import '../ranked-render-performance.js';

const {RenderBudget,text,attr}=globalThis.SpaceTowerRankedRendering;

test('ranked rendering respects high-refresh screens and resumes without catch-up bursts',()=>{
  for(const [quality,cap,ratio] of [['low',60,1.25],['medium',60,2],['high',60,2.5]]){
    for(const hz of [30,60,90,120,144]){
      const budget=new RenderBudget(quality);let draws=0;
      for(let frame=0;frame<hz*10;frame++)draws+=budget.shouldDraw(frame*1000/hz);
      // Even pacing: every Nth refresh, never above the cap and never below 45 FPS.
      assert.ok(draws<=cap*10+1&&draws>=Math.min(hz,45)*10-2,`${quality} / ${hz} Hz: ${draws}`);
      assert.equal(budget.pixelRatio,ratio);
      assert.equal(budget.shouldDraw(60000),true);
      assert.equal(budget.shouldDraw(60001),false);
    }
  }
  for(const hz of [90,120,144,165]){const budget=new RenderBudget();const gaps=[];let last=null;
    for(let frame=0;frame<hz*4;frame++){const t=frame*1000/hz;if(budget.shouldDraw(t)){if(last!==null&&frame>hz)gaps.push(Math.round((t-last)*hz/1000));last=t;}}
    assert.equal(new Set(gaps).size,1,`${hz} Hz frames are evenly spaced: ${[...new Set(gaps)]}`);}
  const idle=new RenderBudget();let draws=0;
  for(let frame=0;frame<1200;frame++)draws+=idle.shouldDraw(frame*1000/120,false);
  assert.ok(draws>=149&&draws<=151);
  assert.equal(idle.shouldDraw(10000,true),true);
});

test('sustained expensive frames lower resolution by one small step while preserving 60 FPS and art quality',()=>{
  const budget=new RenderBudget('high');
  for(let i=0;i<120;i++)budget.record(30,i*16.67);
  assert.equal(budget.pixelRatio,2.5,'brief spikes do not trigger repeated resolution changes');
  for(let i=120;i<2000;i++)budget.record(30,i*16.67);
  assert.equal(budget.pixelRatio,2.25,'resolution drops one small step, never to a visibly soft image');assert.equal(budget.fps,60);
  for(let i=2000;i<3000;i++)budget.record(30,i*16.67);
  assert.equal(budget.pixelRatio,2.25);assert.equal(budget.fps,60);assert.equal(budget.quality,'high','art quality never changes mid-match');
});

test('normal 60 Hz vsync jitter does not produce repeated 33 ms presentation gaps',()=>{
  for(const quality of ['low','medium','high']){
    const budget=new RenderBudget(quality);let frames=0;
    for(let i=0;i<600;i++)frames+=budget.shouldDraw(i*1000/60+(i%2?-.9:.9));
    assert.equal(frames,600,quality);
  }
});

test('GPU missed frames reduce resolution even when JavaScript command submission is cheap',()=>{
  const slow=new RenderBudget('medium'),smooth=new RenderBudget('medium');
  for(let i=0;i<600;i++){slow.record(2,i*1000/30,1000/30);smooth.record(2,i*1000/60,1000/60);}
  assert.ok(slow.pixelRatio<2);assert.equal(slow.fps,60);
  assert.equal(smooth.pixelRatio,2);assert.equal(smooth.fps,60);assert.equal(smooth.quality,'medium');
  // Paced high-refresh screens are on time, not overloaded.
  for(const hz of [90,144]){const paced=new RenderBudget('medium');let last=0;
    for(let i=0;i<hz*12;i++){const t=i*1000/hz;if(paced.shouldDraw(t)){paced.record(2,t,t-last);last=t;}}
    assert.equal(paced.pixelRatio,2,`${hz} Hz`);assert.equal(paced.quality,'medium',`${hz} Hz`);}
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
  const scope={SpaceTowerCatalog:{byId:new Map(definitions.map(d=>[d.id,d]))},SpaceTowerRanked:{positions:Array.from({length:12},()=>[0,0]),SLOT_COUNT:12,TRACK:{w:.84,h:.74,start:.06,end:-.14},CORE:[-.16,-.74],PATH_LENGTH:6.12,pathPoint:d=>({x:d/10-.3,y:-.74,heading:0})},document:{createElement(){const c=canvas();layers.push(c);return c;}},rankedTurretMuzzles:()=>[[12,0]],drawRankedProjectile(c,d){weaponDraws.push(d.id);},drawRankedEnemies(){},drawRankedEnemyOverlay(){}};
  vm.runInNewContext(readFileSync(new URL('../ranked-battle-art.js',import.meta.url),'utf8'),scope);
  const board=canvas(),g={w:400,h:300,cx:200,cy:165,sx:248,sy:150,size:36,dpr:1.25};
  const unit={id:'shield',slot:0,star:1,hp:100,maxHp:100,angle:0,firedAt:-1,hitAt:-1};
  const state={units:[unit,...Array(11).fill(null)],enemies:[],beams:[],impacts:[],popups:[],projectiles:Array.from({length:80},(_,i)=>({id:i%2?'gatling':'phoenix',x:.2,y:.3,angle:.5,age:.1,born:0}))};
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
