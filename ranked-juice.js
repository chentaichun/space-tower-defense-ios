/* Ranked presentation layer: reacts to authoritative match state, never changes it. */
(() => {
  'use strict';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = key => globalThis.SpaceTowerLocale?.text?.(key) || key;
  // The vibration motor is a real battery and heat cost: at most one pulse per 1.2 s.
  let lastBuzz = -Infinity;
  const buzz = ms => { const now = performance.now(); if (now - lastBuzz < 1200) return; lastBuzz = now; try { if (!reduced()) navigator.vibrate?.(ms); } catch {} };
  let seen = new Set(), lastElapsed = -1, lastWave = 0, stars = new Map(), lastBurst = 0, liveCoins = 0, helpers = null;

  function reset() { seen = new Set(); stars = new Map(); lastWave = 0; lastBurst = 0; }
  function once(key) { if (seen.has(key)) return false; seen.add(key); if (seen.size > 600) seen = new Set([...seen].slice(-300)); return true; }

  function banner(board, kind, title, sub, ms = 1500) {
    const host = document.querySelector(board === 1 ? '.arena.opponent' : '.arena.player');
    if (!host) return;
    host.querySelector(`.rj-banner.rj-${kind}`)?.remove();
    const el = document.createElement('div');
    el.className = `rj-banner rj-${kind}`;
    el.innerHTML = '<i></i><b></b><small></small>';
    el.querySelector('b').textContent = T(title);
    el.querySelector('small').textContent = sub ? T(sub) : '';
    host.append(el);
    setTimeout(() => el.remove(), reduced() ? Math.min(ms, 900) : ms);
  }
  function flash(board, kind) {
    const host = document.querySelector(board === 1 ? '.arena.opponent' : '.arena.player');
    if (!host || reduced()) return;
    host.classList.remove(`rj-flash-${kind}`); void host.offsetWidth; host.classList.add(`rj-flash-${kind}`);
    setTimeout(() => host.classList.remove(`rj-flash-${kind}`), 700);
  }
  function coin(fromX, fromY) {
    const target = document.getElementById('coins');
    if (!target || liveCoins >= 8 || reduced()) return;
    const r = target.getBoundingClientRect(), el = document.createElement('i');
    el.className = 'rj-coin';
    el.style.left = fromX + 'px'; el.style.top = fromY + 'px';
    document.body.append(el); liveCoins++;
    const dx = r.left + r.width / 2 - fromX, dy = r.top + r.height / 2 - fromY;
    const anim = el.animate([
      { transform: 'translate(-50%,-50%) scale(.6)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx * .35}px), calc(-50% + ${dy * .35 - 40}px)) scale(1.1)`, opacity: 1, offset: .35 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.7)`, opacity: .9 }
    ], { duration: 560, easing: 'cubic-bezier(.4,0,.6,1)' });
    anim.onfinish = () => {
      el.remove(); liveCoins--;
      const chip = target.closest('.coin-balance') || target;
      chip.classList.remove('rj-coin-hit'); void chip.offsetWidth; chip.classList.add('rj-coin-hit');
    };
  }
  function gateCallout(count) {
    if (!helpers) return;
    const R = globalThis.SpaceTowerRanked, start = R.pathPoint(0), [x, y] = helpers.screen(0, start.x + .03, start.y);
    const el = document.createElement('div');
    el.className = 'rj-incoming';
    el.textContent = `+${count} ${T('來襲')}`;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.append(el);
    setTimeout(() => el.remove(), 1300);
    flash(0, 'gate');
  }

  function observe(m, h) {
    helpers = h;
    if (!m || !m.sides) return;
    if (m.elapsed < lastElapsed - .5) reset();
    lastElapsed = m.elapsed;
    const me = m.sides[0];

    // A2: every kill on my board sends a coin to the balance.
    let coins = 0;
    for (const e of me.impacts || []) {
      if (e.kind !== 'kill' || m.elapsed - e.born > .4 || !once(`k:${e.born}:${e.x}:${e.y}`)) continue;
      if (coins++ < 3) { const [x, y] = h.screen(0, e.x, e.y); coin(x, y); }
    }

    // A3: celebrate fresh high-star turrets.
    for (const u of me.units || []) {
      if (!u) continue;
      const before = stars.get(u.uid);
      stars.set(u.uid, u.star);
      if (before === undefined && u.star >= 5 && m.elapsed - (u.born || 0) < 1 && once(`s:${u.uid}`)) {
        banner(0, 'star', `★${u.star} 達成！`, '', 1400);
        h.audio?.('upgrade', 'magic'); buzz(30);
      }
    }

    // A4: counter-attacks in both directions.
    for (const e of m.transferEvents || []) {
      if (!e.counter || !once(`c:${e.side}:${e.at}:${e.lineage}`)) continue;
      if (e.side === 0) { banner(1, 'counter', '反擊發動！', '', 1200); flash(1, 'hit'); }
      else { banner(0, 'raid', '反擊來襲！', '', 1400); flash(0, 'raid'); buzz(40); }
    }

    // A5: boss waves get a warning on both boards.
    if (m.wave !== lastWave) {
      if (lastWave && m.wave % 10 === 0) {
        banner(0, 'boss', 'WARNING', `WAVE ${m.wave}`, 1800); banner(1, 'boss', 'WARNING', `WAVE ${m.wave}`, 1800);
        h.audio?.('loss', ''); buzz(50);
      }
      lastWave = m.wave;
    }

    // A6: a flood of transfers into my gate.
    const flood = (m.transferEvents || []).filter(e => e.side === 1 && m.elapsed - e.at < 1).length;
    if (flood >= 6 && m.elapsed - lastBurst > 2.5) { lastBurst = m.elapsed; gateCallout(flood); buzz(25); }
  }

  globalThis.SpaceTowerRankedJuice = Object.freeze({ observe, reset });
})();
