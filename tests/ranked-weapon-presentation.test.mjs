import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
function setup(){
  const scope=vm.createContext({});
  for(const file of ['turret-catalog.js','ranked-enemy-catalog.js','ranked-battle-core.js','ranked-turret-art.js','ranked-battle-art.js','ranked-render-buffer.js'])vm.runInContext(read(file),scope);
  return scope;
}
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
const geometry={w:400,h:280,cx:200,cy:154,sx:248,sy:140,size:36,dpr:1,quality:'medium'};

test('authored right-facing barrels aim at screen-space targets on rectangular arenas',()=>{
  const scope=setup(),art=scope.SpaceTowerRankedArt;
  for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2,.8,-2.7]){
    const u={id:'gatling',slot:0,angle};
    const pose=art.weaponPose(geometry,u,angle,1);
    const dx=Math.cos(angle)*geometry.sx,dy=Math.sin(angle)*geometry.sy;
    close(Math.atan2(Math.sin(pose.rotation-Math.atan2(dy,dx)),Math.cos(pose.rotation-Math.atan2(dy,dx))),0);
    // Gatling artwork has three physical barrel ends at source x=65.
    close(Math.hypot(pose.muzzleX-pose.x,pose.muzzleY-pose.y),65*36*1.26/156);
    close((pose.muzzleX-pose.x)*dy-(pose.muzzleY-pose.y)*dx,0);
  }
  const sniper=art.weaponPose(geometry,{id:'long_range_sniper',slot:0,angle:0});
  close(sniper.muzzleX,200+82*36*1.26/156);close(sniper.muzzleY,154);
});

test('every weapon has finite emitters aligned with its firing direction at all viewport ratios',()=>{
  const scope=setup(),art=scope.SpaceTowerRankedArt;
  for(const d of scope.SpaceTowerCatalog.turrets)for(const sy of [80,140,360]){
    const g={...geometry,sy};
    for(const angle of [-2.3,0,1.1]){
      const u={id:d.id,slot:5,angle},pose=art.weaponPose(g,u);
      assert.ok(Object.values(pose).filter(v=>typeof v==='number').every(Number.isFinite),d.id);
      const localX=pose.tips.reduce((sum,p)=>sum+p[0],0)/pose.tips.length,localY=pose.tips.reduce((sum,p)=>sum+p[1],0)/pose.tips.length;
      const x=localX*Math.cos(pose.rotation)-localY*Math.sin(pose.rotation),y=localX*Math.sin(pose.rotation)+localY*Math.cos(pose.rotation);
      close(x*Math.sin(angle)*g.sy-y*Math.cos(angle)*g.sx,0);
      assert.ok(x*Math.cos(angle)*g.sx+y*Math.sin(angle)*g.sy>0,d.id);
    }
  }
});

test('projectiles start at real muzzles, arrive at authoritative impacts, and split in flight',()=>{
  const scope=setup(),art=scope.SpaceTowerRankedArt,owner={uid:7,id:'gatling',slot:0,angle:.8};
  const p={uid:10,id:'gatling',owner,originX:0,originY:0,x:0,y:0,tx:.8,ty:.9,angle:.8,age:0};
  const before=JSON.stringify(p),pose=art.weaponPose(geometry,owner,.8,10),start=art.shotPoint(geometry,p);
  close(start[0],pose.muzzleX);close(start[1],pose.muzzleY);assert.equal(JSON.stringify(p),before);
  const end=art.shotPoint(geometry,{...p,x:.8,y:.9});close(end[0],200+.8*248);close(end[1],154+.9*140);
  const child={...p,uid:11,originX:.2,originY:.3,x:.2,y:.3};
  const split=art.shotPoint(geometry,child);close(split[0],200+.2*248);close(split[1],154+.3*140);
});

