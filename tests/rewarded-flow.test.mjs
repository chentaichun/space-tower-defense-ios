import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../v2-features.js',import.meta.url),'utf8');
const config=readFileSync(new URL('../release/admob.production.js',import.meta.url),'utf8');
const section=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const placements=['daily_obsidian','utility_consumable','launch_reward_double','run_revive','result_double','card_reroll','trial_attempt'];
function flow() {
  const calls=[],events=[],handlers=new Map();let mode='reward',grants=0;
  const elements=Object.fromEntries(['rewardedSupplyCard','rewardedSupplyKicker','rewardedSupplyTitle','rewardedSupplyDescription','rewardedSupplyButton','rewardedSupplyStatus','homeRewardedSupplyButton','homeRewardedSupplyTitle','homeRewardedSupplyHint'].map(k=>[k,{}]));
  const adMob={
    addListener:async(n,f)=>{handlers.set(n,f);return{remove:async()=>handlers.delete(n)}},
    prepareRewardVideoAd:async options=>{calls.push(options);if(mode==='no-fill')throw Object.assign(new Error('No fill.'),{code:3});if(mode==='timeout')throw Object.assign(new Error('Load timed out'),{code:'LOAD_TIMEOUT'});},
    showRewardVideoAd:()=>{queueMicrotask(()=>{if(mode==='show-failed'){handlers.get('onRewardedVideoAdFailedToShow')?.(new Error('Show failed'));return;}if(mode==='reward')handlers.get('onRewardedVideoAdReward')?.({amount:5,type:'Obsidian'});handlers.get('onRewardedVideoAdDismissed')?.();});return new Promise(()=>{});}
  };
  const c=vm.createContext({...elements,IS_IOS_APP:false,IS_NATIVE_APP:true,DEV_MODE:false,LOCAL_REWARDED_AD_PREVIEW:false,
    rewardedAdsReady:true,rewardedAdBusy:false,rewardedAdSeenThisRun:false,iosTrackingAuthorized:false,
    rewardedAdLastStage:'ready',rewardedAdLastPlacement:'',rewardedAdLastError:null,rewardedSupplyMessage:'',REWARDED_OBSIDIAN_AMOUNT:5,
    getAdMobPlugin:()=>adMob,renderRewardedRevive(){},renderObsidian(){},getAdFreeActionLabel:x=>x,
    getRewardedAdsText:()=>({loading:'Loading',failed:'Incomplete',unavailable:'Unavailable',watchSupply:'Watch',granted:'Granted'}),
    trackRewardedEvent:(name,placement)=>events.push({name,placement}),recordRewardedAdFailure:(_e,_p,s)=>{c.rewardedAdLastStage=s;},
    window:{getSpaceTowerRewardedSupplyState:()=>({remaining:5-grants,limit:5}),grantSpaceTowerRewardedSupply:amount=>{grants++;return amount;}}
  });
  vm.runInContext(config,c);
  vm.runInContext(section('const GOOGLE_REWARDED_PRODUCTION_UNIT_IDS','function shouldUseRewardedAdPreview'),c);
  vm.runInContext(section('function getRewardedAdMode()', 'async function initializeRewardedAdsOnce()'),c);
  vm.runInContext(section('async function showConfirmedRewardedAd(', 'function readPostRunAdState()'),c);
  vm.runInContext(section('function renderRewardedSupply()', 'function renderRewardedRevive()'),c);
  return{c,calls,events,handlers,elements,setMode:m=>mode=m,grants:()=>grants};
}
for(const placement of placements) test(`${placement}: correct production unit, no-fill unlocks, next request can complete`,async()=>{
  const h=flow();h.setMode('no-fill');assert.equal(await h.c.showOptInRewardedAd(placement),false);
  assert.equal(h.c.rewardedAdBusy,false);assert.equal(h.events.filter(e=>e.name==='rewarded_complete').length,0);
  h.setMode('reward');assert.equal(await h.c.showOptInRewardedAd(placement),true);
  assert.equal(h.calls[0].adId,`ca-app-pub-4461762858602817/${placement==='run_revive'?'5964221194':'9681205002'}`);
  assert.equal(h.calls[0].isTesting,false);assert.equal(h.calls.length,2);assert.equal(h.handlers.size,0);assert.equal(h.c.rewardedAdBusy,false);
});
for(const mode of ['no-fill','timeout','dismissed','show-failed']) test(`${mode}: no Obsidian granted, both buttons unlock`,async()=>{
  const h=flow();h.setMode(mode);await h.c.claimRewardedObsidian();
  assert.equal(h.grants(),0);assert.equal(h.elements.homeRewardedSupplyButton.disabled,false);assert.equal(h.elements.rewardedSupplyButton.disabled,false);
  assert.equal(h.handlers.size,0);assert.equal(h.c.rewardedAdBusy,false);
});
test('duplicate taps issue one request and grant exactly once after earned reward and dismissal',async()=>{
  const h=flow();await Promise.all([h.c.claimRewardedObsidian(),h.c.claimRewardedObsidian()]);
  assert.equal(h.calls.length,1);assert.equal(h.grants(),1);assert.equal(h.elements.homeRewardedSupplyHint.textContent,'Granted');
});
test('supply daily cap blocks both entry points without a native call',async()=>{
  const h=flow();h.c.window.getSpaceTowerRewardedSupplyState=()=>({remaining:0,limit:5});await h.c.claimRewardedObsidian();
  assert.equal(h.calls.length,0);assert.equal(h.elements.homeRewardedSupplyButton.disabled,true);assert.equal(h.elements.rewardedSupplyButton.disabled,true);
});
test('trial verification data reaches the matching native request',async()=>{
  const h=flow();await h.c.showOptInRewardedAd('trial_attempt',{ssvCustomData:'trial:fixture'});
  assert.equal(h.calls[0].ssv.customData,'trial:fixture');
});
test('busy loading is rendered on both supply entry points',async()=>{
  const h=flow();h.c.rewardedAdBusy=true;h.c.renderRewardedSupply();
  assert.equal(h.elements.rewardedSupplyButton.textContent,'Loading');assert.equal(h.elements.homeRewardedSupplyHint.textContent,'Loading');
});
