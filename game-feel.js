/* Battle presentation only: never changes simulation time, damage or rewards. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const copy = {
    zh: ['戰況播報', '敵艦接近', '決戰開始', '推進中', '關後接戰', '震動'],
    en: ['BATTLE RADIO', 'INCOMING', 'ENGAGE', 'ADVANCING', 'WAVES TO CONTACT', 'Haptics'],
    ja: ['戦況通信', '敵艦接近', '交戦開始', '進撃中', 'ウェーブ後に交戦', '振動'],
    ko: ['전황 방송', '적 접근', '교전 시작', '진격 중', '웨이브 후 교전', '진동'],
    ru: ['РАДИО', 'ПРИБЛИЖЕНИЕ', 'В БОЙ', 'ВПЕРЁД', 'ВОЛН ДО БОЯ', 'Вибрация'],
    es: ['RADIO', 'ENEMIGO CERCA', 'COMBATE', 'AVANZANDO', 'OLEADAS AL COMBATE', 'Vibración']
  };
  let haptics = true, lastHaptic = -Infinity, lastKey = '';
  try { haptics = localStorage.getItem('spaceTowerHaptics') !== 'off'; } catch {}
  function pulse(strong = false) {
    const now = performance.now();
    if (!haptics || reduced.matches || document.hidden || now - lastHaptic < (strong ? 180 : 65)) return;
    lastHaptic = now;
    try { navigator.vibrate?.(strong ? 22 : 10); } catch {}
  }
  function milestone(value) {
    const wave = Math.max(1, Math.floor(Number(value) || 1));
    const target = Math.ceil(wave / 50) * 50;
    const distance = target - wave;
    return { target, distance, warning: distance <= (target % 100 === 0 ? 10 : 5), progress: Math.min(1, wave / 1500) };
  }
  const strip = document.getElementById('battlePriorityStrip');
  const radio = document.createElement('div');
  radio.className = 'battle-radio';
  radio.innerHTML = '<i aria-hidden="true">◈</i><div><small></small><strong></strong></div><em></em>';
  strip.append(radio);
  const rail = document.createElement('aside');
  rail.className = 'battle-progress';
  rail.innerHTML = '<b>1500</b><div class="battle-progress-track" role="progressbar" aria-label="Wave / 1500" aria-valuemin="0" aria-valuemax="1500"><i></i><span style="bottom:33.333%">500</span><span style="bottom:66.666%">1000</span></div><strong></strong><button type="button" class="feel-haptics" aria-pressed="true">◉</button>';
  document.body.append(rail);
  const toggle = rail.querySelector('button');
  toggle.setAttribute('aria-pressed', String(haptics));
  toggle.addEventListener('click', () => {
    haptics = !haptics;
    toggle.setAttribute('aria-pressed', String(haptics));
    try { localStorage.setItem('spaceTowerHaptics', haptics ? 'on' : 'off'); } catch {}
    if (haptics) pulse();
  });
  function update(wave, mode, language, bossName) {
    const normal = mode !== 'trial';
    strip.classList.toggle('feel-normal', normal);
    rail.hidden = !normal;
    const key = `${wave}|${mode}|${language}|${bossName}`;
    if (key === lastKey) return;
    lastKey = key;
    const state = milestone(wave), t = copy[language] || copy.en;
    radio.classList.toggle('is-warning', state.warning);
    radio.querySelector('small').textContent = state.warning ? `WARNING · ${t[1]}` : t[0];
    radio.querySelector('strong').textContent = state.warning
      ? `${state.distance === 0 ? t[2] : `${state.distance} ${t[4]}`} · ${bossName || 'BOSS'}`
      : `${t[3]} · ${wave} / 1500`;
    radio.querySelector('em').textContent = `${state.target}`;
    rail.querySelector('.battle-progress-track').setAttribute('aria-valuenow', String(Math.min(1500, wave)));
    rail.querySelector('.battle-progress-track i').style.transform = `scaleY(${state.progress})`;
    rail.querySelector('strong').textContent = `${Math.round(state.progress * 100)}%`;
    toggle.title = t[5];
    toggle.setAttribute('aria-label', t[5]);
    rail.classList.toggle('is-complete', state.progress === 1);
  }
  // A slash silhouette and pointed rays read at speed without expensive blur layers.
  function impact(ctx, effect, scale) {
    const a = Math.max(0, effect.life / effect.maxLife);
    ctx.save();
    ctx.translate(effect.x, effect.y);
    ctx.rotate(-0.55);
    ctx.globalAlpha = a;
    ctx.fillStyle = effect.color;
    const reach = (26 + (1 - a) * 48) * scale;
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath(); ctx.moveTo(5 * scale, -3 * scale);
      ctx.lineTo(reach * (i % 2 ? 0.5 : 1), 0);
      ctx.lineTo(5 * scale, 3 * scale); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#fff9df';
    ctx.beginPath(); ctx.moveTo(-reach, 3 * scale); ctx.quadraticCurveTo(0, -16 * scale, reach, -3 * scale);
    ctx.quadraticCurveTo(0, 5 * scale, -reach, 3 * scale); ctx.fill();
    ctx.restore();
  }
  function feedback(button, event) {
    if (button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    pulse();
    if (reduced.matches) return;
    button.animate?.([{filter:'brightness(1.8)',scale:'.95'}, {filter:'brightness(1.15)',scale:'1.025'}, {filter:'brightness(1)',scale:'1'}], {duration:260});
    const r = button.getBoundingClientRect();
    const spark = document.createElement('i'); spark.className = 'feel-tap';
    spark.style.left = `${event.detail ? event.clientX : r.left + r.width / 2}px`;
    spark.style.top = `${event.detail ? event.clientY : r.top + r.height / 2}px`;
    // Put the effect in the top layer when a dialog owns the button.
    (button.closest('dialog') || document.body).append(spark);
    setTimeout(() => spark.remove(), 420);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest?.('button, [role="button"], [role="tab"]');
    if (button) feedback(button, event);
  }, true);
  window.spaceTowerFeel = { milestone, update, pulse, impact, reduced: () => reduced.matches };
})();