test('new homing snapshots cannot rewrite already buffered segments of a projectile path',()=>{
  const scope=setup(),R=scope.SpaceTowerRanked,buffer=new scope.SpaceTowerRankedRenderBuffer();
  const m=R.create({loadout:['gatling','frost_core','flame_core','time_slow','shield_generator']});
  const p={uid:99,id:'gatling',born:0,originX:0,originY:0,age:0,angle:0};
  for(const [t,x,y]of [[0,0,0],[.2,.2,0],[.4,.2,.3]]){
    m.elapsed=t;m.sides[0].projectiles=[{...p,x,y,age:t,tx:.2,ty:.6}];buffer.push(JSON.parse(JSON.stringify(m)),t*1000);
  }
  buffer.time=.1;buffer.sampled=400;
  const first=buffer.sample(400).sides[0].projectiles[0];close(first.x,.1);close(first.y,0);
  m.elapsed=.6;m.sides[0].projectiles=[{...p,x:-.2,y:.5,age:.6,tx:-.3,ty:.6}];
  const untouched=JSON.stringify(m);buffer.push(m,600);buffer.time=.1;buffer.sampled=600;
  const next=buffer.sample(600).sides[0].projectiles[0];close(next.x,.1);close(next.y,0);
  buffer.time=.3;buffer.sampled=600;const corner=buffer.sample(600).sides[0].projectiles[0];close(corner.x,.2);close(corner.y,.15);
  assert.equal(JSON.stringify(m),untouched);
});

test('a buffered muzzle turns at the displayed shot time rather than the packet arrival',()=>{
  const scope=setup(),R=scope.SpaceTowerRanked,buffer=new scope.SpaceTowerRankedRenderBuffer();
  const m=R.create({loadout:['gatling','frost_core','flame_core','time_slow','shield_generator']});
  const u={uid:7,id:'gatling',slot:0,angle:0,timer:.2,firedAt:-1};m.sides[0].units[0]=u;
  buffer.push(JSON.parse(JSON.stringify(m)),0);
  m.elapsed=.2;u.angle=Math.PI/2;u.firedAt=.1;
  m.sides[0].projectiles=[{uid:99,id:'gatling',owner:u,born:.1,originX:0,originY:0,x:0,y:.2,tx:0,ty:1,angle:Math.PI/2,age:.1}];
  buffer.push(JSON.parse(JSON.stringify(m)),200);
  buffer.time=.05;buffer.sampled=200;let shown=buffer.sample(200).sides[0].units[0];close(shown.angle,0);close(shown.firedAt,-1);
  buffer.time=.1;buffer.sampled=200;shown=buffer.sample(200).sides[0].units[0];close(shown.angle,Math.PI/2);close(shown.firedAt,.1);
  const shot=buffer.sample(200).sides[0].projectiles[0],pose=scope.SpaceTowerRankedArt.weaponPose(geometry,shown,shown.angle,shot.uid),point=scope.SpaceTowerRankedArt.shotPoint(geometry,shot);
  close(point[0],pose.muzzleX);close(point[1],pose.muzzleY);
});

test('a projectile advanced in its creation tick still first appears at its muzzle',()=>{
  const scope=setup(),R=scope.SpaceTowerRanked,buffer=new scope.SpaceTowerRankedRenderBuffer();
  const m=R.create({loadout:['gatling','frost_core','flame_core','time_slow','shield_generator']});
  buffer.push(JSON.parse(JSON.stringify(m)),0);
  const owner={uid:7,id:'gatling',slot:0,angle:0,firedAt:.2};m.elapsed=.2;m.sides[0].units[0]=owner;
  m.sides[0].projectiles=[{uid:99,id:'gatling',owner,born:.2,originX:0,originY:0,x:.13,y:0,tx:1,ty:0,angle:0,age:.05}];
  buffer.push(JSON.parse(JSON.stringify(m)),200);m.elapsed=.4;m.sides[0].projectiles[0].x=.65;buffer.push(JSON.parse(JSON.stringify(m)),400);
  buffer.time=.2;buffer.sampled=400;const p=buffer.sample(400).sides[0].projectiles[0];close(p.x,0);close(p.y,0);
  const pose=scope.SpaceTowerRankedArt.weaponPose(geometry,owner,0,p.uid),point=scope.SpaceTowerRankedArt.shotPoint(geometry,p);
  close(point[0],pose.muzzleX);close(point[1],pose.muzzleY);
});

