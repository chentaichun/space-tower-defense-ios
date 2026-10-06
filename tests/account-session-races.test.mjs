import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=(await readFile(new URL('../index.html',import.meta.url),'utf8')).replaceAll('\r\n','\n');
function extract(name) {
  const match=source.match(new RegExp(`    (?:async )?function ${name}\\([^]*?\\n    }\\n`));
  assert.ok(match,`missing ${name}`);return match[0];
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
function fixture() {
  const pending=deferred(), applied=[], statuses=[];
  const c={playerName:'PilotA',playerPassword:'',playerSessionToken:'tokenA',sessionPlayerName:'PilotA',playerSessionRevision:0,
    PLAYER_SESSION_KEY:'session',PLAYER_NAME_KEY:'name',rememberedPlayerSessions:{pilota:{name:'PilotA',token:'tokenA'}},
    localStorage:storage(),sessionStorage:storage(),cloudSaveReady:true,cloudSaveTimer:0,cloudSavePending:false,cloudSavePendingCritical:false,
    vipState:null,vipStoreMessage:'',authBusy:false,DEV_MODE:false,officialBalanceReady:Promise.resolve(),economyDirty:false,economyRevision:0,
    loginName:{value:'PilotB'},loginPassword:{value:'Password123!'},window:{},calls:0,activations:0,
    setShopEntitlements(){},renderRememberedPlayerSessions(){},saveRememberedPlayerSessions(){},clearTimeout,
    apiUrl:p=>p,shopAuthHeaders:h=>h,getLocalSavePayload:()=>({economyRevision:0}),
    commerceRequest:()=>{c.calls++;return pending.promise;},applyCloudSave:s=>applied.push(s),loadVipStatus(){},
    activateCloudSaveSession:()=>{c.activations++;c.cloudSaveReady=true;},
    getExtraText:()=>({}),formatLocalized:(x,args)=>JSON.stringify(args),setLoginStatus:s=>statuses.push(s),localizedAuthError:(code,msg)=>msg,
    startButton:{},registerButton:{},googleSignInButton:{},accountSignInTab:{},accountRegisterTab:{},setAccountMode(){},
    guestStart:{addEventListener:(_event,fn)=>{c.guestClick=fn;}}
  };
  for(const k of ['localStorage','sessionStorage']) {c[k].setItem('session','tokenA');c[k].setItem('name','PilotA');}
  const functions=['setAuthBusy','persistPlayerSession','clearPlayerSession','syncPlayerSave','resumeRememberedPlayer','loginAndStart'].map(extract).join('\n');
  const guest=source.match(/    guestStart\.addEventListener\("click", async \(\) => \{[^]*?\n    \}\);/)[0];
  runInNewContext(functions+'\n'+guest,c);
  return {c,pending,applied,statuses};
}
const success=name=>({response:{ok:true},data:{player:{name,save:{obsidian:123}},entitlements:[]}});

test('choosing guest removes active credentials from both persistent stores and keeps saved account choices',async()=>{
  const {c}=fixture();await c.guestClick();
  assert.equal(c.playerName,'Guest');assert.equal(c.playerSessionToken,'');assert.equal(c.cloudSaveReady,false);
  for(const k of ['localStorage','sessionStorage']) {assert.equal(c[k].getItem('session'),null);assert.equal(c[k].getItem('name'),null);}
  assert.equal(c.rememberedPlayerSessions.pilota.token,'tokenA');
  assert.equal(c.loginName.value,'');assert.equal(c.loginPassword.value,'');
});

test('a delayed automatic login cannot overwrite a later session invalidation',async()=>{
  const {c,pending,applied}=fixture();const resume=c.resumeRememberedPlayer();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(c.calls,1);c.clearPlayerSession();c.playerName='Guest';pending.resolve(success('PilotA'));await resume;
  assert.equal(c.playerName,'Guest');assert.equal(c.playerSessionToken,'');assert.equal(c.cloudSaveReady,false);
  assert.deepEqual(applied,[]);assert.equal(c.activations,0);assert.equal(c.localStorage.getItem('session'),null);
});

test('automatic resume locks account entry until its response has finished',async()=>{
  const {c,pending}=fixture();const resume=c.resumeRememberedPlayer();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(c.authBusy,true);assert.equal(c.loginName.disabled,true);assert.equal(c.loginPassword.disabled,true);
  assert.equal(c.accountRegisterTab.disabled,true);assert.equal(c.guestStart.disabled,true);
  pending.resolve(success('PilotA'));await resume;
  assert.equal(c.authBusy,false);assert.equal(c.loginName.disabled,false);assert.equal(c.loginPassword.disabled,false);
});

test('a stale save response cannot apply another account progress or token after switching',async()=>{
  const {c,pending,applied}=fixture();const save=c.syncPlayerSave('save');
  c.clearPlayerSession();c.persistPlayerSession('tokenB','PilotB');c.playerName='PilotB';
  pending.resolve({...success('PilotA'),data:{...success('PilotA').data,sessionToken:'replacementA'}});
  await assert.rejects(save,{code:'SESSION_CHANGED'});
  assert.equal(c.playerName,'PilotB');assert.equal(c.localStorage.getItem('session'),'tokenB');assert.deepEqual(applied,[]);
});

test('account choice changed during startup prevents the old automatic request from starting',async()=>{
  const {c}=fixture(),balance=deferred();c.officialBalanceReady=balance.promise;
  const resume=c.resumeRememberedPlayer();c.clearPlayerSession();c.playerName='Guest';balance.resolve();await resume;
  assert.equal(c.calls,0);assert.equal(c.activations,0);assert.equal(c.playerName,'Guest');
});

test('repeated login submission while a request is pending sends only one request',async()=>{
  const {c,pending}=fixture();const first=c.loginAndStart();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(c.authBusy,true);await c.loginAndStart();assert.equal(c.calls,1);
  pending.resolve({...success('PilotB'),data:{...success('PilotB').data,sessionToken:'tokenB'}});await first;
  assert.equal(c.playerName,'PilotB');assert.equal(c.authBusy,false);assert.equal(c.activations,1);
});

test('a failed old automatic request does not erase a newly selected account',async()=>{
  const {c,pending}=fixture();const resume=c.resumeRememberedPlayer();await new Promise(resolve=>setImmediate(resolve));
  c.clearPlayerSession();c.persistPlayerSession('tokenB','PilotB');c.playerName='PilotB';
  pending.reject(new Error('offline'));await resume;
  assert.equal(c.localStorage.getItem('session'),'tokenB');assert.equal(c.playerName,'PilotB');
});
