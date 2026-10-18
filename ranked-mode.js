(() => {
  'use strict';
  const C = SpaceTowerCatalog, R = SpaceTowerRanked, N = SpaceTowerRecruit;
  const L=SpaceTowerLocale;
  document.documentElement.lang=L.language==='zh'?'zh-Hant':L.language;
  for(const a of document.querySelectorAll('a[href^="index.html"]')){const url=new URL(a.href);url.searchParams.set('lang',L.language);a.href=url.href;}
  const $ = id => document.getElementById(id);
  const {text:setText,attr:setAttr,RenderBudget}=SpaceTowerRankedRendering;
  let quality='medium';try{quality=JSON.parse(localStorage.getItem('spaceTowerSettings')||'{}').quality||quality;}catch{}
  const renderBudget=new RenderBudget(quality),surfaces=new Map();
  let layoutDirty=true,needsDraw=true,hasDrawn=false;
  const battleAudio=new SpaceTowerRankedAudio.RankedAudio();battleAudio.readSettings();
  function audioButtonState(){const enabled=battleAudio.unlocked&&(battleAudio.settings.sfx||battleAudio.settings.bgm);setAttr($('audioButton'),'aria-label',enabled?'關閉音效':'開啟音效');setAttr($('audioButton'),'aria-pressed',String(enabled));setText($('audioButton'),enabled?'♫':'♪');}
  function unlockAudio(){if(!battleAudio.unlocked||battleAudio.context?.state==='suspended'){battleAudio.unlock();audioButtonState();}}
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('#audioButton'))unlockAudio();},{passive:true});
  document.addEventListener('keydown',unlockAudio);
  $('audioButton').addEventListener('click',()=>{if(!battleAudio.unlocked&&(battleAudio.settings.sfx||battleAudio.settings.bgm))battleAudio.unlock();else battleAudio.toggle();audioButtonState();});
  const defaults = [...N.starterIds];
  const upgradeLabels = {speed:['⌁','攻速'],physical:['⌖','物攻'],hp:['♡','血量'],magic:['✧','魔攻']};
  const coinIcon = '<svg class="coin-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="m10 1 8 4.5v9L10 19l-8-4.5v-9Z" fill="#ba8b40" stroke="#f4d795"/><path d="m10 4 5 3v6l-5 3-5-3V7Z" fill="#eacb79"/><path d="m10 6 3 4-3 4-3-4Z" fill="#856031"/></svg>';
  const upgradeArt = {
    speed:'<path d="m27 9-14 16h10l-2 14 15-19H25Z" fill="currentColor"/><path d="M8 16h7M5 24h7M8 32h7" fill="none" stroke="currentColor" stroke-width="2"/>',
    physical:'<path d="m15 33 15-21 7 5-15 21Z" fill="currentColor"/><path d="m30 12 8-3-1 8M11 27l11 11M9 35l5 4" fill="none" stroke="currentColor" stroke-width="2"/><path d="m22 26 9-12" stroke="#fff6db" stroke-width="2"/>',
    hp:'<path d="m24 8 14 6v10c0 9-6 13-14 17-8-4-14-8-14-17V14Z" fill="currentColor" opacity=".17" stroke="currentColor" stroke-width="2"/><path d="M24 20c-6-9-15 1 0 11 15-10 6-20 0-11Z" fill="currentColor"/>',
    magic:'<path d="m24 5 4 12 13 7-13 6-4 13-5-13-12-6 12-7Z" fill="currentColor" opacity=".2" stroke="currentColor"/><path d="m24 12 5 12-5 12-5-12Z" fill="currentColor"/><path d="m10 8 2 5 5 2-5 2-2 5-2-5-5-2 5-2ZM37 31l2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="currentColor"/>'
  };
  const number = value => Math.round(value).toLocaleString('en-US');
  const grade = d => d.vipExclusive ? d.rarity === 'legendary' ? 'VIP 金' : 'VIP 銀' : `G${d.strengthGrade}`;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let loadout = [...defaults], draft = [...loadout], draftIndex = 0, match;
  let selected = null, manualPaused = false, lastTime = 0, accumulator = 0, uiTime = 0, statusUntil = 0, round = 0;
  let pointer = null, suppressClickUntil = 0, resultShown = false, preparing = true, drawerOpen = false;
  let preparationTab = 'formation';
  let progress,saveError=false,matchKind='ranked',tutorial=null;
  const matchPreview=window.SPACE_TOWER_LOCAL_RANKED&&new URLSearchParams(location.search).get('matchPreview')==='1';
  const resultPreview=window.SPACE_TOWER_LOCAL_RANKED&&['win','loss'].includes(new URLSearchParams(location.search).get('resultPreview'))?new URLSearchParams(location.search).get('resultPreview'):null;
  const showcase=window.SPACE_TOWER_LOCAL_RANKED?new URLSearchParams(location.search).get('showcase'):null;
  const previewScenario=['comeback','gentle','challenging','prep','archive','rules','training'].includes(showcase);
  let networkMatch=false,networkStatus='idle',networkSettled=false,networkPreview=false,queueStarted=0,networkBusy=false;
  let renderBuffer=new SpaceTowerRankedRenderBuffer(),renderMatch=null;
  try{progress=N.read();}catch{progress=N.reconcile({});saveError=true;}
  if(!matchPreview&&!resultPreview&&!previewScenario&&!saveError&&!N.eligibility(progress).introClaimed){location.replace('index.html?lang='+L.language+'&afterIntro=ranked&dev=0');return;}
  try{if(sessionStorage.getItem('spaceTowerRankedAudioEntry')==='1'){battleAudio.setActive(!document.hidden);battleAudio.unlock(false);audioButtonState();}}catch{}
  const entry=()=>previewScenario?{...N.eligibility(progress),owned:defaults,count:5,ranked:true,introClaimed:true,tutorialClaimed:true,normalRound:0}:N.eligibility(progress);
  const availableIds=()=>entry().owned;
  function refreshDraft(){draft=previewScenario?[...defaults]:N.selectedLoadout(progress);}
  function persistDraft(){if(previewScenario||matchPreview||resultPreview)return true;return saveRecruit(p=>N.setRankedLoadout(p,draft))===true;}
  function saveRecruit(change){try{const saved=N.commit(change);progress=saved.progress;saveError=false;return saved.result;}catch{saveError=true;return null;}}
  let practiceRating=1200, practiceStreak={wins:0,losses:0};
  const spriteCache = new Map(), canvases = [$('playerCanvas'),$('opponentCanvas')];
  const dialogs = [...document.querySelectorAll('dialog')];
  const modalOpen = () => dialogs.some(d => d.open);
  const paused = () => preparing || manualPaused || document.hidden || modalOpen() || tutorial&&tutorial.step!==5;
  const connection=new SpaceTowerRankedConnection(receiveMatch,(message,fatal)=>{
    $('matchingError').textContent=message;showStatus(message);
    if(fatal){networkStatus='error';$('matchmakingTitle').textContent='暫時無法配對';$('cancelMatchmaking').disabled=false;$('cancelMatchmaking').textContent='返回備戰';}
  });
  function matchingFormation(){
    $('matchingTurrets').innerHTML=loadout.map(id=>`<span>${portrait(id)}<small>${escape(C.byId.get(id).name)}</small></span>`).join('');portraits($('matchingTurrets'));
  }
  function showMatching(){
    $('loadoutDialog').close();document.body.classList.remove('is-preparing');preparing=false;setDrawer(false);
    if(!$('matchmakingDialog').open){$('matchmakingDialog').showModal();$('matchmakingTitle').focus({preventScroll:true});$('matchmakingDialog').scrollTop=0;}
  }
  function beginMatch(next=loadout){
    loadout=[...next];matchKind='ranked';networkMatch=true;networkStatus='searching';networkSettled=false;resultShown=false;queueStarted=performance.now();renderBuffer=new SpaceTowerRankedRenderBuffer();renderMatch=null;
    $('matchingError').textContent='';$('matchmakingTitle').textContent='正在尋找對手';$('matchmakingSubtitle').textContent='陣容已鎖定 · 等待對戰訊號';
    $('matchingOpponentLabel').textContent='對手訊號';$('matchingOpponentName').textContent='搜尋中…';$('matchingOpponentCups').textContent='—';$('matchingCountdown').hidden=true;
    $('matchmakingDialog').classList.remove('matched');$('matchingElapsed').textContent='00:00';$('cancelMatchmaking').disabled=false;$('cancelMatchmaking').textContent='取消配對';
    $('matchingPlayerCups').textContent=number(practiceRating)+' 杯';matchingFormation();showMatching();connection.begin(loadout);
  }
  function receiveMatch(data){
    networkStatus=data.status;networkPreview=!!data.preview;
    if(data.status==='searching'){
      networkMatch=true;queueStarted=performance.now()-data.elapsedMs;practiceRating=data.rating;if(data.loadout)loadout=[...data.loadout];matchingFormation();$('matchingPlayerCups').textContent=number(data.rating)+' 杯';showMatching();
    }
    if(data.status==='matched'){networkMatch=true;$('cancelMatchmaking').disabled=true;$('matchmakingTitle').textContent='正在連接對手';showMatching();}
    if(data.match){
      networkMatch=true;match=data.match;loadout=[...match.sides[0].loadout];networkSettled=data.settled;
      battleAudio.prepare(match.sides.flatMap(s=>s.loadout));
      renderBuffer.push(match,performance.now());
      $('opponentName').textContent=data.opponent.name;$('opponentRating').textContent=number(data.opponent.rating)+' 杯';
      document.querySelector('.ranked-title small').textContent=networkPreview?'配對預覽':'排位對戰';
      $('pauseButton').hidden=true;manualPaused=false;
      $('matchingOpponentName').textContent=data.opponent.name;$('matchingOpponentCups').textContent=number(data.opponent.rating)+' 杯';$('matchingPlayerCups').textContent=number(data.player.rating)+' 杯';
      if(['waiting','countdown'].includes(data.status)){
        showMatching();matchingFormation();$('matchmakingDialog').classList.add('matched');$('matchingOpponentLabel').textContent='對手已就緒';$('matchmakingTitle').textContent=data.status==='waiting'?'對手連接中':'對手已就緒';
        $('matchmakingSubtitle').textContent='雙方陣容鎖定 · 準備進場';$('cancelMatchmaking').disabled=true;
        $('matchingCountdown').hidden=data.status!=='countdown';$('matchingCountdown').textContent=Math.max(1,Math.ceil(data.countdownMs/1000));
      }else if(['playing','finished'].includes(data.status)){
        $('matchmakingDialog').close();$('matchingError').textContent='';
        if(data.opponentReconnecting)showStatus('對手重新連線中');
      }
      updateUI();drawBoards();
    }
    if(data.status==='cancelled'){
      $('matchmakingDialog').close();networkMatch=false;networkStatus='idle';preparing=true;$('pauseButton').hidden=false;reset();openLoadout();
      if(data.reason)showStatus('對手未能連線，請重新配對');
    }
  }
  async function perform(type,values={}){
    if(networkBusy)return {ok:false,reason:'操作確認中'};
    if(networkMatch){if(networkStatus!=='playing')return {ok:false,reason:'等待對戰開始'};networkBusy=true;try{return await connection.command(type,values);}finally{networkBusy=false;}}
    return type==='summon'?R.summon(match,0):type==='merge'?R.merge(match,0,values.from,values.to):R.upgrade(match,0,values.key);
  }
  $('matchmakingDialog').addEventListener('cancel',event=>event.preventDefault());
  $('cancelMatchmaking').addEventListener('click',async()=>{
    $('cancelMatchmaking').disabled=true;
    if(networkStatus==='error'){receiveMatch({status:'cancelled'});return;}
    try{await connection.cancel();}catch(error){$('matchingError').textContent=error.message;$('cancelMatchmaking').disabled=false;}
  });
  function sprite(id,battle=false) {
    const key=id+(battle?':battle':'');
    if (!spriteCache.has(key)) {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = battle?192:156;
      drawTurretPreviewCanvas(canvas,C.byId.get(id),{transparent:true,battle}); spriteCache.set(key,canvas);
    }
    return spriteCache.get(key);
  }
  function portrait(id) { return `<canvas width="156" height="156" data-portrait="${id}" aria-hidden="true"></canvas>`; }
  function portraits(root) { root.querySelectorAll('[data-portrait]').forEach(canvas => canvas.getContext('2d').drawImage(sprite(canvas.dataset.portrait),0,0)); }
  function loadoutCard(id,index,active = false) {
    if(!id)return `<button class="loadout-card empty-slot ${active?'active':''}" data-loadout-index="${index}" aria-label="第 ${index+1} 格，尚未擁有砲台"><span class="slot-meta"><i>${String(index+1).padStart(2,'0')}</i></span><span class="card-portrait">＋</span><span class="card-name">尚未解鎖</span><span class="card-hp">新手計畫</span></button>`;
    const d = C.byId.get(id);
    return `<button type="button" class="loadout-card ${d.vipExclusive ? d.rarity === 'legendary' ? 'vip-gold' : 'vip-silver' : ''} ${active ? 'active' : ''}" data-loadout-index="${index}" style="--turret:${d.color}" aria-pressed="${active}" aria-label="第 ${index+1} 種砲台 ${escape(d.name)} 血量 ${C.health(d)}，點選替換"><span class="slot-meta"><i>${String(index+1).padStart(2,'0')}</i><span class="card-grade">${grade(d)}</span></span><span class="card-portrait">${portrait(id)}</span><span class="card-name">${escape(d.name)}</span><span class="card-hp">HP <strong>${C.health(d)}</strong></span></button>`;
  }
  function showStatus(text) { $('actionStatus').textContent = text; $('actionStatus').classList.add('feedback'); statusUntil = performance.now()+4500; }
  function reset(next = loadout) {
    loadout = [...next]; match = R.create({loadout,opponentLoadout:defaults,seed:20261026 + (preparing ? 0 : round++),ratings:[practiceRating,1200],streaks:[practiceStreak,{wins:0,losses:0}]});
    battleAudio.prepare(match.sides.flatMap(s=>s.loadout));
    if(matchKind!=='tutorial')for (let i=0;i<5;i++) { R.summon(match,0); R.summon(match,1); }
    document.querySelector('.ranked-title small').textContent=matchKind==='tutorial'?'首航訓練':'排位對戰';
    $('opponentName').textContent=L.text(matchKind==='tutorial'?'星環守衛':'等待對手');$('opponentRating').textContent=matchKind==='tutorial'?'首航訓練':'排位對戰';
    selected = null; manualPaused = false; lastTime = 0; accumulator = 0; resultShown = false;
    $('actionStatus').textContent = ''; $('actionStatus').classList.remove('feedback'); statusUntil = 0;
    updateUI(); drawBoards();
  }
  function updateUI() {
    for (let i=0;i<2;i++) {
      const prefix = i === 0 ? 'player' : 'opponent', s = match.sides[i];
      setText($(prefix+'Hp'),`${number(s.hp)} / ${number(s.maxHp)}`);
      const width=`${(100*s.hp/s.maxHp).toFixed(2)}%`;if($(prefix+'HpBar').style.width!==width)$(prefix+'HpBar').style.width=width;
      setText($(prefix+'Slots'),`${s.units.filter(Boolean).length} / 13`);
      setText($(prefix+'Sent'),s.sent);
    }
    const s = match.sides[0];
    if(selected !== null && !s.units[selected]) selected = null;
    setText($('coins'),number(s.coins));setText($('summonCost'),number(R.summonCost(s)));
    $('summonButton').disabled = s.coins < R.summonCost(s) || s.units.every(Boolean) || match.status !== 'playing';
    setAttr($('summonButton'),'aria-label',`召喚砲台，花費 ${R.summonCost(s)} 金幣${s.units.every(Boolean) ? '，場上已滿' : ''}`);
    for (const key of Object.keys(upgradeLabels)) {
      const button = document.querySelector(`[data-upgrade="${key}"]`), level=s.upgrades[key];
      setText(button.querySelector('.upgrade-level'),`Lv.${level}`);
      setText(button.querySelector('.upgrade-cost-value'),level >= R.MAX_UPGRADE ? 'MAX' : R.upgradeCost(s,key));
      button.classList.toggle('maxed',level >= R.MAX_UPGRADE);
      button.disabled = level >= R.MAX_UPGRADE || s.coins < R.upgradeCost(s,key) || match.status !== 'playing';
      setAttr(button,'aria-label',`${upgradeLabels[key][1]} ${level} 級，${level >= R.MAX_UPGRADE ? '已達最高等級' : `升級 ${R.upgradeCost(s,key)} 金幣`}`);
    }
    const elapsed = Math.floor(match.elapsed);
    setText($('timer'),`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`);
    setText($('waveLabel'),`WAVE ${String(match.wave).padStart(2,'0')}`);
    for(let i=0;i<2;i++){const prefix=i?'opponent':'player',count=match.transferEvents.filter(e=>e.side===i).length;setText($(prefix+'Burst'),count?'+'+count:'');$(prefix+'Sent').parentElement.classList.toggle('active',count>0);}
    setText($('pauseButton'),manualPaused ? '▷' : 'Ⅱ');
    setAttr($('pauseButton'),'aria-label',manualPaused ? '繼續演練' : '暫停演練');
    setAttr($('pauseButton'),'aria-pressed',String(manualPaused));
    $('pauseIndicator').hidden = !manualPaused || match.status === 'finished';
    for (const [i,button] of [...$('slotTargets').children].entries()) {
      const u=s.units[i], a=s.units[selected];
      const compatible = a && u && i !== selected && a.id === u.id && a.star === u.star && a.star < R.MAX_STAR;
      button.classList.toggle('selected',i===selected); button.classList.toggle('compatible',!!compatible);
      setAttr(button,'aria-label',u ? `欄位 ${i+1}，${C.byId.get(u.id).name}，${u.star} 星，血量 ${Math.ceil(u.hp)} / ${u.maxHp}${compatible ? '，可融合' : ''}` : `欄位 ${i+1}，空位`);
      setAttr(button,'aria-pressed',String(i===selected));
    }
    $('mergeHint').classList.toggle('selected',selected!==null);
    setText($('mergeHint'),selected===null ? '同種同星 · 點選或拖曳融合' : `${C.byId.get(s.units[selected].id).name} ★${s.units[selected].star} · HP ${Math.ceil(s.units[selected].hp)} / ${s.units[selected].maxHp}`);
    if (statusUntil && performance.now() > statusUntil) { statusUntil=0; $('actionStatus').classList.remove('feedback'); $('actionStatus').textContent=''; }
    if (match.status === 'finished' && !resultShown) {
      if(matchKind==='tutorial')return;
      if(networkMatch&&!networkSettled)return;
      const result=match.results[0];resultShown = true;if(matchKind==='ranked'){practiceRating=result.ratingAfter;practiceStreak={...result.streak};}
      setDrawer(false);$('resultTitle').textContent = result.outcome === 'draw' ? '勢均力敵' : result.outcome === 'win' ? '排位勝利' : '陣地失守';
      $('resultDialog').classList.toggle('loss',result.outcome==='loss');
      $('resultStats').textContent = `${$('timer').textContent} · 擊破 ${s.kills}`;
      $('resultCups').textContent = `${result.cups>0?'+':''}${result.cups}`;
      $('resultRating').textContent = `${number(result.ratingBefore)} → ${number(result.ratingAfter)}${result.rebound?' · 連敗回升 +'+result.rebound:result.reversal?' · 連勝終止 −'+result.reversal:''}`;
      $('resultObsidian').textContent = '+'+result.obsidian;
      $('resultRewardNote').textContent=networkPreview?'本機預覽獎勵':'回首頁同步領取';
      $('resultFinalRating').innerHTML=number(result.ratingAfter)+'<small>杯</small>';
      $('resultOutcome').textContent=result.outcome==='win'?'VICTORY':result.outcome==='loss'?'DEFEAT':'DRAW';
      $('againButton').textContent='再來一場';
      const low=Math.floor(Math.min(result.ratingBefore,result.ratingAfter)/100)*100,high=Math.max(low+100,Math.ceil(Math.max(result.ratingBefore,result.ratingAfter)/100)*100);
      const before=100*(result.ratingBefore-low)/(high-low),after=100*(result.ratingAfter-low)/(high-low);
      $('ratingProgressFrom').textContent=number(low)+' 杯';$('ratingProgressTo').textContent=number(high)+' 杯';
      $('ratingProgressFill').style.width=after+'%';$('ratingProgressMarker').style.left=after+'%';
      $('resultDialog').showModal();
      battleAudio.play(result.outcome==='win'?'win':'loss','',0,1.5);
      $('resultTitle').focus({preventScroll:true});$('resultDialog').scrollTop=0;
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){$('ratingProgressFill').animate([{width:before+'%'},{width:after+'%'}],{duration:1000,easing:'cubic-bezier(.2,.7,.2,1)'});$('ratingProgressMarker').animate([{left:before+'%'},{left:after+'%'}],{duration:1000,easing:'cubic-bezier(.2,.7,.2,1)'});}
    }
  }
  function geometry(canvas) {
    const {width,height} = canvas.getBoundingClientRect();
    return {w:width,h:height,cx:width*.5,cy:height*.55,sx:width*.62,sy:height*.5,size:Math.max(18,Math.min(42,width*.09,height*.18))};
  }
  function resizeCanvas(canvas) {
    const {context:c,geometry:g}=surfaces.get(canvas);return [c,g];
  }
  function refreshLayouts(){
    if(!layoutDirty)return;layoutDirty=false;
    // Read every canvas before any style write; no forced layout between boards.
    const measured=[...canvases,$('transferCanvas')].map(canvas=>[canvas,geometry(canvas)]);
    const dpr=Math.min(renderBudget.pixelRatio,devicePixelRatio||1);
    for(const [canvas,g] of measured){
      const width=Math.max(1,Math.round(g.w*dpr)),height=Math.max(1,Math.round(g.h*dpr));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      const context=canvas.getContext('2d');context.setTransform(dpr,0,0,dpr,0,0);g.dpr=dpr;g.quality=renderBudget.quality;
      surfaces.set(canvas,{context,geometry:g});
    }
    const g=surfaces.get(canvases[0]).geometry;
    [...$('slotTargets').children].forEach((button,i)=>{const[x,y]=R.positions[i];button.style.left=g.cx+x*g.sx+'px';button.style.top=g.cy+y*g.sy+'px';button.style.width=g.size*1.15+'px';button.style.height=g.size*1.15+'px';});
  }
  function drawBoard(index) {
    const canvas=canvases[index], [c,g]=resizeCanvas(canvas),display=renderMatch||match,s=display.sides[index];
    SpaceTowerRankedArt.draw(c,g,s,display,index,sprite);
  }
  function drawTransfers(){
    const canvas=$('transferCanvas'),[c,g]=resizeCanvas(canvas);c.clearRect(0,0,g.w,g.h);
    const display=renderMatch||match;
    for(const e of display.transferEvents){const q=(display.elapsed-e.at)/.65;if(q<0||q>1)continue;const x=(e.side===0?.23:.77)*g.w+Math.sin(e.lineage*12)*28,y=(e.side===0?1-q:q)*g.h;c.save();c.globalAlpha=(1-q)*.8;c.fillStyle=e.side===0?'#8aefff':'#ffb1e2';c.shadowColor=c.fillStyle;c.shadowBlur=10;c.beginPath();c.moveTo(x,y+(e.side===0?-5:5));c.lineTo(x-3,y);c.lineTo(x+3,y);c.closePath();c.fill();c.restore();}
  }
  function drawBoards(){needsDraw=true;}
  function renderBoards(time){refreshLayouts();renderMatch=networkMatch&&networkStatus==='playing'?renderBuffer.sample(time):null;drawBoard(0);drawBoard(1);drawTransfers();if(!paused())battleAudio.update(renderMatch||match);hasDrawn=true;needsDraw=false;}
  async function selectSlot(index) {
    if(match.status!=='playing')return;
    if(tutorial&&(tutorial.step!==2||index!==Number(guideTarget()?.dataset.slot)))return;
    const u=match.sides[0].units[index];
    if(!u){selected=null;showStatus('召喚時會隨機選擇空位');updateUI();return;}
    if(selected===index){selected=null;updateUI();return;}
    if(selected!==null){
      const a=match.sides[0].units[selected];
      if(a && a.id===u.id && a.star===u.star){const result=await perform('merge',{from:selected,to:index});if(result.ok){selected=null;showStatus(`融合成功 · ${C.byId.get(result.id).name} ★${result.star}`);updateUI();drawBoards();guideAction('merge');return;}showStatus(result.reason);}
    }
    selected=index;updateUI();if(tutorial){positionGuide();guideTarget()?.focus({preventScroll:true});}
  }
  function slotAt(clientX,clientY){const rect=canvases[0].getBoundingClientRect(),g=geometry(canvases[0]);let found=-1,best=g.size*.85;R.positions.forEach(([x,y],i)=>{const dist=Math.hypot(clientX-rect.left-g.cx-x*g.sx,clientY-rect.top-g.cy-y*g.sy);if(dist<best){found=i;best=dist;}});return found;}
  $('slotTargets').innerHTML=Array.from({length:13},(_,i)=>`<button class="slot-target" data-slot="${i}" type="button" aria-label="欄位 ${i+1}"></button>`).join('');
  $('slotTargets').addEventListener('click',event=>{const b=event.target.closest('[data-slot]');if(b && performance.now()>suppressClickUntil)selectSlot(Number(b.dataset.slot));});
  $('slotTargets').addEventListener('pointerdown',event=>{if(tutorial&&tutorial.step!==2)return;const b=event.target.closest('[data-slot]');if(b)pointer={index:Number(b.dataset.slot),x:event.clientX,y:event.clientY};});
  window.addEventListener('pointerup',async event=>{if(!pointer)return;const start=pointer;pointer=null;if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>8){suppressClickUntil=performance.now()+400;const to=slotAt(event.clientX,event.clientY);if(to>=0 && to!==start.index){const result=await perform('merge',{from:start.index,to});selected=null;showStatus(result.ok?`融合成功 · ${C.byId.get(result.id).name} ★${result.star}`:result.reason);updateUI();drawBoards();if(result.ok)guideAction('merge');}}});
  window.addEventListener('pointercancel',()=>pointer=null);
  $('upgradeButtons').innerHTML=Object.entries(upgradeLabels).map(([key,[,label]])=>`<button class="upgrade-button" data-upgrade="${key}" type="button"><span class="upgrade-art" aria-hidden="true"><svg viewBox="0 0 48 48"><path class="upgrade-art-frame" d="m24 2 19 11v22L24 46 5 35V13Z"/>${upgradeArt[key]}</svg></span><span class="upgrade-name"><b>${label}</b><small class="upgrade-level">Lv.0</small></span><span class="upgrade-cost">${coinIcon}<strong class="upgrade-cost-value">10</strong></span></button>`).join('');
  $('upgradeButtons').addEventListener('click',async event=>{const b=event.target.closest('[data-upgrade]');if(!b)return;const key=b.dataset.upgrade,result=await perform('upgrade',{key});
    if(result.ok&&result.health){const h=result.health;showStatus(`${C.byId.get(h.id).name} HP ${h.before} → ${h.after} · 核心 +${h.delta}`);}
    else showStatus(result.ok?`${upgradeLabels[key][1]}強化 Lv.${match.sides[0].upgrades[key]}`:result.reason);
    if(result.ok&&!matchMedia('(prefers-reduced-motion: reduce)').matches)b.animate([{boxShadow:'inset 0 0 24px currentColor',filter:'brightness(1.55)'},{boxShadow:'inset 0 0 0 transparent',filter:'brightness(1)'}],{duration:400});
    updateUI();if(result.ok)battleAudio.play('upgrade',key);if(result.ok&&key==='physical')guideAction('upgrade');});
  function setDrawer(open){drawerOpen=open;$('upgradeDrawer').hidden=!open;$('drawerToggle').setAttribute('aria-expanded',String(open));document.querySelector('.ranked-app').classList.toggle('drawer-open',open);if(open)guideAction('drawer');}
  $('drawerToggle').addEventListener('click',()=>setDrawer(!drawerOpen));$('closeDrawer').addEventListener('click',()=>setDrawer(false));
  document.addEventListener('pointerdown',event=>{if(!tutorial&&drawerOpen&&!event.target.closest('#upgradeDrawer,#drawerToggle,#summonButton,dialog'))setDrawer(false);});
  $('upgradeDrawer').addEventListener('keydown',event=>{if(!tutorial&&event.key==='Escape'){setDrawer(false);$('drawerToggle').focus();}});

  $('summonButton').addEventListener('click',async()=>{const result=await perform('summon');showStatus(result.ok?`已部署 ${C.byId.get(result.id).name} ★1`:result.reason);updateUI();drawBoards();if(result.ok)guideAction('summon');});
  $('pauseButton').addEventListener('click',()=>{manualPaused=!manualPaused;lastTime=0;updateUI();});
  $('againButton').addEventListener('click',()=>{$('resultDialog').close();beginMatch();});
  $('finishMatchButton').addEventListener('click',()=>{
    $('resultDialog').close();networkMatch=false;networkStatus='idle';preparing=true;renderMatch=null;draft=[...loadout];$('pauseButton').hidden=false;reset();openLoadout();
  });
  function renderDraft(){
    $('draftRack').innerHTML=draft.map((id,i)=>loadoutCard(id,i,i===draftIndex)).join('');portraits($('draftRack'));
    const total=draft.filter(Boolean).reduce((sum,id)=>sum+C.health(id),0),e=entry();
    $('draftTotal').textContent=number(total);$('rulesCoreHp').textContent=number(total);
    $('coreComposition').innerHTML=draft.filter(Boolean).map(id=>`<i style="--segment:${C.byId.get(id).color};flex:${C.health(id)}"></i>`).join('');
    document.querySelector('.formation-heading b').textContent=draft.filter(Boolean).length;
    $('recruitProgressText').textContent=e.normalRound?`一般模式 ${e.normalRound-1}/2 · 再完成一場領一座`:`已擁有 ${e.count} 種${e.ranked?' · 已達五種門檻':' · 完成教學領取兩座'}`;
    $('applyLoadout').querySelector('span').textContent=saveError?'進度讀取失敗':e.ranked?'開始配對':e.normalRound?'前往一般模式':'開始新手教學';
    $('applyLoadout').disabled=saveError;
    $('replacementLabel').textContent=`替換第 ${draftIndex+1} 座`;
    $('slotInstruction').textContent=`第 ${draftIndex+1} 座 · ${C.byId.get(draft[draftIndex])?.name||'尚未解鎖'}`;
    $('ruleFormation').innerHTML=draft.map(id=>id?`<span style="--turret:${C.byId.get(id).color}">${portrait(id)}<small>${C.health(id)}</small></span>`:'<span class="rule-empty">?</span>').join('<i>＋</i>');portraits($('ruleFormation'));
    const filter=$('turretFilter').value,query=$('turretSearch').value.trim().toLowerCase();
    const turrets=C.turrets.filter(d=>(!query||L.text(d.name).toLowerCase().includes(query)||d.id.includes(query))&&(filter==='all'||filter==='regular'&&!d.vipExclusive||d.rarity===filter||filter==='tank'&&['tank','bruiser'].includes(d.healthRole)));
    $('catalogCount').textContent=turrets.length;
    turrets.sort((a,b)=>Number(availableIds().includes(b.id))-Number(availableIds().includes(a.id)));
    $('catalogGrid').innerHTML=turrets.map(d=>`<button class="catalog-card ${draft.includes(d.id)?'picked':''} ${d.vipExclusive?'catalog-'+d.rarity:''}" type="button" data-pick="${d.id}" style="--turret:${d.color}" aria-label="${escape(d.name)}，${grade(d)}，${C.roles[d.healthRole]}，HP ${C.health(d)}${!availableIds().includes(d.id)?'，尚未擁有':draft.includes(d.id)?'，已出戰':`，替換第 ${draftIndex+1} 座`}" ${!availableIds().includes(d.id)||draft.includes(d.id)&&draft[draftIndex]!==d.id?'disabled':''}><span class="catalog-portrait">${portrait(d.id)}</span><span class="catalog-copy"><b>${escape(d.name)}</b><small>${grade(d)} <i>·</i> ${availableIds().includes(d.id)?C.roles[d.healthRole]:'尚未擁有'}</small><span class="catalog-hp"><small>HP</small> <strong>${C.health(d)}</strong></span></span>${draft.includes(d.id)?'<span class="equipped-mark" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="m2 6 3 3 5-6"/></svg></span>':''}</button>`).join('')||'<p class="empty-catalog">沒有符合的砲台</p>';portraits($('catalogGrid'));
    if(preparationTab==='health')renderHealth();
  }
  function renderHealth(){
    const query=$('healthSearch').value.trim().toLowerCase(),sort=$('healthSort').value;
    const turrets=C.turrets.filter(d=>!query||L.text(d.name).toLowerCase().includes(query)||d.id.includes(query));
    const gradeOrder=(a,b)=>Number(a.vipExclusive||0)-Number(b.vipExclusive||0)||Number(a.rarity==='legendary')-Number(b.rarity==='legendary')||a.strengthGrade-b.strengthGrade;
    turrets.sort((a,b)=>sort==='hp'?C.health(b)-C.health(a)||gradeOrder(a,b):sort==='loadout'?Number(draft.includes(b.id))-Number(draft.includes(a.id))||gradeOrder(a,b):gradeOrder(a,b));
    const highestHp=Math.max(...C.turrets.map(d=>C.health(d)));
    $('healthRows').innerHTML=turrets.map(d=>`<tr class="${draft.includes(d.id)?'equipped-row':''}" style="--turret:${d.color}"><td><button class="health-turret" data-intel="${d.id}" aria-label="查看${escape(d.name)}基礎數值">${portrait(d.id)}<span><b>${escape(d.name)}</b><small>${grade(d)}${draft.includes(d.id)?' · 出戰':''}</small></span></button></td><td><span class="health-role">${C.roles[d.healthRole]}</span></td><td><strong>${C.health(d)}</strong><span class="health-comparison"><i style="width:${100*C.health(d)/highestHp}%"></i></span></td></tr>`).join('');
    $('healthEmpty').hidden=turrets.length>0;portraits($('healthRows'));
  }
  function setPreparationTab(tab){
    if(!preparing)return;preparationTab=tab;
    for(const button of document.querySelectorAll('[data-prep-tab]')){const active=button.dataset.prepTab===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$(button.getAttribute('aria-controls')).hidden=!active;}
    if(tab==='health')renderHealth();
  }
  function openLoadout(index=0){if(!preparing)return;draftIndex=index;$('turretSearch').value='';$('turretFilter').value='all';document.body.classList.add('is-preparing');renderDraft();setPreparationTab('formation');if(!$('loadoutDialog').open)$('loadoutDialog').showModal();}
  $('draftRack').addEventListener('click',event=>{const b=event.target.closest('[data-loadout-index]');if(b&&preparing){draftIndex=Number(b.dataset.loadoutIndex);setPreparationTab('formation');renderDraft();$('draftRack').querySelector(`[data-loadout-index="${draftIndex}"]`).focus({preventScroll:true});}});
  $('catalogGrid').addEventListener('click',event=>{const b=event.target.closest('[data-pick]');if(!b||b.disabled||!preparing||!availableIds().includes(b.dataset.pick))return;draft[draftIndex]=b.dataset.pick;if(N.validLoadout(progress,draft))persistDraft();renderDraft();$('catalogGrid').querySelector(`[data-pick="${draft[draftIndex]}"]`)?.focus({preventScroll:true});});
  $('turretSearch').addEventListener('input',renderDraft);$('turretFilter').addEventListener('change',renderDraft);
  $('applyLoadout').addEventListener('click',()=>{if(!preparing||saveError)return;const e=entry();if(!e.tutorialClaimed){startTutorial();return;}if(!e.ranked){location.href='index.html?recruit=campaign&lang='+L.language+'&dev=0';return;}if(N.validLoadout(progress,draft)&&persistDraft())beginMatch(draft);else renderDraft();});
  $('loadoutDialog').addEventListener('cancel',event=>event.preventDefault());
  $('resultDialog').addEventListener('cancel',event=>event.preventDefault());
  for(const button of document.querySelectorAll('[data-prep-tab]')){
    button.addEventListener('click',()=>setPreparationTab(button.dataset.prepTab));
    button.addEventListener('keydown',event=>{const tabs=[...document.querySelectorAll('[data-prep-tab]')],index=tabs.indexOf(button);let next;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
      event.preventDefault();setPreparationTab(tabs[next].dataset.prepTab);tabs[next].focus();});
  }
  $('healthSearch').addEventListener('input',renderHealth);$('healthSort').addEventListener('change',renderHealth);
  $('prepWinReward').textContent=R.resultFor(1200,1200,{wins:0,losses:0},'win').obsidian;
  $('prepLossReward').textContent=R.resultFor(1200,1200,{wins:0,losses:0},'loss').obsidian;
  for(const dialog of dialogs){dialog.addEventListener('click',event=>{if(event.target.closest('[data-close]'))dialog.close();});dialog.addEventListener('close',()=>{lastTime=0;});}
  document.addEventListener('visibilitychange',()=>{lastTime=0;accumulator=0;});
  function rewardCard(id){const d=C.byId.get(id);return `<article style="--turret:${d.color}">${portrait(id)}<small>G1 · ${C.roles[d.healthRole]}</small><b>${d.name}</b><strong>HP ${C.health(d)}</strong></article>`;}
  function renderRecruitPlan(){
    const n=N.normalize(progress.onboarding),steps=[{label:'初始持有',ids:['basic_cannon'],done:true},{label:'完成互動教學',ids:N.starterIds.slice(1,3),done:n.tutorialClaimed},{label:'完成第 1 場一般模式',ids:['rookie_guard'],done:n.normalMatches.length>0},{label:'完成第 2 場一般模式',ids:['rookie_chill'],done:n.normalMatches.length>1}];
    $('recruitMilestones').innerHTML=steps.map((s,i)=>`<article class="recruit-milestone ${s.done?'done':''}"><span class="milestone-number">${s.done?'✓':String(i).padStart(2,'0')}</span><div><header><b>${s.label}</b><small>${s.done?'已領取':'待完成'}</small></header><div class="milestone-turrets">${s.ids.map(id=>`<span>${portrait(id)}<span>${C.byId.get(id).name}<small>G1 · HP ${C.health(id)}</small></span></span>`).join('')}</div></div></article>`).join('');portraits($('recruitMilestones'));
    $('recruitStartButton').textContent=!n.tutorialClaimed?'開始互動教學':entry().normalRound?'前往一般模式 '+entry().normalRound+'/2':'返回備戰';$('replayTutorial').hidden=!n.tutorialClaimed;
  }
  $('recruitPlanButton').addEventListener('click',()=>{renderRecruitPlan();$('recruitDialog').showModal();});
  $('recruitStartButton').addEventListener('click',()=>{$('recruitDialog').close();if(!entry().tutorialClaimed)startTutorial();else if(entry().normalRound)location.href='index.html?recruit=campaign&lang='+L.language;});
  $('replayTutorial').addEventListener('click',()=>{$('recruitDialog').close();startTutorial();});
  function startTutorial(){
    if(saveError)return;
    $('loadoutDialog').close();preparing=false;document.body.classList.remove('is-preparing');setDrawer(false);matchKind='tutorial';reset(defaults);match.seed=9;
    tutorial={step:0};$('leaveTutorial').hidden=!entry().tutorialClaimed;$('guideLayer').hidden=false;document.body.classList.add('in-recruit-guide');document.querySelector('.ranked-header .back').hidden=!entry().tutorialClaimed;$('pauseButton').hidden=true;setGuideStep(0);
  }
  const guideCopy=[['召喚第一座砲台','點亮下方召喚鈕，部署你的第一座砲台。'],['再召喚一座','再點一次召喚；教學先提供相同種類，練習融合。'],['合併同種同星砲台','點選一座，再點另一座；也可以直接拖曳到另一座上。'],['打開戰鬥強化','點下方強化鈕，查看本場可以提升的能力。'],['提升物理攻擊','點亮物攻卡片，花費 10 金幣完成第一次強化。'],['觀察砲台自動攻擊','砲台會自動開火。擊破敵機，就會立即把它送到對面。'],['敵機已送往對手','擊破一隻，對面就出現一隻；同種同星融合後會隨機變換種類。']];
  function guideTarget(){
    if(!tutorial)return null;
    if(tutorial.step<2)return $('summonButton');
    if(tutorial.step===2){const units=match.sides[0].units,source=units[selected],slot=units.findIndex((u,i)=>u&&i!==selected&&(!source||u.id===source.id&&u.star===source.star));return $('slotTargets').querySelector(`[data-slot="${slot}"]`);}
    return tutorial.step===3?$('drawerToggle'):tutorial.step===4?document.querySelector('[data-upgrade="physical"]'):tutorial.step===5?$('playerCanvas'):$('opponentCanvas');
  }
  function positionGuide(){
    if(!tutorial)return;const target=guideTarget();if(!target)return;const r=target.getBoundingClientRect(),pad=tutorial.step===2?6:3;
    Object.assign($('guideSpotlight').style,{left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});
    const cx=r.left+r.width/2,cy=r.top+r.height/2,pointing=tutorial.step<5,merging=tutorial.step===2,chosen=merging&&selected!==null;
    for(const id of ['guideHand','guideTapRing','guideTargetLabel'])$(id).toggleAttribute('hidden',!pointing);
    // The downward-facing SVG fingertip is (25.5,43.75) in its 48-unit viewBox.
    // Anchor that point to the target centre; scaling animates around the fingertip.
    Object.assign($('guideHand').style,{left:cx-42*25.5/48+'px',top:cy-42*43.75/48+'px'});
    Object.assign($('guideTapRing').style,{left:cx+'px',top:cy+'px'});
    $('guideTargetLabel').textContent=merging?(chosen?'② 再點這座':'① 先點這座'):tutorial.step<2?'點擊召喚':tutorial.step===3?'打開強化':'點擊物攻';
    Object.assign($('guideTargetLabel').style,{left:Math.max(48,Math.min(innerWidth-48,cx))+'px',top:Math.max(8,r.top-55)+'px'});
    $('guideMergeLink').toggleAttribute('hidden',!chosen);$('guideSelected').hidden=!chosen;
    if(merging){
      const phase=chosen?2:1;
      if(tutorial.mergePhase!==phase){tutorial.mergePhase=phase;$('guideTitle').textContent=chosen?'再點另一座，完成融合':'先選第一座砲台';$('guideText').textContent=chosen?'第一座已選取。點亮框中的另一座 ★1，融合成隨機種類的 ★2 砲台。':'點「①」亮框中的砲台，選為融合來源。接著會標示第二座。';}
    }
    if(chosen){
      const source=$('slotTargets').querySelector(`[data-slot="${selected}"]`).getBoundingClientRect(),sx=source.left+source.width/2,sy=source.top+source.height/2,dx=cx-sx,dy=cy-sy,distance=Math.max(1,Math.hypot(dx,dy)),start=Math.min(source.width/2+8,distance*.25),end=Math.min(r.width/2+10,distance*.25);
      $('guideMergeLink').setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);$('guideMergePath').setAttribute('d',`M${sx+dx/distance*start} ${sy+dy/distance*start} L${cx-dx/distance*end} ${cy-dy/distance*end}`);
      Object.assign($('guideSelected').style,{left:sx+'px',top:source.top-16+'px'});
    }
    const coach=$('guideCoach'),board=$('opponentCanvas').getBoundingClientRect();coach.style.width=Math.min(360,innerWidth-28)+'px';coach.style.left=Math.max(14,(innerWidth-Math.min(360,innerWidth-28))/2)+'px';
    coach.style.top=(tutorial.step===6?Math.min(innerHeight-coach.offsetHeight-90,$('playerCanvas').getBoundingClientRect().top):Math.max(62,board.top+8))+'px';
  }
  function setGuideStep(step){
    if(!tutorial)return;tutorial.step=step;tutorial.mergePhase=null;selected=null;
    $('guideStepLabel').textContent=`首航訓練 ${String(step+1).padStart(2,'0')} / 07`;$('guideTitle').textContent=guideCopy[step][0];$('guideText').textContent=guideCopy[step][1];
    $('guideProgress').innerHTML=guideCopy.map((_,i)=>`<i class="${i<=step?'done':''}"></i>`).join('')+(step===6?'<button id="finishGuide" class="primary-button">完成教學</button>':'');
    if(step===5){setDrawer(false);for(const s of match.sides){s.wave=1;s.spawnRemaining=0;s.spawnTimer=999;}const enemy=R.spawn(match,0,{kind:'basic'});enemy.hp=enemy.maxHp=3;enemy.x=0;enemy.y=-.5;}
    $('finishGuide')?.addEventListener('click',finishTutorial);updateUI();drawBoards();positionGuide();
    if(step<5)guideTarget()?.focus({preventScroll:true});
  }
  function guideAction(action){if(!tutorial)return;const s=tutorial.step;if(action==='summon'&&s<2)setGuideStep(s+1);else if(action==='merge'&&s===2)setGuideStep(3);else if(action==='drawer'&&s===3)setGuideStep(4);else if(action==='upgrade'&&s===4)setGuideStep(5);}
  function finishTutorial(){
    if(!tutorial||tutorial.step!==6)return;tutorial=null;$('guideLayer').hidden=true;document.body.classList.remove('in-recruit-guide');manualPaused=true;
    $('tutorialRewards').innerHTML=N.starterIds.slice(1,3).map(rewardCard).join('');portraits($('tutorialRewards'));
    $('tutorialSaveStatus').textContent=entry().tutorialClaimed?'已領過的砲台不會重複發放。':'兩座 G1 砲台，加入你的軍械庫。';$('claimTutorialButton').textContent=entry().tutorialClaimed?'返回備戰':'領取兩座砲台';$('recruitClaimDialog').showModal();
  }
  $('claimTutorialButton').addEventListener('click',()=>{
    const reward=previewScenario?[]:saveRecruit(p=>{N.completeTutorial(p);return N.claimTutorial(p);});
    if(reward===null){$('tutorialSaveStatus').textContent='無法儲存進度，獎勵尚未領取。請重試。';return;}
    $('recruitClaimDialog').close();document.querySelector('.ranked-header .back').hidden=false;$('pauseButton').hidden=false;preparing=true;refreshDraft();openLoadout();
  });
  $('recruitClaimDialog').addEventListener('cancel',event=>event.preventDefault());
  $('leaveTutorial').addEventListener('click',()=>{if(!entry().tutorialClaimed)return;tutorial=null;$('guideLayer').hidden=true;document.body.classList.remove('in-recruit-guide');$('pauseButton').hidden=false;setDrawer(false);preparing=true;refreshDraft();openLoadout();});
  // Guided steps use real combat controls. Only the current action can advance them.
  document.addEventListener('click',event=>{
    if(!tutorial||event.target.closest('#leaveTutorial,#finishGuide'))return;
    const step=tutorial.step,allowed=step<2?'#summonButton':step===2?'[data-slot]':step===3?'#drawerToggle':step===4?'[data-upgrade="physical"]':'#guideCoach';
    if(!event.target.closest(allowed)){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  $('healthRows').addEventListener('click',event=>{
    const button=event.target.closest('[data-intel]');if(!button)return;const d=C.byId.get(button.dataset.intel),damage=32*(d.rankedDamage??d.damage),rate=d.cooldown?1/d.cooldown:(d.rankedSpeed??d.speed)/.65;
    $('turretIntelBody').innerHTML=`<div class="intel-portrait" style="--turret:${d.color}">${portrait(d.id)}</div><span class="eyebrow">${grade(d)} · ${C.roles[d.healthRole]}</span><h2 id="turretIntelTitle">${escape(d.name)}</h2><p>${escape(d.id==='basic_cannon'?'初始持有的標準砲台，發射單發物理彈。':d.description)}</p><div class="intel-values"><span>排位初始 HP<b>${C.health(d)}</b></span><span>${d.damageType==='magic'?'魔法':'物理'}單發傷害<b>${d.antimatter?Math.round(d.antimatter*100)+'% 最大 HP':damage.toFixed(2).replace(/\.00$/,'')}</b></span><span>初始攻速<b>${rate.toFixed(2)}<small> 次 / 秒</small></b></span></div><p class="intel-note">${d.acquisition||'工坊收集碎片或對應商城取得'}${d.id==='basic_cannon'?' · 一般模式原始核心 HP 10、物攻 10、魔攻 0、攻速 4.17 次 / 秒。':''}</p>`;
    portraits($('turretIntelBody'));$('turretIntelDialog').showModal();
  });
  const resizeObserver=new ResizeObserver(()=>{layoutDirty=true;drawBoards();});
  for(const canvas of [...canvases,$('transferCanvas')])resizeObserver.observe(canvas);
  window.addEventListener('resize',()=>{layoutDirty=true;drawBoards();});
  document.addEventListener('visibilitychange',()=>{lastTime=0;battleAudio.setActive(!document.hidden&&!manualPaused);if(!document.hidden){layoutDirty=true;drawBoards();}});
  window.addEventListener('pagehide',()=>battleAudio.setActive(false));
  function frame(time){
    battleAudio.setActive(!document.hidden&&!manualPaused);
    if(!lastTime)lastTime=time;const dt=Math.min(.1,(time-lastTime)/1000);lastTime=time;
    if(!networkMatch&&!paused()&&match.status==='playing'){accumulator+=dt;while(accumulator>=.05){R.tick(match,.05,{opponentAI:matchKind!=='tutorial'});accumulator-=.05;}}
    if($('matchmakingDialog').open&&networkStatus==='searching'){const seconds=Math.max(0,Math.floor((time-queueStarted)/1000));setText($('matchingElapsed'),String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'));}
    if(tutorial){if(tutorial.step===5&&match.sides[0].sent>0)setGuideStep(6);positionGuide();}
    if(!document.hidden&&!preparing&&!modalOpen()&&time-uiTime>120){updateUI();uiTime=time;}
    const active=!paused()&&match.status==='playing';
    if(!document.hidden&&(active||needsDraw)&&(!hasDrawn||layoutDirty||!modalOpen()&&!preparing)&&renderBudget.shouldDraw(time,active)){
      const start=performance.now();renderBoards(time);if(active&&renderBudget.record(performance.now()-start,time,dt*1000))layoutDirty=true;
    }
    requestAnimationFrame(frame);
  }
  window.SpaceTowerRankedPreview=Object.freeze({snapshot:()=>JSON.parse(JSON.stringify(match)),reset:()=>reset(),setPaused:value=>{manualPaused=!!value;updateUI();}});
  refreshDraft();reset();
  const guidePreview=['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('guidePreview')==='merge';
  if(guidePreview&&!saveError){startTutorial();R.summon(match,0);R.summon(match,0);setGuideStep(2);}
  else if(previewScenario){
    networkPreview=true;
    if(['prep','archive','rules'].includes(showcase)){openLoadout();setPreparationTab(showcase==='archive'?'health':showcase==='rules'?'rules':'formation');}
    else if(showcase==='training'){startTutorial();}
    else{
      const rules=SpaceTowerMatchRules;let seed=1;while(rules.botProfile(1200,seed).difficulty!==(showcase==='challenging'?'challenging':'gentle'))seed++;
      const bot=rules.botProfile(1200,seed),army=rules.botLoadout(1200,defaults,seed,bot);
      match=R.create({loadout:defaults,opponentLoadout:army,seed:seed+991,ratings:[1200,bot.rating],bots:[null,bot]});
      for(let i=0;i<5;i++){R.summon(match,0);R.summon(match,1);}preparing=false;
      $('opponentName').textContent=rules.botName(seed+23);$('opponentRating').textContent=number(bot.rating)+' 杯';
      document.querySelector('.ranked-title small').textContent='本機預覽';
      if(showcase==='comeback'){
        const side=match.sides[0];side.units.fill(null);side.lost=5;side.coins=0;
        for(let i=0;i<10;i++){const angle=i*Math.PI*.2,e=R.spawn(match,0,{kind:'basic',angle});e.x=Math.cos(angle)*(.20+i*.018);e.y=Math.sin(angle)*(.20+i*.018);}
      }
      updateUI();drawBoards();
    }
  }
  else if(matchPreview){beginMatch(defaults);}
  else if(resultPreview){networkPreview=true;preparing=false;match.elapsed=93;match.status='finished';match.winner=resultPreview==='win'?0:1;match.sides[0].kills=146;match.results=[R.resultFor(1200,1200,practiceStreak,resultPreview),R.resultFor(1200,1200,practiceStreak,resultPreview==='win'?'loss':'win')];updateUI();}
  else if(entry().tutorialClaimed||saveError){openLoadout();if(entry().ranked)connection.recover();}else startTutorial();requestAnimationFrame(frame);
})();
