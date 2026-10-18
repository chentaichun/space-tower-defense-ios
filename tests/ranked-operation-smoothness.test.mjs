import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {MatchRoom} from '../server/ranked-service.mjs';
import '../ranked-render-buffer.js';
import '../ranked-battle-art.js';
vm.runInThisContext(readFileSync(new URL('../ranked-turret-art.js',import.meta.url),'utf8'));
const R=SpaceTowerRanked,army=['basic_cannon','gatling','frost_core','flame_core','shield_generator'];
const clone=value=>JSON.parse(JSON.stringify(value));

test('bursts of summon and merge responses preserve continuous enemy motion',()=>{
  for(const packetStep of [3,5,8]){
    const m=R.create({loadout:army}),buffer=new SpaceTowerRankedRenderBuffer();R.spawn(m,0,{kind:'basic',angle:0});
    let previous=null,maxFrames=0;
    for(let tick=0;tick<480;tick++){
      const now=tick*1000/60;
      if(tick%24===0||tick>144&&tick<180&&tick%packetStep===0){
        m.elapsed=Math.floor((now+1)/50)*.05;m.sides[0].enemies[0].x=1-m.elapsed*.1;
        buffer.push(clone(m),now);
      }
      const view=buffer.sample(now),x=view.sides[0].enemies[0].x;
      if(previous!==null&&now>1600){const step=previous-x;assert.ok(step>.0005&&step<.003,`packet step ${packetStep}, ${now} ms: motion ${step}`);}
      previous=x;maxFrames=Math.max(maxFrames,buffer.frames.length);
    }
    assert.ok(maxFrames<=27,'history stays bounded by simulation time');
  }
});

test('same-tick action acknowledgements replace state without duplicating history',()=>{
  const buffer=new SpaceTowerRankedRenderBuffer(),m=R.create({loadout:army});
  buffer.push(clone(m),0);m.sides[0].coins=10000;
  for(let i=0;i<8;i++){R.summon(m,0);buffer.push(clone(m),i+1);}
  assert.equal(buffer.frames.length,1);assert.equal(buffer.sample(16).sides[0].units.filter(Boolean).length,8);
});

test('confirmed summon and merge appear immediately without jumping the enemy clock',()=>{
  const buffer=new SpaceTowerRankedRenderBuffer(),m=R.create({loadout:army});R.spawn(m,0,{kind:'basic',angle:0});
  m.sides[0].coins=10000;R.summon(m,0);const first=m.sides[0].units.findIndex(Boolean),unit=m.sides[0].units[first],second=(first+1)%13;
  m.sides[0].units[second]={...unit,uid:999,slot:second};buffer.push(clone(m),0);buffer.sample(0);
  m.elapsed=.4;m.sides[0].enemies[0].x-=.04;const result=R.merge(m,0,first,second);assert.equal(result.ok,true);
  m.sides[0].impacts.push({kind:'hit',id:'gatling',x:.5,y:.5,born:.4,until:1.1});
  const wire=clone(m),unchanged=JSON.stringify(wire);buffer.push(wire,400);buffer.confirm(wire,result);
  const view=buffer.sample(16);assert.ok(view.elapsed<.05);assert.equal(view.sides[0].units[first],null);assert.equal(view.sides[0].units[second].star,2);
  assert.ok(view.sides[0].enemies[0].x>m.sides[0].enemies[0].x,'world movement retains its own clock');
  const effects=view.sides[0].impacts.filter(e=>e.kind==='merge');assert.equal(effects.length,1);assert.ok(effects[0].born<=view.elapsed);
  assert.equal(view.sides[0].impacts.find(e=>e.kind==='hit').born,.4,'unrelated hits retain authoritative timing');
  assert.equal(JSON.stringify(wire),unchanged);
  // Retry acknowledgements must not restart the feedback animation.
  const born=effects[0].born;buffer.confirm(wire,result);assert.equal(buffer.sample(32).sides[0].impacts.find(e=>e.kind==='merge').born,born);
  buffer.time=.4;buffer.sampled=400;assert.equal(buffer.sample(400).sides[0].units[first],null);assert.equal(buffer.sample(400).sides[0].units[second].star,2);
});

test('resuming a hidden tab rejoins the live presentation window',()=>{
  const buffer=new SpaceTowerRankedRenderBuffer(),m=R.create({loadout:army});buffer.push(clone(m),0);buffer.sample(0);
  for(let now=200;now<=30000;now+=200){m.elapsed=now/1000;buffer.push(clone(m),now);}
  const view=buffer.sample(30000);assert.ok(view.elapsed>29&&view.elapsed<=30);assert.ok(buffer.frames.length<=8);
});

