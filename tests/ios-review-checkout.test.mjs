import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('    async function waitForVipStore('),html.indexOf('    async function purchaseVipTurret('));
function fixture(overrides={}) {
  const events=[], purchases=[], restores=[];
  const billing={isAvailable:async()=>({available:true}),queryProducts:async()=>({products:[{productId:'vip_monthly_v1',formattedPrice:'$3.99'}]}),
    purchase:async options=>{purchases.push(options);return {status:'cancelled',purchases:[]};},
    queryPurchases:async options=>{restores.push(options);return {status:'ok',purchases:[]};},finishTransaction:async()=>{}};
  const context=vm.createContext({setTimeout,clearTimeout,crypto,console,IS_NATIVE_APP:true,IS_IOS_APP:true,currentLanguage:'en',
    playerSessionToken:'session-a',sessionPlayerName:'player-a',vipPurchaseBusy:false,commercePurchaseActive:false,
    vipProduct:null,vipState:null,vipStoreMessage:'',shopGooglePlayAccountId:'',
    nativeStoreBilling:()=>billing,nativePurchaseOptions:(productId,attemptId)=>({productId,attemptId}),apiUrl:p=>p,shopAuthHeaders:()=>({}),
    commerceRequest:async url=>({response:{ok:true},data:url==='/api/vip-store'?{active:false}:{authenticated:true,appleStoreReady:true,appleAppAccountToken:'account-a'}}),
    handleGooglePlayPurchaseResult:async()=>{},showTaskToast:()=>{},trackGameEvent:()=>{},
    window:{renderSpaceTowerVipStore:()=>events.push(context.vipStoreMessage),openSpaceTowerVipSignIn:message=>events.push({login:message})},...overrides});
  vm.runInContext(source,context);
  return {context,billing,events,purchases,restores};
}

test('VIP click gives immediate feedback, uses only VIP catalog and prevents duplicate checkout',async()=>{
  const f=fixture(); let resolveAvailability;
  f.billing.isAvailable=()=>new Promise(resolve=>{resolveAvailability=resolve;});
  const first=f.context.purchaseVipSubscription();
  assert.equal(f.context.vipPurchaseBusy,true);
  assert.match(f.events[0],/Connecting/);
  await f.context.purchaseVipSubscription();
  resolveAvailability({available:true}); await first;
  assert.equal(f.purchases.length,1);
  assert.equal(f.purchases[0].appAccountToken,'account-a');
  assert.match(f.context.vipStoreMessage,/cancelled/);
  assert.equal(f.context.vipPurchaseBusy,false);
  assert.equal(f.context.commercePurchaseActive,false);
});

test('VIP guest action opens account UI instead of silently returning',async()=>{
  for(const state of [{playerSessionToken:'',sessionPlayerName:''},{sessionPlayerName:'Guest-ABCDEF12'}]) {
    const f=fixture(state); await f.context.purchaseVipSubscription();
    assert.equal(f.purchases.length,0); assert.ok(f.events.some(event=>event.login));
  }
});

test('unavailable products, restricted payments and network failure leave retryable feedback',async()=>{
  for(const mode of ['product','restriction','network']) {
    const f=fixture();
    if(mode==='product')f.billing.queryProducts=async()=>({products:[]});
    if(mode==='restriction')f.billing.isAvailable=async()=>({available:false});
    if(mode==='network')f.context.commerceRequest=async()=>{throw Object.assign(new Error(),{code:'COMMERCE_TIMEOUT'});};
    await f.context.purchaseVipSubscription();
    assert.equal(f.purchases.length,0); assert.equal(f.context.vipPurchaseBusy,false);
    assert.match(f.context.vipStoreMessage,/loaded|restricted|connection/);
  }
});

test('changing player during preparation cannot charge the next player account',async()=>{
  const f=fixture();
  f.context.commerceRequest=async()=>{f.context.playerSessionToken='session-b';return {response:{ok:true},data:{authenticated:true,appleStoreReady:true,appleAppAccountToken:'account-a'}};};
  await f.context.purchaseVipSubscription(); assert.equal(f.purchases.length,0);
  assert.match(f.context.vipStoreMessage,/player account/);
});

