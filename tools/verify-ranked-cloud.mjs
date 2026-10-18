import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import '../turret-catalog.js';
import '../ranked-progression.js';

const base = new URL(process.env.SPACE_TOWER_BASE_URL || 'https://space-tower-defense.pages.dev').origin;
if (!/^https:\/\/(?:[a-z0-9-]+\.)?space-tower-defense\.pages\.dev$/.test(base)) throw new Error('Expected the game Cloudflare deployment.');
const reportPath = process.env.RANKED_REPORT_PATH || 'tmp/ranked-cloud-verification.json';
const started = new Date().toISOString();
const checks = [], timings = [], clients = [];
const loadout = [...globalThis.SpaceTowerRecruit.starterIds];
const progress = globalThis.SpaceTowerRecruit.reconcile({revision:1,onboarding:{introStep:11,introComplete:true,introClaimed:true,tutorialComplete:true,tutorialClaimed:true,normalMatches:['cloud_check_1','cloud_check_2']}});
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
let roomId = '', roomFinished = false, cleanupComplete = false, failure = null;
function pass(name, detail = {}) { checks.push({name,...detail}); console.log('PASS '+name); }
async function request(path, body, client, expected=200, method='POST') {
  const before=performance.now();
  const response=await fetch(base+path,{method,headers:{Origin:'https://localhost','Content-Type':'application/json',...(client?.token?{Authorization:'Bearer '+client.token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});
  const data=await response.json().catch(()=>({error:'NON_JSON_RESPONSE'}));
  timings.push({path,action:body?.action||method,status:response.status,ms:Math.round(performance.now()-before)});
  assert.equal(response.status,expected,`${path}: expected ${expected}, got ${response.status} (${data.error||data.code||'unknown'})`);
  assert.equal(response.headers.get('access-control-allow-origin'),'https://localhost');
  return data;
}
async function ranked(client,body) { const data=await request('/api/ranked',body,client);if(Number.isInteger(data.ackSeq))client.seq=data.ackSeq;return data; }
const poll=client=>ranked(client,{action:'poll',roomId});
async function command(client,type,values={}) {
  const body={seq:client.seq+1,type,...values};
  const data=await ranked(client,{action:'command',roomId,command:body});
  assert.equal(data.commandResult?.ok,true,`Command ${type}: ${data.commandResult?.reason}`);
  return {data,body};
}
try {
  const preflight=await fetch(base+'/api/ranked',{method:'OPTIONS',headers:{Origin:'https://localhost','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,authorization'}});
  assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://localhost');
  await request('/api/ranked',{action:'profile'},null,401);
  pass('Cloud endpoint and mobile CORS; unauthenticated access rejected');
  for (let i=0;i<2;i++) {
    const client={name:'ranked_check_'+Date.now().toString(36)+'_'+randomBytes(3).toString('hex'),password:randomBytes(24).toString('base64url'),seq:0};
    clients.push(client);
    const registered=await request('/api/player',{action:'register',name:client.name,password:client.password,save:{obsidian:0,v2Progress:progress}});
    assert.ok(registered.registered);assert.ok(registered.sessionToken);client.token=registered.sessionToken;
    client.balance=registered.player.save.obsidian;
    assert.equal(globalThis.SpaceTowerRecruit.validLoadout(registered.player.save.v2Progress,loadout),true);
  }
  pass('Two separate authenticated accounts and eligible five-turret formations');
  await request('/api/ranked',{action:'join',loadout:['basic_cannon']},clients[0],403);
  pass('Server rejects an invalid formation');
  const initialProfiles=await Promise.all(clients.map(c=>ranked(c,{action:'profile'})));
  await Promise.all(clients.map(c=>ranked(c,{action:'join',loadout})));
  const tickets=await Promise.all(clients.map(c=>ranked(c,{action:'status'})));
  assert.equal(tickets[0].status,'matched');assert.equal(tickets[1].status,'matched');
  assert.equal(tickets[0].roomId,tickets[1].roomId,'Both authenticated users must share one room; a bot result is not accepted.');
  roomId=tickets[0].roomId;
  let frames=await Promise.all(clients.map(poll));
  assert.equal(frames[0].opponent.name,frames[1].player.name);assert.equal(frames[1].opponent.name,frames[0].player.name);
  assert.notEqual(frames[0].player.name,frames[1].player.name);
  pass('Both human-player accounts matched into the same cloud room',{roomId});
  await delay(3200);
  frames=await Promise.all(clients.map(poll));assert.ok(frames.every(f=>f.status==='playing'));
  pass('Shared countdown advances into live combat');
  const incomeDeadline=Date.now()+40000;
  while(frames[0].match.sides[0].coins<10*(frames[0].match.sides[0].draws+1)||frames[1].match.sides[0].coins<10){
    assert.ok(Date.now()<incomeDeadline,'Combat income did not cover a summon within 40 seconds.');
    await delay(500);frames=await Promise.all(clients.map(poll));assert.ok(frames.every(f=>f.status==='playing'));
  }
  pass('Live combat generates spendable gold');
  const initialCount=frames[0].match.sides[0].units.filter(Boolean).length;
  const summoned=await command(clients[0],'summon');
  const originalIds=summoned.data.match.sides[0].units.filter(Boolean).map(u=>u.uid);
  assert.equal(originalIds.length,initialCount+1);
  const duplicate=await ranked(clients[0],{action:'command',roomId,command:summoned.body});
  assert.deepEqual(duplicate.match.sides[0].units.filter(Boolean).map(u=>u.uid),originalIds);
  const opponentView=await poll(clients[1]);
  assert.deepEqual(opponentView.match.sides[1].units.filter(Boolean).map(u=>u.uid),originalIds);
  pass('Summon is visible to the opponent; a repeated command does not summon twice');
  await command(clients[1],'upgrade',{key:'physical'});
  const upgradeView=await poll(clients[0]);assert.equal(upgradeView.match.sides[1].upgrades.physical,1);
  pass('Opponent upgrade is synchronized');
  const units=upgradeView.match.sides[0].units;
  let pair;
  for(let a=0;a<units.length&&!pair;a++)for(let b=a+1;b<units.length;b++)if(units[a]&&units[b]&&units[a].id===units[b].id&&units[a].star===units[b].star){pair=[a,b];break;}
  assert.ok(pair,'Six living turrets from five types should provide a merge pair.');
  const merged=await command(clients[0],'merge',{from:pair[0],to:pair[1]});
  assert.ok(merged.data.match.sides[0].units.some(u=>u&&u.star===2));
  pass('Merge executes on the authoritative cloud room');
  const until=Date.now()+4500;let observedReconnect=false;
  while(Date.now()<until){await delay(500);const view=await poll(clients[0]);observedReconnect ||= view.opponentReconnecting;}
  assert.ok(observedReconnect);
  const recovered=await ranked(clients[1],{action:'status'});assert.equal(recovered.roomId,roomId);
  const resumed=await poll(clients[1]);assert.equal(resumed.status,'playing');assert.equal(resumed.ackSeq,1);
  assert.equal((await poll(clients[0])).opponentReconnecting,false);
  pass('Brief connection loss recovers the same battle and command sequence');
  const ended=await command(clients[0],'surrender');roomFinished=true;
  const won=await poll(clients[1]);
  assert.equal(ended.data.status,'finished');assert.equal(ended.data.settled,true);
  assert.equal(ended.data.match.results[0].outcome,'loss');assert.equal(won.match.results[0].outcome,'win');assert.equal(won.settled,true);
  const profiles=await Promise.all(clients.map(c=>ranked(c,{action:'profile'})));
  assert.ok(profiles[0].rating<initialProfiles[0].rating);assert.ok(profiles[1].rating>initialProfiles[1].rating);
  assert.equal(profiles[1].rewardTotal,initialProfiles[1].rewardTotal+won.match.results[0].obsidian);
  await ranked(clients[0],{action:'command',roomId,command:ended.body});await poll(clients[1]);
  assert.deepEqual(await ranked(clients[1],{action:'profile'}),profiles[1]);
  pass('Opposite results, cup changes and one-time reward settlement',{winnerCups:profiles[1].rating,loserCups:profiles[0].rating,winnerReward:won.match.results[0].obsidian});
  const wallet=await request('/api/player',{action:'login'},clients[1]);
  assert.equal(wallet.player.save.obsidian,clients[1].balance+won.match.results[0].obsidian);
  const repeatWallet=await request('/api/player',{action:'login'},clients[1]);
  assert.equal(repeatWallet.player.save.obsidian,wallet.player.save.obsidian);
  pass('Reward reaches the saved wallet exactly once');
} catch(error) { failure=error.message;console.error('FAIL '+failure);process.exitCode=1; }
finally {
  if(roomId&&!roomFinished&&clients[0]?.token){try{const view=await poll(clients[0]);if(view.status==='playing'){await command(clients[0],'surrender');roomFinished=true;}}catch{}}
  const cleanup=[];
  for(const client of clients){
    try{
      if(!client.token){const login=await request('/api/player',{action:'login',name:client.name,password:client.password});client.token=login.sessionToken;}
      const deleted=await request('/api/player',undefined,client,200,'DELETE');assert.equal(deleted.deleted,true);
      await request('/api/ranked',{action:'profile'},client,401);cleanup.push(true);
    }catch(error){cleanup.push(false);failure ||= 'Test-account cleanup: '+error.message;process.exitCode=1;}
  }
  cleanupComplete=cleanup.length===2&&cleanup.every(Boolean);
  if(cleanupComplete)pass('Temporary accounts removed and sessions revoked');
  const report={base,started,finished:new Date().toISOString(),success:!failure,checks,roomId,cleanupComplete,failure,timings};
  await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log('Report: '+reportPath);
}
