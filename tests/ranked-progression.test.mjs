import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {sanitizeRecord} from '../functions/api/player.js';
const c=vm.createContext({});
for(const f of ['turret-catalog.js','ranked-progression.js','ranked-enemy-catalog.js','ranked-battle-core.js'])vm.runInContext(readFileSync(new URL('../'+f,import.meta.url),'utf8'),c);
const N=c.SpaceTowerRecruit,C=c.SpaceTowerCatalog,R=c.SpaceTowerRanked;
const fresh=()=>N.reconcile({});
const complete=p=>{N.completeTutorial(p);N.claimTutorial(p);return p;};
const result=id=>({id,finished:true,elapsed:45,mode:'campaign',reason:'core_destroyed'});
test('fresh and legacy players always own the original cannon, but copies do not satisfy five types',()=>{
  const p=fresh();assert.equal(N.eligibility(p).count,1);assert.equal(N.eligibility(p).ranked,false);
  p.assembled.basic_cannon=99;assert.equal(N.eligibility(p).count,1);
  for(const id of ['gatling','time_slow','shield_generator','heavy_cannon']){p.assembled[id]=1;p.stars[id]=1;}
  assert.equal(N.eligibility(p).ranked,true);assert.equal(N.validLoadout(p,['basic_cannon','gatling','time_slow','shield_generator','heavy_cannon']),false);
  complete(p);assert.equal(N.validLoadout(p,['basic_cannon','gatling','time_slow','shield_generator','heavy_cannon']),true);
  assert.equal(N.validLoadout(p,['basic_cannon','basic_cannon','time_slow','shield_generator','heavy_cannon']),false);
});
test('tutorial completion grants exactly two permanent G1 turrets and grants neither on skip nor replay',()=>{
  const p=fresh();assert.equal(N.claimTutorial(p).length,0);complete(p);assert.equal(N.eligibility(p).count,3);
  assert.equal(N.claimTutorial(p).length,0);assert.equal(p.assembled.rookie_rapid,1);assert.equal(p.stars.rookie_spark,1);
  assert.equal(N.eligibility(p).ranked,false);assert.equal(N.validLoadout(p,N.starterIds),false);assert.equal(N.validLoadout(p,N.starterIds,{training:true}),false);
  assert.equal(N.validLoadout(p,['basic_cannon','rookie_rapid','rookie_spark','rookie_guard','vip_star_phoenix'],{training:true}),false);
});
test('two completed normal runs unlock one turret each; duplicate settlements and revives count once',()=>{
  const p=complete(fresh());assert.equal(N.finishNormalRun(p,{...result('abort'),finished:false}).length,0);
  assert.equal(N.finishNormalRun(p,result('first'))[0],'rookie_guard');assert.equal(N.eligibility(p).count,4);
  assert.equal(N.finishNormalRun(p,result('first')).length,0);assert.equal(N.eligibility(p).count,4);
  assert.equal(N.finishNormalRun(p,result('second'))[0],'rookie_chill');assert.equal(N.eligibility(p).count,5);
  assert.equal(N.eligibility(p).ranked,true);assert.equal(N.eligibility(p).normalRound,0);assert.equal(N.validLoadout(p,N.starterIds),true);
  assert.equal(N.finishNormalRun(p,result('third')).length,0);assert.equal(p.assembled.rookie_chill,1);
});
test('unfinished, malformed and pre-tutorial matches cannot grant rewards',()=>{
  const p=fresh();assert.equal(N.finishNormalRun(p,result('early')).length,0);complete(p);
  for(const r of [{},result(''),result('bad!'),{...result('zero'),elapsed:0},{...result('nan'),elapsed:NaN},{...result('trial'),mode:'trial'},{...result('ranked'),mode:'ranked'},{...result('quit'),reason:'quit'}])assert.equal(N.finishNormalRun(p,r).length,0);
  assert.equal(N.eligibility(p).count,3);
});
test('a fresh commit preserves unrelated inventory and a failed storage write cannot claim a reward',()=>{
  let saved=JSON.stringify({revision:8,fragments:{gatling:23},assembled:{gatling:2},stars:{gatling:3}});
  const storage={getItem:()=>saved,setItem:(_key,value)=>saved=value};
  N.commit(complete,storage);const p=N.read(storage);assert.equal(p.fragments.gatling,23);assert.equal(p.assembled.gatling,2);assert.equal(p.stars.gatling,3);assert.equal(p.revision,9);
  N.commit(p=>N.claimTutorial(p),storage);assert.equal(N.read(storage).assembled.rookie_rapid,1);
  const before=saved;assert.throws(()=>N.commit(p=>N.finishNormalRun(p,result('failed')),{getItem:()=>saved,setItem:()=>{throw Error('quota');}}));assert.equal(saved,before);
});
test('cloud normalization preserves bounded reward receipts and restored inventory does not duplicate grants',()=>{
  const p=complete(fresh());N.finishNormalRun(p,result('first'));
  const restored=sanitizeRecord({v2Progress:p}).v2Progress;assert.equal(restored.onboarding.tutorialClaimed,true);assert.deepEqual(restored.onboarding.normalMatches,['first']);
  N.reconcile(restored);assert.equal(N.eligibility(restored).count,4);assert.equal(N.claimTutorial(restored).length,0);assert.equal(N.finishNormalRun(restored,result('first')).length,0);
  const malformed=sanitizeRecord({v2Progress:{onboarding:{tutorialComplete:false,tutorialClaimed:true,normalMatches:['a','b','c']}}}).v2Progress;
  assert.equal(malformed.onboarding.tutorialClaimed,false);assert.equal(malformed.onboarding.normalMatches.length,0);
});

