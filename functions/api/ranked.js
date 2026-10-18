import '../../turret-catalog.js';
import '../../ranked-progression.js';
import {authenticatePlayerSession,digest} from '../_shared/player-auth.js';
import {jsonResponse,optionsResponse} from '../_shared/cors.js';
export const onRequestOptions=({request})=>optionsResponse(request);
export async function onRequestPost({request,env}){
  if(!env.RANKED_QUEUE||!env.RANKED_ROOMS||!env.COMMERCE_DB)return jsonResponse(request,{error:'RANKED_UNAVAILABLE'},503);
  const auth=await authenticatePlayerSession(request,env);
  if(!auth)return jsonResponse(request,{error:'LOGIN_REQUIRED'},401);
  let body;try{const raw=await request.text();if(raw.length>4096)throw new Error();body=JSON.parse(raw);}catch{return jsonResponse(request,{error:'INVALID_REQUEST'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body))return jsonResponse(request,{error:'INVALID_REQUEST'},400);
  const key=auth.accountKey;
  let stub,payload;
  if(['join','status','cancel','profile'].includes(body.action)){
    payload={key,action:body.action};
    if(body.action==='join'){
      if(!globalThis.SpaceTowerRecruit.validLoadout(auth.account.save?.v2Progress,body.loadout))return jsonResponse(request,{error:'LOADOUT_NOT_READY'},403);
      payload.profile={name:'星際駕駛 '+(await digest(key)).slice(0,5).toUpperCase(),loadout:body.loadout};
    }
    stub=env.RANKED_QUEUE.get(env.RANKED_QUEUE.idFromName('ranked-v1-global'));
  }else if(['poll','command'].includes(body.action)&&/^[0-9a-f-]{36}$/.test(body.roomId||'')){
    payload={key,action:body.action,command:body.command};
    stub=env.RANKED_ROOMS.get(env.RANKED_ROOMS.idFromName(body.roomId));
  }else return jsonResponse(request,{error:'INVALID_ACTION'},400);
  try{const response=await stub.fetch('https://ranked/internal',{method:'POST',body:JSON.stringify(payload)});return jsonResponse(request,await response.json(),response.status);}
  catch{return jsonResponse(request,{error:'RANKED_UNAVAILABLE'},503);}
}
