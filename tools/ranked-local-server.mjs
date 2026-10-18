// Loopback-only adapter. Uses the same queue and authoritative combat as the Worker.
// Preview identities/rewards stay in memory and never touch production accounts.
import {MatchQueue,MatchRoom,validLineup} from '../server/ranked-service.mjs';
const queue=new MatchQueue(),rooms=new Map(),profiles=new Map(),sessions=new Set();
function profile(key){if(!profiles.has(key))profiles.set(key,{rating:1200,streak:{wins:0,losses:0},rewardTotal:0});return profiles.get(key);}
function settle(room){const s=room.state;if(s.status==='finished'&&!s.settled){s.players.forEach((p,i)=>{if(!p.bot){const r=s.match.results[i];profiles.set(p.key,{rating:r.ratingAfter,streak:r.streak,rewardTotal:profile(p.key).rewardTotal+r.obsidian});}});s.settled=true;}if(s.status==='cancelled')s.settled=true;}
setInterval(()=>{for(const [id,room] of rooms){room.advance(Date.now());settle(room);if(Date.now()-room.state.created>1200000){rooms.delete(id);queue.release(id);}}queue.expire(Date.now());},1000).unref();
export async function handleRanked(request,response){
  const host=String(request.headers.host||'');
  if(!/^(127\.0\.0\.1|localhost):\d+$/.test(host)||request.headers.origin&&request.headers.origin!==`http://${host}`){response.writeHead(403);response.end();return;}
  if(request.method!=='POST'){response.writeHead(405);response.end();return;}
  let key=String(request.headers.cookie||'').match(/(?:^|;\s*)ranked_preview=([0-9a-f-]{36})/)?.[1];
  if(!key||!sessions.has(key)){key=crypto.randomUUID();sessions.add(key);response.setHeader('Set-Cookie',`ranked_preview=${key}; Path=/api/ranked; HttpOnly; SameSite=Strict`);}
  const send=(value,status=200)=>{response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});response.end(JSON.stringify({...value,preview:true}));};
  let raw='';try{for await(const chunk of request){raw+=chunk;if(raw.length>4096)throw new Error('INVALID_REQUEST');}const body=JSON.parse(raw),now=Date.now();let value;
    if(body.action==='profile')return send(profile(key));
    if(['join','status','cancel'].includes(body.action)){
      const active=queue.state.entries[key]?.roomId,room=rooms.get(active);
      if(body.action==='join'&&room&&['finished','cancelled'].includes(room.state.status)){settle(room);queue.release(active);}
      if(body.action==='join'){
        if(!validLineup(body.loadout))throw new Error('INVALID_LOADOUT');
        value=queue.join({key,name:'星際駕駛 '+key.slice(0,5).toUpperCase(),loadout:body.loadout,...profile(key)},now);
      }else value=body.action==='cancel'?queue.cancel(key):queue.poll(key,now);
      if(value.roomId&&!rooms.has(value.roomId))rooms.set(value.roomId,new MatchRoom(queue.state.plans[value.roomId]));
    }else if(['poll','command'].includes(body.action)){
      const room=rooms.get(body.roomId);if(!room)throw new Error('MATCH_EXPIRED');
      value=room.request(key,body.action,body.command,now);settle(room);value.settled=room.state.settled;
    }else throw new Error('INVALID_ACTION');
    send(value);
  }catch(error){send({error:error.message},400);}
}
