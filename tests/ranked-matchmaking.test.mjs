import test from 'node:test';
import assert from 'node:assert/strict';
import {MatchQueue,MatchRoom,Rules} from '../server/ranked-service.mjs';
import '../ranked-progression.js';
import '../ranked-render-buffer.js';
import {onRequestPost} from '../functions/api/ranked.js';
const loadout=[...globalThis.SpaceTowerRecruit.starterIds];
const pilot=(key,rating=1200)=>({key,name:key,rating,streak:{wins:0,losses:0},loadout});
function room(bot=false){return new MatchRoom({id:'test-match',created:0,seed:42,players:[pilot('a'),{...pilot('b'),...(bot?{bot:Rules.botProfile(1200)}:{})}]});}
test('two human identities enter one room; self-rejoins cannot match themselves',()=>{
  const q=new MatchQueue(undefined,()=>0xffffffff);assert.equal(q.join(pilot('a'),0).status,'searching');
  q.join(pilot('a'),100);assert.equal(Object.keys(q.state.entries).length,1);
  const b=q.join(pilot('b'),200),a=q.poll('a',300);assert.equal(a.roomId,b.roomId);assert.equal(Object.keys(q.state.plans).length,1);
  assert.ok(q.state.plans[a.roomId].players.every(p=>!p.bot));
});
test('rating windows expand, army mismatch remains bounded, and expired players cannot be paired',()=>{
  const q=new MatchQueue(undefined,()=>0xffffffff);q.join(pilot('a'),0);assert.equal(q.join(pilot('b',1340),100).status,'searching');
  assert.equal(q.poll('a',4100).status,'matched');
  const idle=new MatchQueue(undefined,()=>0xffffffff);idle.join(pilot('old'),0);assert.equal(idle.join(pilot('new'),7000).status,'searching');
  const a={...pilot('a'),rules:1,power:500,joined:0},b={...pilot('b'),rules:1,power:900,joined:0};assert.equal(Rules.compatible(a,b,12000),false);
});
test('fallback respects its stored deadline with a live lease; humans win at the deadline',()=>{
  const q=new MatchQueue(undefined,()=>0xffffffff);q.join(pilot('a'),0);for(let t=5000;t<30000;t+=5000)assert.equal(q.poll('a',t).status,'searching');
  const result=q.poll('a',30000),plan=q.state.plans[result.roomId];assert.ok(plan.players[1].bot);assert.notDeepEqual([...plan.players[1].loadout].sort(),[...loadout].sort());
  const human=new MatchQueue(undefined,()=>0xffffffff);human.join(pilot('a'),0);for(let t=5000;t<30000;t+=5000)human.poll('a',t);
  const paired=human.join(pilot('b'),30000);assert.ok(human.state.plans[paired.roomId].players.every(p=>!p.bot));
});
test('fallback spans the full zero to thirty seconds and never redraws on a poll or restart',()=>{
  assert.equal(Rules.botWaitMs(0),0);assert.equal(Rules.botWaitMs(0xffffffff),30000);
  const immediate=new MatchQueue(undefined,()=>0);assert.equal(immediate.join(pilot('a'),0).status,'matched');
  const seen=new Set();for(let sample=1;sample<=1000;sample++){
    const seed=Math.floor(sample*0xffffffff/1000),q=new MatchQueue(undefined,()=>seed);q.join(pilot('a'),0);const wait=q.state.entries.a.botWaitMs;seen.add(wait);
    const restored=new MatchQueue(JSON.parse(JSON.stringify(q.state)),()=>0);
    for(let t=1000;t<wait;t+=1000)assert.equal(restored.poll('a',t).status,'searching');
    assert.equal(restored.state.entries.a.botWaitMs,wait);assert.equal(restored.poll('a',wait).status,'matched');
  }assert.equal(seen.size,1000);assert.ok([...seen].some(ms=>ms%1000!==0));assert.ok([...seen].every(ms=>ms>=0&&ms<=30000));
});
test('cancellation removes only a waiting ticket and cannot undo an allocated pair',()=>{
  const q=new MatchQueue(undefined,()=>0xffffffff);q.join(pilot('a'),0);assert.equal(q.cancel('a').status,'cancelled');assert.equal(q.poll('a',1).status,'idle');
  q.join(pilot('a'),2);const b=q.join(pilot('b'),3);assert.equal(q.cancel('a').roomId,b.roomId);
});
test('gentle bot scale grows monotonically with cups and remains below human baseline',()=>{
  let last=null;for(const rating of [0,500,1200,2000,3000,4000,20000]){const p=Rules.botProfile(rating);assert.ok(p.damageScale<1&&p.hpScale<1&&p.reaction>.85);if(last){assert.ok(p.damageScale>=last.damageScale&&p.hpScale>=last.hpScale&&p.reaction<=last.reaction);}last=p;}
  const r=room(true);assert.ok(r.state.match.sides[1].maxHp<r.state.match.sides[0].maxHp);
});

