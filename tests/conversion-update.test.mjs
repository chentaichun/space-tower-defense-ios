import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const read = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
function extract(source, signature, next) {
  const start = source.indexOf(signature);
  const end = source.indexOf(next, start + signature.length);
  assert.ok(start >= 0 && end > start, signature);
  return source.slice(start, end);
}
const html = read('index.html');
const ux = read('progression-ux.js');
const expansion = read('expansion-system.js');
test('native checkout distinguishes errors, cancellation, pending, fulfillment and empty restores', async () => {
  const events = [], fulfilled = [];
  const ctx = vm.createContext({ getShopUiText: () => ({ googlePlayUnavailable:'unavailable', googlePlayCancelled:'cancelled',googlePlayPending:'pending' }),
    trackGameEvent: (name, params) => events.push({name,params}), shopStatus:{textContent:''}, submitGooglePlayPurchase:async p => fulfilled.push(p) });
  vm.runInContext(extract(html, 'async function handleGooglePlayPurchaseResult(', '    async function restoreGooglePlayPurchases('),ctx);
  const handle=ctx.handleGooglePlayPurchaseResult;
  await assert.rejects(handle({status:'error',responseCode:3,purchases:[]}), e=>e.code==='3');
  await assert.rejects(handle({status:'updated',responseCode:0,purchases:[]}), e=>e.code==='EMPTY_PURCHASE_RESULT');
  await handle({status:'updated',responseCode:0,purchases:[]},{restored:true});
  await handle({status:'cancelled',responseCode:1},{productId:'starter_emerald',attemptId:'test'});
  assert.equal(ctx.shopStatus.textContent,'cancelled');
  assert.equal(events.at(-1).params.product_id,'starter_emerald');
  await handle({status:'updated',responseCode:0,purchases:[{purchaseState:2}]});
  assert.equal(ctx.shopStatus.textContent,'pending');
  assert.equal(fulfilled.length,0);
  await handle({status:'updated',responseCode:0,purchases:[{purchaseState:1,purchaseToken:'test'}]});
  assert.equal(fulfilled.length,1);
});
test('utility currency purchases work before advertisements and reward-only vouchers cannot be bought',()=>{
  const ctx=vm.createContext({Object,DEV_MODE:false,obsidian:100, UTILITY_OBSIDIAN_OFFERS:{reviveTicket:{price:30,weeklyLimit:3},obsidianDoubleVoucher:{price:0,weeklyLimit:0,rewardOnly:true}},
    expansionStoreText:()=>({}),refreshUtilityClaimWindows:()=>claims,expansionProgress:{consumables:{reviveTicket:0,obsidianDoubleVoucher:0}},
    showTaskToast(){},trackObsidianSpend(){},saveObsidian(){},saveExpansionProgress(){},EXPANSION_REWARD_TEXT:{en:{}},currentLanguage:'en'});
  const claims={adClaims:0,purchases:{reviveTicket:0}};
  vm.runInContext(extract(expansion,'function buyUtilityWithObsidian(','function getMusicTrack('),ctx);
  ctx.buyUtilityWithObsidian('reviveTicket');
  assert.equal(ctx.obsidian,70);assert.equal(ctx.expansionProgress.consumables.reviveTicket,1);assert.equal(claims.adClaims,0);
  ctx.buyUtilityWithObsidian('obsidianDoubleVoucher');
  assert.equal(ctx.obsidian,70);assert.equal(ctx.expansionProgress.consumables.obsidianDoubleVoucher,0);
  claims.purchases.reviveTicket=3;ctx.buyUtilityWithObsidian('reviveTicket');assert.equal(ctx.obsidian,70);
});
test('enemy intel uses final spawning stats and restores live context even after a failed lookup',()=>{
  const ctx=vm.createContext({activeRunTier:2,wave:9,ENEMY_TYPES:{basic:{name:'basic'}},clampTier:n=>n,
    getEnemyTypeWeight:()=>1,getEnemyStats:()=>({hp:100,speed:20,physicalDefense:12,magicDefense:6,collisionDamage:8}),
    getV2EnemyInfo:()=>['Basic','Contact'],getBossTypeForWave:()=>null,getActiveEnvironment:()=>({id:'solar'}),auxiliaryTurrets:[],
    towerStats:{curseAura:0.1},clamp:(n,a,b)=>Math.min(b,Math.max(a,n)),uxText:()=>({none:'None'})});
  vm.runInContext(extract(ux,'function getEnemyIntelRows(','const enemyStatsDialog ='),ctx);
  const rows=ctx.getEnemyIntelRows(3,40);
  assert.equal(rows[0].stats.hp,90);assert.equal(rows[0].stats.speed,21.6);assert.equal(rows[0].stats.physicalDefense,12);
  assert.equal(ctx.wave,9);assert.equal(ctx.activeRunTier,2);
  ctx.getEnemyStats=()=>{throw Error('lookup failed')};
  assert.throws(()=>ctx.getEnemyIntelRows(4,50));assert.equal(ctx.wave,9);assert.equal(ctx.activeRunTier,2);
});
test('enemy drawer only renders current battle stats and refreshes on wave changes',()=>{
  let inBattle=false, shown=0;
  const ctx=vm.createContext({document:{body:{classList:{contains:()=>inBattle}}},Date,
    activeRunTier:3,wave:17,battleIntelOpen:true,enemyIntelTier:1,enemyIntelWave:1,enemyIntelRenderedAt:0,enemyIntelRenderKey:"",currentLanguage:"zh",towerStats:{maxHp:10},auxiliaryTurrets:[],
    renderEnemyStatsDialog(){shown++;}});
  vm.runInContext(extract(ux,'function refreshCurrentEnemyStats()','const progressionBaseUpdateBattleIntel'),ctx);
  ctx.refreshCurrentEnemyStats();assert.equal(shown,0);
  inBattle=true;ctx.refreshCurrentEnemyStats();assert.equal(shown,1);assert.equal(ctx.enemyIntelTier,3);assert.equal(ctx.enemyIntelWave,17);
  ctx.wave=18;ctx.refreshCurrentEnemyStats();assert.equal(ctx.enemyIntelWave,18);assert.equal(shown,2);
  ctx.battleIntelOpen=false;ctx.wave=19;ctx.refreshCurrentEnemyStats();assert.equal(shown,2);
  assert.doesNotMatch(ux,/data-intel-next|data-intel-apply|id="enemyIntelWave"/);
});
test('onboarding shield grant fills one recipe without duplicate rewards or changing an owned turret',()=>{
  const ctx=vm.createContext({window:{},V2_TURRET_DEFS:[{id:'emergency_shield'}],v2Progress:{fragments:{emergency_shield:7},assembled:{emergency_shield:0},lifetimeFragments:7},
    getV2FragmentTarget:()=>50,saveV2Progress(){},showTaskToast(){},uxText:()=>({}),trackGameEvent(){}});
  vm.runInContext(extract(ux,'window.grantV2FirstDeploymentFragment =','window.spaceTowerResultAdvice ='),ctx);
  assert.equal(ctx.window.grantV2FirstDeploymentFragment(),true);
  assert.equal(ctx.v2Progress.fragments.emergency_shield,50);
  assert.equal(ctx.v2Progress.lifetimeFragments,50);
  assert.equal(ctx.window.grantV2FirstDeploymentFragment(),false);
  ctx.v2Progress.assembled.emergency_shield=1;ctx.v2Progress.fragments.emergency_shield=0;
  assert.equal(ctx.window.grantV2FirstDeploymentFragment(),false);
  assert.equal(ctx.v2Progress.fragments.emergency_shield,0);
});
test('analytics keeps ecommerce item arrays and scalar values compatible with the native bridge',()=>{
  const source=read('telemetry-system.js');
  const ctx=vm.createContext({document:{documentElement:{dataset:{gameVersion:'2.9.20'}}}});
  vm.runInContext(extract(source,'  function normalizeName(','  const analyticsPlugin ='),ctx);
  const result=ctx.normalizeParams({product_id:'obsidian_120',items:[{item_id:'obsidian_120',quantity:1,price:.99}],value:.99});
  assert.ok(Array.isArray(result.items));assert.equal(result.items[0].quantity,1);assert.equal(result.items[0].item_id,'obsidian_120');assert.equal(result.value,.99);
});
test('enemy table labels and progression copy exist in all six game languages',()=>{
  const ctx=vm.createContext({window:{},currentLanguage:'en'});
  vm.runInContext(ux.slice(0,ux.indexOf('const uxText =')),ctx);
  for(const language of ['zh','en','ja','ko','ru','es']){
    ctx.currentLanguage=language; const copy=ctx.window.spaceTowerUxText();
    assert.equal(copy.columns.length,6);assert.ok(copy.intel && copy.upgrade && copy.utilityDescription);
  }
});
