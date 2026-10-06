// Local-only interactive QA using the packaged iOS assets and real account handlers.
// No production accounts, native purchases, or external API requests are used.
import http from 'node:http';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {onRequestPost as player} from '../functions/api/player.js';
import {onRequestPost as guest} from '../functions/api/player/guest.js';

class MemoryKV {
  records=new Map();
  async get(key,type) {const value=this.records.get(key);return value===undefined?null:type==='json'?JSON.parse(value):value;}
  async put(key,value) {this.records.set(key,String(value));}
  async delete(key) {this.records.delete(key);}
  async list({prefix=''}={}) {return {keys:[...this.records.keys()].filter(k=>k.startsWith(prefix)).map(name=>({name})),list_complete:true};}
}
const env={FEEDBACK_STORE:new MemoryKV()};
const root=resolve('ios/App/App/public');
const out=resolve('tmp/ios-login-20261006/interactive');await mkdir(out,{recursive:true});
const events=[];let delayMs=0, playerFault='normal', balanceFault='normal';
const port=Number(process.env.ACCOUNT_QA_PORT)||4187;
const makeRequest=body=>new Request('https://example.test/api/player',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const initialGuest=await (await guest({env,request:makeRequest({installationId:'interactive-ios-account-test'})})).json();
for (const name of ['RecoveryPilotA','RecoveryPilotB']) {
  await player({env,request:makeRequest({action:'register',name,password:'LocalOnlyTest123!',save:{}})});
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ogg':'audio/ogg','.mp3':'audio/mpeg'};
const bootstrap=`<script>
window.Capacitor={getPlatform:()=> 'ios',isNativePlatform:()=>true,Plugins:{}};
const qaFetch=window.fetch.bind(window);
window.fetch=(input,options)=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.pathname.startsWith('/api/')) return qaFetch(url.pathname+url.search,options);return url.origin===location.origin?qaFetch(input,options):Promise.resolve(new Response('{}',{headers:{'Content-Type':'application/json'}}));};
if(!localStorage.getItem('interactiveQaInitialized')) {localStorage.setItem('interactiveQaInitialized','1');localStorage.setItem('spaceTowerPlayerName',${JSON.stringify(initialGuest.player.name)});localStorage.setItem('spaceTowerPlayerSession',${JSON.stringify(initialGuest.sessionToken)});}
window.addEventListener('load',()=>window.setSpaceTowerLanguage?.('zh'));
</script>`;
http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,`http://127.0.0.1:${port}`);const chunks=[];for await(const c of req)chunks.push(c);const body=Buffer.concat(chunks).toString();
  res.setHeader('Cache-Control','no-store');
  if(url.pathname==='/qa/requests'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(events));return;}
  if(url.pathname==='/qa/delay'){delayMs=Math.min(15000,Math.max(0,Number(url.searchParams.get('ms'))||0));res.end(JSON.stringify({delayMs}));return;}
  if(url.pathname==='/qa/network'){
   playerFault=url.searchParams.get('player')||'normal';balanceFault=url.searchParams.get('balance')||'normal';
   res.end(JSON.stringify({playerFault,balanceFault}));return;
  }
  if(url.pathname.startsWith('/api/')){
   if(url.pathname==='/api/balance'&&balanceFault==='hang')return;
   if(url.pathname==='/api/player'&&req.method==='POST'){
    const parsed=JSON.parse(body);const at=new Date().toISOString();
    if(playerFault!=='normal'){
     events.push({at,action:parsed.action,requestedName:parsed.name,fault:playerFault});
     await writeFile(resolve(out,'api-requests.json'),JSON.stringify(events,null,2));
     if(playerFault==='hang')return;
     if(playerFault==='offline'){req.socket.destroy();return;}
     res.writeHead(playerFault==='server-error'?503:200,{'Content-Type':'application/json'});res.end('{}');return;
    }
    if(delayMs)await new Promise(resolve=>setTimeout(resolve,delayMs));
    const response=await player({env,request:new Request(url,{method:'POST',headers:req.headers,body})});
    const data=await response.json();events.push({at,action:parsed.action,requestedName:parsed.name,resolvedName:data.player?.name,status:response.status});
    await writeFile(resolve(out,'api-requests.json'),JSON.stringify(events,null,2));
    res.writeHead(response.status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));return;
   }
   res.setHeader('Content-Type','application/json');res.end('{}');return;
  }
  const file=resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  let data=await readFile(file);
  if(extname(file)==='.html')data=Buffer.from(data.toString('utf8').replace('<head>','<head>'+bootstrap));
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(data);
 }catch(error){res.writeHead(500);res.end(error.message);}
}).listen(port,'127.0.0.1',()=>console.log(`IOS_ACCOUNT_QA http://127.0.0.1:${port}`));
