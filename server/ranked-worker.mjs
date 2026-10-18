import {MatchQueue,MatchRoom} from './ranked-service.mjs';
import {rankedProfile,settleRanked} from '../functions/_shared/ranked-store.js';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
// Objects are reachable only through Pages bindings. No public Worker endpoint.
export default {fetch(){return new Response('Not found',{status:404});}};
class SerializedObject {
  constructor(ctx,env){this.ctx=ctx;this.env=env;this.tail=Promise.resolve();}
  run(fn){const task=this.tail.then(fn);this.tail=task.catch(()=>{});return task;}
}
export class RankedQueue extends SerializedObject {
  fetch(request){return this.run(async()=>{
    const body=await request.json(),now=Date.now(),q=new MatchQueue(await this.ctx.storage.get('state')||undefined);
    let existing=q.state.entries[body.key];
    if(existing?.roomId&&body.action==='join'){
      const room=this.env.RANKED_ROOMS.get(this.env.RANKED_ROOMS.idFromName(existing.roomId));
      const info=await (await room.fetch('https://room/internal',{method:'POST',body:JSON.stringify({action:'inspect'})})).json();
      if(['finished','cancelled'].includes(info.status)&&info.settled!==false)q.release(existing.roomId);
    }
    let result;
    if(body.action==='profile')result=await rankedProfile(this.env,body.key);
    else if(body.action==='join')result=q.join({...body.profile,key:body.key,...await rankedProfile(this.env,body.key)},now);
    else if(body.action==='cancel')result=q.cancel(body.key);
    else if(body.action==='status')result=q.poll(body.key,now);
    else return json({error:'INVALID_ACTION'},400);
    // Persist reservation before room initialization. Retries use the same room id.
    await this.ctx.storage.put('state',q.state);
    if(result.roomId){
      const room=this.env.RANKED_ROOMS.get(this.env.RANKED_ROOMS.idFromName(result.roomId));
      const response=await room.fetch('https://room/internal',{method:'POST',body:JSON.stringify({action:'init',plan:q.state.plans[result.roomId]})});
      if(!response.ok)throw new Error('ROOM_UNAVAILABLE');
    }
    await this.ctx.storage.setAlarm(now+60000);
    return json(result);
  }).catch(()=>json({error:'MATCHMAKING_UNAVAILABLE'},503));}
  alarm(){return this.run(async()=>{
    const state=await this.ctx.storage.get('state');if(!state)return;
    const q=new MatchQueue(state);q.expire(Date.now());
    for(const [id,plan] of Object.entries(q.state.plans))if(Date.now()-plan.created>1200000)q.release(id);
    await this.ctx.storage.put('state',q.state);
    if(Object.keys(q.state.entries).length)await this.ctx.storage.setAlarm(Date.now()+60000);
  });}
}
export class RankedRoom extends SerializedObject {
  async save(room){
    const s=room.state;
    // Settlement is idempotent in D1, including retries after a storage failure.
    if(s.status==='finished'&&!s.settled){await settleRanked(this.env,s);s.settled=true;}
    if(s.status==='cancelled')s.settled=true;
    await this.ctx.storage.put('state',s);
    await this.ctx.storage.setAlarm(Date.now()+(['finished','cancelled'].includes(s.status)?3600000:5000));
  }
  fetch(request){return this.run(async()=>{
    const body=await request.json();let state=await this.ctx.storage.get('state');
    if(body.action==='init'){
      if(!state){if(!body.plan)return json({error:'NO_PLAN'},400);const room=new MatchRoom(body.plan);await this.save(room);}
      return json({ok:true});
    }
    if(!state)return json({error:'MATCH_EXPIRED'},404);
    const room=new MatchRoom(null,state);
    if(body.action==='inspect'){room.advance(Date.now());await this.save(room);return json({status:state.status,settled:state.settled});}
    if(!['poll','command'].includes(body.action))return json({error:'INVALID_ACTION'},400);
    let value;try{value=room.request(body.key,body.action,body.command);}catch(error){return json({error:error.message},403);}
    await this.save(room);value.settled=state.settled;return json(value);
  }).catch(()=>json({error:'MATCH_UNAVAILABLE'},503));}
  alarm(){return this.run(async()=>{
    const state=await this.ctx.storage.get('state');if(!state)return;
    if(['finished','cancelled'].includes(state.status)&&state.settled){await this.ctx.storage.deleteAll();return;}
    const room=new MatchRoom(null,state);room.advance(Date.now());await this.save(room);
  });}
}