test('bot cups vary around the player and difficulty draws approximate eighty/twenty',()=>{
  let stronger=0;const cups=new Set();
  for(let seed=0;seed<10000;seed++){
    const p=Rules.botProfile(1200,seed);cups.add(p.rating);assert.notEqual(p.rating,1200);assert.ok(Math.abs(p.rating-1200)<=160);
    if(p.difficulty==='challenging'){stronger++;assert.ok(p.damageScale>1&&p.hpScale>1);}else assert.ok(p.damageScale<1&&p.hpScale<1);
    for(const edge of [0,5,99995,100000])assert.ok(Rules.botProfile(edge,seed).rating>=0&&Rules.botProfile(edge,seed).rating<=100000);
  }
  assert.ok(stronger>1850&&stronger<2150);assert.ok(cups.size>100);assert.ok([...cups].some(n=>n<1200)&&[...cups].some(n=>n>1200));
});
test('both clients see the same authoritative world with their own board first',()=>{
  const r=room();r.request('a','poll',{},0);r.request('b','poll',{},10);
  const a=r.request('a','poll',{},4010),b=r.request('b','poll',{},4010);
  assert.equal(a.status,'playing');assert.deepEqual(a.match.sides[0],b.match.sides[1]);assert.deepEqual(a.match.sides[1],b.match.sides[0]);
  assert.equal(a.match.elapsed,b.match.elapsed);assert.ok(!JSON.stringify(a).includes('"key":"a"'));
});
test('foreign identities and forged sequence jumps are rejected; retries never spend twice',()=>{
  const r=room(true);r.request('a','poll',{},0);r.request('a','poll',{},3000);r.state.match.sides[0].coins=100;
  assert.throws(()=>r.request('intruder','poll',{},3000),/NOT_IN_MATCH/);
  const cmd={seq:1,type:'upgrade',key:'hp'};const first=r.request('a','command',cmd,3000),second=r.request('a','command',cmd,3000);
  assert.deepEqual(first.commandResult,second.commandResult);assert.equal(r.state.match.sides[0].coins,90);assert.equal(r.state.match.sides[0].upgrades.hp,1);
  assert.throws(()=>r.request('a','command',{...cmd,seq:5},3000),/STALE_COMMAND/);
});
test('unready players abort without rewards; one disconnected player forfeits after grace',()=>{
  const waiting=room();waiting.request('a','poll',{},0);waiting.advance(15001);assert.equal(waiting.state.status,'cancelled');assert.equal(waiting.state.match.results,null);
  const r=room();r.request('a','poll',{},0);r.request('b','poll',{},1);
  for(let t=3000;t<20000;t+=1000)r.request('a','poll',{},t);
  const done=r.request('a','poll',{},20002);assert.equal(done.status,'finished');assert.equal(done.match.winner,0);assert.equal(done.match.results[1].obsidian,0);
});
test('returning within grace resumes a running clock; simultaneous abandonment awards nothing',()=>{
  const r=room();r.request('a','poll',{},0);r.request('b','poll',{},1);
  r.request('a','poll',{},4000);r.request('a','poll',{},12000);const b=r.request('b','poll',{},13000);assert.equal(b.status,'playing');assert.ok(b.match.elapsed>9);
  r.advance(40000);assert.equal(r.state.status,'cancelled');assert.equal(r.state.match.results,null);
});
test('serialized room snapshots restore owner links and continue deterministically',()=>{
  const r=room(true);r.request('a','poll',{},0);r.request('a','poll',{},9000);
  const restored=new MatchRoom(null,JSON.parse(JSON.stringify(r.state)));
  assert.deepEqual(r.request('a','poll',{},10000),restored.request('a','poll',{},10000));
});
test('production endpoint fails closed without service bindings or authentication',async()=>{
  const request=new Request('https://game.test/api/ranked',{method:'POST',body:JSON.stringify({action:'join',loadout})});
  assert.equal((await onRequestPost({request,env:{}})).status,503);
  assert.equal((await onRequestPost({request,env:{RANKED_QUEUE:{},RANKED_ROOMS:{},COMMERCE_DB:{}}})).status,401);
});
test('bot names include varied writing systems and consistent generated nicknames',()=>{
  const names=Array.from({length:120},(_,i)=>Rules.botName(i));assert.ok(new Set(names).size>60);assert.ok(names.some(n=>/^[a-z]/i.test(n)));assert.ok(names.some(n=>/[\u4e00-\u9fff]/.test(n)));assert.ok(names.some(n=>/[\u3040-\u30ff]/.test(n)));
});
test('bot rosters vary, remain five distinct types, and respect rating and army strength',()=>{
  const C=globalThis.SpaceTowerCatalog,seen=new Set();
  for(const rating of [0,1200,2000,4000])for(let seed=0;seed<30;seed++){
    const ids=Rules.botLoadout(rating,loadout,seed);assert.equal(ids.length,5);assert.equal(new Set(ids).size,5);assert.ok(ids.every(id=>C.byId.has(id)&&C.byId.get(id).strengthGrade<=2&&!C.byId.get(id).vipExclusive));
    assert.ok(Rules.power(ids)<=Rules.power(loadout)*1.03);assert.notDeepEqual([...ids].sort(),[...loadout].sort());seen.add([...ids].sort().join(','));
  }
  assert.ok(seen.size>15);
});
test('bots actively summon, merge and upgrade through a sustained match',()=>{
  const R=globalThis.SpaceTowerRanked,army=['gatling','royal_tide','shield_generator','frost_core','heavy_cannon'],records=[];
  for(let seed=1;seed<=16;seed++){
    const m=R.create({loadout:army,seed,bots:[null,Rules.botProfile(1200)]});
    for(let i=0;i<5;i++){R.summon(m,0);R.summon(m,1);}
    for(let t=0;t<2400&&m.status==='playing';t++)R.tick(m,.05,{playerAI:true});
    const a=m.sides[1].aiActions;assert.ok(a.summon>0);assert.ok(a.upgrade>0);assert.ok(m.sides[1].sent>0);records.push({winner:m.winner,...a});
  }
  assert.ok(records.some(a=>a.merge>0));assert.ok(records.some(a=>a.winner===1));assert.ok(records.some(a=>a.winner===0));
});
test('remote rendering moves every animation frame and retains short-lived projectiles',()=>{
  const R=globalThis.SpaceTowerRanked,m=R.create({loadout}),buffer=new globalThis.SpaceTowerRankedRenderBuffer();
  R.spawn(m,0,{kind:'basic',angle:0});const first=JSON.parse(JSON.stringify(m));buffer.push(first,0);
  m.elapsed=.2;m.sides[0].enemies[0].x-=.1;
  m.sides[0].spentProjectiles=[{uid:999,id:'basic_cannon',born:.05,ended:.15,originX:0,originY:0,x:.5,y:0,age:.1,angle:0}];
  buffer.push(JSON.parse(JSON.stringify(m)),200);
  const x1=buffer.sample(300).sides[0].enemies[0].x,x2=buffer.sample(316).sides[0].enemies[0].x;
  assert.ok(x2<x1);const view=buffer.sample(330);assert.ok(view.elapsed>.05&&view.elapsed<.15);assert.ok(view.sides[0].projectiles.some(p=>p.uid===999&&p.x>0&&p.x<.5));
  assert.equal(m.sides[0].enemies[0].x,first.sides[0].enemies[0].x-.1);
});
test('mobile snapshot intervals adapt without holding every second animation frame',()=>{
  const R=SpaceTowerRanked,m=R.create({loadout}),buffer=new SpaceTowerRankedRenderBuffer();R.spawn(m,0,{kind:'basic',angle:0});
  let next=0,previous=-1,moving=0,total=0;
  for(let now=0;now<6000;now+=1000/60){
    if(now>=next){m.elapsed=now/1000;m.sides[0].enemies[0].x=1-now/10000;buffer.push(JSON.parse(JSON.stringify(m)),now);next=now+400;}
    const view=buffer.sample(now);if(now>1600){total++;if(view.elapsed>previous)moving++;}previous=view.elapsed;
  }
  assert.ok(buffer.delay>=.4&&buffer.delay<=.7);assert.ok(moving/total>.96,`${moving}/${total}`);
  buffer.sample(30000);const end=buffer.sample(40000);assert.ok(end.elapsed<=m.elapsed+.081,'a disconnected world cannot run ahead indefinitely');
  const fresh=R.create({loadout});buffer.push(fresh,41000);assert.equal(buffer.sample(41000).elapsed,0);
});
