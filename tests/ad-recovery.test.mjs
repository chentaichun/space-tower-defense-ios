import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../v2-features.js', import.meta.url), 'utf8');
const section = (a,b) => source.slice(source.indexOf(a), source.indexOf(b,source.indexOf(a)));
function harness(consent) {
  let initialized = 0, recovery = 0;
  const adMob = {initialize:async()=>{initialized++}};
  const c = vm.createContext({IS_IOS_APP:false,IS_NATIVE_APP:true,LOCAL_REWARDED_AD_PREVIEW:false,
    rewardedAdsReady:false,rewardedAdLastStage:'idle',rewardedAdLastPlacement:'',adRecoveryTimer:null,
    renderRewardedSupply(){},renderRewardedRevive(){},getAdMobPlugin:()=>adMob,
    getRewardedAdMode:()=> 'production',updatePrivacyOptionsAvailability(){},trackRewardedEvent(){},
    scheduleAdRecovery:()=>recovery++,recordRewardedAdFailure(){},
    window:{Capacitor:{Plugins:{AdConsent:{requestConsent:async()=>consent}}}}});
  vm.runInContext(section('async function initializeRewardedAdsOnce()', 'async function initializeRewardedAds()'), c);
  return {c,counts:()=>({initialized,recovery})};
}
test('UMP network failure can use SDK-authorized cached consent',async()=>{
  const h=harness({canRequestAds:true,errorCode:2,errorMessage:'Network'});
  assert.equal(await h.c.initializeRewardedAdsOnce(),true);
  assert.deepEqual(h.counts(),{initialized:1,recovery:0});
});
test('missing or denied SDK consent never initializes advertising',async()=>{
  for(const consent of [{},{canRequestAds:false}]) {
    const h=harness(consent);assert.equal(await h.c.initializeRewardedAdsOnce(),false);
    assert.equal(h.counts().initialized,0);
  }
});
test('network failure without cached consent schedules recovery, not ads',async()=>{
  const h=harness({canRequestAds:false,errorCode:2,errorMessage:'Network'});
  assert.equal(await h.c.initializeRewardedAdsOnce(),false);
  assert.deepEqual(h.counts(),{initialized:0,recovery:1});
});

test('iOS initializes only after native consent and keeps tracking denied independent of ad consent',async()=>{
  for (const allowed of [false, true]) {
    const h=harness({canRequestAds:allowed,trackingAuthorized:false});
    h.c.IS_IOS_APP=true;
    assert.equal(await h.c.initializeRewardedAdsOnce(),allowed);
    assert.equal(h.counts().initialized,allowed?1:0);
    assert.equal(h.c.iosTrackingAuthorized,false);
  }
});

test('iOS production ads never fall back to Android units or Android mode',()=>{
  const c=vm.createContext({IS_IOS_APP:true,window:{SPACE_TOWER_AD_CONFIG:{mode:'production',rewardedUnitId:'android'}},
    GOOGLE_REWARDED_PRODUCTION_UNIT_IDS:{run_revive:'android'}});
  vm.runInContext(section('function getRewardedAdMode()', 'async function initializeRewardedAdsOnce()'),c);
  assert.equal(c.getRewardedAdMode(),'test');
  c.window.SPACE_TOWER_AD_CONFIG.ios={mode:'production'};
  assert.equal(c.getConfiguredRewardedUnitId('run_revive'),'');
  c.window.SPACE_TOWER_AD_CONFIG.ios.rewardedUnitId='ios-supplies';
  c.window.SPACE_TOWER_AD_CONFIG.ios.rewardedUnitIds={run_revive:'ios-revive'};
  assert.equal(c.getConfiguredRewardedUnitId('run_revive'),'ios-revive');
  assert.equal(c.getConfiguredRewardedUnitId('daily_obsidian'),'ios-supplies');
});
function postRunHarness() {
  let saved={completedRuns:1,lastShownAt:0}, shown=0, prepare;
  const c=vm.createContext({POST_RUN_INTERSTITIAL_FIRST_RUN:2,POST_RUN_INTERSTITIAL_INTERVAL:3,
    POST_RUN_INTERSTITIAL_COOLDOWN_MS:600000,postRunAdGeneration:0,rewardedAdBusy:false,rewardedAdSeenThisRun:false,
    IS_IOS_APP:false,IS_NATIVE_APP:true,LOCAL_REWARDED_AD_PREVIEW:false,rewardedAdsReady:true,
    running:false,commercePurchaseActive:false,commerceAppActive:true,document:{hidden:false},
    resultScreen:{classList:{contains:()=>false}},window:{SPACE_TOWER_AD_CONFIG:{interstitialUnitId:'test'}},
    readPostRunAdState:()=>({...saved}),writePostRunAdState:s=>{saved={...s}},getRewardedAdMode:()=> 'production',
    trackRewardedEvent(){},recordRewardedAdFailure(){},renderRewardedSupply(){},renderRewardedRevive(){},
    getAdMobPlugin:()=>({prepareInterstitial:()=>new Promise(r=>prepare=r),showInterstitial(){}}),
    showConfirmedInterstitial:async(_a,eligible,onShown)=>{if(!eligible())return false;shown++;onShown();return true;}
  });
  vm.runInContext(section('function isPostRunInterstitialDue(', 'async function showConfirmedInterstitial('),c);
  vm.runInContext(section('async function maybeShowPostRunInterstitial()', 'window.maybeShowSpaceTowerPostRunInterstitial'),c);
  return {c,release:()=>prepare(),state:()=>saved,shown:()=>shown};
}
test('restart during ad load cancels display and retains the pending opportunity',async()=>{
  const h=postRunHarness();const p=h.c.maybeShowPostRunInterstitial();
  h.c.postRunAdGeneration++;h.c.running=true;h.release();
  assert.equal(await p,false);assert.equal(h.shown(),0);assert.equal(h.state().pending,true);
  assert.equal(h.c.rewardedAdBusy,false);
  h.c.running=false;const next=h.c.maybeShowPostRunInterstitial();h.release();
  assert.equal(await next,true);assert.equal(h.state().pending,false);
});
test('no-ads entitlement and competing rewarded ad suppress automatic display',async()=>{
  for(const mode of ['owned','busy']) {
    const h=postRunHarness();
    if(mode==='owned')h.c.window.hasSpaceTowerNoAds=()=>true;else h.c.rewardedAdBusy=true;
    assert.equal(await h.c.maybeShowPostRunInterstitial(),false);assert.equal(h.shown(),0);
  }
});
test('interstitial lock lasts until dismissal and impressions require SDK showed event',async()=>{
  const handlers={},removed=[];let shown=0,settled=false;
  const c=vm.createContext({});
  vm.runInContext(section('async function showConfirmedInterstitial(', 'async function maybeShowPostRunInterstitial()'),c);
  const adMob={addListener:async(n,fn)=>{handlers[n]=fn;return{remove:()=>removed.push(n)}},showInterstitial:async()=>{}};
  const pending=c.showConfirmedInterstitial(adMob,()=>true,()=>shown++).then(r=>{settled=true;return r});
  for(let i=0;i<10;i++)await Promise.resolve();
  assert.equal(settled,false);assert.equal(shown,0);
  handlers.interstitialAdShowed();assert.equal(shown,1);
  handlers.interstitialAdDismissed();assert.equal(await pending,true);assert.equal(removed.length,3);
});
