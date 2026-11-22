/* First-entry guide. Lesson progress and its one-time gift share the existing player save. */
(() => {
  'use strict';
  const N=SpaceTowerRecruit,$=id=>document.getElementById(id);
  const crystal='<svg class="intro-crystal" viewBox="0 0 80 100" aria-hidden="true"><path d="M40 3 69 23 75 65 40 97 5 65 11 23Z" fill="#392856" stroke="#c6b1e9" stroke-width="2"/><path d="m40 3 13 28-13 66-13-66Z" fill="#d4b8f5"/><path d="m11 23 16 8 13-28M27 31 5 65l35 32M53 31l22 34-35 32" fill="#72589b"/><path d="m11 23 29 16 29-16M5 65l35-26 35 26" fill="none" stroke="#b69ad8"/></svg>';
  const lessons=[
    {title:'歡迎登艦，指揮官',body:'守住核心，打得越遠越強。'},
    {title:'親手開火',body:'先強化，再點大傢伙發射轟炸！'},
    {title:'三種戰場',body:'點選圖示，看看每種玩法。',page:'play',panel:'#tierSelector'},
    {title:'組好你的陣容',body:'收集、組裝、裝備出戰。',action:'#homeWorkshopTab',panel:'#homeWorkshopPage',label:'砲台工坊'},
    {title:'認識砲台與敵機',body:'能力、血量、取得方式都在這。',action:'#homeCodexTab',panel:'#homeCodexPage',label:'圖鑑'},
    {title:'任務領補給',body:'完成目標，回來領獎。',action:'#homeTasksTab',panel:'#homeTasksPage',label:'任務'},
    {title:'關鍵時刻放絕招',body:'一招逆轉戰局。',action:'#homeUltimateTab',panel:'#homeUltimatePage',label:'絕招'},
    {title:'永久變強',body:'黑曜石投入永久強化。',action:'#metaOpenButton',panel:'#metaScreen',label:'強化'},
    {title:'補給站',body:'禮包、月卡、卡池都在這。',action:'#homeStoreTab',panel:'#homeStorePage',label:'商店'},
    {title:'爬上排行',body:'突破波數，挑戰全球。',action:'#homeLeaderboardTab',panel:'#homeLeaderboardPage',label:'全球排行'},
    {title:'排位對決',body:'集滿五砲出戰：擊破送給對手，存滿反擊反打！',page:'play',panel:'.home-ranked-destinations'}
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
  function advance(){if(!active){if(modal.open)modal.close();guide.hidden=true;document.body.classList.remove('intro-active');return;}if(step===1&&drill?.kills<9||lessons[step]?.action&&!visited)return;if(step===8&&shopPage<3){shopPage++;renderShopTour();return;}if(saveStep())render();}
  function enter(rewatch=false){
    if(active||window.SpaceTowerStarterGateActive&&!rewatch)return;window.SpaceTowerStarterGateActive=false;window.SpaceTowerIntroActive=true;document.querySelectorAll('#starterPackDialog[open],#valuePackDialog[open],#monthlyPassDialog[open],#newTurretDialog[open]').forEach(d=>d.close());setSettingsOpen(false);replay=rewatch;active=true;window.SpaceTowerIntroActive=true;document.body.classList.add('intro-active');$('introExitGuide').hidden=!replay;
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
      modal.innerHTML=`<span class="intro-kicker">FIRST FLIGHT · 遊戲入門</span><div class="intro-cine-wrap"><canvas class="intro-cine" id="introCine" width="560" height="340" aria-label="開場戰鬥"></canvas><button type="button" class="intro-skip" id="introSkip">跳過 ›</button></div><div class="intro-welcome" id="introWelcome"><h2 id="introTitle">${lessons[0].title}</h2><p>${lessons[0].body}</p><div class="intro-gift">${crystal}<span>${replay?'已領取入門獎勵':'完成教學獎勵'}</span><b>2,000</b></div><div class="intro-ticket-strip"><span>✦ 星隕補給艙 <b>10 抽</b></span><span>♛ 皇極星庫 <b>10 抽</b></span></div>${primary('開始航程')}</div>`;modal.showModal();$('introContinue').addEventListener('click',advance);playOpening();
    }else if(step===1){
      modal.innerHTML=`<span class="intro-kicker">02 / 11 · 試用傳說砲台</span><span class="intro-trial-tag">試用中：千刃劍匣 · 傳說六砲包限定</span><h2 id="introTitle">${lessons[1].title}</h2><p>${lessons[1].body}</p><canvas class="intro-field" id="introField" width="560" height="300" aria-label="練習戰場：中央砲台自動攻擊三架敵機"></canvas><div class="intro-drill-hud"><span>核心 HP 10 / 10</span><span id="introDrillKills">擊破 0 / 9</span><span id="introDrillGold">金幣 30</span></div><button id="introDrillUpgrade" class="intro-drill-upgrade" type="button"><b>強化：啟動千刃劍匣</b><small>11 金幣 · 點我</small></button>${primary('擊破全部敵機後繼續')}`;
      modal.showModal();drill={gold:30,attack:10,kills:0,upgraded:false,time:0,timer:0,shots:[],effects:[],enemies:[...Array.from({length:8},(_,i)=>{const a=i*Math.PI/4+.3;return {x:280+Math.cos(a)*200,y:150+Math.sin(a)*115,hp:12,max:12};}),{x:440,y:70,hp:400,max:400,big:true}],beams:[],swords:[],shards:[],texts:[]};
      // Tap the field to call an orbital strike: the tough third target needs it.
      $('introField').addEventListener('pointerdown',event=>{if(!drill||!drill.upgraded)return;const r=event.currentTarget.getBoundingClientRect(),x=(event.clientX-r.left)*560/r.width,y=(event.clientY-r.top)*300/r.height;drill.beams.push({x,y,t:0});for(const e of drill.enemies)if(e.hp>0&&Math.hypot(e.x-x,e.y-y)<60){e.hp-=500;if(e.hp<=0){drill.kills++;drill.gold+=8;drill.effects.push({x:e.x,y:e.y,t:0});}}});$('introContinue').disabled=true;
      $('introDrillUpgrade').addEventListener('click',()=>{if(drill.upgraded)return;drill.upgraded=true;drill.gold-=11;drill.attack=12;$('introDrillUpgrade').disabled=true;$('introDrillUpgrade').innerHTML='<b>千刃劍匣 已啟動</b><small>蓄力中…</small>';$('introDrillGold').textContent='金幣 '+drill.gold;});$('introContinue').addEventListener('click',advance);drawDrill(0);
    }else if(step===2){renderModes();
    }else if(step>=N.INTRO_STEPS){
      modal.innerHTML=`<span class="intro-kicker">FLIGHT READY · 入門完成</span><div class="intro-hero">${crystal}</div><h2 id="introTitle">航程準備完成</h2><div class="intro-total">${replay?'已領取':'+2,000'}<small>黑曜石</small></div><div class="intro-ticket-strip"><span>✦ 星隕補給艙 <b>10 抽</b></span><span>♛ 皇極星庫 <b>10 抽</b></span></div><p>抽卡券優先使用。登入後，到商店「星際卡包」開啟十連抽。</p>${primary(replay?'返回大廳':'領取全部入門獎勵')}`;modal.showModal();$('introContinue').addEventListener('click',finish);
    }else{
      const lesson=lessons[step];if(lesson.page)setHomePage(lesson.page);else setHomePage('play');
      guide.hidden=false;$('introStepLabel').textContent=`${String(step+1).padStart(2,'0')} / 11 · 遊戲入門`;$('introCoachTitle').textContent=lesson.title;$('introCoachText').textContent=lesson.body;
      $('introSteps').innerHTML=lessons.map((_,i)=>`<i class="${i<=step?'done':''}"></i>`).join('');$('introCoachStatus').textContent='';$('introNext').disabled=!!lesson.action;const actionEl=lesson.action&&document.querySelector(lesson.action),actionName=actionEl?[...actionEl.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()||lesson.label:lesson.label;$('introNext').textContent=lesson.action?(actionEl?.classList.contains('home-secondary-tab')?'先點選「更多」→「'+actionName+'」':'先點選「'+actionName+'」'):step===10?'完成教學':'下一站';
      const target=lesson.action?actionTarget(lesson):document.querySelector(lesson.panel);target?.scrollIntoView({block:'center',behavior:'instant'});if(lesson.action)target?.focus({preventScroll:true});else $('introNext').focus({preventScroll:true});position();
    }
  }

  // A: an eight-second showcase battle (swarm, crits, shatter, WARNING, boss, fatal crit, BOSS DOWN).
  function playOpening(){
    const canvas=$('introCine'),welcome=$('introWelcome');if(!canvas)return;
    const c=canvas.getContext('2d'),W=560,H=340,cx=W/2,cy=H/2+10,TAU=Math.PI*2,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t=0,last=0,done=false,shake=0,flash=0,flashColor='#fff';
    const enemies=[],shots=[],texts=[],shards=[],coins=[];let boss=null,spawned=0,fire=0,angle=0;
    const finish=()=>{if(done)return;done=true;welcome.classList.add('show');$('introSkip')?.remove();$('introContinue')?.focus({preventScroll:true});};
    $('introSkip').addEventListener('click',()=>{t=Math.max(t,7.6);finish();});canvas.addEventListener('pointerdown',()=>{if(t>1.5)finish();});
    if(reduced){t=8;}
    const pop=(x,y,text,color,size)=>texts.push({x,y,text:globalThis.SpaceTowerLocale?.text(text)??text,color,size,t:0});
    const burst=(x,y,color,n,sp)=>{for(let i=0;i<n;i++){const a=Math.random()*TAU,v=sp*(.4+Math.random()*.8);shards.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:Math.random()*6,vr:(Math.random()-.5)*14,s:3+Math.random()*5,color,t:0});}};
    function kill(e){e.dead=true;burst(e.x,e.y,e.color,e.boss?40:9,e.boss?420:220);for(let i=0;i<(e.boss?10:1);i++)coins.push({x:e.x,y:e.y,t:-i*.04});}
    function frame(now){
      if(!modal.open||step!==0||!canvas.isConnected)return;
      const dt=last?Math.min(.05,(now-last)/1000):0;last=now;t+=dt;
      if(t>=7.6)finish();
      // Spawn the swarm, then the boss.
      if(t>.8&&t<4&&spawned<22&&t>.8+spawned*.14){const a=Math.random()*TAU,r=330;enemies.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r*.7,hp:2,color:['#7fdcff','#ff8fae','#b892ff'][spawned%3],s:9});spawned++;}
      if(t>4.6&&!boss){boss={x:cx,y:-70,hp:30,max:30,boss:true,color:'#ff5d7a',s:34};enemies.push(boss);}
      // Turret fire.
      const alive=enemies.filter(e=>!e.dead);fire-=dt;
      if(alive.length&&t<7.2&&fire<=0){fire=.07;const e=alive.sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy))[0];angle=Math.atan2(e.y-cy,e.x-cx);shots.push({x:cx,y:cy,e,v:900});}
      for(const e of alive){if(e.boss){e.y+=(cy-120-e.y)*Math.min(1,dt*2.2);}else{const a=Math.atan2(cy-e.y,cx-e.x);e.x+=Math.cos(a)*95*dt;e.y+=Math.sin(a)*95*dt;}}
      for(const s2 of shots){if(s2.done)continue;const dx=s2.e.x-s2.x,dy=s2.e.y-s2.y,d=Math.hypot(dx,dy);if(d<16){s2.done=true;if(s2.e.dead)continue;
          const crit=Math.random()<.3,fatal=s2.e.boss&&t>6&&!s2.e.fatal;
          if(fatal){s2.e.fatal=true;s2.e.hp=0;pop(s2.e.x,s2.e.y-10,'致命 9.9M','#ff5d7a',40);flash=.5;flashColor='#ffffff';shake=10;}
          else{s2.e.hp-=crit?2:1;pop(s2.e.x+(Math.random()-.5)*20,s2.e.y-14,crit?'暴擊 '+(800+Math.floor(Math.random()*400)):String(200+Math.floor(Math.random()*120)),crit?'#ffe08a':'#ffffff',crit?24:13);if(crit)shake=Math.max(shake,3);}
          if(s2.e.hp<=0&&!s2.e.dead){kill(s2.e);if(s2.e.boss){flash=.55;flashColor='#fff3c4';shake=14;}}
        }else{s2.x+=dx/d*s2.v*dt;s2.y+=dy/d*s2.v*dt;}}
      if(boss&&!boss.dead&&t<6)boss.hp=Math.max(6,boss.hp);
      // Draw.
      shake=Math.max(0,shake-dt*30);flash=Math.max(0,flash-dt*1.6);
      c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
      const bg=c.createRadialGradient(cx,cy,10,cx,cy,360);bg.addColorStop(0,'#13324a');bg.addColorStop(1,'#040a16');c.fillStyle=bg;c.fillRect(0,0,W,H);
      for(let i=0;i<50;i++){c.fillStyle=`rgba(190,220,255,${.2+(i%4)*.12})`;c.fillRect((i*97+t*(i%3+1)*6)%W,(i*61)%H,1.5,1.5);}
      c.save();c.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
      c.strokeStyle='#7ff1ff33';c.lineWidth=1;for(const r of [60,110,160]){c.beginPath();c.ellipse(cx,cy,r,r*.7,0,0,TAU);c.stroke();}
      // Core turret.
      c.save();c.translate(cx,cy);c.rotate(angle);c.shadowColor='#7ff1ff';c.shadowBlur=16;c.fillStyle='#0c2238';c.strokeStyle='#7ff1ff';c.lineWidth=3;c.beginPath();c.arc(0,0,20,0,TAU);c.fill();c.stroke();c.fillStyle='#bff8ff';c.fillRect(8,-4,22,8);c.restore();
      for(const e of enemies){if(e.dead)continue;c.save();c.translate(e.x,e.y);c.rotate(Math.atan2(cy-e.y,cx-e.x));c.fillStyle=e.color;c.shadowColor=e.color;c.shadowBlur=10;c.beginPath();if(e.boss){for(let i=0;i<6;i++){const a=i*TAU/6;i?c.lineTo(Math.cos(a)*e.s,Math.sin(a)*e.s):c.moveTo(Math.cos(a)*e.s,Math.sin(a)*e.s);}c.closePath();}else{c.moveTo(e.s,0);c.lineTo(-e.s,e.s*.8);c.lineTo(-e.s*.5,0);c.lineTo(-e.s,-e.s*.8);c.closePath();}c.fill();c.restore();
        if(e.boss){c.fillStyle='#ffffff22';c.fillRect(e.x-60,e.y-54,120,6);c.fillStyle='#ff5d7a';c.fillRect(e.x-60,e.y-54,120*e.hp/e.max,6);}}
      c.fillStyle='#fff6c8';for(const s2 of shots)if(!s2.done){c.beginPath();c.arc(s2.x,s2.y,3,0,TAU);c.fill();}
      for(const p of shards){p.t+=dt;if(p.t>.7)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.94;p.vy*=.94;p.r+=p.vr*dt;c.save();c.globalAlpha=1-p.t/.7;c.translate(p.x,p.y);c.rotate(p.r);c.fillStyle=p.color;c.beginPath();c.moveTo(p.s,0);c.lineTo(-p.s*.6,p.s*.5);c.lineTo(-p.s*.4,-p.s*.6);c.closePath();c.fill();c.restore();}
      for(const k of coins){k.t+=dt;if(k.t<0||k.t>.6)continue;const q=k.t/.6,x=k.x+(40-k.x)*q*q,y=k.y+(24-k.y)*q-Math.sin(q*Math.PI)*60;c.fillStyle='#ffd64d';c.beginPath();c.arc(x,y,4,0,TAU);c.fill();}
      c.restore();
      for(const p of texts){p.t+=dt;if(p.t>.9)continue;const big=p.size>20,sc=big&&p.t<.1?2-p.t*10:1;c.save();c.globalAlpha=Math.min(1,(.9-p.t)*3);c.translate(p.x,p.y-p.t*30);c.scale(sc,sc);c.font=`italic 900 ${p.size}px "Arial Black",Impact,system-ui,sans-serif`;c.textAlign='center';c.lineJoin='round';c.lineWidth=p.size/5;c.strokeStyle='#1a0610';c.strokeText(p.text,0,0);c.fillStyle=p.color;c.fillText(p.text,0,0);c.restore();}
      // WARNING band, then BOSS DOWN.
      if(t>4&&t<5.4){const q=(t-4)/1.4,a=q<.2?q/.2:q>.8?(1-q)/.2:1;c.save();c.globalAlpha=a;c.fillStyle='rgba(255,60,100,.35)';c.fillRect(0,cy-34,W,68);c.strokeStyle='#ff5d7a';c.lineWidth=2;c.strokeRect(-2,cy-34,W+4,68);c.font='italic 900 44px "Arial Black",Impact,system-ui,sans-serif';c.textAlign='center';c.fillStyle='#fff';c.fillText('WARNING',cx,cy+15);c.restore();c.save();c.globalAlpha=.25*a*(Math.sin(t*20)>0?1:.4);c.strokeStyle='#ff2d55';c.lineWidth=30;c.strokeRect(0,0,W,H);c.restore();}
      if(boss?.dead&&t<9){const q=Math.min(1,(t-6.4)/.3);c.save();c.globalAlpha=Math.max(0,Math.min(1,(9-t)));c.translate(cx,cy-40);c.scale(1+(1-q)*1.4,1+(1-q)*1.4);c.font='italic 900 50px "Arial Black",Impact,system-ui,sans-serif';c.textAlign='center';const g=c.createLinearGradient(0,-30,0,10);g.addColorStop(0,'#fff');g.addColorStop(.5,'#ffe970');g.addColorStop(1,'#ff9529');c.lineWidth=8;c.strokeStyle='#3a1a00';c.strokeText('BOSS DOWN',0,0);c.fillStyle=g;c.fillText('BOSS DOWN',0,0);c.restore();}
      if(flash>0){c.fillStyle=flashColor;c.globalAlpha=flash;c.fillRect(0,0,W,H);c.globalAlpha=1;}
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function renderModes(){
    const modes=[
      {name:'一般模式',icon:'◎',label:'守住核心，突破波次',text:'一波波敵機湧來，強化、轟炸、超載，打得越遠越強。',reward:'黑曜石與砲台成長資源',tone:'campaign'},
      {name:'排位賽',icon:'⚔',label:'五砲配隊，即時對決',text:'召喚、融合砲台；擊破的敵機送給對手，存滿反擊一口氣反打。',reward:'杯數與結算獎勵',tone:'ranked'},
      {name:'星核試煉',icon:'⬡',label:'挑戰首領，爭取週榜',text:'每天 3 次，專打首領，衝上每週排行。',reward:'週榜碎片與補給抽卡',tone:'trial'}
    ];
    const seen=new Set();
    const show=index=>{seen.add(index);const m=modes[index];modal.innerHTML=`<span class="intro-kicker">03 / 11 · 作戰模式</span><h2 id="introTitle">${lessons[2].title}</h2><nav class="intro-mode-tabs" aria-label="認識三種模式">${modes.map((x,i)=>`<button type="button" data-intro-mode="${i}" aria-pressed="${i===index}"><i aria-hidden="true">${x.icon}</i><b>${x.name}</b><small>${seen.has(i)?'已認識':'點選了解'}</small></button>`).join('')}</nav><div class="intro-mode-scene ${m.tone}" aria-hidden="true"><i class="intro-orbit"></i><b>${m.icon}</b><span>◆</span><em>◆</em><small>◆</small></div><h3>${m.label}</h3><p>${m.text}</p><div class="intro-reward-line">${m.reward}</div>${primary(seen.size===3?'已認識三種模式':'再認識其他模式')}`;if(!modal.open)modal.showModal();$('introContinue').disabled=seen.size<3;$('introContinue').addEventListener('click',advance);modal.querySelectorAll('[data-intro-mode]').forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.introMode))));};show(0);
  }
  function renderShopTour(){
    guide.hidden=true;
    let content='';
    if(shopPage===0){
      const price=window.getSpaceTowerVipProduct?.()?.formattedPrice;
      content=`<span class="intro-kicker">09 / 11 · 補給站 1 / 4</span><div class="intro-vip-scene" aria-hidden="true"><span>✧</span><b>♛</b><span>✧</span></div><h2 id="introTitle">星殿通行證</h2><p>按月訂閱，開啟專屬權益。</p><div class="intro-benefits"><span>免廣告體驗</span><span>一般商城 8 折</span><span>VIP 砲台購買資格</span><span>黑曜王座戰場</span></div><strong class="intro-price">${escapeHtml(price?price+' / 月':'價格以 App 商店顯示為準')}</strong><p class="intro-fine">每月自動續訂，可在 App Store 或 Google Play 取消。VIP 砲台需另用黑曜石購買。</p>`;
    }else if(shopPage===1){
      const offer=window.getSpaceTowerStarterOffer();
      content=`<span class="intro-kicker">09 / 11 · 補給站 2 / 4</span><div class="intro-pack-hero"><canvas id="introStarterTurret" width="200" height="200" aria-label="碧焰龍息砲"></canvas><span>G8 · ★1</span></div><h2 id="introTitle">${escapeHtml(offer.title)}</h2><p>新手專屬優惠，快速補足開局資源。</p><div class="intro-benefits"><span>碧焰龍息砲 <b>永久保留</b></span><span>黑曜石 <b>2,400</b></span><span>太空幣 <b>2,000</b></span><span>7 種消耗券 <b>共 20 張</b></span></div><strong class="intro-price">${escapeHtml(offer.formattedPrice||'價格以 App 商店顯示為準')}</strong><p class="intro-fine">每個帳號限購一次 · 自由選購</p>`;
    }else if(shopPage===2){
      content=`<span class="intro-kicker">09 / 11 · 補給站 3 / 4</span><div class="intro-offers-hero"><canvas width="220" height="220" data-new-turret="sword_orb" aria-label="千刃劍匣"></canvas><canvas width="220" height="220" data-new-turret="phoenix_orb" aria-label="火鳳烈焰砲"></canvas><span class="intro-offers-crown">♛</span></div><h2 id="introTitle">超值禮包與無敵月卡</h2><p>三大超值禮包每月限購，共 9 座新砲台；無敵月卡登入、遊玩就升級，30 級獎勵逐級領取。</p><div class="intro-benefits"><span>超值禮包 <b>US$1.99 起</b></span><span>新砲台 <b>9 座</b></span><span>月卡 <b>30 級獎勵</b></span><span>入口 <b>首頁活動列</b></span></div><p class="intro-fine">每次登入會先顯示活動，按 × 即可關閉；之後隨時從首頁活動列或商店打開。</p>`;
    }else{
      content=`<span class="intro-kicker">09 / 11 · 補給站 4 / 4</span><h2 id="introTitle">第一次十連，送給你</h2><p>兩種卡池各送 10 張抽卡券，完成教學後領取。</p><div class="intro-pool-grid">${Object.values(SPACE_TOWER_GACHA_PACKS).map(pack=>`<article class="intro-pool ${pack.id}"><div class="intro-pool-emblem" aria-hidden="true">${pack.id==='normal'?'✦':'♛'}</div><h3>${escapeHtml(localizedPackName(pack))}</h3><b class="intro-free">免費十連 ×1</b><p>${pack.id==='normal'?'砲台、絕招碎片與貨幣補給':'進階素材、特殊外觀與戰備道具'}</p><small>之後使用${pack.currency==='obsidian'?'黑曜石':'太空幣'}抽取</small><details><summary>查看獎池與機率</summary><div>${pack.rewards.map(item=>`<span>${escapeHtml(localizedRewardLabel(item))}<b>${(item[1]/pack.rewards.reduce((sum,r)=>sum+r[1],0)*100).toFixed(2)}%</b></span>`).join('')}</div></details></article>`).join('')}</div><p class="intro-fine">每 10 抽至少一項稀有以上獎勵；每次十連另得 12 星塵。抽卡券優先使用，正式抽取需登入。</p>`;
    }
    modal.innerHTML=content+primary(shopPage===0?'認識新手禮包':shopPage===1?'認識超值禮包與月卡':shopPage===2?'認識免費十連抽':'記住補給站，繼續導覽');if(!modal.open)modal.showModal();modal.scrollTop=0;if(shopPage===1)drawTurretPreviewCanvas($('introStarterTurret'),SpaceTowerCatalog.byId.get('emerald_drake'),{transparent:true});$('introContinue').addEventListener('click',advance);$('introContinue').focus({preventScroll:true});
  }
  $('introNext').addEventListener('click',advance);modal.addEventListener('cancel',event=>event.preventDefault());
  modal.addEventListener('click',event=>{if(replay&&event.target.closest('#introExit'))close();});
  // Tabs folded into "More" are reached through the More button, then the sheet entry.
  function actionTarget(lesson){
    const el=lesson?.action&&document.querySelector(lesson.action);if(!el||!el.classList.contains('home-secondary-tab'))return el;
    const sheet=document.querySelector('.home-more-sheet');return sheet&&!sheet.hidden?sheet.querySelector(`[data-target="${el.id}"]`)||el:$('homeMoreTab')||el;
  }
  function position(){
    if(!active||guide.hidden)return;const lesson=lessons[step],coach=$('introCoach'),target=visited?document.querySelector(lesson.panel):actionTarget(lesson)||document.querySelector(lesson.panel);if(!target)return;
    coach.style.left=Math.max(12,(innerWidth-420)/2)+'px';const r=target.getBoundingClientRect();
    // Targets in the lower half (the bottom tab bar) move the coach to the top so it never covers them.
    const lowTarget=!visited&&lesson.action&&r.top>innerHeight*.5;coach.classList.toggle('intro-coach-top',!!lowTarget);
    const ceiling=lowTarget?innerHeight-4:Math.max(80,innerHeight-coach.offsetHeight-24),floor=lowTarget?coach.getBoundingClientRect().bottom+8:8,top=Math.max(floor,Math.min(ceiling-28,r.top)),bottom=Math.max(top+28,Math.min(ceiling,r.bottom));
    Object.assign($('introFocus').style,{left:Math.max(4,r.left-4)+'px',top:top-3+'px',width:Math.min(innerWidth-8,r.width+8)+'px',height:bottom-top+6+'px'});
    $('introHand').toggleAttribute('hidden',visited||!lesson.action);const low=r.top>innerHeight*.6;$('introHand').classList.toggle('intro-hand-down',low);Object.assign($('introHand').style,{left:Math.min(innerWidth-42,Math.max(4,r.left+r.width*.5-12))+'px',top:(low?Math.max(5,r.top-46):Math.max(5,r.bottom-3))+'px'});
  }
  document.addEventListener('click',event=>{
    if(!active||bypass||event.target.closest('#introDialog,#introCoach')||document.querySelector('dialog[open]:not(#introDialog)'))return;
    const lesson=lessons[step];if(lesson?.action&&event.target.closest(lesson.action)){
      window.setTimeout(()=>{if(!active)return;visited=true;$('introNext').disabled=false;$('introNext').textContent='下一站';if(step===4){bypass=true;document.querySelector('[data-archive="turret"]')?.click();bypass=false;}document.querySelector(lesson.panel)?.scrollIntoView({block:'start',behavior:'instant'});position();$('introNext').focus({preventScroll:true});},0);return;
    }
    if(lesson?.action&&!visited&&document.querySelector(lesson.action)?.classList.contains('home-secondary-tab')&&event.target.closest('#homeMoreTab,.home-more-sheet')){
      window.setTimeout(()=>{if(!active)return;const t=actionTarget(lesson);t?.focus({preventScroll:true});position();},0);return;
    }
    event.preventDefault();event.stopImmediatePropagation();
  },true);
  document.addEventListener('keydown',event=>{
    if(!active||document.querySelector('dialog[open]:not(#introDialog)'))return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(replay)close();}
    if(event.key==='Tab'&&!modal.open){event.preventDefault();const action=lessons[step]?.action;const choices=[action&&!visited?actionTarget(lessons[step]):null,$('introNext')].filter(el=>el&&!el.disabled);if(choices.length)choices[(choices.indexOf(document.activeElement)+1)%choices.length].focus();}
  },true);
  function drawDrill(dt){
    if(!drill)return;const d=drill,c=$('introField').getContext('2d'),w=560,h=300;d.time+=dt;c.clearRect(0,0,w,h);
    const bg=c.createRadialGradient(w/2,h/2,10,w/2,h/2,280);bg.addColorStop(0,'#183c4b');bg.addColorStop(1,'#061522');c.fillStyle=bg;c.fillRect(0,0,w,h);
    c.strokeStyle='#5cabb322';c.lineWidth=1;for(const r of [55,100,145]){c.beginPath();c.ellipse(w/2,h/2,r,r*.68,0,0,Math.PI*2);c.stroke();}for(let i=0;i<24;i++){c.fillStyle='#b7dce94d';c.fillRect((i*79+19)%w,(i*53+30)%h,1.5,1.5);}
    if(d.upgraded){d.timer-=dt;if(d.timer<=0&&d.enemies.some(e=>e.hp>0&&!e.big)){d.volley=(d.volley||0)+1;const off=d.volley*Math.PI/20+Math.random()*.1;for(let i=0;i<12;i++){const a=i*Math.PI/6+off;d.swords.push({x:w/2,y:h/2,vx:Math.cos(a)*300,vy:Math.sin(a)*300,a,t:-i*.06,hit:new Set(),trail:[]});}d.timer=1.6;}}
    for(const sw of d.swords){sw.t+=dt;if(sw.t>1.2||sw.t<0)continue;{let best=null,bd=1e9;for(const e of d.enemies){if(e.hp<=0||sw.hit.has(e))continue;const dd=Math.hypot(e.x-sw.x,e.y-sw.y);if(dd<bd){bd=dd;best=e;}}if(best&&sw.t>.12){const want=Math.atan2(best.y-sw.y,best.x-sw.x),cur=Math.atan2(sw.vy,sw.vx),diff=Math.atan2(Math.sin(want-cur),Math.cos(want-cur)),na=cur+Math.max(-7*dt,Math.min(7*dt,diff)),sp=Math.min(560,Math.hypot(sw.vx,sw.vy)+500*dt);sw.vx=Math.cos(na)*sp;sw.vy=Math.sin(na)*sp;}}sw.a=Math.atan2(sw.vy,sw.vx);sw.trail.push([sw.x,sw.y]);if(sw.trail.length>8)sw.trail.shift();sw.x+=sw.vx*dt;sw.y+=sw.vy*dt;for(const e of d.enemies){if(e.hp<=0||sw.hit.has(e)||Math.hypot(e.x-sw.x,e.y-sw.y)>(e.big?26:24))continue;sw.hit.add(e);const crit=Math.random()<.35,dmg=e.big?(crit?6:3):(crit?24:12);e.hp-=dmg;d.texts.push({x:e.x,y:e.y-14,text:crit?(globalThis.SpaceTowerLocale?.text('暴擊 '+dmg*37)??'暴擊 '+dmg*37):String(dmg*37),crit,t:0});if(e.hp<=0){d.kills++;d.gold+=8;d.effects.push({x:e.x,y:e.y,t:0});for(let k=0;k<8;k++){const q=Math.random()*Math.PI*2;d.shards.push({x:e.x,y:e.y,vx:Math.cos(q)*160,vy:Math.sin(q)*160,t:0});}}}
      {const fade=Math.min(1,(1.2-sw.t)*3);c.save();c.globalCompositeOperation='lighter';c.lineCap='round';for(let k=1;k<sw.trail.length;k++){const q=k/sw.trail.length;c.globalAlpha=fade*q*.5;c.strokeStyle='#a0e1ff';c.lineWidth=1+q*3;c.beginPath();c.moveTo(sw.trail[k-1][0],sw.trail[k-1][1]);c.lineTo(sw.trail[k][0],sw.trail[k][1]);c.stroke();}c.restore();
      c.save();c.translate(sw.x,sw.y);c.rotate(sw.a);c.globalAlpha=fade;c.globalCompositeOperation='lighter';c.strokeStyle='rgba(150,220,255,.45)';c.lineWidth=5;c.beginPath();c.moveTo(-2,0);c.lineTo(16,0);c.stroke();c.globalCompositeOperation='source-over';
      c.fillStyle='#1d1712';c.fillRect(-9,-1,5,2);c.fillStyle='#d8b25a';c.fillRect(-4.5,-3,1,6);const g2=c.createLinearGradient(0,-1.5,0,1.5);g2.addColorStop(0,'#a9b6c4');g2.addColorStop(.5,'#ffffff');g2.addColorStop(1,'#bcd0e0');c.fillStyle=g2;c.beginPath();c.moveTo(-3.5,-1.4);c.lineTo(14,-1);c.lineTo(18,0);c.lineTo(14,1);c.lineTo(-3.5,1.4);c.closePath();c.fill();c.restore();}}
    for(const p of d.shards){p.t+=dt;if(p.t>.5)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;c.globalAlpha=1-p.t*2;c.fillStyle='#88d7ec';c.fillRect(p.x-2,p.y-2,4,4);c.globalAlpha=1;}
    for(const p of d.texts){p.t+=dt;if(p.t>.8)continue;c.save();c.globalAlpha=Math.min(1,(.8-p.t)*3);c.font=`italic 900 ${p.crit?20:12}px "Arial Black",Impact,system-ui`;c.textAlign='center';c.lineWidth=4;c.strokeStyle='#1a0610';c.strokeText(p.text,p.x,p.y-p.t*28);c.fillStyle=p.crit?'#ffe08a':'#fff';c.fillText(p.text,p.x,p.y-p.t*28);c.restore();}
    for(const shot of d.shots){if(shot.done)continue;const e=shot.target,dx=e.x-shot.x,dy=e.y-shot.y,len=Math.hypot(dx,dy);if(len<14){shot.done=true;if(e.hp>0){e.hp-=d.attack;if(e.hp<=0){d.kills++;d.gold+=8;d.effects.push({x:e.x,y:e.y,t:0});}}}else{shot.x+=dx/len*300*dt;shot.y+=dy/len*300*dt;}c.fillStyle='#f5dc9b';c.shadowColor='#f1cf7d';c.shadowBlur=8;c.beginPath();c.arc(shot.x,shot.y,4,0,Math.PI*2);c.fill();c.shadowBlur=0;}
    for(const e of d.enemies){if(e.hp<=0)continue;const z=e.big?20:11,ey=e.y+Math.sin(d.time*2+e.x)*3;c.save();c.translate(e.x,ey);c.rotate(Math.PI/4);c.fillStyle=e.big?'#6b1f3a':'#245b89';c.strokeStyle=e.big?'#ff8fae':'#88d7ec';c.lineWidth=2;c.shadowColor=e.big?'#ff5d7a':'#67beec';c.shadowBlur=12;c.fillRect(-z,-z,z*2,z*2);c.strokeRect(-z,-z,z*2,z*2);c.restore();
      if(e.big){c.fillStyle='#ffffff22';c.fillRect(e.x-26,ey-34,52,4);c.fillStyle='#ff8fae';c.fillRect(e.x-26,ey-34,52*e.hp/e.max,4);
        if(d.kills>=8){const p=(Math.sin(d.time*6)+1)/2;c.strokeStyle=`rgba(255,220,140,${.5+p*.5})`;c.lineWidth=3;c.beginPath();c.arc(e.x,ey,34+p*8,0,Math.PI*2);c.stroke();c.fillStyle='#ffe08a';c.font='bold 16px system-ui';c.textAlign='center';c.fillText(globalThis.SpaceTowerLocale?.text('點它！')??'點它！',e.x,ey+52);c.textAlign='start';}}}
    for(const b of d.beams){b.t+=dt;if(b.t>.4)continue;const a=1-b.t/.4;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.fillStyle='#bff8ff';c.fillRect(b.x-(8*a+2),0,(8*a+2)*2,b.y);c.strokeStyle='#9ffcff';c.lineWidth=4*a;c.beginPath();c.arc(b.x,b.y,20+(1-a)*40,0,Math.PI*2);c.stroke();c.restore();}
    for(const fx of d.effects){fx.t+=dt;if(fx.t>1)continue;c.strokeStyle=`rgba(161,228,221,${1-fx.t})`;c.beginPath();c.arc(fx.x,fx.y,12+fx.t*30,0,Math.PI*2);c.stroke();c.fillStyle='#e9d79d';c.font='15px system-ui';c.fillText('+8',fx.x-9,fx.y-fx.t*35);}
    c.save();c.translate(w/2,h/2);c.scale(.85,.85);if(window.SpaceTowerOffers?.drawArt)window.SpaceTowerOffers.drawArt(c,'sword_orb',d.upgraded?d.time:0);else{c.fillStyle='#ffe6a8';c.beginPath();c.arc(0,0,14,0,Math.PI*2);c.fill();}c.restore();
    $('introDrillGold').textContent='金幣 '+d.gold;$('introDrillKills').textContent='擊破 '+d.kills+' / 9';if(d.kills===9&&$('introContinue').disabled){$('introContinue').disabled=false;$('introContinue').textContent='前往大廳';}
  }
  // Capped at 60 fps: high-refresh phones would otherwise redraw the tutorial 120+ times a second.
  function frame(t){if(!active)return;frameId=requestAnimationFrame(frame);if(lastFrame&&t-lastFrame<15.5)return;const dt=lastFrame?Math.min(.05,(t-lastFrame)/1000):0;lastFrame=t;if(!document.hidden){drawDrill(dt);position();}}
  window.addEventListener('space-tower-cloud-save-applied',()=>{if(!active&&!current().onboarding.introClaimed)enter();});
  window.addEventListener('space-tower-starter-dismissed',()=>{if(!active&&!current().onboarding.introClaimed)enter();});
  const exitGuide=document.createElement('button');exitGuide.id='introExitGuide';exitGuide.type='button';exitGuide.className='intro-exit';exitGuide.textContent='結束導覽';exitGuide.hidden=true;exitGuide.addEventListener('click',()=>{if(replay)close();});$('introCoach').append(exitGuide);
  const replayButton=document.createElement('button');replayButton.id='introReplayButton';replayButton.type='button';replayButton.className='intro-launch-replay';replayButton.textContent='重看遊戲入門教學';replayButton.addEventListener('click',()=>enter(true));$('settingsFullscreenButton').before(replayButton);
  try{applyReceipt(N.recoverIntroReward(localStorage,getActiveRunOwner()));if(!current().onboarding.introClaimed)enter();else applyReceipt(claimGift());}catch{if(!current().onboarding.introClaimed)enter();}
  const previewSection=['localhost','127.0.0.1','[::1]'].includes(location.hostname)?new URLSearchParams(location.search).get('introPreview'):null;
  if(['welcome','starter','subscription','offers','packs','modes'].includes(previewSection)){
    if(active)close();enter(true);if(previewSection==='welcome')return;step=previewSection==='modes'?2:8;visited=true;
    if(step===2)renderModes();else{shopPage={subscription:0,starter:1,offers:2,packs:3}[previewSection];renderShopTour();}
  }
})();
