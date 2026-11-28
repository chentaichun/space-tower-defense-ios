/* Normal-mode signature art for the special turrets.
   The normal-mode simulation (v2-features.js) keeps the ability state - ice walls, phoenix dives, missile
   pentagons, shuriken loops, sun rays, black holes, leviathans, time stop, entanglement, afterimages - and this
   file draws it with the same premium look as ranked, instead of particles (which are capped and far too small
   on phones). Drawing only: it never changes the simulation. */
(() => {
  const TAU = Math.PI * 2;
  const glowCache = new Map();
  // Cached soft glow sprite (radial gradient) per colour - cheap to stamp, no shadowBlur.
  function glow(color) {
    let g = glowCache.get(color); if (g) return g;
    g = document.createElement("canvas"); g.width = g.height = 64; const c = g.getContext("2d");
    const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, color); r.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = r; c.fillRect(0, 0, 64, 64); glowCache.set(color, g); return g;
  }
  const stamp = (c, color, x, y, r, alpha = 1) => { c.globalAlpha = alpha; c.drawImage(glow(color), x - r, y - r, r * 2, r * 2); };
  const unit = () => 30 * (typeof turretVisualScale === "number" ? turretVisualScale : 1);
  const now = () => performance.now() * 0.001;
  const ease = (k) => (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

  function hexPath(c, r) { c.beginPath(); for (let i = 0; i < 6; i += 1) { const a = i * TAU / 6; i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(r, 0); } c.closePath(); }

  // Ice Wall Barrier: an arc of hexagonal ice crystals across the approach, glinting, cracking near the end.
  function drawIceWalls(c, U, t) {
    if (typeof v2IceWalls === "undefined") return;
    for (const w of v2IceWalls) {
      const crack = w.life < .6 ? 1 - w.life / .6 : 0;
      for (let k = -2; k <= 2; k += 1) {
        const a = w.angle + k * 0.2, x = tower.x + Math.cos(a) * w.r, y = tower.y + Math.sin(a) * w.r, r = U * .42 * (1 + Math.sin(t * 2 + k) * .06);
        c.save(); c.globalCompositeOperation = "lighter"; stamp(c, "rgba(143,232,255,.55)", x, y, r * 2.2, .7); c.restore();
        c.save(); c.translate(x + Math.sin(t * 40 + k) * crack * 1.5, y); c.rotate(a + Math.PI / 6);
        c.fillStyle = "rgba(143,232,255,.45)"; c.strokeStyle = "#e8fbff"; c.lineWidth = 1.6; hexPath(c, r); c.fill(); c.stroke();
        if (crack) { c.strokeStyle = `rgba(255,255,255,${crack})`; c.lineWidth = 1; c.beginPath(); c.moveTo(-r * .6, -r * .2); c.lineTo(0, r * .1); c.lineTo(r * .5, -r * .4); c.stroke(); }
        c.restore();
      }
    }
  }

  // Tapered glowing ribbon from (hx,hy) backwards along angle `ang`: white-hot head to deep red tail.
  function streak(c, hx, hy, ang, len, width, alpha) {
    const tx = hx - Math.cos(ang) * len, ty = hy - Math.sin(ang) * len, nx = -Math.sin(ang), ny = Math.cos(ang);
    const g = c.createLinearGradient(hx, hy, tx, ty);
    g.addColorStop(0, "rgba(255,250,225,1)"); g.addColorStop(.12, "rgba(255,210,110,.95)"); g.addColorStop(.4, "rgba(255,110,40,.75)");
    g.addColorStop(.75, "rgba(190,30,15,.35)"); g.addColorStop(1, "rgba(120,10,5,0)");
    c.globalAlpha = alpha; c.fillStyle = g; c.beginPath();
    c.moveTo(hx + nx * width, hy + ny * width); c.quadraticCurveTo(hx + Math.cos(ang) * width * 1.4, hy + Math.sin(ang) * width * 1.4, hx - nx * width, hy - ny * width);
    c.lineTo(tx, ty); c.closePath(); c.fill();
  }
  // Phoenix fire wake: a scorched line that flares white-orange and cools to red within ~1.6 s, shedding embers.
  // Impact pools are the same burn, short and round.
  function drawPhoenixFlames(c, U, t) {
    if (typeof v2PhoenixFlames === "undefined" || !v2PhoenixFlames.length) return;
    c.save(); c.globalCompositeOperation = "lighter";
    const wakes = new Map();
    for (const f of v2PhoenixFlames) {
      const age = f.maxLife - f.life, heat = Math.max(0, 1 - age / f.maxLife), flare = Math.min(1, age / .06);
      const flick = .85 + .15 * Math.sin(t * 23 + f.seed * 7);
      stamp(c, "rgba(200,40,15,.6)", f.x, f.y, f.r * (1.2 + (1 - heat) * .5), heat * flare * .8);
      stamp(c, heat > .55 ? "rgba(255,200,110,.85)" : "rgba(255,110,40,.75)", f.x, f.y, f.r * .62 * flick, heat * heat * flare);
      for (let k = 0; k < 3; k += 1) {
        const q = (age * (1.1 + k * .3) + f.seed * .13 + k * .33) % 1, drift = (f.seed % 2 ? 1 : -1) * (k - 1);
        stamp(c, "rgba(255,190,100,.95)", f.x + Math.cos(f.heading + Math.PI / 2) * drift * f.r * .5 * q + Math.sin(t * 6 + k + f.seed) * 3,
          f.y - q * f.r * 1.6, U * .085 * (1 - q * .5), heat * (1 - q));
      }
      if (f.wake) { const list = wakes.get(f.wake) || []; list.push(f); wakes.set(f.wake, list); }
    }
    // The hot seam of each wake, drawn as one continuous line through its points.
    c.lineCap = "round"; c.lineJoin = "round";
    for (const list of wakes.values()) {
      if (list.length < 2) continue;
      const heat = Math.max(0, list[list.length - 1].life / list[list.length - 1].maxLife);
      for (const [w, col, a] of [[U * .55, "rgba(255,90,30,1)", .35], [U * .2, "rgba(255,235,170,1)", .8]]) {
        c.globalAlpha = heat * a; c.strokeStyle = col; c.lineWidth = w * (.6 + heat * .4); c.beginPath();
        list.forEach((f, i) => (i ? c.lineTo(f.x, f.y) : c.moveTo(f.x, f.y))); c.stroke();
      }
    }
    c.restore();
  }
  // Phoenix shell: a speed tail sized from the shell's velocity (shells live too briefly for a position history).
  function phoenixTail(c, bullet, t) {
    const U = unit(), ang = Math.atan2(bullet.vy, bullet.vx), speed = Math.hypot(bullet.vx, bullet.vy);
    const len = U * Math.min(3.2, 1.4 + speed / 400), seed = (bullet.v2Seed ??= Math.random() * 10);
    c.save(); c.globalCompositeOperation = "lighter";
    stamp(c, "rgba(255,120,40,.7)", bullet.x - Math.cos(ang) * len * .35, bullet.y - Math.sin(ang) * len * .35, U * .75, .55);
    streak(c, bullet.x, bullet.y, ang + Math.sin(t * 30 + seed) * .05, len * (.9 + .1 * Math.sin(t * 41 + seed)), U * .3, .9);
    for (let k = 0; k < 3; k += 1) {
      const q = (t * 3.2 + seed + k / 3) % 1, side = Math.sin(seed * 5 + k * 2.1);
      stamp(c, "rgba(255,225,150,.95)", bullet.x - Math.cos(ang) * len * q - Math.sin(ang) * side * U * .45 * q, bullet.y - Math.sin(ang) * len * q + Math.cos(ang) * side * U * .45 * q, U * .09, 1 - q);
    }
    c.restore();
  }
  // Afterimage Cannon shot: a violet phantom dart that leaves three fading copies of itself behind,
  // each shifted toward blue - the turret's afterimage motif in flight.
  function phantomDart(c, bullet, t) {
    const U = unit(), ang = Math.atan2(bullet.vy, bullet.vx), speed = Math.hypot(bullet.vx, bullet.vy) || 1;
    const gap = U * Math.min(.9, .35 + speed / 1400), L = U * .62, W = U * .2, seed = (bullet.v2Seed ??= Math.random() * 10);
    const dart = (x, y, fill, alpha, scale) => {
      c.save(); c.translate(x, y); c.rotate(ang); c.scale(scale, scale); c.globalAlpha = alpha; c.fillStyle = fill;
      c.beginPath(); c.moveTo(L, 0); c.lineTo(-L * .2, -W); c.lineTo(-L * .55, 0); c.lineTo(-L * .2, W); c.closePath(); c.fill(); c.restore();
    };
    c.save(); c.globalCompositeOperation = "lighter";
    const copies = [["rgba(80,110,255,1)", .22], ["rgba(110,80,255,1)", .38], ["rgba(150,95,255,1)", .58]];
    copies.forEach(([col, a], i) => {
      const back = gap * (copies.length - i), wob = Math.sin(t * 18 + seed + i) * U * .08;
      const x = bullet.x - Math.cos(ang) * back - Math.sin(ang) * wob, y = bullet.y - Math.sin(ang) * back + Math.cos(ang) * wob;
      stamp(c, "rgba(95,63,240,.7)", x, y, U * .55, a * .6); dart(x, y, col, a, .9 + i * .04);
    });
    stamp(c, "rgba(130,90,255,.9)", bullet.x, bullet.y, U * .8, .85);
    dart(bullet.x, bullet.y, "rgba(190,160,255,1)", 1, 1.05);
    c.globalCompositeOperation = "source-over"; dart(bullet.x, bullet.y, "rgba(246,240,255,1)", .95, .55);
    c.restore();
  }

  // ---------- Thousand-Blade Case: gathering qi, the sword halo, the sword river and ink-wash strikes ----------
  const swordPaint = (gold) => globalThis.SpaceTowerShotStyles?.[gold ? "sword_orb_gold" : "sword_orb"]?.paint;
  const clampArt = (v, a, b) => Math.max(a, Math.min(b, v));
  // A dry-brush circle (ensō): a main stroke whose width swells and thins, plus a few bristle lines.
  function enso(c, x, y, R, start, sweep, width, color, alpha) {
    if (sweep <= 0) return;
    c.save(); c.translate(x, y); c.lineCap = "round"; c.strokeStyle = color;
    const steps = 18;
    for (let i = 0; i < steps; i += 1) {
      const a0 = start + sweep * i / steps, a1 = start + sweep * (i + 1) / steps, k = i / steps;
      c.globalAlpha = alpha * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, k * 1.1)));
      c.lineWidth = width * (0.35 + 0.9 * Math.sin(Math.PI * Math.min(1, k * 1.05 + 0.04)));
      c.beginPath(); c.arc(0, 0, R, a0, a1 + 0.02); c.stroke();
    }
    c.lineWidth = Math.max(0.6, width * 0.12);
    for (const off of [-0.32, 0.18, 0.41]) { c.globalAlpha = alpha * 0.45; c.beginPath(); c.arc(0, 0, R + width * off, start + sweep * 0.08, start + sweep * (0.75 + off * 0.3)); c.stroke(); }
    c.restore();
  }
  function qiPoint(x, y, U, a0, sv, t) {
    const r = U * 3.4 * Math.pow(1 - sv, 1.15) + U * 0.3, a = a0 + sv * 2.4 + t * 0.4;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.92];
  }
  function drawSwordCharge(c, U, t) {
    if (typeof v2WorkshopMainTurrets === "undefined" || typeof getWorkshopMainPosition !== "function") return;
    v2WorkshopMainTurrets.forEach((main, index) => {
      if (main.kind !== "sword_orb") return;
      const def = V2_TURRET_DEFS.find((d) => d.id === "sword_orb"), n = def?.swordVolley || 12, pos = getWorkshopMainPosition(index);
      const k = clampArt(1 - Math.max(0, main.fireTimer || 0) / Math.max(0.05, main.shotInterval || 1), 0, 1);
      const gold = ((main.shotCounter || 0) + 1) % (def?.swordFormEvery || 3) === 0;
      const full = k > 0.86 ? (k - 0.86) / 0.14 : 0, x = pos.x, y = pos.y;
      // Ink circle, drawn stroke by stroke as the qi gathers.
      enso(c, x, y, U * 1.95, -Math.PI / 2 + t * 0.15, Math.PI * 1.9 * Math.min(1, k * 1.15), U * 0.26, gold ? "#e8c46a" : "#d9e4ec", 0.28 + 0.35 * k);
      // Qi drawn in: six thin spiral streams flowing into the case, denser and brighter as it fills.
      c.save(); c.globalCompositeOperation = "lighter"; c.lineCap = "round";
      c.strokeStyle = gold ? "rgba(255,220,140,1)" : "rgba(170,255,226,1)";
      for (let j = 0; j < 6; j += 1) {
        const head = (t * (0.55 + k * 0.5) + j / 6) % 1, a0 = j * TAU / 6;
        for (let q = 0; q < 8; q += 1) {
          const s0 = Math.max(0, head - 0.26 + q * 0.0325), s1 = Math.max(0, head - 0.26 + (q + 1) * 0.0325);
          const [x0, y0] = qiPoint(x, y, U, a0, s0, t), [x1, y1] = qiPoint(x, y, U, a0, s1, t);
          c.globalAlpha = (0.08 + 0.5 * k) * (q / 8); c.lineWidth = 0.6 + 1.6 * (q / 8) * (0.4 + k);
          c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        }
        const [mx, my] = qiPoint(x, y, U, a0, head, t);
        stamp(c, gold ? "rgba(255,214,120,.95)" : "rgba(190,255,232,.95)", mx, my, U * 0.12 * (0.6 + k), 0.3 + 0.6 * k);
      }
      stamp(c, gold ? "rgba(255,200,110,.7)" : "rgba(150,240,220,.6)", x, y, U * (1 + k * 0.9 + full * 0.5 * Math.sin(t * 30)), 0.15 + 0.45 * k);
      c.restore();
      // The sword halo: swords appear one by one, tips outward; at full qi they hum and tremble.
      const paint = swordPaint(gold); if (!paint) return;
      const count = Math.floor(k * n + 0.001), R = U * 1.45 - full * U * 0.12;
      for (let i = 0; i < count; i += 1) {
        const a = i * TAU / n - Math.PI / 2 + t * 0.35, shake = full ? Math.sin(t * 70 + i * 1.7) * 1.3 : 0;
        c.save(); c.translate(x + Math.cos(a) * (R + shake), y + Math.sin(a) * (R + shake) * 0.92); c.rotate(a);
        c.globalAlpha = i === count - 1 && !full ? 0.55 : 0.95; paint(c, U * 0.27, t + i * 0.3); c.restore();
      }
      if (count && count < n) {
        const a = (count - 1) * TAU / n - Math.PI / 2 + t * 0.35;
        c.save(); c.globalCompositeOperation = "lighter"; stamp(c, "rgba(220,255,245,.9)", x + Math.cos(a) * R, y + Math.sin(a) * R * 0.92, U * 0.35, 0.5); c.restore();
      }
    });
  }
  function drawSwords(c, U, t) {
    if (typeof v2Swords === "undefined" || !v2Swords.length) return;
    for (const p of v2Swords) {
      if (p.age < p.delay) continue;
      const hovering = p.hover && p.age - p.delay < p.hover.until;
      if (!hovering) {
        const last = p.trail[p.trail.length - 1];
        if (!last || Math.hypot(last[0] - p.x, last[1] - p.y) > 2) { p.trail.push([p.x, p.y]); if (p.trail.length > 14) p.trail.shift(); }
        if (p.trail.length > 2) {
          c.save(); c.globalCompositeOperation = "lighter"; c.lineCap = "round"; c.lineJoin = "round";
          for (let i = 1; i < p.trail.length; i += 1) {
            const k = i / p.trail.length;
            c.strokeStyle = p.gold ? `rgba(255,214,120,${k * 0.6})` : `rgba(165,232,255,${k * 0.55})`; c.lineWidth = U * (0.05 + k * 0.26);
            c.beginPath(); c.moveTo(p.trail[i - 1][0], p.trail[i - 1][1]); c.lineTo(p.trail[i][0], p.trail[i][1]); c.stroke();
          }
          const s0 = Math.max(0, p.trail.length - 5);
          c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = U * 0.06; c.beginPath(); c.moveTo(p.trail[s0][0], p.trail[s0][1]);
          for (let i = s0 + 1; i < p.trail.length; i += 1) c.lineTo(p.trail[i][0], p.trail[i][1]);
          c.stroke(); c.restore();
        }
      } else {
        c.save(); c.globalCompositeOperation = "lighter"; stamp(c, "rgba(255,210,110,.8)", p.x, p.y, U * 0.55, 0.55 + 0.2 * Math.sin(t * 12 + p.side * 9)); c.restore();
      }
      const paint = swordPaint(p.gold); if (!paint) continue;
      c.save(); c.translate(p.x, p.y); c.rotate(p.angle); paint(c, U * 0.3, t); c.restore();
    }
  }
  // Release: a brush-stroke qi wave opens around the case (gold and wider for the Sword Array).
  function drawSwordBursts(c, U, t) {
    if (typeof v2SwordBursts === "undefined") return;
    for (let i = v2SwordBursts.length - 1; i >= 0; i -= 1) {
      const b = v2SwordBursts[i], q = (t - b.born) / (b.gold ? 0.9 : 0.6);
      if (q >= 1) { v2SwordBursts.splice(i, 1); continue; }
      enso(c, b.x, b.y, U * (1.9 + q * (b.gold ? 2.4 : 1.6)), -1.2 + q * 1.5, TAU * 0.88 * Math.min(1, q * 2.6), U * (0.3 * (1 - q) + 0.05), b.gold ? "#f3d27a" : "#e6f4ff", (1 - q) * 0.8);
      c.save(); c.globalCompositeOperation = "lighter"; stamp(c, b.gold ? "rgba(255,214,120,.9)" : "rgba(200,245,255,.85)", b.x, b.y, U * (1.4 + q * 2), (1 - q) * 0.55); c.restore();
    }
  }
  // Ink-wash strike: pale ink blooms outward in soft blots, a brush slash across the ship and gold flecks.
  function drawInkSplashes(c, U, t) {
    if (typeof v2InkSplashes === "undefined") return;
    for (let i = v2InkSplashes.length - 1; i >= 0; i -= 1) {
      const e = v2InkSplashes[i], q = (t - e.born) / 0.55;
      if (q >= 1) { v2InkSplashes.splice(i, 1); continue; }
      const S = U * 1.1; c.save(); c.translate(e.x, e.y);
      for (let j = 0; j < 6; j += 1) {
        const a = j * 1.9 + e.seed * 6, d = S * (0.15 + q * 0.55) * (0.6 + ((j * 37) % 10) / 14), rr = S * (0.22 - j * 0.022) * (0.5 + q * 0.8);
        c.globalAlpha = (1 - q) * 0.7; c.fillStyle = j % 2 ? "rgba(214,222,232,.6)" : "rgba(242,238,226,.75)";
        c.beginPath(); c.ellipse(Math.cos(a) * d, Math.sin(a) * d, rr, rr * 0.7, a, 0, TAU); c.fill();
      }
      c.rotate(e.angle); c.globalAlpha = Math.max(0, 1 - q * 1.6); c.strokeStyle = e.gold ? "#fff1c4" : "#ffffff"; c.lineCap = "round"; c.lineWidth = U * 0.12 * (1 - q);
      c.beginPath(); c.moveTo(-S * 0.9, -S * 0.12); c.quadraticCurveTo(0, S * 0.1, S * 0.9, -S * 0.05); c.stroke();
      c.rotate(-e.angle); c.globalAlpha = 1 - q; c.fillStyle = "#f0cf7a";
      for (let j = 0; j < 5; j += 1) { const a = j * 1.6 + e.seed * 4, d = S * (0.3 + q * 0.9); c.fillRect(Math.cos(a) * d - 1, Math.sin(a) * d - 1, 2, 2); }
      c.restore();
    }
  }

  // ---------- Frostbite Cannon: frost needles per stack, the faceted ice cocoon, and the shatter ----------
  // (Distinct from Frost Wall's hexagonal crystals: needles, an irregular cocoon and flying shards.)
  function needle(c, len, w) {
    c.beginPath(); c.moveTo(len, 0); c.lineTo(len * 0.25, -w); c.lineTo(0, 0); c.lineTo(len * 0.25, w); c.closePath();
  }
  function drawFrostbite(c, U, t) {
    if (typeof enemies === "undefined" || typeof v2Freezes === "undefined") return;
    const now = t;
    for (const e of enemies) {
      if (!(e.hp > 0)) continue;
      const size = Math.max(10, e.size || 12);
      // Stacks: one ice needle per stack, standing out around the ship like hoarfrost, slowly turning.
      const stacks = (e.v2FbUntil || 0) > now ? e.v2Fb || 0 : 0;
      if (stacks > 0 && !((e.v2FrozenUntil || 0) > now)) {
        const fade = Math.min(1, (e.v2FbUntil - now) / 0.6);
        c.save(); c.translate(e.x, e.y);
        c.globalCompositeOperation = "lighter"; stamp(c, "rgba(160,215,255,.7)", 0, 0, size * (1.2 + stacks * 0.12), 0.25 * fade); c.globalCompositeOperation = "source-over";
        for (let k = 0; k < stacks; k += 1) {
          const a = -Math.PI / 2 + k * TAU / 5 + now * 0.6, base = Math.max(size, U * 0.6), len = base * (0.85 + 0.12 * stacks);
          c.save(); c.rotate(a); c.translate(base * 0.6, 0); c.globalAlpha = 0.95 * fade;
          c.globalCompositeOperation = "lighter"; stamp(c, "rgba(170,225,255,.8)", len * 0.45, 0, len * 0.5, 0.5); c.globalCompositeOperation = "source-over";
          c.fillStyle = "rgba(215,240,255,.95)"; c.strokeStyle = "#ffffff"; c.lineWidth = 1.2; needle(c, len, len * 0.17); c.fill(); c.stroke();
          c.restore();
        }
        c.restore();
      }
      // Frozen: an irregular faceted ice cocoon around the ship, a glint sweeping across, cracks near the end.
      if ((e.v2FrozenUntil || 0) > now) {
        const from = e.v2FrozenFrom || now, total = Math.max(0.05, e.v2FrozenUntil - from), q = clamp01((now - from) / total);
        const grow = Math.min(1, (now - from) / 0.12), R = size * 1.55 * (0.6 + 0.4 * grow), seed = e.v2FrozenSeed || 0, pts = [];
        for (let k = 0; k < 9; k += 1) { const a = k * TAU / 9 + seed, r = R * (0.82 + 0.3 * Math.abs(Math.sin(seed * 3 + k * 1.7))); pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.92]); }
        c.save(); c.translate(e.x + (q > 0.75 ? Math.sin(now * 80) * 1.2 : 0), e.y);
        c.globalCompositeOperation = "lighter"; stamp(c, "rgba(150,215,255,.8)", 0, 0, R * 1.6, 0.45); c.globalCompositeOperation = "source-over";
        const body = c.createLinearGradient(-R, -R, R, R); body.addColorStop(0, "rgba(225,245,255,.62)"); body.addColorStop(0.5, "rgba(140,200,245,.45)"); body.addColorStop(1, "rgba(90,150,220,.55)");
        c.fillStyle = body; c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 1.4; c.lineJoin = "round";
        c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 0.9; c.beginPath();
        for (let k = 0; k < pts.length; k += 2) { c.moveTo(pts[k][0] * 0.2, pts[k][1] * 0.2); c.lineTo(pts[k][0], pts[k][1]); } c.stroke();
        // Glint sweeping across the ice.
        c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
        const gx = -R * 1.4 + ((now * 1.6 + seed) % 1) * R * 2.8; c.globalCompositeOperation = "lighter"; c.globalAlpha = 0.55; c.fillStyle = "rgba(255,255,255,1)";
        c.beginPath(); c.moveTo(gx, -R); c.lineTo(gx + R * 0.25, -R); c.lineTo(gx - R * 0.25, R); c.lineTo(gx - R * 0.5, R); c.closePath(); c.fill(); c.restore();
        // Cracks spreading as the freeze runs out.
        if (q > 0.55) {
          const k = (q - 0.55) / 0.45; c.strokeStyle = `rgba(255,255,255,${0.5 + 0.5 * k})`; c.lineWidth = 1.2; c.beginPath();
          for (let j = 0; j < 4; j += 1) { const a = seed * 2 + j * 1.6; let x = 0, y = 0; c.moveTo(0, 0); for (let s = 1; s <= 3; s += 1) { x += Math.cos(a + Math.sin(j * 5 + s) * 0.6) * R * 0.3 * k; y += Math.sin(a + Math.sin(j * 5 + s) * 0.6) * R * 0.3 * k; c.lineTo(x, y); } }
          c.stroke();
        }
        c.restore();
      }
    }
    // Shatter: shards fly out and spin, a frost burst blooms, and frost streaks race to the ships it spreads to.
    for (let i = v2FrostShatters.length - 1; i >= 0; i -= 1) {
      const f = v2FrostShatters[i], q = (now - f.born) / 0.7;
      if (q >= 1) { v2FrostShatters.splice(i, 1); continue; }
      c.save(); c.translate(f.x, f.y);
      c.globalCompositeOperation = "lighter"; stamp(c, "rgba(190,230,255,.9)", 0, 0, f.r * (1.2 + q * 2.4), (1 - q) * 0.7);
      c.strokeStyle = `rgba(220,242,255,${(1 - q) * 0.8})`; c.lineWidth = 2.2 * (1 - q) + 0.5; c.beginPath(); c.arc(0, 0, f.r * (1 + q * 3), 0, TAU); c.stroke();
      c.globalCompositeOperation = "source-over";
      for (let k = 0; k < 11; k += 1) {
        const a = k * TAU / 11 + f.seed, sp = f.r * (2.4 + ((k * 37) % 7) / 3), d = sp * (1 - Math.pow(1 - q, 2)), s = f.r * (0.28 + ((k * 13) % 5) * 0.06);
        c.save(); c.translate(Math.cos(a) * d, Math.sin(a) * d + q * q * f.r * 0.8); c.rotate(a + q * (6 + k)); c.globalAlpha = 1 - q;
        c.fillStyle = k % 3 ? "rgba(210,238,255,.95)" : "rgba(150,205,250,.95)"; c.strokeStyle = "#ffffff"; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(s, 0); c.lineTo(-s * 0.5, -s * 0.55); c.lineTo(-s * 0.3, s * 0.6); c.closePath(); c.fill(); c.stroke(); c.restore();
      }
      c.restore();
      if (f.spread?.length && q < 0.6) {
        c.save(); c.globalCompositeOperation = "lighter"; c.lineCap = "round";
        for (const [x, y] of f.spread) {
          const k = Math.min(1, q / 0.35), mx = f.x + (x - f.x) * k, my = f.y + (y - f.y) * k;
          c.strokeStyle = `rgba(190,230,255,${0.7 * (1 - q / 0.6)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(mx, my); c.stroke();
          stamp(c, "rgba(220,245,255,.95)", mx, my, U * 0.25, 1 - q / 0.6);
        }
        c.restore();
      }
    }
  }
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  // Phoenix Blaze dive: an accelerating strafing pass. Sonic boom at entry, a Mach cone and spark spray
  // around the white-hot bird, and a long fire stream behind it.
  function drawPhoenixDives(c, U, t) {
    if (typeof v2PhoenixDives === "undefined" || typeof drawPhoenixBird !== "function") return;
    for (const f of v2PhoenixDives) {
      const k = f.k || 0, e = Math.pow(k, 1.5), x = f.x0 + (f.x1 - f.x0) * e, y = f.y0 + (f.y1 - f.y0) * e, ang = f.heading;
      const fade = Math.min(1, f.life / .08), speedK = Math.min(1, .35 + 1.5 * Math.sqrt(k));
      c.save(); c.globalCompositeOperation = "lighter";
      // Outer heat haze, then the core fire stream.
      streak(c, x, y, ang, U * 11 * speedK, U * 1.7, .35 * fade);
      streak(c, x, y, ang, U * 8 * speedK, U * .75, .95 * fade);
      // Mach cone: two shock lines swept back from the bird.
      c.globalAlpha = .55 * fade * speedK; c.strokeStyle = "rgba(255,235,200,1)"; c.lineWidth = 1.4;
      for (const side of [-1, 1]) { const a = ang + Math.PI - side * .42; c.beginPath(); c.moveTo(x + Math.cos(ang) * U * .6, y + Math.sin(ang) * U * .6); c.lineTo(x + Math.cos(a) * U * 4.2, y + Math.sin(a) * U * 4.2); c.stroke(); }
      // Spark spray: short streaks thrown sideways and back.
      c.lineWidth = 1.6; c.strokeStyle = "rgba(255,210,130,1)";
      for (let s = 0; s < 7; s += 1) {
        const q = (t * 5 + s * .37 + f.id * 10) % 1, a = ang + Math.PI + (s % 2 ? 1 : -1) * (.35 + (s * .23) % .7), d = U * (1 + q * 3.2);
        const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; c.globalAlpha = fade * (1 - q);
        c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * U * .6, py + Math.sin(a) * U * .6); c.stroke();
      }
      // White-hot body glow.
      stamp(c, "rgba(255,170,90,.9)", x, y, U * 2.4, fade * .8); stamp(c, "rgba(255,250,220,1)", x, y, U * 1.1, fade);
      c.restore();
      // Sonic boom: a flattened ring at the point the dive went supersonic.
      if (k > .25 && k < .7) {
        const q = (k - .25) / .45, bx = f.x0 + (f.x1 - f.x0) * Math.pow(.25, 1.5), by = f.y0 + (f.y1 - f.y0) * Math.pow(.25, 1.5);
        c.save(); c.globalCompositeOperation = "lighter"; c.translate(bx, by); c.rotate(ang); c.globalAlpha = (1 - q) * .8;
        c.strokeStyle = "rgba(255,225,180,1)"; c.lineWidth = 3 * (1 - q) + .6; c.beginPath(); c.ellipse(0, 0, U * (.6 + q * 1.2), U * (1.2 + q * 4.5), 0, 0, TAU); c.stroke(); c.restore();
      }
      // The bird, wings swept back for the dive.
      c.save(); c.globalAlpha = fade; c.translate(x, y); c.rotate(ang + Math.PI / 2); c.scale(.62, 1.15);
      drawPhoenixBird(c, "#ff7a3d", U / 15, t * 5, false); c.restore();
    }
  }

  // Pentagram Missile Pod: five missiles in a turning pentagon, joined by light lines; the seal flashes on detonation.
  function drawPentas(c, U, t) {
    if (typeof v2Pentas === "undefined") return;
    for (const f of v2Pentas) {
      const k = Math.min(1, f.t / f.dur), e = ease(k), x = f.x0 + (f.tx - f.x0) * e, y = f.y0 + (f.ty - f.y0) * e;
      const R = U * 1.4 * (.35 + .65 * Math.sin(Math.min(1, k * 1.4) * Math.PI / 2)), spin = f.spin + k * 2.4, dir = Math.atan2(f.ty - f.y0, f.tx - f.x0), pts = [];
      for (let i = 0; i < 5; i += 1) { const a = spin - Math.PI / 2 + i * TAU / 5; pts.push([x + Math.cos(a) * R, y + Math.sin(a) * R]); }
      c.save(); c.globalCompositeOperation = "lighter"; c.strokeStyle = "rgba(255,170,140,.75)"; c.lineWidth = 1.6; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.stroke(); c.restore();
      for (const [px, py] of pts) {
        const L = U * .55; c.save(); c.translate(px, py); c.rotate(dir);
        c.globalCompositeOperation = "lighter"; stamp(c, "rgba(255,179,106,.9)", -L * .9, 0, L * .7, .8); c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
        c.fillStyle = "#f3e7df"; c.beginPath(); c.moveTo(L * .55, 0); c.lineTo(L * .15, -L * .16); c.lineTo(-L * .45, -L * .16); c.lineTo(-L * .45, L * .16); c.lineTo(L * .15, L * .16); c.closePath(); c.fill();
        c.fillStyle = "#ff9c7a"; c.fillRect(-L * .55, -L * .24, L * .2, L * .48); c.restore();
      }
    }
    if (typeof v2SealFlashes === "undefined") return;
    for (let i = v2SealFlashes.length - 1; i >= 0; i -= 1) {
      const s = v2SealFlashes[i], q = (t - s.born) / .9; if (q >= 1) { v2SealFlashes.splice(i, 1); continue; }
      const R = s.r, draw = Math.min(1, q * 4); c.save(); c.translate(s.x, s.y); c.globalCompositeOperation = "lighter"; c.globalAlpha = Math.max(0, 1 - q * q);
      stamp(c, "rgba(255,156,122,.8)", 0, 0, R * 1.2, Math.max(0, 1 - q * q)); c.strokeStyle = "#ffd2b8"; c.lineWidth = 2.4 * (1 - q) + .8; c.beginPath(); c.arc(0, 0, R, 0, TAU * draw); c.stroke();
      c.strokeStyle = "#ff9c7a"; c.lineWidth = 3 * (1 - q) + 1; c.beginPath(); for (let j = 0; j <= 5 * draw; j += 1) { const a = s.spin - Math.PI / 2 + (j * 2 % 5) * TAU / 5; j ? c.lineTo(Math.cos(a) * R, Math.sin(a) * R) : c.moveTo(Math.cos(a) * R, Math.sin(a) * R); } c.stroke(); c.restore();
    }
  }

  // Hexagram Shuriken Cannon: spinning four-bladed shuriken flying their petal loops.
  function drawShurikens(c, U, t) {
    if (typeof v2Shurikens === "undefined") return;
    for (const sh of v2Shurikens) {
      const k = sh.t, f = sh.reach * Math.sin(Math.PI * k), l = sh.width * Math.sin(2 * Math.PI * k), ca = Math.cos(sh.a), sa = Math.sin(sh.a), x = sh.cx + ca * f - sa * l, y = sh.cy + sa * f + ca * l, R = U * .55;
      c.save(); c.translate(x, y); c.globalCompositeOperation = "lighter"; stamp(c, "rgba(122,255,216,.8)", 0, 0, R * 1.5, .55); c.globalCompositeOperation = "source-over"; c.globalAlpha = 1; c.rotate(t * 18 + sh.a);
      c.fillStyle = "#dffff6"; c.strokeStyle = "#2c8f78"; c.lineWidth = 1;
      for (let b = 0; b < 4; b += 1) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(-R * .18, -R * .18); c.quadraticCurveTo(R * .05, -R * .55, R * .12, -R); c.quadraticCurveTo(R * .2, -R * .45, R * .18, -R * .18); c.closePath(); c.fill(); c.stroke(); }
      c.fillStyle = "#0d2a26"; c.beginPath(); c.arc(0, 0, R * .16, 0, TAU); c.fill(); c.restore();
    }
  }

  // Solar Judgment: a blazing sun at the top of the arena sweeping a colossal ray; branded ships wear sun sigils.
  function drawSunrays(c, U, t) {
    if (typeof v2Sunrays === "undefined") return;
    const ox = tower.x, oy = Math.min(tower.y - 380, 40);
    for (const sr of v2Sunrays) {
      const k = Math.min(1, sr.t / 1.1), a = Math.PI / 2 + 0.9 - 1.8 * ease(k), fade = Math.min(1, sr.t / .2, (1.3 - sr.t) / .25), L = 1600, W = U * 2.2;
      c.save(); c.translate(ox, oy); c.globalCompositeOperation = "lighter"; c.rotate(a);
      for (const [col, w, al] of [["255,120,40", W, .22], ["255,200,90", W * .45, .55], ["255,250,230", W * .14, .95]]) {
        const g = c.createLinearGradient(0, 0, L, 0); g.addColorStop(0, `rgba(${col},${al})`); g.addColorStop(.8, `rgba(${col},${al * .6})`); g.addColorStop(1, `rgba(${col},0)`);
        c.globalAlpha = Math.max(0, fade); c.fillStyle = g; c.beginPath(); c.moveTo(0, -w * .35); c.lineTo(L, -w); c.lineTo(L, w); c.lineTo(0, w * .35); c.closePath(); c.fill();
      }
      c.rotate(-a); const R = U * 1.4; stamp(c, "rgba(255,120,57,.9)", 0, 0, R * 2.4, Math.max(0, fade) * .9); stamp(c, "rgba(255,211,110,.9)", 0, 0, R * 1.4, Math.max(0, fade));
      c.globalCompositeOperation = "source-over"; c.globalAlpha = Math.max(0, fade); const d = c.createRadialGradient(0, 0, 0, 0, 0, R * .8); d.addColorStop(0, "#ffffff"); d.addColorStop(.6, "#fff1b0"); d.addColorStop(1, "#ffb03a"); c.fillStyle = d; c.beginPath(); c.arc(0, 0, R * .8, 0, TAU); c.fill(); c.restore();
    }
    if (typeof v2SunMarks === "undefined") return;
    const nt = performance.now() * 0.001;
    for (const mk of v2SunMarks) {
      const e = mk.e; if (!(e.hp > 0) || mk.at <= nt) continue; const heat = 1 - Math.min(1, (mk.at - nt) / 1.2), R = U * .7;
      c.save(); c.translate(e.x, e.y); c.rotate(t * (2 + heat * 8)); c.globalCompositeOperation = "lighter"; stamp(c, "rgba(255,154,61,.9)", 0, 0, R * 1.5, .4 + .5 * heat);
      c.globalAlpha = .9; c.strokeStyle = "#ffd36e"; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, R * .6, 0, TAU); c.stroke();
      for (let i = 0; i < 8; i += 1) { const b = i * TAU / 8; c.beginPath(); c.moveTo(Math.cos(b) * R * .6, Math.sin(b) * R * .6); c.lineTo(Math.cos(b) * R * (i % 2 ? 1.25 : 1.45), Math.sin(b) * R * (i % 2 ? 1.25 : 1.45)); c.stroke(); }
      c.restore();
    }
  }

  // Singularity King: black core, tilted accretion disk, lensing ring and in-falling motes.
  function drawSingularities(c, U, t) {
    if (typeof v2Singularities === "undefined") return;
    for (const sg of v2Singularities) {
      const grow = Math.min(1, sg.t / .4), shrink = Math.min(1, (2.4 - sg.t) / .25), k = grow * (.35 + .65 * Math.max(0, shrink)), R = U * 2.2 * k;
      c.save(); c.translate(sg.x, sg.y); c.globalCompositeOperation = "lighter"; stamp(c, "rgba(138,77,255,.8)", 0, 0, R * 2.2, .55);
      c.globalAlpha = .6; c.strokeStyle = "rgba(220,200,255,.8)"; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, R * 1.45, 0, TAU); c.stroke();
      c.save(); c.rotate(-.35); c.scale(1, .42);
      ["#fff4d6", "#ffd27a", "#ff9a3d", "#ff5d2e", "#b8336a"].forEach((col, i) => { const a0 = t * (3.2 - i * .35) + i; c.globalAlpha = .75 - i * .1; c.strokeStyle = col; c.lineWidth = R * (.2 - i * .025); c.beginPath(); c.arc(0, 0, R * (.75 + i * .16), a0, a0 + TAU * .78); c.stroke(); });
      c.restore();
      for (let i = 0; i < 14; i += 1) { const q = (sg.t * .7 + i / 14) % 1, a = i * 2.1 + sg.t * (4 + q * 6), rr = R * (1.9 - q * 1.6); c.globalAlpha = q * .9; c.fillStyle = i % 2 ? "#ffd27a" : "#d7b8ff"; c.beginPath(); c.arc(Math.cos(a) * rr, Math.sin(a) * rr * .6, 2, 0, TAU); c.fill(); }
      c.globalCompositeOperation = "source-over"; c.globalAlpha = 1; const core = c.createRadialGradient(0, 0, R * .1, 0, 0, R * .62); core.addColorStop(0, "#000"); core.addColorStop(.8, "#05010c"); core.addColorStop(1, "rgba(90,40,160,.9)"); c.fillStyle = core; c.beginPath(); c.arc(0, 0, R * .6, 0, TAU); c.fill();
      c.restore();
    }
  }

  // Abyssal leviathan: a glowing deep-sea serpent sweeping round the core.
  function drawLeviathans(c, U, t) {
    if (typeof v2Leviathans === "undefined") return;
    for (const lv of v2Leviathans) {
      const k = Math.min(1, lv.t / 1.2), head = lv.start + 2.4 * k, fade = Math.min(1, lv.t / .2, (1.25 - lv.t) / .25), N = 22, len = .9, pts = [];
      for (let i = 0; i <= N; i += 1) { const a = head - len * i / N, sway = Math.sin(t * 7 - i * .55) * U * .35 * (i / N), r = lv.r + sway; pts.push([tower.x + Math.cos(a) * r, tower.y + Math.sin(a) * r, Math.cos(a), Math.sin(a), i / N]); }
      const W = (i) => U * .9 * Math.sin(Math.PI * Math.min(1, .12 + i * .95));
      c.save(); c.globalAlpha = Math.max(0, fade); c.globalCompositeOperation = "lighter"; for (let i = 0; i < N; i += 3) stamp(c, "rgba(43,215,255,.8)", pts[i][0], pts[i][1], U * (1.6 - i / N), Math.max(0, fade) * .45);
      c.globalCompositeOperation = "source-over"; c.globalAlpha = Math.max(0, fade); c.beginPath();
      pts.forEach(([x, y, nx, ny, i], j) => { const w = W(i); j ? c.lineTo(x + nx * w, y + ny * w) : c.moveTo(x + nx * w, y + ny * w); });
      for (let j = pts.length - 1; j >= 0; j -= 1) { const [x, y, nx, ny, i] = pts[j], w = W(i); c.lineTo(x - nx * w, y - ny * w); } c.closePath();
      const g = c.createLinearGradient(pts[0][0], pts[0][1], pts[N][0], pts[N][1]); g.addColorStop(0, "#2a9be8"); g.addColorStop(.45, "#1a62b8"); g.addColorStop(1, "rgba(20,70,150,.25)"); c.fillStyle = g; c.fill(); c.strokeStyle = "rgba(170,245,255,.9)"; c.lineWidth = 2; c.stroke();
      c.globalCompositeOperation = "lighter"; for (let j = 2; j < N - 1; j += 2) { const [x, y, nx, ny, i] = pts[j], w = W(i) * .45; c.globalAlpha = Math.max(0, fade) * (.5 + .5 * Math.sin(t * 6 + j)); c.fillStyle = "#8ff7ff"; c.beginPath(); c.arc(x + nx * w, y + ny * w, 2.2, 0, TAU); c.fill(); }
      const [hx, hy] = pts[0]; stamp(c, "rgba(174,246,255,.9)", hx, hy, U * 1.3, Math.max(0, fade)); c.restore();
    }
  }

  // Afterimage Cannon: eleven blue-violet afterimages orbiting each such turret, with two fading copies each.
  function drawAfterimages(c, U, t) {
    if (typeof v2WorkshopMainTurrets === "undefined" || typeof getWorkshopMainPosition !== "function") return;
    v2WorkshopMainTurrets.forEach((main, index) => {
      const def = V2_TURRET_DEFS.find((d) => d.id === main.kind); if (!def?.afterimage) return;
      const pos = getWorkshopMainPosition(index), orbit = 80, r = U * .38;
      for (let i = 0; i < def.afterimage; i += 1) for (let k = 2; k >= 0; k -= 1) {
        const a = (t - k * .05) * 1.8 + i * TAU / def.afterimage, x = pos.x + Math.cos(a) * orbit, y = pos.y + Math.sin(a) * orbit;
        c.save(); c.globalCompositeOperation = "lighter"; stamp(c, "rgba(84,50,224,.9)", x, y, r * 1.8, k ? .3 / k : .8); c.restore();
        c.globalAlpha = k ? .35 / k : .9; c.fillStyle = "#5432e0"; c.beginPath(); c.arc(x, y, r * .8, 0, TAU); c.fill();
        if (!k) { c.fillStyle = "#9a8cff"; c.beginPath(); c.arc(x, y, r * .36, 0, TAU); c.fill(); }
      }
      c.globalAlpha = 1;
    });
  }

  // Quantum Crown: entangled ships joined in a ring of shimmering violet-gold threads, each with an electron orbit.
  function drawEntanglement(c, U, t) {
    if (typeof enemies === "undefined") return;
    const nt = performance.now() * 0.001, ent = enemies.filter((e) => e.hp > 0 && (e.v2EntUntil || 0) > nt);
    if (!ent.length) return;
    c.save(); c.globalCompositeOperation = "lighter"; c.lineCap = "round";
    if (ent.length >= 2) for (let i = 0; i < ent.length; i += 1) {
      if (ent.length === 2 && i === 1) break;
      const a = ent[i], b = ent[(i + 1) % ent.length], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, steps = Math.max(8, Math.round(L / 6));
      for (const [col, w, al, amp] of [["#b45cff", 4, .35, 1], ["#ffd36e", 1.4, .8, .6]]) { c.globalAlpha = al; c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let k = 0; k <= steps; k += 1) { const q = k / steps, wv = Math.sin(q * Math.PI * 4 - t * 9) * 4 * amp * Math.sin(q * Math.PI); const x = a.x + dx * q + nx * wv, y = a.y + dy * q + ny * wv; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    }
    for (const e of ent) { const r = (e.size || 10) * 1.4; c.save(); c.translate(e.x, e.y); c.rotate(.5); c.globalAlpha = .75; c.strokeStyle = "#d7a8ff"; c.lineWidth = 1.1; c.beginPath(); c.ellipse(0, 0, r, r * .38, 0, 0, TAU); c.stroke(); const a = t * 5; c.fillStyle = "#fff3c4"; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r * .38, 2, 0, TAU); c.fill(); c.restore(); }
    c.restore();
  }

  // Chrono Axis time stop: a cold blue tint and a vast translucent clock face with still hands.
  function drawTimeStop(c, U, t) {
    if (typeof v2TimeStop === "undefined" || !v2TimeStop) return;
    const left = v2TimeStop.until - performance.now() * 0.001, fade = Math.max(0, Math.min(1, left / .25 + .2)), R = Math.min(width, height) * .34, cx = tower.x, cy = tower.y;
    c.save(); c.globalAlpha = fade * .14; c.fillStyle = "#4fb6e8"; c.fillRect(0, 0, width, height);
    c.globalCompositeOperation = "lighter"; stamp(c, "rgba(67,255,196,.6)", cx, cy, R * 1.2, fade * .5);
    c.globalAlpha = fade * .75; c.strokeStyle = "#bffff0"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
    for (let i = 0; i < 12; i += 1) { const a = i * TAU / 12, r0 = R * (i % 3 ? .86 : .8); c.lineWidth = i % 3 ? 1.2 : 2.4; c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * R * .92, cy + Math.sin(a) * R * .92); c.stroke(); }
    const spin = left < .35 ? (.35 - left) * -40 : 0, hA = -Math.PI / 2 + .9 + spin * .3, mA = -Math.PI / 2 - .4 + spin; c.globalAlpha = fade; c.lineCap = "round"; c.strokeStyle = "#eafffa";
    c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(hA) * R * .45, cy + Math.sin(hA) * R * .45); c.stroke();
    c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(mA) * R * .72, cy + Math.sin(mA) * R * .72); c.stroke(); c.restore();
  }

  function drawAll() {
    const c = typeof ctx !== "undefined" ? ctx : null; if (!c) return;
    const U = unit(), t = now();
    c.save();
    try {
      drawTimeStop(c, U, t); drawIceWalls(c, U, t); drawSingularities(c, U, t); drawLeviathans(c, U, t); drawSunrays(c, U, t);
      drawEntanglement(c, U, t); drawAfterimages(c, U, t); drawPentas(c, U, t); drawShurikens(c, U, t); drawPhoenixFlames(c, U, t); drawPhoenixDives(c, U, t);
      drawSwordCharge(c, U, t); drawSwordBursts(c, U, t); drawSwords(c, U, t); drawInkSplashes(c, U, t); drawFrostbite(c, U, t);
    } finally { c.restore(); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; }
  }
  window.SpaceTowerNormalSignatureArt = Object.freeze({ draw: drawAll, phoenixTail, phantomDart });

  // Hook after the existing effects pass (in world coordinates, inside the screen-shake transform).
  if (typeof drawEffects === "function") {
    const baseDrawEffects = drawEffects;
    drawEffects = function () { const r = baseDrawEffects.apply(this, arguments); drawAll(); return r; };
  }
})();
