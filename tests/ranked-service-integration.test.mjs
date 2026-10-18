import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleRanked} from '../tools/ranked-local-server.mjs';
import {MatchRoom} from '../server/ranked-service.mjs';
import {settleRanked,rankedProfile} from '../functions/_shared/ranked-store.js';
import {createPlayerSession} from '../functions/_shared/player-auth.js';
import {putPlayerAccount} from '../functions/_shared/player-storage.js';
import {onRequestPost} from '../functions/api/ranked.js';
import '../ranked-progression.js';
const N=globalThis.SpaceTowerRecruit,loadout=[...N.starterIds];
function database(){
  const db=new DatabaseSync(':memory:');for(const f of ['0006_player_auth.sql','0011_ranked.sql'])db.exec(readFileSync(new URL('../migrations/'+f,import.meta.url),'utf8'));
  const env={COMMERCE_DB:{prepare(sql){const query=(args=[])=>({bind:(...a)=>query(a),run:async()=>db.prepare(sql).run(...args),first:async()=>db.prepare(sql).get(...args)});return query();},batch:async commands=>{db.exec('BEGIN');try{for(const c of commands)await c.run();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}}};
  return {db,env};
}
test('two independent HTTP clients match, see the same battle and settle only once',async()=>{
  const server=createServer(handleRanked);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/api/ranked`,cookies=['',''];
  const call=async(i,body)=>{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookies[i]},body:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookies[i]=r.headers.get('set-cookie').split(';')[0];assert.equal(r.status,200);return r.json();};
  try{
    await call(0,{action:'profile'});await call(1,{action:'profile'});
    const joined=await Promise.all([call(0,{action:'join',loadout}),call(1,{action:'join',loadout})]);
    const a=await call(0,{action:'status'}),b=await call(1,{action:'status'});assert.equal(a.roomId,b.roomId);assert.notEqual(cookies[0],cookies[1]);assert.ok(joined.some(r=>r.status==='matched'));
    const roomId=a.roomId;await call(0,{action:'poll',roomId});await call(1,{action:'poll',roomId});
    await new Promise(resolve=>setTimeout(resolve,3050));
    const playing=await call(0,{action:'poll',roomId});assert.equal(playing.status,'playing');assert.deepEqual(playing.match.sides[0].loadout,loadout);
    const command={seq:1,type:'surrender'};await call(0,{action:'command',roomId,command});await call(0,{action:'command',roomId,command});
    const result=await call(1,{action:'poll',roomId});assert.equal(result.match.results[0].outcome,'win');assert.equal(result.settled,true);
    const profile=await call(1,{action:'profile'});assert.equal(profile.rewardTotal,100);assert.equal(profile.streak.wins,1);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
test('D1 result receipt atomically applies each player once, including settlement retries',async()=>{
  const {db,env}=database();try{
    const players=['a','b'].map(key=>({key,name:key,loadout,rating:1200,streak:{wins:0,losses:0}}));
    const room=new MatchRoom({id:'unique-match',created:0,seed:1,players});room.finish(0,'core_destroyed');
    await settleRanked(env,room.state);await settleRanked(env,room.state);
    assert.equal((await rankedProfile(env,'a')).rating,1224);assert.equal((await rankedProfile(env,'a')).rewardTotal,100);assert.equal((await rankedProfile(env,'b')).rewardTotal,25);
    assert.equal(db.prepare('SELECT count(*) AS n FROM ranked_results').get().n,2);
  }finally{db.close();}
});
test('cloud gateway checks account inventory and never accepts client rating or identity',async()=>{
  const {db,env}=database();let sent;
  env.RANKED_QUEUE={idFromName:n=>n,get:()=>({fetch:async(url,init)=>{sent=JSON.parse(init.body);return Response.json({status:'searching'});}})};env.RANKED_ROOMS={};
  try{
    const key='player:ranked-test',account={name:'ranked-test',createdAt:'2026-01-01T00:00:00Z',save:{v2Progress:{}}};await putPlayerAccount(env,key,account);
    const token=await createPlayerSession(env,key,account.name);
    const call=()=>onRequestPost({env,request:new Request('https://game.test/api/ranked',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({action:'join',loadout,rating:999999,key:'someone-else'})})});
    assert.equal((await call()).status,403);
    account.save.v2Progress=N.reconcile({onboarding:{tutorialComplete:true,tutorialClaimed:true,normalMatches:['a','b']}});await putPlayerAccount(env,key,account);
    assert.equal((await call()).status,200);assert.equal(sent.key,key);assert.equal(sent.profile.rating,undefined);assert.deepEqual(sent.profile.loadout,loadout);
  }finally{db.close();}
});