test('ranked selection survives save, reload, tutorial replay and cloud normalization',()=>{
  const p=complete(fresh()),ids=['gatling','shield_generator','time_slow','heavy_cannon','basic_cannon'];
  for(const id of ids){p.assembled[id]=1;p.stars[id]=1;}
  let saved=JSON.stringify(p);const storage={getItem:()=>saved,setItem:(_key,value)=>saved=value};
  assert.equal(N.commit(p=>N.setRankedLoadout(p,ids),storage).result,true);
  assert.deepEqual([...N.selectedLoadout(N.read(storage))],ids);
  N.commit(p=>{N.completeTutorial(p);N.claimTutorial(p);},storage);
  assert.deepEqual([...N.selectedLoadout(N.read(storage))],ids);
  const cloud=sanitizeRecord({v2Progress:N.read(storage)}).v2Progress;
  assert.deepEqual(cloud.rankedLoadout,ids);assert.deepEqual([...N.selectedLoadout(cloud)],ids);
  assert.equal(N.setRankedLoadout(p,['basic_cannon','basic_cannon','missing','missing','missing']),false);
  delete cloud.assembled.gatling;
  const repaired=[...N.selectedLoadout(cloud)];assert.equal(repaired.includes('gatling'),false);assert.equal(new Set(repaired).size,5);
  assert.deepEqual([...N.selectedLoadout(fresh())],['basic_cannon',null,null,null,null]);
});
test('the four recruit turrets are G1 and stay below established high-tier damage and durability',()=>{
  for(const id of N.starterIds.slice(1)){const d=C.byId.get(id);assert.equal(d.strengthGrade,1);assert.equal(d.vipExclusive,undefined);assert.ok(d.damage*d.speed<C.byId.get('gatling').damage*C.byId.get('gatling').speed);}
  assert.equal(C.loadoutHealth(N.starterIds),510);assert.ok(C.health('rookie_guard')<C.health('shield_generator'));assert.ok(C.byId.get('rookie_chill').frost<C.byId.get('frost_core').frost);
});
test('tutorial seed guarantees two matching summons while fusion still uses the normal random rule',()=>{
  const m=R.create({loadout:N.starterIds,seed:9}),a=R.summon(m,0),b=R.summon(m,0);
  assert.equal(a.id,'basic_cannon');assert.equal(b.id,a.id);const merged=R.merge(m,0,a.slot,b.slot);assert.equal(merged.ok,true);assert.equal(merged.star,2);assert.equal(merged.id,'rookie_rapid');
});

