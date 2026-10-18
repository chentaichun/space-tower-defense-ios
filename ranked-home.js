/* Ranked entry and the read-only turret archive in the existing home screen. */
(() => {
  const N=SpaceTowerRecruit,C=SpaceTowerCatalog;
  const root=document.querySelector('#homeCodexPage .v2-home-panel');
  const entryButton=document.getElementById('rankedOpenButton');
  entryButton.addEventListener('click',()=>{try{sessionStorage.setItem('spaceTowerRankedAudioEntry','1');}catch{}},{capture:true});
  const standing=document.createElement('div');standing.className='ranked-home-standing';standing.id='homeRankedStanding';standing.setAttribute('aria-live','polite');document.getElementById('rankedEntry').prepend(standing);
  let rankedRating=null,rankedToken=null,rankedChecked=0,rankedPending=false;
  function renderStanding(){
    const L=SpaceTowerLocale,known=Number.isFinite(rankedRating),rank=SpaceTowerRanks.describe(rankedRating,currentLanguage);
    standing.style.setProperty('--rank-color',rank.color);standing.style.setProperty('--rank-progress',(known?rank.progress*100:0)+'%');standing.dataset.tier=known?rank.index:0;
    const note=!known?L.text('登入後同步杯數'):rank.next?L.text('距離 {0} 還有 {1} 杯').replace('{0}',rank.nextName).replace('{1}',(rank.next-rank.cups).toLocaleString('en-US')):L.text('最高段位 · 持續突破');
    standing.innerHTML=`${SpaceTowerRanks.badge(rank.index)}<div class="ranked-standing-detail"><div class="rank-name">${known?rank.name:L.text('排位榮耀')}</div><div class="rank-cups"><strong>${known?rank.cups.toLocaleString('en-US'):'—'}</strong><span>${L.text('杯')}</span></div><div class="rank-progress"><i></i></div><small class="rank-next">${note}</small></div>`;
  }
  async function refreshStanding(){
    const token=localStorage.getItem('spaceTowerPlayerSession')||sessionStorage.getItem('spaceTowerPlayerSession');
    if(token!==rankedToken){rankedToken=token;rankedRating=null;rankedChecked=0;}renderStanding();
    if(!token||rankedPending||Date.now()-rankedChecked<30000)return;
    rankedPending=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
    try{const native=!window.SPACE_TOWER_LOCAL_RANKED&&(!!window.Capacitor||location.protocol==='capacitor:'||location.hostname==='localhost');const response=await fetch((native?'https://space-tower-defense.pages.dev':'')+'/api/ranked',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'profile'}),signal:controller.signal});const profile=await response.json();if(!response.ok||!Number.isFinite(profile.rating))throw new Error('PROFILE_UNAVAILABLE');
      if(Number.isFinite(profile.rating)&&token===(localStorage.getItem('spaceTowerPlayerSession')||sessionStorage.getItem('spaceTowerPlayerSession'))){rankedRating=profile.rating;rankedChecked=Date.now();renderStanding();}
    }catch{rankedChecked=Date.now();if(rankedRating===null&&token===rankedToken)standing.querySelector('.rank-next').textContent=SpaceTowerLocale.text('杯數暫時無法同步');}finally{clearTimeout(timeout);rankedPending=false;}
  }
  const zh=()=>currentLanguage==='zh';
  const savedProgress=()=>DEV_MODE?N.read():v2Progress;
  const normalGoal=document.createElement('section');normalGoal.id='normalRecruitGoal';normalGoal.className='normal-recruit-goal';normalGoal.hidden=true;document.querySelector('.home-mission-console').before(normalGoal);
  function refreshRankedEntry(){
    refreshStanding();
    let state;try{state=N.eligibility(savedProgress());}catch{return;}
    document.getElementById('homeCodexTab').textContent=zh()?'圖鑑':'Archive';
    document.querySelector('#rankedEntry > div:not(.ranked-home-standing) small').textContent=zh()?`已擁有 ${state.count} 種砲台 · ${state.ranked?'可開始排位':'集滿五種開放排位'}`:`${state.count} turret types · ${state.ranked?'Ranked ready':'5 types required'}`;
    entryButton.textContent=zh()?(state.ranked?'排位備戰 ↗':state.tutorialClaimed?'查看解鎖進度 ↗':'新手教學 ↗'):(state.ranked?'Ranked prep ↗':'Recruit training ↗');
    normalGoal.hidden=!state.normalRound;
    if(state.normalRound){const d=C.byId.get(N.starterIds[2+state.normalRound]);normalGoal.innerHTML=`${renderTurretPortrait(d)}<div><small>${zh()?'新手出戰計畫':'RECRUIT MISSIONS'} · ${state.normalRound-1}/2</small><b>${zh()?'完成一般模式，領取':'Complete a normal run to earn'}<br>${escapeHtml(d.name)}</b><span>G1 · HP ${C.health(d)}</span></div>`;drawWorkshopTurretPreviews(normalGoal);}
  }
  const style=document.createElement('style');style.textContent=`
  #homeCodexPage .v2-home-panel > [hidden]{display:none!important}.result-screen:not(.hidden)~.dev-panel{display:none!important}
  .archive-switch{display:flex;gap:8px;margin-bottom:16px}.archive-switch button{flex:1;background:#102b40;color:#bcdbe4;border:1px solid #436079;border-radius:10px;padding:12px}.archive-switch button[aria-pressed=true]{color:#d8eac3;border-color:#aac78f;background:#233c3c}
  .home-turret-archive{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.archive-turret{background:linear-gradient(145deg,#132e44,#0a1b2c);border:1px solid #37546c;border-radius:12px;overflow:hidden;padding:10px;color:#d2e6ed}.archive-turret summary{cursor:pointer;display:flex;align-items:center;gap:8px;list-style:none}.archive-turret .turret-portrait{width:62px;height:62px;min-width:62px;margin:0}.archive-turret summary small{display:block;color:#90aeba;font-size:9px;margin-bottom:5px}.archive-turret summary b{font-size:12px}.archive-turret summary strong{display:block;color:#b4dbc2;font-size:11px;margin-top:7px}.archive-turret p{font-size:11px;line-height:1.8;color:#a5bfcb}.archive-base-values{display:grid;gap:6px;font-size:11px;color:#bad3df}.recruit-workshop-link{display:block;margin-top:10px;color:#a8e7cd;font-size:12px}
  .archive-turret summary>span{min-width:0;overflow-wrap:anywhere}
  @media(max-width:600px){.home-turret-archive{grid-template-columns:1fr}.archive-turret .turret-portrait{width:70px;height:70px}}
  .normal-recruit-goal{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;text-align:left;padding:12px 15px;margin:0 0 12px;border:1px solid #9cc3ad55;border-radius:14px;background:radial-gradient(ellipse at 10% 50%,#41636744,transparent 70%),#102737}.normal-recruit-goal[hidden],.recruit-run-reward[hidden]{display:none}.normal-recruit-goal .turret-portrait{width:72px;height:72px;min-width:72px;margin:0}.normal-recruit-goal small{display:block;font-size:10px;letter-spacing:1px;color:#a8c2b2}.normal-recruit-goal b{display:block;color:#e5e8cf;font-size:13px;line-height:1.7;margin:5px 0}.normal-recruit-goal span{font-size:11px;color:#a2ccd6}
  .recruit-run-reward{padding:16px;margin:12px 0 18px;border:1px solid #c3a76c77;border-radius:16px;background:radial-gradient(ellipse at 10% 45%,#6b634640,transparent 75%),linear-gradient(135deg,#173743,#101e31);color:#dae9e5;text-align:left}.recruit-run-reward>small{display:block;color:#d0be93;font-size:10px;letter-spacing:1px}.recruit-run-reward .recruit-award{display:flex;gap:12px;align-items:center;margin:10px 0}.recruit-run-reward .turret-portrait{width:90px;height:90px;min-width:90px;margin:0}.recruit-run-reward b{font-size:18px;color:#eedba9}.recruit-run-reward p{font-size:12px;color:#a7c6cb;line-height:1.6;margin:6px 0}.recruit-run-reward a,.recruit-run-reward button{display:block;margin-top:12px;padding:12px;text-align:center;border:1px solid #b1d2b270;border-radius:9px;background:#22433f;color:#e4f0d6;font:inherit;font-size:13px;text-decoration:none;width:100%;box-sizing:border-box}
  `;document.head.append(style);
  const switcher=document.createElement('div');switcher.className='archive-switch';switcher.innerHTML='<button type="button" data-archive="enemy" aria-pressed="true">戰機圖鑑</button><button type="button" data-archive="turret" aria-pressed="false">砲台圖鑑</button>';root.prepend(switcher);
  const archive=document.createElement('div');archive.className='home-turret-archive';archive.hidden=true;root.append(archive);
  function renderArchive(){
    archive.innerHTML=SpaceTowerCatalog.turrets.map(d=>`<details class="archive-turret"><summary>${renderTurretPortrait(d)}<span><small>${d.vipExclusive?(d.rarity==='legendary'?'VIP 金':'VIP 銀'):'G'+d.strengthGrade} · ${SpaceTowerCatalog.roles[d.healthRole]}</small><b>${escapeHtml(d.name)}</b><strong>${zh()?'排位初始 HP':'Ranked HP'} ${SpaceTowerCatalog.health(d)}</strong></span></summary><p>${escapeHtml(d.description)}</p><div class="archive-base-values"><span>${d.damageType==='magic'?(zh()?'魔攻倍率':'Magic multiplier'):(zh()?'物攻倍率':'Physical multiplier')} × ${d.damage}</span><span>${zh()?'攻速倍率':'Rate multiplier'} × ${d.speed}</span>${d.id==='basic_cannon'?'<span>一般模式：HP 10 · 物攻 10 · 魔攻 0 · 4.17 次 / 秒</span>':''}</div>${d.acquisition?`<p>${escapeHtml(d.acquisition)}</p>`:''}</details>`).join('');drawWorkshopTurretPreviews(archive);
  }
  switcher.addEventListener('click',event=>{const b=event.target.closest('[data-archive]');if(!b)return;const turret=b.dataset.archive==='turret';for(const button of switcher.children)button.setAttribute('aria-pressed',String(button===b));for(const child of root.children)if(child!==switcher&&child!==archive)child.hidden=turret;archive.hidden=!turret;if(turret)renderArchive();});
  const baseSetHomePage=setHomePage;
  setHomePage=function(...args){const result=baseSetHomePage(...args);refreshRankedEntry();return result;};
  const rewardPanel=document.createElement('section');rewardPanel.id='recruitRunReward';rewardPanel.className='recruit-run-reward';rewardPanel.setAttribute('aria-live','polite');rewardPanel.hidden=true;document.getElementById('resultTitle').after(rewardPanel);
  function grantNormalReward(){
    if(!runStats.recruitReceipt)return;
    try{
      const next=JSON.parse(JSON.stringify(savedProgress()));
      const granted=N.finishNormalRun(next,runStats.recruitReceipt);
      if(granted.length){
        next.revision=(Number(next.revision)||0)+1;
        localStorage.setItem(N.KEY,JSON.stringify(next));
        if(!DEV_MODE)v2Progress=next;
        else v2Progress.onboarding=next.onboarding;
        runStats.recruitReward=granted;
        if(!DEV_MODE)try{queueCloudSave({critical:true});}catch{/* Local reward is saved; the existing cloud queue can retry later. */}
      }
      runStats.recruitSaveFailed=false;
    }catch{runStats.recruitSaveFailed=true;}
  }
  function renderNormalReward(){
    rewardPanel.hidden=!runStats.recruitSaveFailed&&!runStats.recruitReward?.length;
    if(rewardPanel.hidden)return;
    if(runStats.recruitSaveFailed){rewardPanel.innerHTML='<p>砲台獎勵尚未儲存。</p><button type="button" id="retryRecruitReward">重試領取</button>';return;}
    const state=N.eligibility(savedProgress());
    rewardPanel.innerHTML=`<small>新手出戰計畫 · 永久獲得</small>${runStats.recruitReward.map(id=>{const d=C.byId.get(id);return `<div class="recruit-award">${renderTurretPortrait(d)}<div><b>${escapeHtml(d.name)}</b><p>G1 · HP ${C.health(d)}</p></div></div>`;}).join('')}<p>${state.normalRound?'一般模式 1/2 完成 · 再完成一場，領薄霜減速砲。':'一般模式 2/2 完成 · 五砲到齊，排位已解鎖。'}</p>${!state.normalRound?`<a href="ranked.html?lang=${currentLanguage}">前往排位備戰 ↗</a>`:''}`;
    drawWorkshopTurretPreviews(rewardPanel);
  }
  rewardPanel.addEventListener('click',event=>{if(event.target.closest('#retryRecruitReward')){grantNormalReward();renderNormalReward();}});
  const baseEndRun=endRun;
  endRun=function(...args){
    if(gameStarted&&running&&activeRunMode==='campaign'&&coreHp<=0){
      runStats.recruitReceipt={id:runStats.recruitRunId,mode:'campaign',reason:'core_destroyed',finished:true,elapsed:(performance.now()-runStats.startedAt)/1000};
      grantNormalReward();
    }
    return baseEndRun(...args);
  };
  const baseShowResultScreen=showResultScreen;
  showResultScreen=function(...args){const result=baseShowResultScreen(...args);renderNormalReward();return result;};
  window.addEventListener('space-tower-language-changed',refreshRankedEntry);
  window.addEventListener('space-tower-cloud-save-applied',refreshRankedEntry);
  refreshRankedEntry();
})();