test('ordinary enemy glows are rasterized once while every enemy and current HP bar is drawn',()=>{
  const scope=setup(),layers=[],bodyCalls=[],blits=[],health=[];
  const makeContext=()=>new Proxy({drawImage(...a){blits.push(a);},fillRect(...a){health.push(a);},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>o[k]||(()=>{})});
  scope.document={createElement(){const context=makeContext(),canvas={width:0,height:0,getContext:()=>context};layers.push(canvas);return canvas;}};
  scope.drawRankedEnemies=(c,enemies,tower,scale,time,quality)=>bodyCalls.push({enemies,quality});scope.drawRankedEnemyOverlay=()=>{};
  const enemies=Array.from({length:90},(_,i)=>({id:i,kind:'basic',shape:'diamond',color:'#ddeeff',strokeColor:'#ffffff',sizeScale:1,x:(i%10)/10,y:.2,hp:5,maxHp:10,hitKick:0,wobble:0,flash:0,trail:[]}));
  const state={units:Array(13).fill(null),enemies,projectiles:[],impacts:[],beams:[],popups:[]},ctx=makeContext();
  scope.SpaceTowerRankedArt.draw(ctx,geometry,state,{elapsed:1},0,()=>{});
  assert.equal(bodyCalls[0].enemies[0].kind,'basic');assert.equal(bodyCalls[0].enemies[0].shape,'diamond');
  const allocated=layers.length;bodyCalls.length=0;blits.length=0;health.length=0;
  enemies[0].hp=2;scope.SpaceTowerRankedArt.draw(ctx,geometry,state,{elapsed:1.01},0,()=>{});
  assert.equal(bodyCalls.length,0);assert.equal(layers.length,allocated);
  assert.ok(blits.length>=90,'all enemies remain visible');
  const size=Math.max(7,geometry.size*.24);assert.ok(health.some(a=>Math.abs(a[2]-size*.2)<1e-8),'live HP is not baked into the cache');
  scope.SpaceTowerRankedArt.draw(ctx,{...geometry,quality:'high'},state,{elapsed:1.02},0,()=>{});
  assert.equal(bodyCalls.length,1);assert.equal(bodyCalls[0].quality,'high');
});

test('identical VIP ornaments share raster work while every rotating turret is still drawn',()=>{
  const scope=setup();let textures=0,blits=0,rotations=0;
  const context=new Proxy({drawImage(){blits++;},rotate(){rotations++;},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>o[k]||(()=>{})});
  scope.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
  scope.drawVipBattleArt=()=>textures++;
  const state={units:Array.from({length:13},(_,slot)=>({uid:slot,id:'vip_star_phoenix',slot,angle:slot/2,timer:.4,hp:100,maxHp:100,firedAt:-1,hitAt:-1,star:1})),enemies:[],projectiles:[],beams:[],impacts:[],popups:[]};
  scope.SpaceTowerRankedArt.draw(context,geometry,state,{elapsed:1},0,()=>{});assert.equal(textures,1);
  blits=0;rotations=0;state.units.forEach(u=>u.angle+=.1);
  scope.SpaceTowerRankedArt.draw(context,geometry,state,{elapsed:1.016},0,()=>{});
  assert.equal(textures,1);assert.ok(blits>=13);assert.ok(rotations>=13,'aiming is not capped to the ornament texture rate');
  scope.SpaceTowerRankedArt.draw(context,geometry,state,{elapsed:1.04},0,()=>{});assert.equal(textures,2);
});

test('sustained multicolor impact animation does not allocate new canvases every phase',()=>{
  const scope=setup(),layers=[];let blits=0;
  const context=new Proxy({drawImage(){blits++;},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>o[k]||(()=>{})});
  scope.document={createElement:()=>{const c={width:0,height:0,getContext:()=>context};layers.push(c);return c;}};
  const ids=scope.SpaceTowerCatalog.turrets.filter(d=>!d.vipExclusive).slice(0,10).map(d=>d.id);
  const state={units:Array(13).fill(null),enemies:[],projectiles:[],beams:[],popups:[],impacts:ids.flatMap(id=>['hit','kill','summon','merge'].map(kind=>({id,kind,x:.2,y:.3,born:0,until:5})))};
  state.impacts.push(...['arrival','core','destroy'].map(kind=>({kind,x:0,y:0,born:0,until:5})));
  const before=JSON.stringify(state);
  scope.SpaceTowerRankedArt.draw(context,geometry,state,{elapsed:0},0,()=>{});const allocated=layers.length;
  for(let frame=1;frame<300;frame++)scope.SpaceTowerRankedArt.draw(context,{...geometry,size:frame%2?28:36},state,{elapsed:frame/60},0,()=>{});
  assert.equal(layers.length,allocated,'animation phases and arena scaling reuse existing texture storage');
  assert.ok(blits>=300*40,'every active effect still gets drawn');assert.equal(JSON.stringify(state),before);
});