test('public online snapshots recover the launching turret after a merge removed it',()=>{
  const pilot=key=>({key,name:key,rating:1200,loadout:army,streak:{wins:0,losses:0}});
  const room=new MatchRoom({id:'muzzle',created:0,seed:2,players:[pilot('a'),pilot('b')]}),m=room.state.match;
  const u={uid:700,id:'gatling',slot:0,angle:Math.PI/2,firedAt:.1,timer:.2,hp:100,maxHp:100,star:1};
  m.sides[0].units[0]=u;m.elapsed=0;const buffer=new SpaceTowerRankedRenderBuffer();buffer.push(room.snapshot(0,0).match,0);
  m.elapsed=.2;m.sides[0].projectiles=[{uid:900,id:'gatling',owner:u,born:.1,originX:0,originY:0,x:0,y:.2,tx:0,ty:1,angle:Math.PI/2,age:.1}];
  const wire=room.snapshot(0,200).match;assert.equal(wire.sides[0].projectiles[0].owner,undefined);buffer.push(wire,200);
  m.elapsed=.4;m.sides[0].units[0]=null;m.sides[0].projectiles[0].y=.6;buffer.push(room.snapshot(0,400).match,400);
  buffer.time=.1;buffer.sampled=400;const p=buffer.sample(400).sides[0].projectiles[0];assert.equal(p.owner.uid,u.uid);
  const g={cx:200,cy:150,sx:248,sy:140,size:36},pose=SpaceTowerRankedArt.weaponPose(g,u,u.angle,p.uid),point=SpaceTowerRankedArt.shotPoint(g,p);
  assert.ok(Math.abs(point[0]-pose.muzzleX)<1e-8&&Math.abs(point[1]-pose.muzzleY)<1e-8);
  assert.equal(wire.sides[0].projectiles[0].owner,undefined,'wire state remains read-only');
});

function connection(){
  const states=[],errors=[],scope={window:{},performance,setTimeout,clearTimeout};
  vm.runInNewContext(readFileSync(new URL('../ranked-network.js',import.meta.url),'utf8'),scope);
  const c=new scope.window.SpaceTowerRankedConnection(data=>states.push(data),message=>errors.push(message));
  c.active=true;c.roomId='test';c.schedule=()=>{};return {c,states,errors};
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const state=(time,seq=0)=>({status:'playing',roomId:'test',serverTime:time,ackSeq:seq,commandResult:{ok:true},match:{elapsed:time/1000}});

test('summon is sent immediately during a slow poll and late poll data cannot rewind it',async()=>{
  const {c,states}=connection(),poll=deferred(),command=deferred(),requests=[];
  c.request=body=>{requests.push(body);return body.action==='poll'?poll.promise:command.promise;};
  const polling=c.poll(),summoning=c.command('summon');await Promise.resolve();
  assert.equal(requests.length,2,'command must not wait for poll round-trip');assert.equal(requests[1].command.seq,1);
  command.resolve(state(400,1));assert.equal((await summoning).ok,true);
  poll.resolve(state(200,0));await polling;
  assert.equal(states.length,1);assert.equal(c.seq,1);assert.equal(c.serverTime,400);
  c.request=async body=>{requests.push(body);return state(500,2);};
  const next=c.command('merge',{from:1,to:2});await Promise.resolve();assert.equal(requests.at(-1).command.seq,2);await next;assert.equal(c.seq,2);
});

test('lost command acknowledgement is retried with the same sequence exactly once',async()=>{
  const {c,states}=connection(),requests=[];let fail=true;
  c.request=async body=>{requests.push(body);if(fail){fail=false;throw Error('lost response');}return state(400,1);};
  assert.equal((await c.command('merge',{from:1,to:2})).ok,false);assert.equal(c.pending.seq,1);
  await c.poll();assert.equal(requests.length,2);assert.equal(requests[0].command,requests[1].command);assert.equal(c.pending,null);assert.equal(c.seq,1);assert.equal(states.length,1);
});

test('overlapping polls are coalesced and responses from a previous room are ignored',async()=>{
  const {c,states}=connection(),old=deferred();let requests=0;
  c.request=()=>{requests++;return old.promise;};const first=c.poll();await c.poll();assert.equal(requests,1);
  c.epoch++;c.roomId='new';c.seq=0;c.serverTime=0;
  old.resolve(state(200));await first;assert.equal(c.roomId,'new');assert.equal(states.length,0);
});

test('a late matchmaking poll cannot reopen a cancelled match',async()=>{
  const {c,states}=connection(),old=deferred();c.roomId=null;
  c.request=body=>body.action==='cancel'?Promise.resolve({status:'cancelled'}):old.promise;
  const polling=c.poll();await c.cancel();assert.equal(c.active,false);
  old.resolve({status:'searching',elapsedMs:100});await polling;
  assert.equal(states.length,1);assert.equal(states[0].status,'cancelled');
});