test('pending approval is visible in VIP, and success verifies before reporting active',async()=>{
  const f=fixture(); f.billing.purchase=async()=>({status:'pending',purchases:[]});
  await f.context.purchaseVipSubscription(); assert.match(f.context.vipStoreMessage,/awaiting store approval/);
  f.billing.purchase=async()=>({status:'ok',purchases:[{purchaseState:1}]});
  let verified=false;
  f.context.handleGooglePlayPurchaseResult=async()=>{verified=true;f.context.setVipStoreMessage('VIP is now active.');};
  await f.context.purchaseVipSubscription(); assert.equal(verified,true); assert.match(f.context.vipStoreMessage,/now active/);
});

test('restore explicitly requests App Store sync and never reports success for empty or failed restore',async()=>{
  const f=fixture(); await f.context.restoreVipSubscription();
  assert.equal(f.restores[0].restore,true); assert.match(f.context.vipStoreMessage,/No active/);
  f.billing.queryPurchases=async()=>{throw new Error('RESTORE_FAILED');};
  await f.context.restoreVipSubscription(); assert.match(f.context.vipStoreMessage,/could not be completed/);
  assert.equal(f.context.vipPurchaseBusy,false);
});

test('product lookup timeout settles and allows retry',async()=>{
  const f=fixture();
  await assert.rejects(f.context.waitForVipStore(new Promise(()=>{}),5),error=>error.code==='COMMERCE_TIMEOUT');
  assert.equal(await f.context.waitForVipStore(Promise.resolve('ready'),5),'ready');
});

test('VIP verification never finishes or grants failed or account-switched transactions',async()=>{
  for (const mode of ['failed','switched','finish-switched','success']) {
    const f=fixture(); let finished=0;
    f.billing.finishTransaction=async()=>{finished++;if(mode==='finish-switched')f.context.playerSessionToken='session-b';};
    f.context.commerceRequest=async()=>{
      if(mode==='switched')f.context.playerSessionToken='session-b';
      return {response:{ok:mode!=='failed'},data:{active:mode!=='failed',code:'SUBSCRIPTION_VERIFICATION_FAILED'}};
    };
    const operation=f.context.verifyVipSubscriptionPurchase({transactionId:'test-transaction',purchaseState:1});
    if(mode==='success') {
      await operation; assert.equal(finished,1); assert.equal(f.context.vipState.active,true);
    } else {
      await assert.rejects(operation); assert.equal(finished,mode==='finish-switched'?1:0); assert.equal(f.context.vipState,null);
    }
  }
});

test('pending VIP transaction from native callback updates the visible subscription page',async()=>{
  const f=fixture(); f.context.getShopUiText=()=>({googlePlayPending:'pending'}); f.context.shopStatus={textContent:''};
  const fn=html.slice(html.indexOf('    async function handleGooglePlayPurchaseResult('),html.indexOf('    async function restoreGooglePlayPurchases('));
  vm.runInContext(fn,f.context);
  await f.context.handleGooglePlayPurchaseResult({status:'ok',purchases:[{products:['vip_monthly_v1'],purchaseState:2}]});
  assert.match(f.context.vipStoreMessage,/awaiting store approval/);
  await assert.rejects(f.context.handleGooglePlayPurchaseResult({status:'ok',purchases:[]}),error=>error.code==='EMPTY_PURCHASE_RESULT');
});

test('battle alerts clear top controls at tablet widths and ignore bottom speed controls on phones',()=>{
  const js=readFileSync(new URL('../v2-features.js',import.meta.url),'utf8');
  const fn=js.slice(js.indexOf('function layoutBattleStatus()'),js.indexOf('let battleLayoutFrame'));
  for(const speed of [{top:76,bottom:155,height:79},{top:1000,bottom:1044,height:44}]) {
    const props={}, rects={'.hud':{top:18,bottom:85,height:67},'.game-actions':{top:18,bottom:68,height:50},'.speed-panel':speed};
    const context=vm.createContext({window:{innerHeight:1180},getComputedStyle:()=>({display:'grid'}),document:{
      body:{classList:{contains:()=>true},style:{setProperty:(key,value)=>props[key]=value}},
      querySelector:selector=>({getBoundingClientRect:()=>rects[selector]}),
      getElementById:()=>({getBoundingClientRect:()=>({bottom:205})})}});
    vm.runInContext(fn,context);context.layoutBattleStatus();
    assert.equal(props['--battle-priority-top'],speed.top===76?'165px':'95px');
    assert.equal(props['--battle-coach-top'],'215px');
  }
});