function homeHarness(){
  const nodes=new Map();
  const node=()=>({children:[],events:{},style:{setProperty(){}},dataset:{},set id(value){this._id=value;nodes.set(value,this);},get id(){return this._id;},setAttribute(){},addEventListener(type,fn){this.events[type]=fn;},before(){},after(){},append(){},prepend(){}});
  const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);};
  let saved='',failStorage=false;
  const context=vm.createContext({DEV_MODE:false,currentLanguage:'zh',performance:{now:()=>45000},gameStarted:true,running:true,activeRunMode:'campaign',coreHp:0,
    document:{querySelector:get,getElementById:get,createElement:node,head:node()},window:{addEventListener(){}},
    renderTurretPortrait:()=>'',drawWorkshopTurretPreviews(){},escapeHtml:String,setHomePage(){},showResultScreen(){},queueCloudSave(){},
    SpaceTowerLocale:{text:value=>value},sessionStorage:{getItem:()=>null},
    localStorage:{getItem:key=>key===N.KEY?saved:null,setItem:(_key,value)=>{if(failStorage)throw Error('quota');saved=value;}}
  });
  for(const file of ['turret-catalog.js','ranked-progression.js','ranked-ranks.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),context);
  context.v2Progress=context.SpaceTowerRecruit.reconcile({});context.SpaceTowerRecruit.completeTutorial(context.v2Progress);context.SpaceTowerRecruit.claimTutorial(context.v2Progress);
  context.runStats={recruitRunId:'run-1',startedAt:0};
  context.endRun=()=>{if(!context.running)return;context.running=false;context.showResultScreen();};
  vm.runInContext(readFileSync(new URL('../ranked-home.js',import.meta.url),'utf8'),context);
  return {context,get,fail:()=>failStorage=true,recover:()=>failStorage=false,saved:()=>saved};
}
test('normal result integration grants once across revival and unlocks ranked after the second run',()=>{
  const {context:h}=homeHarness();h.endRun();assert.equal(h.v2Progress.onboarding.normalMatches.length,1);assert.equal(h.v2Progress.assembled.rookie_guard,1);
  h.running=true;h.endRun();assert.equal(h.v2Progress.onboarding.normalMatches.length,1);
  h.running=true;h.runStats={recruitRunId:'run-2',startedAt:0};h.endRun();assert.equal(h.SpaceTowerRecruit.eligibility(h.v2Progress).ranked,true);assert.equal(h.v2Progress.assembled.rookie_chill,1);
});
test('normal result integration excludes trials, manual exits and startup resets',()=>{
  for(const override of [{activeRunMode:'trial'},{coreHp:4},{gameStarted:false},{running:false}]){const {context:h}=homeHarness();Object.assign(h,override);h.endRun();assert.equal(h.v2Progress.onboarding.normalMatches.length,0);}
});
test('failed normal reward writes leave inventory untouched and the settlement retry commits only once',()=>{
  const t=homeHarness(),h=t.context;t.fail();h.endRun();assert.equal(h.runStats.recruitSaveFailed,true);assert.equal(h.v2Progress.assembled.rookie_guard,undefined);assert.equal(h.v2Progress.onboarding.normalMatches.length,0);
  t.recover();const retry=()=>t.get('recruitRunReward').events.click({target:{closest:()=>true}});retry();retry();assert.equal(h.runStats.recruitSaveFailed,false);assert.equal(h.v2Progress.assembled.rookie_guard,1);assert.equal(JSON.parse(t.saved()).onboarding.normalMatches.length,1);
});
test('retired ranked practice receipts do not count as normal mode completions',()=>{
  const p=complete(fresh());p.onboarding.matches=['training-old-1','training-old-2'];N.reconcile(p);assert.equal(N.eligibility(p).normalRound,1);assert.equal(N.eligibility(p).ranked,false);
});

const introStorage=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};};
const completeIntro=p=>{for(let step=0;step<N.INTRO_STEPS;step++)assert.equal(N.advanceIntro(p,step),true);return p;};
test('the mandatory game guide resumes in order and cannot grant its gift early',()=>{
  const p=fresh(),storage=introStorage();assert.equal(N.advanceIntro(p,4),false);assert.equal(p.onboarding.introStep,0);
  assert.equal(N.claimIntroReward({progress:p,balance:20,economyRevision:3},storage),null);
  N.advanceIntro(p,0);storage.setItem(N.KEY,JSON.stringify(p));const resumed=N.read(storage);assert.equal(resumed.onboarding.introStep,1);assert.equal(N.advanceIntro(resumed,0),false);
  assert.equal(N.eligibility(resumed).introClaimed,false);assert.equal(N.eligibility(resumed).tutorialClaimed,false);
});
test('the 2000 obsidian reward is independent from ranked rewards and stale repeat requests grant nothing',()=>{
  const p=completeIntro(fresh()),storage=introStorage();const receipt=N.claimIntroReward({progress:p,balance:125,economyRevision:3},storage);
  assert.equal(receipt.amount,2000);assert.equal(receipt.balance,2125);assert.equal(receipt.economyRevision,4);assert.equal(N.read(storage).onboarding.introClaimed,true);assert.equal(N.read(storage).onboarding.tutorialClaimed,false);
  assert.equal(N.claimIntroReward({progress:p,balance:125,economyRevision:3},storage),null);assert.equal(Number(storage.getItem('spaceTowerObsidian')),2125);
  const restored=sanitizeRecord({v2Progress:receipt.progress}).v2Progress;assert.equal(restored.onboarding.introClaimed,true);assert.equal(restored.onboarding.introStep,N.INTRO_STEPS);
});
test('interrupted gift writes recover the exact balance and receipt without losing or doubling the reward',()=>{
  for(let failAt=1;failAt<=7;failAt++){
    const storage=introStorage(),p=completeIntro(fresh());storage.setItem(N.KEY,JSON.stringify(p));let writes=0;
    const broken={getItem:storage.getItem,setItem:(k,v)=>{if(++writes===failAt)throw Error('quota');storage.setItem(k,v);},removeItem:k=>{if(++writes===failAt)throw Error('quota');storage.removeItem(k);}};
    assert.throws(()=>N.claimIntroReward({progress:p,balance:7,economyRevision:2},broken));
    N.claimIntroReward({progress:p,balance:7,economyRevision:2},storage);assert.equal(Number(storage.getItem('spaceTowerObsidian')),2007);assert.equal(N.read(storage).onboarding.introClaimed,true);
    assert.deepEqual(JSON.parse(storage.getItem('spaceTowerExpansionV1')).packVouchers,{normal:10,supreme:10});
    assert.equal(N.recoverIntroReward(storage),null);assert.equal(N.claimIntroReward({progress:p,balance:7,economyRevision:2},storage),null);
  }
});
test('intro grants both ten-pull vouchers once and adds them to existing balances',()=>{
  const storage=introStorage(),p=completeIntro(fresh());storage.setItem('spaceTowerExpansionV1',JSON.stringify({revision:3,packVouchers:{normal:7,supreme:2},consumables:{reviveTicket:4}}));
  const receipt=N.claimIntroReward({progress:p,balance:25,economyRevision:0},storage);
  assert.equal(receipt.expansion.packVouchers.normal,17);assert.equal(receipt.expansion.packVouchers.supreme,12);assert.equal(receipt.expansion.consumables.reviveTicket,4);assert.equal(receipt.expansion.introVouchersGranted,true);
  assert.equal(N.claimIntroReward({progress:p,balance:25,economyRevision:0},storage),null);
});
test('existing intro completions receive missing vouchers without granting obsidian again',()=>{
  const storage=introStorage(),p=completeIntro(fresh());p.onboarding.introClaimed=true;storage.setItem(N.KEY,JSON.stringify(p));
  const receipt=N.claimIntroReward({progress:p,balance:2450,economyRevision:7},storage);
  assert.equal(receipt.amount,0);assert.equal(receipt.balance,2450);assert.equal(receipt.economyRevision,7);assert.equal(receipt.expansion.packVouchers.normal,10);
  assert.equal(N.claimIntroReward({progress:p,balance:2450,economyRevision:7},storage),null);
});
