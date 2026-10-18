/* Shared, local progression for the guided introduction. Currency/rating stay in the ranked simulator. */
(() => {
  'use strict';
  const KEY='spaceTowerV2Progress';
  const INTRO_STEPS=11,INTRO_REWARD=2000,INTRO_PENDING='spaceTowerIntroRewardPendingV1';
  const starterIds=Object.freeze(['basic_cannon','rookie_rapid','rookie_spark','rookie_guard','rookie_chill']);
  const count=v=>Math.max(0,Math.floor(Number(v)||0));
  function normalize(raw={}) {
    const introStep=Math.min(INTRO_STEPS,count(raw?.introStep));
    const introComplete=introStep===INTRO_STEPS&&raw?.introComplete===true;
    const introClaimed=introComplete&&raw?.introClaimed===true;
    const tutorialComplete=raw?.tutorialComplete===true;
    const tutorialClaimed=tutorialComplete&&raw?.tutorialClaimed===true;
    const normalMatches=tutorialClaimed&&Array.isArray(raw.normalMatches)?[...new Set(raw.normalMatches.filter(id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(id)))].slice(0,2):[];
    return {introStep,introComplete,introClaimed,tutorialComplete,tutorialClaimed,normalMatches};
  }
  function ensureOwned(progress,ids) {
    for(const bucket of ['stars','assembled','active','fragments','cores'])if(!progress[bucket]||typeof progress[bucket]!=='object')progress[bucket]={};
    for(const id of ids){progress.stars[id]=Math.max(1,count(progress.stars[id]));progress.assembled[id]=Math.max(1,count(progress.assembled[id]));}
    return progress;
  }
  function reconcile(progress) {
    progress.onboarding=normalize(progress.onboarding);
    const n=progress.onboarding,ids=['basic_cannon'];
    if(n.tutorialClaimed)ids.push(...starterIds.slice(1,3));
    if(n.normalMatches.length>0)ids.push('rookie_guard');
    if(n.normalMatches.length>1)ids.push('rookie_chill');
    return ensureOwned(progress,ids);
  }
  function ownedIds(progress) {
    return SpaceTowerCatalog.turrets.filter(d=>d.id==='basic_cannon'||count(progress?.assembled?.[d.id])>0&&(progress?.stars?.[d.id]===undefined||count(progress.stars[d.id])>0)).map(d=>d.id);
  }
  function eligibility(progress) {
    const owned=ownedIds(progress),n=normalize(progress?.onboarding);
    return {owned,count:owned.length,ranked:owned.length>=5,introClaimed:n.introClaimed,tutorialClaimed:n.tutorialClaimed,normalRound:n.tutorialClaimed&&n.normalMatches.length<2?n.normalMatches.length+1:0};
  }
  function validLoadout(progress,ids) {
    const e=eligibility(progress),available=new Set(e.owned);
    return e.ranked&&e.tutorialClaimed&&Array.isArray(ids)&&ids.length===5&&new Set(ids).size===5&&ids.every(id=>available.has(id));
  }
  function selectedLoadout(progress) {
    const available=ownedIds(progress),selected=[];
    for(const id of [...(Array.isArray(progress?.rankedLoadout)?progress.rankedLoadout:[]),...available]){
      if(available.includes(id)&&!selected.includes(id))selected.push(id);
      if(selected.length===5)break;
    }
    return Array.from({length:5},(_,i)=>selected[i]||null);
  }
  function setRankedLoadout(progress,ids) {
    if(!validLoadout(progress,ids))return false;
    progress.rankedLoadout=[...ids];return true;
  }
  function completeTutorial(progress) {reconcile(progress);progress.onboarding.tutorialComplete=true;return progress;}
  function advanceIntro(progress,step){
    reconcile(progress);const n=progress.onboarding;
    if(n.introClaimed||step!==n.introStep||step>=INTRO_STEPS)return false;
    n.introStep++;n.introComplete=n.introStep===INTRO_STEPS;return true;
  }
  // A recoverable receipt keeps the reward and completion flag together across interrupted writes.
  function recoverIntroReward(storage=globalThis.localStorage,owner='guest'){
    const raw=storage.getItem(INTRO_PENDING);if(!raw)return null;
    const receipt=JSON.parse(raw);if(receipt.owner!==owner)throw new Error('Pending reward belongs to another player');
    if(![0,INTRO_REWARD].includes(receipt.amount)||!Number.isFinite(receipt.balance)||!Number.isFinite(receipt.economyRevision)||!normalize(receipt.progress?.onboarding).introClaimed)throw new Error('Invalid reward receipt');
    storage.setItem('spaceTowerObsidian',String(receipt.balance));
    storage.setItem('spaceTowerEconomyRevision',String(receipt.economyRevision));
    storage.setItem('spaceTowerEconomyDirty','1');
    if(receipt.expansion)storage.setItem('spaceTowerExpansionV1',JSON.stringify(receipt.expansion));
    storage.setItem(KEY,JSON.stringify(receipt.progress));
    storage.removeItem(INTRO_PENDING);return receipt;
  }
  function claimIntroReward({progress,balance,economyRevision,expansion,owner='guest'},storage=globalThis.localStorage){
    const pending=recoverIntroReward(storage,owner);if(pending)return pending;
    const saved=read(storage),alreadyClaimed=saved.onboarding.introClaimed;
    const next=reconcile(JSON.parse(JSON.stringify(alreadyClaimed?saved:progress))),n=next.onboarding;
    if(!n.introComplete)return null;
    const storedExpansion=JSON.parse(storage.getItem('spaceTowerExpansionV1')||'{}');
    const extra=JSON.parse(JSON.stringify(expansion||storedExpansion));
    if(alreadyClaimed&&(storedExpansion.introVouchersGranted===true||extra.introVouchersGranted===true))return null;
    const amount=alreadyClaimed||n.introClaimed?0:INTRO_REWARD;
    const addVouchers=storedExpansion.introVouchersGranted!==true&&extra.introVouchersGranted!==true;
    if(addVouchers){extra.packVouchers={...extra.packVouchers,normal:count(extra.packVouchers?.normal)+10,supreme:count(extra.packVouchers?.supreme)+10};extra.introVouchersGranted=true;extra.revision=count(extra.revision)+1;}
    n.introClaimed=true;next.revision=count(next.revision)+1;
    const receipt={owner,amount,balance:count(balance)+amount,economyRevision:count(economyRevision)+(amount?1:0),progress:next,expansion:extra,voucherPulls:addVouchers?10:0};
    storage.setItem(INTRO_PENDING,JSON.stringify(receipt));return recoverIntroReward(storage,owner);
  }
  function claimTutorial(progress) {
    reconcile(progress);const n=progress.onboarding;
    if(!n.tutorialComplete||n.tutorialClaimed)return [];
    n.tutorialClaimed=true;ensureOwned(progress,starterIds.slice(1,3));return starterIds.slice(1,3);
  }
  function finishNormalRun(progress,result) {
    reconcile(progress);const n=progress.onboarding;
    if(!n.tutorialClaimed||n.normalMatches.length>=2||!result||result.mode!=='campaign'||result.reason!=='core_destroyed'||result.finished!==true||!Number.isFinite(result.elapsed)||result.elapsed<=0||typeof result.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(result.id)||n.normalMatches.includes(result.id))return [];
    const id=starterIds[3+n.normalMatches.length];n.normalMatches.push(result.id);ensureOwned(progress,[id]);return [id];
  }
  function read(storage=globalThis.localStorage) {
    const raw=JSON.parse(storage.getItem(KEY)||'{}');
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Invalid player save');
    return reconcile(raw);
  }
  function commit(change,storage=globalThis.localStorage) {
    const progress=read(storage),result=change(progress);
    progress.revision=count(progress.revision)+1;storage.setItem(KEY,JSON.stringify(progress));return {progress,result};
  }
  globalThis.SpaceTowerRecruit=Object.freeze({KEY,INTRO_STEPS,INTRO_REWARD,starterIds,normalize,reconcile,ownedIds,eligibility,validLoadout,selectedLoadout,setRankedLoadout,advanceIntro,claimIntroReward,recoverIntroReward,completeTutorial,claimTutorial,finishNormalRun,read,commit});
})();
