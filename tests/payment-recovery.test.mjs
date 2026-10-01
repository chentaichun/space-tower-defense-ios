import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const starter = readFileSync(new URL('../starter-pack.js', import.meta.url), 'utf8');
const section = (source, from, to) => {
  const start = source.indexOf(from), end = source.indexOf(to, start + from.length);
  assert.ok(start >= 0 && end > start);
  return source.slice(start, end);
};
const helpers = section(html, '    async function commerceRequest(', '    async function syncPlayerSave(');
function harness(fetch = async () => ({ok:true, json:async()=>({})})) {
  const timers = new Map(), events = [], classes = new Set(), storage = new Map();
  let id = 0;
  const ctx = vm.createContext({ AbortController, fetch, console, currentLanguage:'zh', IS_NATIVE_APP:true, IS_IOS_APP:false,
    setTimeout: fn => { timers.set(++id, fn); return id; }, clearTimeout: n => timers.delete(n),
    document:{body:{classList:{add:n=>classes.add(n),remove:n=>classes.delete(n)}}},
    localStorage:{setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    trackGameEvent:(name, params)=>events.push({name,params}),
    getLocalSavePayload:()=>({}), syncPlayerSave:async()=>{},
  });
  ctx.window = ctx;
  vm.runInContext(helpers, ctx);
  vm.runInContext(section(html, '    function nativeStoreBilling()', '    async function fulfillAppleStorePurchase('), ctx);
  return {ctx,timers,events,classes,storage};
}
const flush = async () => { for(let i=0;i<12;i++) await Promise.resolve(); };
for (const stuck of ['headers','body']) test(`commerce timeout aborts stuck ${stuck}, including a late response`, async()=>{
  let signal, release;
  const unresolved = new Promise(r=>release=r);
  const h=harness(async (_url, options)=>{signal=options.signal; return stuck==='headers'?unresolved:{ok:true,json:()=>unresolved};});
  const request=h.ctx.commerceRequest('/fake',{},'verification',30);
  await flush();
  const rejected=assert.rejects(request,e=>e.code==='COMMERCE_TIMEOUT' && e.stage==='verification');
  [...h.timers.values()][0]();
  await rejected;
  assert.equal(signal.aborted,true); assert.equal(h.timers.size,0);
  release(stuck==='headers'?{ok:true,json:async()=>({fulfilled:true})}:{fulfilled:true});
  await flush(); assert.equal(h.timers.size,0);
});
test('successful request keeps payload and clears watchdog',async()=>{
  const h=harness(async()=>({ok:true,status:202,json:async()=>({pending:true})}));
  const result=await h.ctx.commerceRequest('/fake');
  assert.equal(result.response.status,202); assert.equal(result.data.pending,true); assert.equal(h.timers.size,0);
});
test('currency and starter share a purchase lock and interrupted attempt marker',()=>{
  const h=harness();
  assert.equal(h.ctx.beginCommercePurchase('obsidian_120','first'),true);
  assert.equal(h.ctx.beginCommercePurchase('starter_emerald_v1','second'),false);
  assert.equal(JSON.parse(h.storage.get('spaceTowerCheckoutAttempt')).attempt_id,'first');
  assert.ok(h.classes.has('checkout-active'));
  h.ctx.endCommercePurchase();
  assert.equal(h.classes.size,0); assert.equal(h.storage.size,0);
  assert.equal(h.ctx.beginCommercePurchase('starter_emerald_v1','second'),true);
});
test('native timeout unlocks currency checkout without reporting cancellation',async()=>{
  const h=harness(); let rejectNative;
  Object.assign(h.ctx,{shopBusy:false,playerSessionToken:'test',shopAuthenticated:true,shopProviderReady:true,
    shopGooglePlayAccountId:'test',shopStatus:{textContent:''},crypto:{randomUUID:()=> 'attempt'},
    getShopUiText:()=>({redirecting:'Waiting',googlePlayUnavailable:'Unavailable'}),renderShop(){},
    findShopProduct:()=>({}),getGooglePlayAnalyticsValue:()=>0,
    nativePlugin:()=>({purchase:()=>new Promise((_,reject)=>rejectNative=reject)}),
    shopErrorMessage:()=> 'Check purchase status',handleGooglePlayPurchaseResult:async()=>assert.fail('no receipt'),
  });
  vm.runInContext(section(html,'    async function purchaseGooglePlayObsidian(', '    async function purchaseObsidian('),h.ctx);
  const purchase=h.ctx.purchaseGooglePlayObsidian('obsidian_120');
  assert.equal(h.ctx.shopBusy,true);
  rejectNative(Object.assign(new Error('timeout'),{code:'BILLING_TIMEOUT'}));
  await purchase;
  assert.equal(h.ctx.shopBusy,false); assert.equal(h.classes.size,0);
  assert.ok(h.events.some(e=>e.name==='checkout_error' && e.params.code==='BILLING_TIMEOUT'));
  assert.ok(!h.events.some(e=>e.name==='checkout_cancel' || e.name==='purchase'));
});
test('starter preflight failure releases both locks and never opens Play',async()=>{
  const h=harness(); let nativeCalls=0;
  Object.assign(h.ctx,{starterState:{busy:false,product:{formattedPrice:'NT$30'}},STARTER_PREVIEW:false,
    starterOwned:()=>false,STARTER_OFFER:{id:'starter_emerald_v1'},crypto:{randomUUID:()=> 'starter'},
    renderStarterPack(){},getShopUiText:()=>({redirecting:'Waiting'}),playerSessionToken:'test',shopAuthenticated:true,
    IS_ANDROID_APP:true,shopGooglePlayServerReady:true,shopErrorMessage:()=> 'Retry',starterText:()=>({}),
    syncPlayerSave:async()=>{throw Object.assign(new Error('timeout'),{code:'COMMERCE_TIMEOUT',stage:'save_sync'});},
    nativePlugin:()=>({purchase:()=>nativeCalls++})
  });
  vm.runInContext(section(starter,'async function buyStarterPack()', 'starterDialog.addEventListener('),h.ctx);
  await h.ctx.buyStarterPack();
  assert.equal(nativeCalls,0);assert.equal(h.ctx.starterState.busy,false);assert.equal(h.classes.size,0);
  assert.equal(h.events.at(-1).params.stage,'save_sync');
});
test('listener and resume receipt race submits the token once',async()=>{
  const h=harness();let calls=0,release;
  h.ctx.fulfillGooglePlayPurchase=()=>{calls++;return new Promise(r=>release=r);};
  vm.runInContext(section(html,'    async function submitGooglePlayPurchase(', '    async function fulfillGooglePlayPurchase('),h.ctx);
  const receipt={purchaseToken:'fake-token'};
  const a=h.ctx.submitGooglePlayPurchase(receipt),b=h.ctx.submitGooglePlayPurchase(receipt,{restored:true});
  assert.equal(calls,1);release({fulfilled:true});
  await Promise.all([a,b]);
  assert.equal(vm.runInContext('commerceSubmissions.size',h.ctx),0);
});
test('post-fulfillment sync failure is distinct from payment failure',async()=>{
  const h=harness(); h.ctx.syncPlayerSave=async()=>{throw Object.assign(new Error('offline'),{code:'COMMERCE_TIMEOUT'});};
  assert.equal(await h.ctx.syncFulfilledPurchase('obsidian_120'),false);
  assert.equal(h.events.at(-1).name,'checkout_sync_pending');
  assert.match(h.ctx.commerceSyncText(),/付款已確認/);
  assert.ok(!h.events.some(e=>e.name==='checkout_error'));
});

test('Apple client never finishes an unfulfilled transaction and can retry after server success',async()=>{
  const calls=[];
  let fulfilled=false;
  const ctx=vm.createContext({
    commerceRequest:async()=>({response:{ok:fulfilled},data:{fulfilled,entitlements:[],wallet:{},code:'RETRY'}}),
    apiUrl:x=>x,shopAuthHeaders:x=>x,getShopUiText:()=>({paymentPending:'Pending',paymentSuccess:'Done'}),
    nativeStoreBilling:()=>({finishTransaction:async()=>calls.push('finish')}),setShopEntitlements:()=>{},
    window:{},syncFulfilledPurchase:async()=>{calls.push('sync');return true;},shopOrderHistory:[],
    renderShop:()=>{},shopStatus:{textContent:''}
  });
  vm.runInContext(section(html,'    async function fulfillAppleStorePurchase(', '    function normalizeShopState('),ctx);
  const receipt={purchaseState:1,products:['obsidian_120'],transactionId:'12345',environment:'Production'};
  await assert.rejects(ctx.fulfillAppleStorePurchase(receipt));
  assert.deepEqual(calls,[]);
  fulfilled=true;
  await ctx.fulfillAppleStorePurchase(receipt);
  assert.deepEqual(calls,['finish','sync']);
});
