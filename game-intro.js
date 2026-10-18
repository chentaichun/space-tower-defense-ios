/* First-entry guide. Lesson progress and its one-time gift share the existing player save. */
(() => {
  'use strict';
  const N=SpaceTowerRecruit,$=id=>document.getElementById(id);
  const crystal='<svg class="intro-crystal" viewBox="0 0 80 100" aria-hidden="true"><path d="M40 3 69 23 75 65 40 97 5 65 11 23Z" fill="#392856" stroke="#c6b1e9" stroke-width="2"/><path d="m40 3 13 28-13 66-13-66Z" fill="#d4b8f5"/><path d="m11 23 16 8 13-28M27 31 5 65l35 32M53 31l22 34-35 32" fill="#72589b"/><path d="m11 23 29 16 29-16M5 65l35-26 35 26" fill="none" stroke="#b69ad8"/></svg>';
  const lessons=[
    {title:'歡迎登艦，指揮官',body:'守住核心、組建砲台陣容，挑戰更遠的星域。完成這段航程，領取你的第一份補給。'},
    {title:'讓第一發更有力',body:'砲台會自動攻擊。點物攻強化，提升傷害；擊破敵機就能取得本局金幣。'},
    {title:'選擇你的下一場戰役',body:'三種模式，各有目標。點選圖示，認識每種玩法。',page:'play',panel:'#tierSelector'},
    {title:'組建你的砲台陣容',body:'在工坊收集碎片與核心、組裝砲台，再裝備出戰。不同砲台有各自的子彈與能力。',action:'#homeWorkshopTab',panel:'#homeWorkshopPage',label:'砲台工坊'},
    {title:'出戰前，先認識裝備與敵人',body:'圖鑑能查看砲台的血量、能力與取得方式，也能認識每種敵機的特性。',action:'#homeCodexTab',panel:'#homeCodexPage',label:'圖鑑'},
    {title:'完成任務，領取補給',body:'這裡有每日、每週任務與星際信箱。達成目標後回來領獎，累積下一場的資源。',action:'#homeTasksTab',panel:'#homeTasksPage',label:'任務'},
    {title:'把絕招留給關鍵時刻',body:'戰鬥中可施放已裝備的絕招。查看效果與冷卻時間，決定何時解圍或集中火力。',action:'#homeUltimateTab',panel:'#homeUltimatePage',label:'絕招'},
    {title:'把成長留到下一場',body:'本局金幣用於戰鬥強化；黑曜石可投入永久強化，提升後續出戰的基礎能力。',action:'#metaOpenButton',panel:'#metaScreen',label:'永久強化'},
    {title:'開啟你的補給站',body:'認識 VIP 訂閱、新手禮包與兩種卡池。完成入門後，兩種卡池各送一次免費十連抽。',action:'#homeStoreTab',panel:'#homeStorePage',label:'商店'},
    {title:'看看自己走了多遠',body:'全球排行記錄玩家的作戰進度。持續突破波數與 Tier，就能挑戰更高的位置。',action:'#homeLeaderboardTab',panel:'#homeLeaderboardPage',label:'全球排行'},
    {title:'從五座砲台，開始你的排位旅程',body:'首次點排位先完成操作教學，領兩座 G1 砲台。再完成兩場一般模式，各領一座；加上初始砲台，就能帶五砲出戰。',page:'play',panel:'.home-ranked-destinations'}
  ];
  const modal=document.createElement('dialog');modal.id='introDialog';modal.className='intro-modal';modal.setAttribute('aria-labelledby','introTitle');document.body.append(modal);
  const guide=document.createElement('div');guide.id='introGuide';guide.className='intro-guide';guide.hidden=true;guide.innerHTML='<div class="intro-focus" id="introFocus"></div><svg class="intro-hand" id="introHand" viewBox="0 0 48 48" aria-hidden="true"><path d="M19 26V8c0-5 7-5 7 0v11c4-5 8-1 8 2 5-2 7 2 7 6v9c0 5-5 8-11 8-9 0-11-5-14-9l-7-9c-3-5 2-8 6-4Z" fill="#d6f6f7" stroke="#39849d" stroke-width="2"/></svg><section class="intro-coach" id="introCoach" role="dialog" aria-modal="true" aria-labelledby="introCoachTitle"><span class="intro-kicker" id="introStepLabel"></span><h2 id="introCoachTitle"></h2><p id="introCoachText"></p><div class="intro-steps" id="introSteps"></div><button class="intro-primary" id="introNext" type="button"></button><p class="intro-save-status" id="introCoachStatus" role="status"></p></section>';document.body.append(guide);
  let active=false,step=0,visited=false,replay=false,drill=null,lastFrame=0,frameId=0,bypass=false,storageFailed=false,shopPage=-1,suspendedBattle=false,previousPaused=false;
  const current=()=>DEV_MODE?N.read():N.reconcile(v2Progress);
  function acceptProgress(next){if(DEV_MODE){v2Progress.onboarding=next.onboarding;}else v2Progress=next;}
  function saveStep(){
    if(replay){step++;return true;}
    try{const next=JSON.parse(JSON.stringify(current()));if(!N.advanceIntro(next,step)){step=next.onboarding.introStep;return true;}next.revision=(Number(next.revision)||0)+1;localStorage.setItem(N.KEY,JSON.stringify(next));acceptProgress(next);step=next.onboarding.introStep;storageFailed=false;if(!DEV_MODE)try{queueCloudSave({critical:true});}catch{}return true;}
    catch{storageFailed=true;const status=modal.open?$('introSaveStatus'):$('introCoachStatus');if(status)status.textContent='尚未儲存，請再試一次。';return false;}
  }
  function applyReceipt(receipt){if(!receipt)return;acceptProgress(receipt.progress);if(!DEV_MODE){obsidian=receipt.balance;economyRevision=receipt.economyRevision;economyDirty=true;}if(receipt.expansion)expansionProgress=normalizeExpansionProgress(receipt.expansion);renderObsidian();renderSupplyPacks();if(!DEV_MODE)try{queueCloudSave({critical:true});}catch{}}
  function claimGift(){return N.claimIntroReward({progress:current(),balance:DEV_MODE?Number(localStorage.getItem(OBSIDIAN_KEY)||0):obsidian,economyRevision:DEV_MODE?Number(localStorage.getItem(ECONOMY_REVISION_KEY)||0):economyRevision,expansion:DEV_MODE?loadExpansionProgress():expansionProgress,owner:getActiveRunOwner()});}
  function primary(text){return `<p class="intro-save-status" id="introSaveStatus" role="status"></p><button class="intro-primary" id="introContinue" type="button">${text}</button>${replay?'<button class="intro-exit" id="introExit" type="button">結束導覽</button>':''}`;}
  function portrait(){const canvas=$('introTurret');if(canvas)drawTurretPreviewCanvas(canvas,SpaceTowerCatalog.byId.get('basic_cannon'),{transparent:true});}
  function advance(){if(!active||step===1&&drill?.kills<3||lessons[step]?.action&&!visited)return;if(step===8&&shopPage<2){shopPage++;renderShopTour();return;}if(saveStep())render();}
  function enter(rewatch=false){
    if(active)return;setSettingsOpen(false);replay=rewatch;active=true;window.SpaceTowerIntroActive=true;document.body.classList.add('intro-active');$('introExitGuide').hidden=!replay;
    suspendedBattle=document.body.classList.contains('in-game');previousPaused=isPaused;if(suspendedBattle){isPaused=true;document.body.classList.remove('in-game');}
    try{applyReceipt(N.recoverIntroReward(localStorage,getActiveRunOwner()));step=rewatch?0:current().onboarding.introStep;}catch{storageFailed=true;step=0;}
    render();frameId=requestAnimationFrame(frame);
  }
  function finish(){
    if(replay){close();return;}
    try{
      const receipt=claimGift();
      applyReceipt(receipt);if(!current().onboarding.introClaimed)throw Error('Incomplete guide');
      close();showTaskToast('遊戲入門完成','2,000 黑曜石 · 兩種卡池各 10 抽');
      if(new URLSearchParams(location.search).get('afterIntro')==='ranked')location.href='ranked.html?lang='+currentLanguage;
    }catch{$('introSaveStatus').textContent='獎勵尚未完成儲存，請重試領取。';}
  }
  function close(){active=false;window.SpaceTowerIntroActive=false;document.body.classList.remove('intro-active');modal.close();guide.hidden=true;cancelAnimationFrame(frameId);closeMetaScreen();setHomePage('play');if(suspendedBattle){document.body.classList.add('in-game');isPaused=previousPaused;$('pauseButton').focus({preventScroll:true});}else $('homePlayTab').focus({preventScroll:true});}
  function render(){
    visited=false;drill=null;shopPage=-1;if(modal.open)modal.close();guide.hidden=true;closeMetaScreen();
    if(step===0){
      modal.innerHTML=`<span class="intro-kicker">FIRST FLIGHT · 遊戲入門</span><div class="intro-hero"><canvas id="introTurret" width="180" height="180" aria-hidden="true"></canvas></div><h2 id="introTitle">${lessons[0].title}</h2><p>${lessons[0].body}</p><div class="intro-gift">${crystal}<span>${replay?'已領取入門獎勵':'完成教學獎勵'}</span><b>2,000</b></div><div class="intro-ticket-strip"><span>✦ 星隕補給艙 <b>10 抽</b></span><span>♛ 皇極星庫 <b>10 抽</b></span></div>${primary('開始航程')}`;modal.showModal();portrait();$('introContinue').addEventListener('click',advance);
    }else if(step===1){
      modal.innerHTML=`<span class="intro-kicker">02 / 11 · 自動戰鬥與強化</span><h2 id="introTitle">${lessons[1].title}</h2><p>${lessons[1].body}</p><canvas class="intro-field" id="introField" width="560" height="300" aria-label="練習戰場：中央砲台自動攻擊三架敵機"></canvas><div class="intro-drill-hud"><span>核心 HP 10 / 10</span><span id="introDrillKills">擊破 0 / 3</span><span id="introDrillGold">金幣 30</span></div><button id="introDrillUpgrade" class="intro-drill-upgrade" type="button"><b>物攻 10 → 12</b><small>11 金幣 · 點擊強化</small></button>${primary('擊破三架敵機後繼續')}`;
      modal.showModal();drill={gold:30,attack:10,kills:0,upgraded:false,time:0,timer:0,shots:[],effects:[],enemies:[{x:75,y:70,hp:12},{x:415,y:85,hp:12},{x:400,y:225,hp:12}]};$('introContinue').disabled=true;
      $('introDrillUpgrade').addEventListener('click',()=>{if(drill.upgraded)return;drill.upgraded=true;drill.gold-=11;drill.attack=12;$('introDrillUpgrade').disabled=true;$('introDrillUpgrade').innerHTML='<b>物攻 12</b><small>已強化 ✓</small>';$('introDrillGold').textContent='金幣 '+drill.gold;});$('introContinue').addEventListener('click',advance);drawDrill(0);
    }else if(step===2){renderModes();
    }else if(step>=N.INTRO_STEPS){
      modal.innerHTML=`<span class="intro-kicker">FLIGHT READY · 入門完成</span><div class="intro-hero">${crystal}</div><h2 id="introTitle">航程準備完成</h2><div class="intro-total">${replay?'已領取':'+2,000'}<small>黑曜石</small></div><div class="intro-ticket-strip"><span>✦ 星隕補給艙 <b>10 抽</b></span><span>♛ 皇極星庫 <b>10 抽</b></span></div><p>抽卡券優先使用。登入後，到商店「星際卡包」開啟十連抽。</p>${primary(replay?'返回大廳':'領取全部入門獎勵')}`;modal.showModal();$('introContinue').addEventListener('click',finish);
    }else{
      const lesson=lessons[step];if(lesson.page)setHomePage(lesson.page);else setHomePage('play');
      guide.hidden=false;$('introStepLabel').textContent=`${String(step+1).padStart(2,'0')} / 11 · 遊戲入門`;$('introCoachTitle').textContent=lesson.title;$('introCoachText').textContent=lesson.body;
      $('introSteps').innerHTML=lessons.map((_,i)=>`<i class="${i<=step?'done':''}"></i>`).join('');$('introCoachStatus').textContent='';$('introNext').disabled=!!lesson.action;$('introNext').textContent=lesson.action?'先點選「'+lesson.label+'」':step===10?'完成教學':'下一站';
      const target=document.querySelector(lesson.action||lesson.panel);target?.scrollIntoView({block:'center',behavior:'instant'});if(lesson.action)target?.focus({preventScroll:true});else $('introNext').focus({preventScroll:true});position();
    }
  }
  function renderModes(){
    const modes=[
      {name:'一般模式',icon:'◎',label:'守住核心，突破波次',text:'選擇作戰 Tier，抵擋一波波敵機。局內用金幣強化，每 25 波選特技卡；突破進度後開放更高 Tier。',reward:'累積黑曜石與砲台成長資源',tone:'campaign'},
      {name:'排位賽',icon:'⚔',label:'五砲配隊，雙方攻防',text:'五種砲台組隊，召喚與融合形成陣容。擊殺敵機會立刻送到對面，先讓對手核心歸零的一方獲勝。',reward:'勝敗影響杯數，並獲得結算獎勵',tone:'ranked'},
      {name:'星核試煉',icon:'⬡',label:'挑戰首領，爭取週榜',text:'專門挑戰首領的關卡。依一般模式 Tier 開放層數，每日 3 次挑戰，通關進度參與每週排名。',reward:'通關獎勵與週榜碎片、補給抽卡',tone:'trial'}
    ];
    const seen=new Set();
    const show=index=>{seen.add(index);const m=modes[index];modal.innerHTML=`<span class="intro-kicker">03 / 11 · 作戰模式</span><h2 id="introTitle">${lessons[2].title}</h2><nav class="intro-mode-tabs" aria-label="認識三種模式">${modes.map((x,i)=>`<button type="button" data-intro-mode="${i}" aria-pressed="${i===index}"><i aria-hidden="true">${x.icon}</i><b>${x.name}</b><small>${seen.has(i)?'已認識':'點選了解'}</small></button>`).join('')}</nav><div class="intro-mode-scene ${m.tone}" aria-hidden="true"><i class="intro-orbit"></i><b>${m.icon}</b><span>◆</span><em>◆</em><small>◆</small></div><h3>${m.label}</h3><p>${m.text}</p><div class="intro-reward-line">${m.reward}</div>${primary(seen.size===3?'已認識三種模式':'再認識其他模式')}`;if(!modal.open)modal.showModal();$('introContinue').disabled=seen.size<3;$('introContinue').addEventListener('click',advance);modal.querySelectorAll('[data-intro-mode]').forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.introMode))));};show(0);
  }
  function renderShopTour(){
    guide.hidden=true;
    let content='';
    if(shopPage===0){
      const price=window.getSpaceTowerVipProduct?.()?.formattedPrice;
      content=`<span class="intro-kicker">09 / 11 · 補給站 1 / 3</span><div class="intro-vip-scene" aria-hidden="true"><span>✧</span><b>♛</b><span>✧</span></div><h2 id="introTitle">星殿通行證</h2><p>按月訂閱，開啟專屬權益。</p><div class="intro-benefits"><span>免廣告體驗</span><span>一般商城 8 折</span><span>VIP 砲台購買資格</span><span>黑曜王座戰場</span></div><strong class="intro-price">${escapeHtml(price?price+' / 月':'價格以 App 商店顯示為準')}</strong><p class="intro-fine">每月自動續訂，可在 App Store 或 Google Play 取消。VIP 砲台需另用黑曜石購買。</p>`;
    }else if(shopPage===1){
      const offer=window.getSpaceTowerStarterOffer();
      content=`<span class="intro-kicker">09 / 11 · 補給站 2 / 3</span><div class="intro-pack-hero"><canvas id="introStarterTurret" width="200" height="200" aria-label="碧焰龍息砲"></canvas><span>G8 · ★1</span></div><h2 id="introTitle">${escapeHtml(offer.title)}</h2><p>新手專屬優惠，快速補足開局資源。</p><div class="intro-benefits"><span>碧焰龍息砲 <b>永久保留</b></span><span>黑曜石 <b>2,400</b></span><span>太空幣 <b>2,000</b></span><span>7 種消耗券 <b>共 20 張</b></span></div><strong class="intro-price">${escapeHtml(offer.formattedPrice||'價格以 App 商店顯示為準')}</strong><p class="intro-fine">每個帳號限購一次 · 自由選購</p>`;
    }else{
      content=`<span class="intro-kicker">09 / 11 · 補給站 3 / 3</span><h2 id="introTitle">第一次十連，送給你</h2><p>兩種卡池各送 10 張抽卡券，完成教學後領取。</p><div class="intro-pool-grid">${Object.values(SPACE_TOWER_GACHA_PACKS).map(pack=>`<article class="intro-pool ${pack.id}"><div class="intro-pool-emblem" aria-hidden="true">${pack.id==='normal'?'✦':'♛'}</div><h3>${escapeHtml(localizedPackName(pack))}</h3><b class="intro-free">免費十連 ×1</b><p>${pack.id==='normal'?'砲台、絕招碎片與貨幣補給':'進階素材、特殊外觀與戰備道具'}</p><small>之後使用${pack.currency==='obsidian'?'黑曜石':'太空幣'}抽取</small><details><summary>查看獎池與機率</summary><div>${pack.rewards.map(item=>`<span>${escapeHtml(localizedRewardLabel(item))}<b>${(item[1]/pack.rewards.reduce((sum,r)=>sum+r[1],0)*100).toFixed(2)}%</b></span>`).join('')}</div></details></article>`).join('')}</div><p class="intro-fine">每 10 抽至少一項稀有以上獎勵；每次十連另得 12 星塵。抽卡券優先使用，正式抽取需登入。</p>`;
    }
    modal.innerHTML=content+primary(shopPage===0?'認識新手禮包':shopPage===1?'認識免費十連抽':'記住補給站，繼續導覽');if(!modal.open)modal.showModal();modal.scrollTop=0;if(shopPage===1)drawTurretPreviewCanvas($('introStarterTurret'),SpaceTowerCatalog.byId.get('emerald_drake'),{transparent:true});$('introContinue').addEventListener('click',advance);$('introContinue').focus({preventScroll:true});
  }
  $('introNext').addEventListener('click',advance);modal.addEventListener('cancel',event=>event.preventDefault());
  modal.addEventListener('click',event=>{if(replay&&event.target.closest('#introExit'))close();});
  function position(){
    if(!active||guide.hidden)return;const lesson=lessons[step],coach=$('introCoach'),target=document.querySelector(visited?lesson.panel:lesson.action||lesson.panel);if(!target)return;
    coach.style.left=Math.max(12,(innerWidth-420)/2)+'px';const r=target.getBoundingClientRect(),ceiling=Math.max(80,innerHeight-coach.offsetHeight-24),top=Math.max(8,Math.min(ceiling-28,r.top)),bottom=Math.max(top+28,Math.min(ceiling,r.bottom));
    Object.assign($('introFocus').style,{left:Math.max(4,r.left-4)+'px',top:top-3+'px',width:Math.min(innerWidth-8,r.width+8)+'px',height:bottom-top+6+'px'});
    $('introHand').toggleAttribute('hidden',visited||!lesson.action);Object.assign($('introHand').style,{left:Math.min(innerWidth-42,Math.max(4,r.left+r.width*.5-12))+'px',top:Math.max(5,r.bottom-3)+'px'});
  }
  document.addEventListener('click',event=>{
    if(!active||bypass||event.target.closest('#introDialog,#introCoach')||document.querySelector('dialog[open]:not(#introDialog)'))return;
    const lesson=lessons[step];if(lesson?.action&&event.target.closest(lesson.action)){
      window.setTimeout(()=>{if(!active)return;visited=true;$('introNext').disabled=false;$('introNext').textContent='下一站';if(step===4){bypass=true;document.querySelector('[data-archive="turret"]')?.click();bypass=false;}document.querySelector(lesson.panel)?.scrollIntoView({block:'start',behavior:'instant'});position();$('introNext').focus({preventScroll:true});},0);return;
    }
    event.preventDefault();event.stopImmediatePropagation();
  },true);
  document.addEventListener('keydown',event=>{
    if(!active||document.querySelector('dialog[open]:not(#introDialog)'))return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(replay)close();}
    if(event.key==='Tab'&&!modal.open){event.preventDefault();const action=lessons[step]?.action;const choices=[action&&!visited?document.querySelector(action):null,$('introNext')].filter(el=>el&&!el.disabled);if(choices.length)choices[(choices.indexOf(document.activeElement)+1)%choices.length].focus();}
  },true);
  function drawDrill(dt){
    if(!drill)return;const d=drill,c=$('introField').getContext('2d'),w=560,h=300;d.time+=dt;c.clearRect(0,0,w,h);
    const bg=c.createRadialGradient(w/2,h/2,10,w/2,h/2,280);bg.addColorStop(0,'#183c4b');bg.addColorStop(1,'#061522');c.fillStyle=bg;c.fillRect(0,0,w,h);
    c.strokeStyle='#5cabb322';c.lineWidth=1;for(const r of [55,100,145]){c.beginPath();c.ellipse(w/2,h/2,r,r*.68,0,0,Math.PI*2);c.stroke();}for(let i=0;i<24;i++){c.fillStyle='#b7dce94d';c.fillRect((i*79+19)%w,(i*53+30)%h,1.5,1.5);}
    if(d.upgraded){d.timer-=dt;if(d.timer<=0&&d.enemies.some(e=>e.hp>0)){const e=d.enemies.find(e=>e.hp>0);d.shots.push({x:w/2,y:h/2,target:e});d.timer=.7;}}
    for(const shot of d.shots){if(shot.done)continue;const e=shot.target,dx=e.x-shot.x,dy=e.y-shot.y,len=Math.hypot(dx,dy);if(len<14){shot.done=true;if(e.hp>0){e.hp-=d.attack;if(e.hp<=0){d.kills++;d.gold+=8;d.effects.push({x:e.x,y:e.y,t:0});}}}else{shot.x+=dx/len*300*dt;shot.y+=dy/len*300*dt;}c.fillStyle='#f5dc9b';c.shadowColor='#f1cf7d';c.shadowBlur=8;c.beginPath();c.arc(shot.x,shot.y,4,0,Math.PI*2);c.fill();c.shadowBlur=0;}
    for(const e of d.enemies){if(e.hp<=0)continue;c.save();c.translate(e.x,e.y+Math.sin(d.time*2+e.x)*3);c.rotate(Math.PI/4);c.fillStyle='#245b89';c.strokeStyle='#88d7ec';c.lineWidth=2;c.shadowColor='#67beec';c.shadowBlur=12;c.fillRect(-11,-11,22,22);c.strokeRect(-11,-11,22,22);c.restore();}
    for(const fx of d.effects){fx.t+=dt;if(fx.t>1)continue;c.strokeStyle=`rgba(161,228,221,${1-fx.t})`;c.beginPath();c.arc(fx.x,fx.y,12+fx.t*30,0,Math.PI*2);c.stroke();c.fillStyle='#e9d79d';c.font='15px system-ui';c.fillText('+8',fx.x-9,fx.y-fx.t*35);}
    const target=d.enemies.find(e=>e.hp>0)||{x:430,y:150};c.save();c.translate(w/2,h/2);c.rotate(Math.atan2(target.y-h/2,target.x-w/2));c.shadowColor='#83cfe1';c.shadowBlur=17;drawRecruitTurret(c,SpaceTowerCatalog.byId.get('basic_cannon'),19);c.restore();
    $('introDrillGold').textContent='金幣 '+d.gold;$('introDrillKills').textContent='擊破 '+d.kills+' / 3';if(d.kills===3){$('introContinue').disabled=false;$('introContinue').textContent='前往大廳';}
  }
  function frame(t){if(!active)return;const dt=lastFrame?Math.min(.05,(t-lastFrame)/1000):0;lastFrame=t;if(!document.hidden){drawDrill(dt);position();}frameId=requestAnimationFrame(frame);}
  window.addEventListener('space-tower-cloud-save-applied',()=>{if(!active&&!current().onboarding.introClaimed)enter();});
  const exitGuide=document.createElement('button');exitGuide.id='introExitGuide';exitGuide.type='button';exitGuide.className='intro-exit';exitGuide.textContent='結束導覽';exitGuide.hidden=true;exitGuide.addEventListener('click',()=>{if(replay)close();});$('introCoach').append(exitGuide);
  const replayButton=document.createElement('button');replayButton.id='introReplayButton';replayButton.type='button';replayButton.className='intro-launch-replay';replayButton.textContent='重看遊戲入門教學';replayButton.addEventListener('click',()=>enter(true));$('settingsFullscreenButton').before(replayButton);
  try{applyReceipt(N.recoverIntroReward(localStorage,getActiveRunOwner()));if(!current().onboarding.introClaimed)enter();else applyReceipt(claimGift());}catch{if(!current().onboarding.introClaimed)enter();}
  const previewSection=['localhost','127.0.0.1','[::1]'].includes(location.hostname)?new URLSearchParams(location.search).get('introPreview'):null;
  if(['welcome','starter','subscription','packs','modes'].includes(previewSection)){
    if(active)close();enter(true);if(previewSection==='welcome')return;step=previewSection==='modes'?2:8;visited=true;
    if(step===2)renderModes();else{shopPage={subscription:0,starter:1,packs:2}[previewSection];renderShopTour();}
  }
})();
