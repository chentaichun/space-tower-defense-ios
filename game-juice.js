/* Game juice: crit tiers, hit-stop, shatter, coin flight, boss cinematics,
   milestone bursts and the campaign interaction layer (overdrive, tap strike,
   supply pods, boss weak points). Loaded after every system that wraps the
   battle globals, so these wrappers sit on top of the final chain. */
(() => {
  const TEXT = {
    zh: { mega: '致命暴擊', overdrive: '超載', ready: '就緒', tap: '點擊轟炸', bossDown: '擊破', toContact: '關後接戰', breakthrough: '突破', supply: '補給艙', weak: '弱點', engage: '決戰開始', wave: '第 {n} 關' },
    en: { mega: 'CRITICAL!', overdrive: 'OVERDRIVE', ready: 'READY', tap: 'TAP STRIKE', bossDown: 'BOSS DOWN', toContact: 'WAVES TO CONTACT', breakthrough: 'BREAKTHROUGH', supply: 'SUPPLY POD', weak: 'WEAK POINT', engage: 'ENGAGE', wave: 'WAVE {n}' },
    ja: { mega: '会心の一撃', overdrive: 'オーバードライブ', ready: '準備完了', tap: 'タップ砲撃', bossDown: '撃破', toContact: 'ウェーブ後に交戦', breakthrough: '突破', supply: '補給ポッド', weak: '弱点', engage: '交戦開始', wave: 'ウェーブ {n}' },
    ko: { mega: '치명타!', overdrive: '오버드라이브', ready: '준비', tap: '탭 포격', bossDown: '격파', toContact: '웨이브 후 교전', breakthrough: '돌파', supply: '보급 포드', weak: '약점', engage: '교전 시작', wave: '웨이브 {n}' },
    ru: { mega: 'КРИТ!', overdrive: 'ФОРСАЖ', ready: 'ГОТОВО', tap: 'УДАР', bossDown: 'БОСС ПОВЕРЖЕН', toContact: 'ВОЛН ДО БОЯ', breakthrough: 'РУБЕЖ', supply: 'ПРИПАСЫ', weak: 'УЯЗВИМОСТЬ', engage: 'В БОЙ', wave: 'ВОЛНА {n}' },
    es: { mega: '¡CRÍTICO!', overdrive: 'SOBRECARGA', ready: 'LISTO', tap: 'ATAQUE', bossDown: 'JEFE DERROTADO', toContact: 'OLEADAS AL COMBATE', breakthrough: 'HITO', supply: 'SUMINISTRO', weak: 'PUNTO DÉBIL', engage: 'COMBATE', wave: 'OLEADA {n}' }
  };
  const t = (key, n) => ((TEXT[currentLanguage] || TEXT.en)[key] || TEXT.en[key]).replace('{n}', n);

  // Tunables. Interaction values only apply to the campaign run.
  const TUNE = {
    overdriveKills: 45, overdriveBossKill: 20, overdriveSeconds: 8, overdriveSpeed: 1.8,
    strikeCharges: 3, strikeRecharge: 4, strikeDamage: 3, strikeRadius: 74,
    weakEvery: 5, weakLife: 2.6, weakDamage: 4,
    podChance: 0.18, podMinWave: 6, podGold: 10, podObsidianChance: 0.3,
    megaCooldown: 0.45
  };
  const J = {
    freeze: 0, flash: 0, flashColor: '#ffffff', shards: [], coins: [], beams: [], lastMega: -Infinity,
    od: 0, odTime: 0, charges: TUNE.strikeCharges, recharge: 0,
    weakTimer: TUNE.weakEvery, weak: null, pod: null,
    warnedTarget: 0, lastCritSound: 0, lastCoinPulse: 0
  };
  const reduced = () => window.spaceTowerFeel?.reduced?.() === true;
  const campaign = () => activeRunMode !== 'trial';
  const live = () => gameStarted && running && !isPaused && !choosingCard;
  const now = () => performance.now() / 1000;

  /* ---------- sound ---------- */
  function sfxReady() { return typeof audioCtx !== 'undefined' && audioCtx && audioCtx.state === 'running'; }
  function tone(type, f0, f1, dur, gain, delay = 0) {
    if (!sfxReady()) return;
    const at = audioCtx.currentTime + delay, osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(f0, at); osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + dur);
    g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(gain, at + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g); g.connect(getSfxOutput()); osc.start(at); osc.stop(at + dur + 0.02);
  }
  function noise(dur, gain, freq, kind = 'highpass', delay = 0) {
    if (!sfxReady()) return;
    const at = audioCtx.currentTime + delay, src = audioCtx.createBufferSource(), f = audioCtx.createBiquadFilter(), g = audioCtx.createGain();
    src.buffer = makeNoiseBuffer(dur); f.type = kind; f.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(gain, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f); f.connect(g); g.connect(getSfxOutput()); src.start(at); src.stop(at + dur + 0.02);
  }
  const sound = {
    crit() { const n = now(); if (n - J.lastCritSound < 0.07) return; J.lastCritSound = n; noise(0.07, 0.09, 1600); tone('square', 220, 70, 0.09, 0.05); },
    mega() { noise(0.16, 0.14, 900); tone('sawtooth', 160, 40, 0.28, 0.09); tone('triangle', 1900, 900, 0.32, 0.03, 0.02); },
    strike() { tone('sawtooth', 1700, 140, 0.22, 0.05); noise(0.2, 0.12, 500, 'lowpass', 0.05); tone('sine', 90, 35, 0.3, 0.12, 0.05); },
    overdrive() { tone('sawtooth', 180, 880, 0.55, 0.05); [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, 0.4, 0.035, 0.12 + i * 0.06)); },
    siren() { for (let i = 0; i < 3; i++) { tone('square', 620, 880, 0.22, 0.025, i * 0.42); tone('square', 880, 620, 0.2, 0.025, i * 0.42 + 0.21); } },
    boss() { tone('sine', 70, 28, 1.1, 0.2); noise(0.9, 0.1, 260, 'lowpass'); tone('sawtooth', 110, 55, 0.7, 0.04, 0.05); },
    bossDown() { noise(0.4, 0.14, 700, 'lowpass'); [392, 523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f * 1.01, 0.5, 0.04, 0.1 + i * 0.07)); },
    pod() { [880, 1175, 1568].forEach((f, i) => tone('sine', f, f, 0.14, 0.05, i * 0.05)); },
    weak() { tone('triangle', 2400, 1200, 0.25, 0.06); noise(0.12, 0.12, 2000); tone('sine', 120, 40, 0.3, 0.12); }
  };
  const buzz = strong => window.spaceTowerFeel?.pulse?.(strong);

  /* ---------- helpers ---------- */
  function freeze(seconds) { if (reduced() || gameSpeed >= 3) return; J.freeze = Math.max(J.freeze, seconds); }
  function flash(alpha, color = '#ffffff') { if (reduced()) return; J.flash = Math.max(J.flash, alpha); J.flashColor = color; }
  function burst(x, y, color, count, speed = 260, size = 7) {
    const room = Math.max(0, (gameSpeed >= 5 ? 70 : 160) - J.shards.length);
    const n = Math.min(room, Math.round(count * (typeof getQualityParticleScale === 'function' ? getQualityParticleScale() : 1)));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = speed * (0.45 + Math.random() * 0.75);
      J.shards.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 18, size: size * (0.5 + Math.random() * 0.8), color, life: 0.55, maxLife: 0.55 });
    }
  }
  function goldTarget() {
    const el = document.getElementById('gold'), r = el?.getBoundingClientRect(), c = canvas.getBoundingClientRect();
    if (!r || !r.width) return null;
    return { x: (r.left + r.width / 2 - c.left) * (width / c.width), y: (r.top + r.height / 2 - c.top) * (height / c.height) };
  }
  function popup(x, y, text, color, extra = {}) {
    pushVisualEffect(scorePopups, 56, { x, y, vy: -20, life: 0.9, maxLife: 0.9, text, color, juice: 3, ...extra });
  }
  function banner(kind, title, sub, ms) {
    const el = document.createElement('div');
    el.className = `juice-banner juice-${kind}`;
    el.innerHTML = '<div class="juice-banner-band"></div><b></b><small></small>';
    el.querySelector('b').textContent = title;
    el.querySelector('small').textContent = sub || '';
    document.body.append(el);
    setTimeout(() => el.remove(), reduced() ? Math.min(ms, 1200) : ms);
    return el;
  }

  /* ---------- crit tiers ---------- */
  const baseCreateHit = createHit;
  createHit = function (x, y, enemy, damage, popupColor, critical, damageType) {
    baseCreateHit.apply(this, arguments);
    if (!critical) return;
    const p = scorePopups[scorePopups.length - 1];
    if (!p || !p.crit) return;
    const n = now();
    const mega = n - J.lastMega > TUNE.megaCooldown && (enemy?.isBoss || (enemy && enemy.type !== 'basic') || Math.random() < 0.14);
    const magic = damageType === 'magic';
    p.juice = mega ? 2 : 1;
    p.magic = magic;
    p.label = mega ? t('mega') : String(p.text).split(' ')[0];
    p.text = formatCompactNumber(damage);
    p.life = p.maxLife = mega ? 0.95 : 0.78;
    p.vy = mega ? -14 : -22;
    p.x += (Math.random() - 0.5) * 16;
    if (mega) {
      J.lastMega = n;
      freeze(0.055);
      flash(0.16, magic ? '#e7c2ff' : '#ffffff');
      burst(x, y, magic ? '#d79bff' : '#ffd15c', 10, 340, 6);
      sound.mega();
      buzz(true);
    } else sound.crit();
  };

  // A heavy crescent slash with a white core reads as a cut, not a sticker.
  function impact(c, e, scale) {
    const a = Math.max(0, e.life / e.maxLife), grow = 1 - a;
    const color = e.color || '#ffef9a';
    c.save();
    c.translate(e.x, e.y);
    c.globalCompositeOperation = 'lighter';
    c.rotate(-0.6 + (e.x % 7) * 0.08);
    const len = (44 + grow * 40) * scale, thick = (11 * a + 2) * scale;
    c.globalAlpha = a;
    c.fillStyle = color;
    c.beginPath(); c.moveTo(-len, thick * 0.3); c.quadraticCurveTo(0, -thick * 2.2, len, -thick * 0.3); c.quadraticCurveTo(0, thick * 0.6, -len, thick * 0.3); c.fill();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.moveTo(-len * 0.8, thick * 0.1); c.quadraticCurveTo(0, -thick * 1.2, len * 0.8, -thick * 0.1); c.quadraticCurveTo(0, thick * 0.2, -len * 0.8, thick * 0.1); c.fill();
    c.strokeStyle = color; c.lineWidth = 2 * scale;
    for (let i = 0; i < 4; i++) {
      const ang = i * Math.PI / 2 + 0.78, r0 = 8 * scale, r1 = (30 + grow * 46) * scale;
      c.globalAlpha = a * 0.8;
      c.beginPath(); c.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); c.lineTo(Math.cos(ang) * r1, Math.sin(ang) * r1); c.stroke();
    }
    c.globalAlpha = a * 0.5; c.lineWidth = 3 * scale * a;
    c.beginPath(); c.arc(0, 0, (10 + grow * 34) * scale, 0, Math.PI * 2); c.stroke();
    c.restore();
  }
  if (window.spaceTowerFeel) window.spaceTowerFeel.impact = impact;

  function drawJuicePopup(p) {
    const tier = p.juice, age = p.maxLife - p.life, s = textVisualScale;
    const pop = reduced() ? 1 : age < 0.09 ? 1.9 - (age / 0.09) * 1.05 : age < 0.18 ? 0.85 + ((age - 0.09) / 0.09) * 0.15 : 1;
    const alpha = clamp(p.life / (p.maxLife * 0.35), 0, 1);
    const size = (tier === 2 ? 38 : tier === 1 ? 27 : 15) * s;
    const palette = tier === 3 ? [p.color || '#ffffff', p.color || '#ffffff', '#08101e']
      : p.magic ? ['#ffffff', '#f0c8ff', '#9b55ff', '#1c0532']
        : tier === 2 ? ['#ffffff', '#ffd3db', '#ff2d55', '#2c0010'] : ['#ffffff', '#ffe970', '#ff9529', '#2a0e00'];
    ctx.save();
    ctx.globalAlpha = alpha;
    const margin = Math.min(width * 0.3, size * 2.2);
    ctx.translate(clamp(p.x, margin, width - margin), clamp(p.y, size * 1.4, height - size));
    if (tier !== 3) ctx.rotate(-0.07);
    ctx.scale(pop, pop);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.font = `${tier === 3 ? '900' : 'italic 900'} ${size}px "Arial Black", Impact, "Noto Sans TC", system-ui, sans-serif`;
    if (tier === 3) {
      ctx.strokeStyle = palette[2]; ctx.lineWidth = 4 * s; ctx.strokeText(p.text, 0, 0);
      ctx.fillStyle = palette[0]; ctx.fillText(p.text, 0, 0);
      ctx.restore();
      return;
    }
    const grad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5);
    grad.addColorStop(0, palette[0]); grad.addColorStop(0.45, palette[1]); grad.addColorStop(1, palette[2]);
    if (tier === 2 && !reduced()) { ctx.shadowBlur = 20 * s; ctx.shadowColor = palette[2]; }
    ctx.strokeStyle = palette[3]; ctx.lineWidth = (tier === 2 ? 8 : 6) * s;
    ctx.strokeText(p.text, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = grad; ctx.fillText(p.text, 0, 0);
    if (p.label) {
      ctx.font = `italic 900 ${(tier === 2 ? 13 : 10) * s}px "Arial Black", Impact, "Noto Sans TC", system-ui, sans-serif`;
      ctx.lineWidth = 4 * s; ctx.strokeText(p.label, -size * 0.2, -size * 0.72);
      ctx.fillStyle = palette[1]; ctx.fillText(p.label, -size * 0.2, -size * 0.72);
    }
    ctx.restore();
  }

  /* ---------- kills: shatter, coins, overdrive charge, boss down ---------- */
  const baseAward = awardEnemyGold;
  awardEnemyGold = function (enemy) {
    const fresh = enemy && !enemy.rewarded;
    const goldBefore = gold;
    baseAward.apply(this, arguments);
    if (!fresh || !enemy.rewarded) return;
    const color = enemy.strokeColor || enemy.color || '#7ff1ff';
    burst(enemy.x, enemy.y, color, enemy.isBoss ? 34 : enemy.type === 'basic' ? 5 : 9, enemy.isBoss ? 420 : 250, enemy.isBoss ? 13 : 7);
    if (!campaign()) return;
    const target = goldTarget();
    if (target && J.coins.length < 40) {
      for (let i = 0, n = enemy.isBoss ? 12 : 1; i < n; i++) {
        J.coins.push({ x0: enemy.x + (Math.random() - 0.5) * 20, y0: enemy.y, x1: target.x, y1: target.y, cx: enemy.x + (Math.random() - 0.5) * 140, cy: enemy.y - 80 - Math.random() * 60, life: 0.55 + i * 0.03, maxLife: 0.55 + i * 0.03 });
      }
    }
    if (J.odTime <= 0) {
      J.od = Math.min(TUNE.overdriveKills, J.od + (enemy.isBoss ? TUNE.overdriveBossKill : 1));
    }
    if (enemy.isBoss) {
      freeze(0.13);
      flash(0.32, '#fff3c4');
      addImpactShake(14);
      sound.bossDown();
      buzz(true);
      banner('down', t('bossDown'), `${enemy.title || 'BOSS'} · +${formatGold(Math.max(0, gold - goldBefore))}`, 1700);
    }
  };

  /* ---------- boss entrance ---------- */
  const baseSpawnBoss = spawnBossForWave;
  spawnBossForWave = function () {
    const before = new Set(enemies);
    baseSpawnBoss.apply(this, arguments);
    const boss = enemies.find(e => e.isBoss && !before.has(e));
    if (!boss) return;
    const major = wave % 50 === 0;
    bossWarning = null;
    const name = String(boss.title || 'BOSS').replace(/^BOSS\s*·\s*/i, '');
    const el = banner(major ? 'boss major' : 'boss', name, `${t('wave', wave)} · ${t('engage')}`, major ? 2300 : 1500);
    el.style.setProperty('--boss-color', boss.strokeColor || boss.color || '#ff5f86');
    sound.boss();
    if (major) sound.siren();
    buzz(true);
    flash(major ? 0.22 : 0.1, boss.strokeColor || '#ff5f86');
    J.weakTimer = 2.2;
  };

  /* ---------- radio escalation + warning sweep ---------- */
  const feel = window.spaceTowerFeel;
  if (feel?.update) {
    const baseRadio = feel.update;
    feel.update = function (waveValue, mode, language, bossName) {
      baseRadio.apply(this, arguments);
      const m = feel.milestone(waveValue);
      const radio = document.querySelector('.battle-radio');
      radio?.classList.toggle('is-engage', m.warning && m.distance === 0);
      const alert = mode !== 'trial' && m.warning;
      document.body.classList.toggle('juice-alert', alert);
      if (alert) {
        const lead = m.target % 100 === 0 ? 10 : 5;
        document.body.style.setProperty('--juice-alert', String(0.35 + 0.65 * (1 - m.distance / lead)));
      }
      if (alert && m.distance > 0 && J.warnedTarget !== m.target && gameStarted) {
        J.warnedTarget = m.target;
        banner('warning', 'WARNING', `${bossName || 'BOSS'} · ${m.distance} ${t('toContact')}`, 2100);
        sound.siren();
        buzz(true);
      }
    };
  }

  /* ---------- milestones ---------- */
  const baseNextWave = beginNextWave;
  beginNextWave = function () {
    baseNextWave.apply(this, arguments);
    if (!campaign() || !running) return;
    if ([500, 1000, 1500].includes(wave)) {
      banner('milestone', t('wave', wave), t('breakthrough'), 2200);
      sound.bossDown();
      flash(0.25, '#fff7b0');
      const rail = document.querySelector('.battle-progress');
      rail?.classList.remove('juice-burst'); void rail?.offsetWidth; rail?.classList.add('juice-burst');
    }
    if (!J.pod && wave >= TUNE.podMinWave && Math.random() < TUNE.podChance) spawnPod();
  };

  /* ---------- interaction layer ---------- */
  const ui = document.createElement('div');
  ui.className = 'juice-controls';
  ui.innerHTML = '<button type="button" class="juice-od" aria-label="Overdrive"><span class="juice-od-ring"></span><b></b><small></small></button><div class="juice-strike" aria-hidden="true"><i></i><i></i><i></i><small></small></div>';
  document.body.append(ui);
  const odButton = ui.querySelector('.juice-od'), pips = [...ui.querySelectorAll('.juice-strike i')];
  odButton.addEventListener('click', () => {
    if (!live() || !campaign() || J.odTime > 0 || J.od < TUNE.overdriveKills) return;
    J.odTime = TUNE.overdriveSeconds;
    J.od = 0;
    document.body.classList.add('juice-overdrive');
    sound.overdrive();
    buzz(true);
    flash(0.2, '#9ffcff');
    banner('odbanner', t('overdrive'), `×${TUNE.overdriveSpeed} SPEED · ${TUNE.overdriveSeconds}s`, 1100);
  });
  let lastUi = '';
  function renderUi() {
    const show = gameStarted && campaign() && running && !choosingCard && !document.querySelector('dialog[open]');
    if (ui.hidden !== !show) ui.hidden = !show;
    if (!show) return;
    const ready = J.odTime <= 0 && J.od >= TUNE.overdriveKills;
    const p = J.odTime > 0 ? J.odTime / TUNE.overdriveSeconds : J.od / TUNE.overdriveKills;
    const key = `${currentLanguage}|${ready}|${J.odTime > 0}|${Math.round(p * 50)}|${J.charges}|${Math.round(J.recharge * 10)}`;
    if (key === lastUi) return;
    lastUi = key;
    odButton.style.setProperty('--p', p.toFixed(3));
    odButton.classList.toggle('is-ready', ready);
    odButton.classList.toggle('is-active', J.odTime > 0);
    odButton.querySelector('b').textContent = J.odTime > 0 ? `${Math.ceil(J.odTime)}s` : ready ? t('ready') : `${Math.floor(p * 100)}%`;
    odButton.querySelector('small').textContent = t('overdrive');
    pips.forEach((pip, i) => pip.classList.toggle('on', i < J.charges));
    ui.querySelector('.juice-strike').style.setProperty('--r', J.charges < TUNE.strikeCharges ? (1 - J.recharge / TUNE.strikeRecharge).toFixed(2) : '1');
    ui.querySelector('.juice-strike small').textContent = t('tap');
  }

  const baseSpeed = getAttackSpeed;
  getAttackSpeed = function () {
    const value = baseSpeed.apply(this, arguments);
    return J.odTime > 0 && campaign() ? value * TUNE.overdriveSpeed : value;
  };

  function spawnPod() {
    const fromLeft = Math.random() < 0.5;
    J.pod = { x: fromLeft ? -30 : width + 30, y: height * (0.3 + Math.random() * 0.28), vx: (fromLeft ? 1 : -1) * Math.max(48, width / 7), t: 0 };
    sound.pod();
  }

  function strikeAt(x, y) {
    J.charges -= 1;
    if (J.recharge <= 0) J.recharge = TUNE.strikeRecharge;
    const radius = TUNE.strikeRadius * battleVisualScale;
    J.beams.push({ x, y, life: 0.32, maxLife: 0.32, r: radius });
    burst(x, y, '#9ffcff', 12, 300, 6);
    sound.strike();
    buzz(false);
    addImpactShake(8);
    const crit = Math.random() < getCritChance();
    const damage = Math.max(1, Math.round(getPhysicalDamage() * TUNE.strikeDamage * (crit ? getCritDamage() : 1)));
    for (const enemy of [...enemies]) {
      if (enemy.hp <= 0 || Math.hypot(enemy.x - x, enemy.y - y) > radius + enemy.size * 0.5) continue;
      applyEnemyDamage(enemy, damage, 'physical', enemy.x, enemy.y, '#9ffcff', crit);
    }
  }

  function hitWeak() {
    const w = J.weak, boss = w.boss;
    J.weak = null;
    const damage = Math.max(1, Math.round(getPhysicalDamage() * getCritDamage() * TUNE.weakDamage));
    J.lastMega = -Infinity;
    applyEnemyDamage(boss, damage, 'physical', w.x, w.y, '#ff5f86', true);
    const p = scorePopups[scorePopups.length - 1];
    if (p && p.juice) { p.juice = 2; p.label = t('weak'); }
    sound.weak();
    buzz(true);
    freeze(0.07);
    burst(w.x, w.y, '#ff4f7a', 18, 380, 8);
  }

  function collectPod() {
    const pod = J.pod;
    J.pod = null;
    const reward = applyBattleGoldMultiplier(Math.max(5, Math.round(TUNE.podGold * getWaveGoldScale(wave))));
    gold += reward;
    runStats.goldEarned += reward;
    popup(pod.x, pod.y - 22, `${t('supply')} +${formatGold(reward)}`, '#ffd36e');
    if (Math.random() < TUNE.podObsidianChance) {
      const granted = grantBattleObsidian(1, 'supplyPod');
      if (granted > 0) popup(pod.x, pod.y - 46, `+${granted} OBS`, '#c7b7ff');
    }
    burst(pod.x, pod.y, '#ffd36e', 16, 260, 6);
    sound.pod();
    buzz(false);
    updateHud();
  }

  window.addEventListener('pointerdown', event => {
    if (event.target !== canvas || !live() || !campaign()) return;
    const r = canvas.getBoundingClientRect();
    const x = (event.clientX - r.left) * (width / r.width), y = (event.clientY - r.top) * (height / r.height);
    const reach = 38 * battleVisualScale + 10;
    if (J.weak && Math.hypot(J.weak.x - x, J.weak.y - y) <= reach) return hitWeak();
    if (J.pod && Math.hypot(J.pod.x - x, J.pod.y - y) <= reach + 6) return collectPod();
    if (J.charges > 0) strikeAt(x, y);
  }, { passive: true });

  /* ---------- simulation hook: hit-stop + timers ---------- */
  const baseUpdate = update;
  update = function (dt) {
    if (J.freeze > 0 && live()) { J.freeze -= dt / Math.max(1, gameSpeed); return; }
    baseUpdate.apply(this, arguments);
    if (!live() || !campaign()) return;
    const realDt = dt / Math.max(1, gameSpeed);
    if (J.odTime > 0) {
      J.odTime = Math.max(0, J.odTime - dt);
      if (J.odTime === 0) document.body.classList.remove('juice-overdrive');
    }
    if (J.charges < TUNE.strikeCharges) {
      J.recharge -= dt;
      if (J.recharge <= 0) { J.charges += 1; J.recharge = J.charges < TUNE.strikeCharges ? TUNE.strikeRecharge : 0; }
    }
    if (J.pod) {
      J.pod.x += J.pod.vx * realDt;
      J.pod.t += realDt;
      if (J.pod.x < -60 || J.pod.x > width + 60) J.pod = null;
    }
    const boss = getActiveBoss();
    if (J.weak) {
      J.weak.life -= realDt;
      if (J.weak.life <= 0 || J.weak.boss.hp <= 0) J.weak = null;
      else { J.weak.x = J.weak.boss.x + Math.cos(J.weak.angle) * J.weak.boss.size * 0.32; J.weak.y = J.weak.boss.y + Math.sin(J.weak.angle) * J.weak.boss.size * 0.32; }
    } else if (boss) {
      J.weakTimer -= realDt;
      if (J.weakTimer <= 0) {
        J.weakTimer = TUNE.weakEvery;
        const angle = Math.random() * Math.PI * 2;
        J.weak = { boss, angle, x: boss.x, y: boss.y, life: TUNE.weakLife, maxLife: TUNE.weakLife };
      }
    }
  };

  /* ---------- drawing ---------- */
  function updateVisuals(dt) {
    J.flash = Math.max(0, J.flash - dt * 2.4);
    for (const s of J.shards) { s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= Math.pow(0.08, dt); s.vy *= Math.pow(0.08, dt); s.rot += s.vr * dt; s.life -= dt; }
    J.shards = J.shards.filter(s => s.life > 0);
    for (const c of J.coins) c.life -= dt;
    const landed = J.coins.some(c => c.life <= 0);
    J.coins = J.coins.filter(c => c.life > 0);
    if (landed && now() - J.lastCoinPulse > 0.12) {
      J.lastCoinPulse = now();
      const chip = document.getElementById('gold')?.closest('.chip');
      chip?.classList.remove('juice-coin'); void chip?.offsetWidth; chip?.classList.add('juice-coin');
    }
    for (const b of J.beams) b.life -= dt;
    J.beams = J.beams.filter(b => b.life > 0);
  }

  let lastDraw = performance.now();
  const baseDrawEffects = drawEffects;
  drawEffects = function () {
    // Juice popups are drawn here, so the legacy pass skips them.
    baseDrawEffects.apply(this, arguments);
    const n = performance.now(), dt = Math.min(0.1, (n - lastDraw) / 1000);
    lastDraw = n;
    updateVisuals(dt);
    const s = battleVisualScale;

    for (const b of J.beams) {
      const a = b.life / b.maxLife;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a;
      const g = ctx.createLinearGradient(b.x, 0, b.x, b.y);
      g.addColorStop(0, 'rgba(159,252,255,0)'); g.addColorStop(1, '#e8ffff');
      ctx.fillStyle = g;
      const w = (14 * a + 3) * s;
      ctx.fillRect(b.x - w / 2, 0, w, b.y);
      ctx.strokeStyle = '#9ffcff'; ctx.lineWidth = 4 * s * a;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (1.15 - a * 0.5), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#9ffcff';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (1 - a * 0.4), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    for (const sh of J.shards) {
      if (!isRenderVisible(sh.x, sh.y, 20)) continue;
      const a = sh.life / sh.maxLife;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(sh.x, sh.y); ctx.rotate(sh.rot);
      ctx.fillStyle = sh.color;
      const z = sh.size * s * (0.5 + a * 0.5);
      ctx.beginPath(); ctx.moveTo(z, 0); ctx.lineTo(-z * 0.6, z * 0.5); ctx.lineTo(-z * 0.4, -z * 0.6); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    for (const c of J.coins) {
      const k = 1 - c.life / c.maxLife, e = k * k;
      const x = (1 - e) * (1 - e) * c.x0 + 2 * (1 - e) * e * c.cx + e * e * c.x1;
      const y = (1 - e) * (1 - e) * c.y0 + 2 * (1 - e) * e * c.cy + e * e * c.y1;
      ctx.fillStyle = '#ffd64d'; ctx.strokeStyle = '#8a5a00'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 4.5 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }

    if (J.pod) {
      const p = J.pod, bob = Math.sin(p.t * 5) * 4;
      ctx.save();
      ctx.translate(p.x, p.y + bob);
      ctx.shadowBlur = 18; ctx.shadowColor = '#ffd36e';
      ctx.fillStyle = '#2a2108'; ctx.strokeStyle = '#ffd36e'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-20 * s, -13 * s, 40 * s, 26 * s, 9 * s); else ctx.rect(-20 * s, -13 * s, 40 * s, 26 * s);
      ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = '#ffd36e';
      ctx.fillRect(-3 * s, -9 * s, 6 * s, 18 * s); ctx.fillRect(-9 * s, -3 * s, 18 * s, 6 * s);
      const ring = (p.t * 1.4) % 1;
      ctx.globalAlpha = 1 - ring; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, (24 + ring * 18) * s, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    if (J.weak) {
      const w = J.weak, a = w.life / w.maxLife, pulse = 1 + Math.sin(n / 70) * 0.12;
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#ff4f7a'; ctx.fillStyle = 'rgba(255,79,122,.28)'; ctx.lineWidth = 3 * s;
      const r = 17 * s * pulse;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r + 9 * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a); ctx.stroke();
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 4; i++) { const ang = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r * 0.4, Math.sin(ang) * r * 0.4); ctx.lineTo(Math.cos(ang) * r * 1.35, Math.sin(ang) * r * 1.35); ctx.stroke(); }
      ctx.restore();
    }

    if (J.odTime > 0 && tower) {
      ctx.save();
      ctx.translate(tower.x, tower.y);
      ctx.rotate(n / 260);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = '#ffd36e'; ctx.lineWidth = 3 * s; ctx.setLineDash([10 * s, 8 * s]);
      ctx.beginPath(); ctx.arc(0, 0, tower.radius * 2.2 * s, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    for (const p of scorePopups) if (p.juice && isRenderVisible(p.x, p.y, 200)) drawJuicePopup(p);

    if (J.flash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = J.flash;
      ctx.fillStyle = J.flashColor;
      ctx.fillRect(-40, -40, width + 80, height + 80);
      ctx.restore();
    }
    renderUi();
  };

  /* ---------- run lifecycle ---------- */
  const baseReset = resetGame;
  resetGame = function () {
    baseReset.apply(this, arguments);
    Object.assign(J, { freeze: 0, flash: 0, shards: [], coins: [], beams: [], od: 0, odTime: 0, charges: TUNE.strikeCharges, recharge: 0, weakTimer: TUNE.weakEvery, weak: null, pod: null, warnedTarget: 0 });
    document.body.classList.remove('juice-overdrive', 'juice-alert');
    document.querySelectorAll('.juice-banner').forEach(el => el.remove());
    lastUi = '';
  };

  window.spaceTowerJuice = { TUNE, state: J, t };
})();
