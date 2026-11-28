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

  // Phoenix Blaze dive: a great phoenix circling the core, dragging a trail of fire.
  function drawPhoenixDives(c, U, t) {
    if (typeof v2PhoenixDives === "undefined" || typeof drawPhoenixBird !== "function") return;
    for (const f of v2PhoenixDives) {
      const k = 1 - f.life / 1.4, a = f.start + k * TAU, fade = Math.min(1, k * 8, f.life * 4);
      c.save(); c.globalCompositeOperation = "lighter";
      for (let j = 6; j >= 1; j -= 1) { const b = a - j * .09; stamp(c, j < 3 ? "rgba(255,211,110,.9)" : "rgba(255,122,61,.8)", tower.x + Math.cos(b) * f.r, tower.y + Math.sin(b) * f.r, U * (1.1 - j * .1), fade * (1 - j / 7) * .7); }
      c.restore();
      const x = tower.x + Math.cos(a) * f.r, y = tower.y + Math.sin(a) * f.r;
      c.save(); c.globalCompositeOperation = "lighter"; stamp(c, "rgba(255,176,112,.9)", x, y, U * 1.6, fade); c.restore();
      c.save(); c.globalAlpha = fade; c.translate(x, y); c.rotate(a + Math.PI); drawPhoenixBird(c, "#ff7a3d", U / 24, t * 2, false); c.restore();
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
      drawEntanglement(c, U, t); drawAfterimages(c, U, t); drawPentas(c, U, t); drawShurikens(c, U, t); drawPhoenixDives(c, U, t);
    } finally { c.restore(); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; }
  }
  window.SpaceTowerNormalSignatureArt = Object.freeze({ draw: drawAll });

  // Hook after the existing effects pass (in world coordinates, inside the screen-shake transform).
  if (typeof drawEffects === "function") {
    const baseDrawEffects = drawEffects;
    drawEffects = function () { const r = baseDrawEffects.apply(this, arguments); drawAll(); return r; };
  }
})();
