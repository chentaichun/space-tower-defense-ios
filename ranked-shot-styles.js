/* Per-turret projectile identities for ranked battles.
   Each painter draws one shot at the origin, flying toward +X, inside a cached
   sprite (redrawn ~24 times per second), so detail here costs almost nothing
   per frame. `size` scales the shot relative to the shared base radius. */
(() => {
  const TAU = Math.PI * 2;
  function glowDot(c, r, inner, outer) {
    const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, inner); g.addColorStop(.45, outer); g.addColorStop(1, outer.replace(/[\d.]+\)$/, '0)'));
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  }
  function star4(c, r, thin) {
    c.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, d = i % 2 ? r * thin : r; i ? c.lineTo(Math.cos(a) * d, Math.sin(a) * d) : c.moveTo(d, 0); }
    c.closePath(); c.fill();
  }

  const styles = {
    // 3 · Glimmer Magic Cannon: a small violet mote with a twinkling star and two trailing sparks.
    rookie_spark: {
      size: .9,
      trail: '#e9dcff',
      paint(c, r, t) {
        glowDot(c, r * 1.6, 'rgba(255,252,255,1)', 'rgba(222,200,255,.6)');
        c.save(); c.rotate(t * 5); const tw = .8 + Math.sin(t * 14) * .25;
        c.fillStyle = '#fbf6ff'; star4(c, r * 1.35 * tw, .22); c.restore();
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, r * .32, 0, TAU); c.fill();
        for (let i = 0; i < 2; i++) {
          const x = -r * (1.7 + i * 1.1), y = Math.sin(t * 11 + i * 2) * r * .45, a = .75 - i * .3;
          c.globalAlpha = a; c.fillStyle = i ? '#dcc8ff' : '#f2eaff'; c.save(); c.translate(x, y); c.rotate(t * 7 + i); star4(c, r * (.55 - i * .15), .3); c.restore();
        }
        c.globalAlpha = 1;
      }
    },
    // 4 · Armored Guard Cannon: a heavy brass shell with a driving band and a short smoke puff.
    rookie_guard: {
      size: 1.4,
      impact: 1.5,
      trail: '#c9b08a',
      paint(c, r) {
        c.save(); c.globalAlpha = .45; c.fillStyle = '#8f8778';
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-r * (1.5 + i * .7), (i % 2 ? .25 : -.2) * r, r * (.5 - i * .1), 0, TAU); c.fill(); }
        c.restore();
        const body = c.createLinearGradient(0, -r * .6, 0, r * .6);
        body.addColorStop(0, '#fff1cf'); body.addColorStop(.45, '#e9c88d'); body.addColorStop(1, '#8a6a3c');
        c.fillStyle = body; c.strokeStyle = '#5a4426'; c.lineWidth = Math.max(1, r * .12);
        c.beginPath(); c.moveTo(r * 1.05, 0); c.quadraticCurveTo(r * .75, -r * .58, r * .1, -r * .58); c.lineTo(-r * .9, -r * .58); c.lineTo(-r * .9, r * .58); c.lineTo(r * .1, r * .58); c.quadraticCurveTo(r * .75, r * .58, r * 1.05, 0); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#b88a4a'; c.fillRect(-r * .55, -r * .58, r * .22, r * 1.16);
        c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-r * .75, -r * .42, r * 1.3, r * .14);
      }
    },
    // 5 · Thin Frost Cannon: a spinning six-point ice crystal shedding frost motes.
    rookie_chill: {
      size: 1.05,
      impact: 1.2,
      trail: '#c9f4ff',
      paint(c, r, t) {
        for (let i = 0; i < 3; i++) { c.globalAlpha = .55 - i * .15; c.fillStyle = '#e8fbff'; c.beginPath(); c.arc(-r * (1.4 + i * .8), Math.sin(t * 9 + i * 2.1) * r * .5, r * (.2 - i * .04), 0, TAU); c.fill(); }
        c.globalAlpha = 1;
        glowDot(c, r * 1.5, 'rgba(240,253,255,1)', 'rgba(150,225,255,.45)');
        c.save(); c.rotate(t * 3); c.strokeStyle = '#f2fdff'; c.lineWidth = Math.max(1, r * .16); c.lineCap = 'round';
        for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(r * 1.05, 0); c.moveTo(r * .62, 0); c.lineTo(r * .85, -r * .2); c.moveTo(r * .62, 0); c.lineTo(r * .85, r * .2); c.stroke(); }
        c.restore();
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, r * .22, 0, TAU); c.fill();
      }
    },
    // 7 · Frost Slow Core: a faceted ice orb ringed by three orbiting shards.
    frost_core: {
      size: 1.25,
      impact: 1.4,
      trail: '#bff8ff',
      paint(c, r, t) {
        glowDot(c, r * 1.9, 'rgba(235,255,255,.95)', 'rgba(120,230,255,.4)');
        c.save(); c.rotate(t * 1.5);
        const g = c.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#bff8ff'); g.addColorStop(1, '#5fc6e8');
        c.fillStyle = g; c.strokeStyle = '#effdff'; c.lineWidth = Math.max(1, r * .1);
        c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; i ? c.lineTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8) : c.moveTo(r * .8, 0); } c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(.8, r * .06); c.beginPath(); for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; c.moveTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); c.lineTo(-Math.cos(a) * r * .8, -Math.sin(a) * r * .8); } c.stroke();
        c.restore();
        c.fillStyle = '#e8fdff';
        for (let i = 0; i < 3; i++) { const a = -t * 4 + i * TAU / 3; c.save(); c.translate(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35); c.rotate(a); c.beginPath(); c.moveTo(r * .32, 0); c.lineTo(0, -r * .12); c.lineTo(-r * .2, 0); c.lineTo(0, r * .12); c.closePath(); c.fill(); c.restore(); }
      }
    },
    // 8 · Flame Ignition Core: a roiling fireball with a licking flame tail and embers.
    flame_core: {
      size: 1.2,
      impact: 1.3,
      trail: '#ff9b52',
      paint(c, r, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) {
          const f = .8 + Math.sin(t * 20 + i * 2) * .2, len = r * (1.6 + i * .5) * f, w = r * (.7 - i * .16);
          c.globalAlpha = .7 - i * .15; c.fillStyle = ['#ffd36e', '#ff8a3c', '#ff4d2a'][i];
          c.beginPath(); c.moveTo(r * .2, -w); c.quadraticCurveTo(-len * .5, -w * 1.1 + Math.sin(t * 15 + i) * r * .2, -len, Math.sin(t * 12 + i) * r * .25); c.quadraticCurveTo(-len * .5, w * 1.1, r * .2, w); c.closePath(); c.fill();
        }
        c.restore();
        glowDot(c, r * 1.25, 'rgba(255,250,220,1)', 'rgba(255,140,60,.7)');
        c.fillStyle = '#fffbe8'; c.beginPath(); c.arc(r * .12, 0, r * .38, 0, TAU); c.fill();
        c.fillStyle = '#ffd36e';
        for (let i = 0; i < 3; i++) { const x = -r * (1.2 + ((t * 3 + i * .37) % 1) * 1.6), y = Math.sin(t * 9 + i * 3) * r * .7; c.globalAlpha = .8; c.beginPath(); c.arc(x, y, r * .1, 0, TAU); c.fill(); }
        c.globalAlpha = 1;
      }
    },
    // 9 · Full-HP Berserker Core: a hot gold slug with a red rage streak.
    full_hp_berserk: {
      size: 1,
      trail: '#ff6a3a',
      paint(c, r) {
        c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .75;
        const g = c.createLinearGradient(-r * 2.6, 0, r, 0); g.addColorStop(0, 'rgba(255,60,30,0)'); g.addColorStop(1, 'rgba(255,90,40,.9)');
        c.fillStyle = g; c.beginPath(); c.moveTo(r * .6, -r * .42); c.lineTo(-r * 2.6, 0); c.lineTo(r * .6, r * .42); c.closePath(); c.fill(); c.restore();
        c.fillStyle = '#ffe16f'; c.strokeStyle = '#8a3a10'; c.lineWidth = Math.max(1, r * .12);
        c.beginPath(); c.moveTo(r * 1.1, 0); c.lineTo(r * .3, -r * .38); c.lineTo(-r * .7, -r * .38); c.lineTo(-r * .7, r * .38); c.lineTo(r * .3, r * .38); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#fff8d8'; c.fillRect(-r * .5, -r * .24, r * .9, r * .14);
      }
    },
    // 10 · Weakening Curse Core: a spinning violet crescent trailing dark curse smoke.
    weakening_curse: {
      size: 1.15,
      trail: '#8a5ad0',
      paint(c, r, t) {
        for (let i = 0; i < 3; i++) { c.globalAlpha = .45 - i * .12; c.fillStyle = '#3b1a5c'; c.beginPath(); c.arc(-r * (1.2 + i * .75), Math.sin(t * 7 + i * 2) * r * .35, r * (.55 - i * .1), 0, TAU); c.fill(); }
        c.globalAlpha = 1;
        glowDot(c, r * 1.5, 'rgba(240,220,255,.9)', 'rgba(160,100,230,.5)');
        c.save(); c.rotate(t * 9);
        c.fillStyle = '#e4d0ff'; c.beginPath(); c.arc(0, 0, r * .95, 0, TAU); c.arc(r * .35, -r * .1, r * .78, 0, TAU, true); c.fill('evenodd');
        c.restore();
        c.fillStyle = '#2a1140'; c.beginPath(); c.arc(0, 0, r * .22, 0, TAU); c.fill();
      }
    },
    // 11 · Heavy Cannon Core: a big dark iron ball with a hot orange rim and smoke.
    heavy_cannon: {
      size: 1.6,
      impact: 1.9,
      trail: '#9a8a78',
      paint(c, r) {
        c.save(); c.globalAlpha = .4; c.fillStyle = '#7d756c';
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-r * (1.3 + i * .7), (i % 2 ? .2 : -.15) * r, r * (.55 - i * .1), 0, TAU); c.fill(); }
        c.restore();
        glowDot(c, r * 1.5, 'rgba(255,200,120,.9)', 'rgba(255,140,50,.35)');
        const g = c.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r * .85);
        g.addColorStop(0, '#8a8580'); g.addColorStop(.6, '#3b3632'); g.addColorStop(1, '#1a1714');
        c.fillStyle = g; c.strokeStyle = '#ffb66e'; c.lineWidth = Math.max(1.2, r * .14);
        c.beginPath(); c.arc(0, 0, r * .85, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(-r * .3, -r * .32, r * .18, 0, TAU); c.fill();
      }
    },
    // 12 · Pulse Quantum Turret: a bright quantum core with two orbiting electrons.
    pulse_quantum: {
      size: 1.15,
      impact: 1.35,
      trail: '#9fe6ff',
      paint(c, r, t) {
        glowDot(c, r * 1.7, 'rgba(235,252,255,1)', 'rgba(90,200,255,.5)');
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, r * .42, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(180,240,255,.85)'; c.lineWidth = Math.max(.8, r * .08);
        for (let k = 0; k < 2; k++) {
          c.save(); c.rotate(k ? .9 : -.9); c.beginPath(); c.ellipse(0, 0, r * 1.25, r * .45, 0, 0, TAU); c.stroke();
          const a = t * 10 + k * Math.PI; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(Math.cos(a) * r * 1.25, Math.sin(a) * r * .45, r * .17, 0, TAU); c.fill(); c.restore();
        }
      }
    },
    // 13 · Gatling Gun: a thin bright tracer slug.
    gatling: {
      size: .75,
      trail: '#c8ffe6',
      paint(c, r) {
        c.save(); c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(-r * 3, 0, r, 0); g.addColorStop(0, 'rgba(128,255,199,0)'); g.addColorStop(1, 'rgba(220,255,240,1)');
        c.fillStyle = g; c.beginPath(); c.moveTo(r * 1.1, 0); c.lineTo(-r * 3, -r * .22); c.lineTo(-r * 3, r * .22); c.closePath(); c.fill(); c.restore();
        c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(r * .4, 0, r * .7, r * .26, 0, 0, TAU); c.fill();
      }
    },
    // 14 · Split Cannon: twin amber cores held by a crackling bridge, about to break apart.
    split_cannon: {
      size: 1.2,
      impact: 1.3,
      trail: '#ffd894',
      paint(c, r, t) {
        const gap = r * (.42 + Math.sin(t * 18) * .06);
        c.save(); c.strokeStyle = '#fff3c8'; c.lineWidth = Math.max(1, r * .12); c.beginPath(); c.moveTo(0, -gap);
        for (let i = 1; i <= 4; i++) c.lineTo((i % 2 ? .18 : -.18) * r, -gap + i * gap / 2); c.stroke(); c.restore();
        for (const side of [-1, 1]) { c.save(); c.translate(0, side * gap); glowDot(c, r * .85, 'rgba(255,250,225,1)', 'rgba(255,190,90,.6)'); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, r * .25, 0, TAU); c.fill(); c.restore(); }
      }
    },
    // 14b · Split Cannon child: a slim amber dart that peels off after the split.
    split_cannon_child: {
      size: .85,
      paint(c, r) {
        glowDot(c, r * 1.1, 'rgba(255,248,220,1)', 'rgba(255,190,90,.55)');
        c.fillStyle = '#fff3c8'; c.beginPath(); c.moveTo(r * 1.1, 0); c.lineTo(-r * .6, -r * .38); c.lineTo(-r * .25, 0); c.lineTo(-r * .6, r * .38); c.closePath(); c.fill();
      }
    },
    // 16 · Reflective Bastion: a faceted ice-blue diamond shard with a prism glint.
    reflect_bastion: {
      size: 1.15,
      paint(c, r, t) {
        glowDot(c, r * 1.4, 'rgba(240,252,255,.95)', 'rgba(150,220,255,.4)');
        c.save(); c.rotate(Math.sin(t * 6) * .25);
        c.fillStyle = '#dff8ff'; c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(.8, r * .08);
        c.beginPath(); c.moveTo(r * 1.1, 0); c.lineTo(0, -r * .62); c.lineTo(-r * .7, 0); c.lineTo(0, r * .62); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = 'rgba(120,200,255,.8)'; c.beginPath(); c.moveTo(r * 1.1, 0); c.lineTo(-r * .7, 0); c.moveTo(0, -r * .62); c.lineTo(0, r * .62); c.stroke();
        const glint = (Math.sin(t * 9) + 1) / 2; c.globalAlpha = glint; c.fillStyle = '#ffe6fb'; c.beginPath(); c.arc(r * .25, -r * .2, r * .16, 0, TAU); c.fill();
        c.restore();
      }
    },
    // 17 · Scatter Heavy Cannon: a hot buckshot pellet with a spark flick.
    scatter_heavy: {
      size: .9,
      impact: .9,
      paint(c, r, t) {
        glowDot(c, r * 1.2, 'rgba(255,246,220,1)', 'rgba(255,150,70,.55)');
        c.fillStyle = '#fff3d6'; c.beginPath(); c.arc(0, 0, r * .42, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,190,110,.85)'; c.lineWidth = Math.max(.8, r * .14); c.lineCap = 'round';
        c.beginPath(); c.moveTo(-r * .4, 0); c.lineTo(-r * (1.2 + Math.sin(t * 30) * .2), 0); c.stroke();
      }
    },
    // 18 · Double Burst Core: a sleek cyan capsule bolt with a white core.
    double_burst: {
      size: 1,
      paint(c, r, t) {
        // A piercing cyan lance: long bright needle with a flickering energy sheath.
        glowDot(c, r * 1.2, 'rgba(235,255,255,.9)', 'rgba(110,230,255,.4)');
        c.fillStyle = 'rgba(140,240,255,.55)'; c.beginPath(); c.moveTo(r * 1.6, 0); c.lineTo(-r * 1.6, -r * (.3 + Math.sin(t * 40) * .05)); c.lineTo(-r * 1.6, r * (.3 + Math.sin(t * 40) * .05)); c.closePath(); c.fill();
        c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(r * 1.7, 0); c.lineTo(-r * 1.1, -r * .12); c.lineTo(-r * 1.1, r * .12); c.closePath(); c.fill();
      }
    },
    // 20 · Void Devourer: a dark void orb with a thin violet event-horizon ring.
    void_devourer: {
      size: 1.2,
      paint(c, r, t) {
        glowDot(c, r * 1.5, 'rgba(200,180,255,.7)', 'rgba(110,80,230,.4)');
        c.fillStyle = '#0a0418'; c.beginPath(); c.arc(0, 0, r * .62, 0, TAU); c.fill();
        c.save(); c.rotate(t * 6); c.strokeStyle = '#d9ccff'; c.lineWidth = Math.max(1, r * .12); c.beginPath(); c.ellipse(0, 0, r * .95, r * .38, 0, 0, TAU * .8); c.stroke(); c.restore();
      }
    },
    // 21 · Vulnerability Mark Core: a red marker dart with a tiny reticle.
    vulnerability_mark: {
      size: 1.05,
      paint(c, r, t) {
        glowDot(c, r * 1.3, 'rgba(255,230,236,.95)', 'rgba(255,90,130,.45)');
        c.fillStyle = '#ffd0dc'; c.beginPath(); c.moveTo(r * 1.2, 0); c.lineTo(-r * .5, -r * .4); c.lineTo(-r * .2, 0); c.lineTo(-r * .5, r * .4); c.closePath(); c.fill();
        c.save(); c.rotate(t * 5); c.strokeStyle = '#ff6f91'; c.lineWidth = Math.max(.8, r * .1); c.beginPath(); c.arc(0, 0, r * .75, 0, TAU); c.stroke();
        for (let k = 0; k < 4; k++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(r * .55, 0); c.lineTo(r * .95, 0); c.stroke(); } c.restore();
      }
    },
    // 22 · Emerald Drake: an emerald dragonfire bolt with licking green flame tongues.
    emerald_drake: {
      size: 1.25,
      impact: 1.2,
      paint(c, r, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) {
          const f = .8 + Math.sin(t * 22 + i * 2) * .2, len = r * (1.4 + i * .45) * f, w = r * (.62 - i * .14);
          c.globalAlpha = .7 - i * .16; c.fillStyle = ['#c9ffdc', '#3df58e', '#14b866'][i];
          c.beginPath(); c.moveTo(r * .2, -w); c.quadraticCurveTo(-len * .5, -w * 1.1 + Math.sin(t * 16 + i) * r * .22, -len, Math.sin(t * 13 + i) * r * .28); c.quadraticCurveTo(-len * .5, w * 1.1, r * .2, w); c.closePath(); c.fill();
        }
        c.restore();
        glowDot(c, r * 1.2, 'rgba(235,255,240,1)', 'rgba(60,240,140,.6)');
        c.fillStyle = '#f4fff7'; c.beginPath(); c.arc(r * .12, 0, r * .36, 0, TAU); c.fill();
      }
    },
    // 23 · Capacitor Pulse: a small amber charge cell...
    capacitor_pulse: {
      size: .9,
      paint(c, r) {
        glowDot(c, r * 1.1, 'rgba(255,248,210,.95)', 'rgba(255,200,80,.45)');
        c.fillStyle = '#ffe08a'; c.fillRect(-r * .55, -r * .32, r * 1.1, r * .64);
        c.fillStyle = '#fff8dc'; c.fillRect(r * .55, -r * .16, r * .2, r * .32);
      }
    },
    // ...and every 5th shot a big crackling surge orb with lightning arcs.
    capacitor_pulse_charged: {
      size: 1.7,
      impact: 1.3,
      paint(c, r, t) {
        glowDot(c, r * 1.5, 'rgba(255,255,235,1)', 'rgba(255,215,70,.6)');
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, r * .4, 0, TAU); c.fill();
        c.strokeStyle = '#fff6c2'; c.lineWidth = Math.max(1, r * .1);
        for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + t * 9; c.beginPath(); c.moveTo(Math.cos(a) * r * .45, Math.sin(a) * r * .45); c.lineTo(Math.cos(a + .4) * r * .8, Math.sin(a + .4) * r * .8); c.lineTo(Math.cos(a - .1) * r * 1.15, Math.sin(a - .1) * r * 1.15); c.stroke(); }
      }
    },
    // 24 · Royal Sapphire Tide: a sapphire water orb with a curling wave crest.
    royal_tide: {
      size: 1.15,
      paint(c, r, t) {
        glowDot(c, r * 1.5, 'rgba(235,245,255,1)', 'rgba(70,140,255,.75)');
        c.fillStyle = '#4a8dff'; c.beginPath(); c.arc(0, 0, r * .7, 0, TAU); c.fill();
        c.strokeStyle = '#eaf4ff'; c.lineWidth = Math.max(1, r * .12); c.beginPath(); c.arc(-r * .1, 0, r * .48, -2.4 + Math.sin(t * 8) * .2, .4); c.stroke();
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(r * .22, -r * .22, r * .14, 0, TAU); c.fill();
      }
    },
    // 25 · Phase Echo Cannon: a magenta phase bolt...
    phase_echo: {
      size: 1.05,
      paint(c, r) {
        glowDot(c, r * 1.25, 'rgba(255,230,250,.95)', 'rgba(255,110,230,.5)');
        c.fillStyle = '#ffc4f2'; c.beginPath(); c.moveTo(r * 1.15, 0); c.lineTo(-r * .55, -r * .42); c.lineTo(-r * .3, 0); c.lineTo(-r * .55, r * .42); c.closePath(); c.fill();
      }
    },
    // ...and its echo: the same bolt as a hollow, flickering ghost with doubled outlines.
    phase_echo_echo: {
      size: 1.05,
      paint(c, r, t) {
        c.globalAlpha = .55 + Math.sin(t * 40) * .2;
        c.strokeStyle = '#ff9bea'; c.lineWidth = Math.max(1, r * .14);
        for (const off of [0, -r * .35]) { c.beginPath(); c.moveTo(r * 1.15 + off, 0); c.lineTo(-r * .55 + off, -r * .42); c.lineTo(-r * .3 + off, 0); c.lineTo(-r * .55 + off, r * .42); c.closePath(); c.stroke(); c.globalAlpha *= .5; }
        c.globalAlpha = 1;
      }
    },
    // 26 · Missile Nest: a micro rocket with a flickering exhaust and smoke puffs.
    missile_nest: {
      size: 1.05,
      impact: 1.25,
      paint(c, r, t) {
        c.save(); c.globalAlpha = .45; c.fillStyle = '#9a948c';
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-r * (1.5 + i * .6), Math.sin(t * 9 + i) * r * .2, r * (.32 - i * .06), 0, TAU); c.fill(); }
        c.restore();
        const f = .8 + Math.sin(t * 50) * .2;
        c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = '#ffd36e'; c.beginPath(); c.moveTo(-r * .55, -r * .2); c.lineTo(-r * (1.1 + .4 * f), 0); c.lineTo(-r * .55, r * .2); c.closePath(); c.fill(); c.restore();
        c.fillStyle = '#f2ece2'; c.strokeStyle = '#7a4b22'; c.lineWidth = Math.max(.8, r * .08);
        c.beginPath(); c.moveTo(r * 1, 0); c.lineTo(r * .45, -r * .24); c.lineTo(-r * .55, -r * .24); c.lineTo(-r * .55, r * .24); c.lineTo(r * .45, r * .24); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#ffbc72'; c.beginPath(); c.moveTo(-r * .3, -r * .24); c.lineTo(-r * .6, -r * .5); c.lineTo(-r * .55, -r * .24); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-r * .3, r * .24); c.lineTo(-r * .6, r * .5); c.lineTo(-r * .55, r * .24); c.closePath(); c.fill();
      }
    },
    // 30 · Flame Sprayer: a tumbling fuel bomb, dark canister with a lit fuse flame.
    flame_sprayer: {
      size: 1.15,
      impact: 1.4,
      paint(c, r, t) {
        c.save(); c.rotate(t * 8);
        c.fillStyle = '#5a2a14'; c.strokeStyle = '#ff9a4d'; c.lineWidth = Math.max(1, r * .12);
        c.beginPath(); c.ellipse(0, 0, r * .75, r * .55, 0, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = '#ffb35a'; c.fillRect(-r * .1, -r * .55, r * .2, r * 1.1);
        c.restore();
        c.save(); c.globalCompositeOperation = 'lighter'; const f = .8 + Math.sin(t * 40) * .2;
        c.fillStyle = '#ffd36e'; c.beginPath(); c.arc(-r * .7, 0, r * .3 * f, 0, TAU); c.fill(); c.restore();
      }
    },
    // 31 · Long-Range Sniper: a short, separate gold laser bolt (not a line joined to the gun).
    long_range_sniper: {
      size: 1,
      paint(c, r) {
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        c.strokeStyle = 'rgba(255,229,131,.55)'; c.lineWidth = r * .8; c.beginPath(); c.moveTo(r * 1.2, 0); c.lineTo(-r * 2.6, 0); c.stroke();
        c.strokeStyle = '#ffffff'; c.lineWidth = r * .3; c.beginPath(); c.moveTo(r * 1.3, 0); c.lineTo(-r * 2.2, 0); c.stroke();
        c.restore();
      }
    },
    // 35 · Cluster Bomb: a segmented cluster shell with three glowing bomblet pods...
    cluster_bomb: {
      size: 1.3,
      impact: 1.2,
      paint(c, r, t) {
        c.fillStyle = '#3a3f4a'; c.strokeStyle = '#ffb66e'; c.lineWidth = Math.max(1, r * .1);
        c.beginPath(); c.ellipse(0, 0, r * .95, r * .6, 0, 0, TAU); c.fill(); c.stroke();
        for (let i = 0; i < 3; i++) { const x = (i - 1) * r * .5, on = (Math.floor(t * 6) + i) % 3 === 0; c.fillStyle = on ? '#fff1c2' : '#ff9a3c'; c.beginPath(); c.arc(x, 0, r * .2, 0, TAU); c.fill(); }
      }
    },
    // ...and each bomblet: a small dark pod with a blinking fuse light.
    cluster_bomb_bomblet: {
      size: .8,
      paint(c, r, t) {
        c.fillStyle = '#2c2f36'; c.strokeStyle = '#ffb66e'; c.lineWidth = Math.max(.8, r * .12);
        c.beginPath(); c.arc(0, 0, r * .55, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = Math.floor(t * 16) % 2 ? '#ff4d3d' : '#fff1c2'; c.beginPath(); c.arc(0, 0, r * .2, 0, TAU); c.fill();
      }
    },
    // 37 · Soul Drain: a pale-green spirit bolt with a wavering ghost tail.
    soul_drain: {
      size: 1.1,
      paint(c, r, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(133,255,182,.45)'; c.beginPath(); c.moveTo(r * .2, -r * .5); c.quadraticCurveTo(-r * 1.2, -r * .5 + Math.sin(t * 14) * r * .3, -r * 2, Math.sin(t * 10) * r * .3); c.quadraticCurveTo(-r * 1.2, r * .5 + Math.sin(t * 14 + 1) * r * .3, r * .2, r * .5); c.closePath(); c.fill(); c.restore();
        glowDot(c, r * 1.2, 'rgba(240,255,245,1)', 'rgba(110,240,170,.55)');
        c.fillStyle = '#0d2a1c'; c.beginPath(); c.arc(r * .22, -r * .14, r * .1, 0, TAU); c.arc(r * .22, r * .14, r * .1, 0, TAU); c.fill();
      }
    },
    // 39 · Antimatter: a black antimatter orb wrapped in a crackling magenta rim.
    antimatter: {
      size: 1.6,
      paint(c, r, t) {
        glowDot(c, r * 1.6, 'rgba(255,210,240,.9)', 'rgba(255,105,206,.5)');
        c.fillStyle = '#06010a'; c.beginPath(); c.arc(0, 0, r * .72, 0, TAU); c.fill();
        c.strokeStyle = '#ffd1f1'; c.lineWidth = Math.max(1, r * .1); c.beginPath(); c.arc(0, 0, r * .72, 0, TAU); c.stroke();
        c.save(); c.rotate(t * 8); c.strokeStyle = '#ff69ce'; c.lineWidth = Math.max(.8, r * .07); c.beginPath(); c.arc(0, 0, r * .92, 0, 1.4); c.stroke(); c.beginPath(); c.arc(0, 0, r * .92, Math.PI, Math.PI + 1.4); c.stroke(); c.restore();
      }
    },
    // 40 · Spirit Charger: a bright green spirit bolt with a cross-shaped glint.
    vital_orb: {
      size: 1.15,
      paint(c, r, t) {
        glowDot(c, r * 1.4, 'rgba(240,255,230,1)', 'rgba(140,255,100,.5)');
        c.save(); c.rotate(t * 3); c.fillStyle = '#f4ffe9';
        c.fillRect(-r * .12, -r * .55, r * .24, r * 1.1); c.fillRect(-r * .55, -r * .12, r * 1.1, r * .24); c.restore();
      }
    },
    // 15 · Arcane Core: a violet arcane orb inside a turning rune ring, shedding glyph sparks.
    arcane_core: {
      size: 1.3,
      impact: 1.4,
      trail: false,
      paint(c, r, t) {
        c.save(); c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 1;
        // pulsing bloom
        const pulse = 1 + Math.sin(t * 16) * .12;
        glowDot(c, r * 1.9 * pulse, 'rgba(255,255,255,1)', 'rgba(160,120,255,.65)');
        c.restore();
        // rune ring: hexagram turning one way, outer ring the other
        c.save(); c.rotate(-t * 5); c.strokeStyle = '#f2ecff'; c.lineWidth = Math.max(1, r * .1);
        c.beginPath(); c.arc(0, 0, r * 1.15, 0, TAU); c.stroke();
        c.restore();
        c.save(); c.rotate(t * 7); c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(.9, r * .08);
        for (const off of [0, Math.PI / 3]) { c.beginPath(); for (let k = 0; k < 3; k++) { const a = off + k * TAU / 3; k ? c.lineTo(Math.cos(a) * r * .9, Math.sin(a) * r * .9) : c.moveTo(Math.cos(a) * r * .9, Math.sin(a) * r * .9); } c.closePath(); c.stroke(); }
        c.restore();
        // three glyph satellites orbiting the ring
        c.fillStyle = '#ffffff';
        for (let k = 0; k < 3; k++) { const a = t * 9 + k * TAU / 3; c.save(); c.translate(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15); c.rotate(a); c.fillRect(-r * .14, -r * .14, r * .28, r * .28); c.restore(); }
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, r * .4, 0, TAU); c.fill();
      }
    }
  };
  // Thousand-Blade Case: a flying jian designed to read well in a flock — a long, slim, luminous blade
  // with a pale sword-qi edge, a thin gold guard and a short dark grip. No tassels or mist: the light
  // streak drawn along each sword's real flight path (in the battle renderer) carries the motion.
  const jian = (c, r, t, gold) => {
    const TAU = Math.PI * 2;
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    // Qi edge: a soft glow hugging the blade.
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = gold ? 'rgba(255,214,120,.35)' : 'rgba(150,220,255,.35)'; c.lineWidth = r * .55;
    c.beginPath(); c.moveTo(-r * .2, 0); c.lineTo(r * 3.1, 0); c.stroke();
    c.globalCompositeOperation = 'source-over';
    // Grip and pommel.
    c.fillStyle = '#1d1712'; c.beginPath(); c.moveTo(-r * 1.05, -r * .09); c.lineTo(-r * .5, -r * .1); c.lineTo(-r * .5, r * .1); c.lineTo(-r * 1.05, r * .09); c.closePath(); c.fill();
    c.fillStyle = gold ? '#ffe08a' : '#d8b25a'; c.beginPath(); c.arc(-r * 1.08, 0, r * .09, 0, TAU); c.fill();
    // Thin gold guard.
    c.beginPath(); c.moveTo(-r * .52, -r * .3); c.quadraticCurveTo(-r * .4, 0, -r * .52, r * .3); c.lineTo(-r * .44, r * .3); c.quadraticCurveTo(-r * .32, 0, -r * .44, -r * .3); c.closePath(); c.fill();
    // Blade.
    const g = c.createLinearGradient(0, -r * .15, 0, r * .15);
    if (gold) { g.addColorStop(0, '#d9a93f'); g.addColorStop(.5, '#fff6d6'); g.addColorStop(1, '#e0b453'); }
    else { g.addColorStop(0, '#a9b6c4'); g.addColorStop(.5, '#ffffff'); g.addColorStop(1, '#bcd0e0'); }
    c.fillStyle = g; c.beginPath(); c.moveTo(-r * .38, -r * .14); c.lineTo(r * 2.75, -r * .1); c.lineTo(r * 3.25, 0); c.lineTo(r * 2.75, r * .1); c.lineTo(-r * .38, r * .14); c.closePath(); c.fill();
    c.strokeStyle = gold ? 'rgba(160,110,30,.6)' : 'rgba(90,110,130,.55)'; c.lineWidth = Math.max(.4, r * .03); c.beginPath(); c.moveTo(-r * .36, 0); c.lineTo(r * 3.05, 0); c.stroke();
    c.restore();
  };
  styles.sword_orb = { size: 1.6, impact: 1.5, trail: false, jian, paint(c, r, t) { jian(c, r, t, false); } };
  styles.sword_orb_gold = { size: 1.75, impact: 1.7, trail: false, paint(c, r, t) { jian(c, r, t, true); } };
  // Phoenix Blaze: each shell is a tiny flapping phoenix (the promo bird), nose forward, with an ember tail.
  const phoenixBird = (c, color, k, time = 0, embers = true) => {
  const TAU = Math.PI * 2, flap = Math.sin(time * 6) * .35;
  c.save(); c.scale(k, k);
  for (const side of [-1, 1]) {
    c.save(); c.scale(side, 1); c.rotate(-flap);
    c.fillStyle = color; c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(28, -34, 46, -12); c.quadraticCurveTo(30, -10, 36, 4); c.quadraticCurveTo(20, 0, 2, 8); c.fill();
    c.fillStyle = "#ffd36e"; c.beginPath(); c.moveTo(4, 0); c.quadraticCurveTo(22, -22, 34, -10); c.quadraticCurveTo(18, -6, 4, 6); c.fill();
    c.restore();
  }
  c.fillStyle = "#ff7a3d"; c.beginPath(); c.moveTo(-5, 10); c.quadraticCurveTo(0, 30, 0, 36); c.quadraticCurveTo(0, 30, 5, 10); c.fill();
  c.fillStyle = "#fff1c9"; c.beginPath(); c.ellipse(0, 2, 6, 12, 0, 0, TAU); c.fill();
  if (embers) for (let i = 0; i < 3; i += 1) { const q = (time * 1.2 + i / 3) % 1; c.globalAlpha = 1 - q; c.fillStyle = "#ffcf6e"; c.beginPath(); c.arc(0, -14 - q * 44, 4 - q * 2, 0, TAU); c.fill(); }
  c.restore();
};
  styles.phoenix_orb = { size: 2.1, impact: 1.7, trail: false, bird: phoenixBird, paint(c, r, t) {
    c.save(); glowDot(c, r * 1.6, 'rgba(255,210,120,.55)', 'rgba(255,122,61,.18)'); c.rotate(Math.PI / 2); phoenixBird(c, '#ff7a3d', r / 44, t * 2, false);
    for (let i = 0; i < 3; i++) { const q = (t * 2 + i / 3) % 1; c.globalAlpha = (1 - q) * .8; c.fillStyle = '#ffcf6e'; c.beginPath(); c.arc(0, r * (.9 + q * 1.4), r * .16 * (1 - q * .5), 0, Math.PI * 2); c.fill(); }
    c.restore();
  } };
  // Bomb Sub-cannon: a round black bomb with a short fuse and a flickering spark (matches its promo art).
  styles.bomb_orb = { size: 1.9, impact: 1.8, trail: false, paint(c, r, t) {
    c.save(); c.fillStyle = '#2a1b10'; c.strokeStyle = '#ffb056'; c.lineWidth = Math.max(1, r * .14);
    c.beginPath(); c.arc(0, 0, r * .72, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.arc(-r * .22, -r * .22, r * .18, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#d9b48a'; c.lineWidth = Math.max(1, r * .14); c.beginPath(); c.moveTo(r * .45, -r * .45); c.lineTo(r * .8, -r * .8); c.stroke();
    const on = Math.sin(t * 40) > 0; c.fillStyle = on ? '#fff4b0' : '#ffb056'; c.beginPath(); c.arc(r * .85, -r * .85, r * (on ? .3 : .2), 0, Math.PI * 2); c.fill(); c.restore();
  } };
  // Frostbite Cannon: a slim ice lance - a long pale shard with a bright white core (the promo's ice arrow).
  styles.frostbite_orb = { size: 1.5, impact: 1.2, trail: false, paint(c, r) {
    c.save(); const g = c.createLinearGradient(-r * 1.4, 0, r * 1.6, 0); g.addColorStop(0, 'rgba(168,216,255,0)'); g.addColorStop(.35, '#a8d8ff'); g.addColorStop(1, '#ffffff');
    c.fillStyle = g; c.beginPath(); c.moveTo(r * 1.6, 0); c.lineTo(r * .2, -r * .26); c.lineTo(-r * 1.4, 0); c.lineTo(r * .2, r * .26); c.closePath(); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(r * 1.4, 0); c.lineTo(r * .5, -r * .08); c.lineTo(-r * .2, 0); c.lineTo(r * .5, r * .08); c.closePath(); c.fill(); c.restore();
  } };
  // Ice Wall Barrier fires the same faceted ice crystal as Frost Core, but larger and paler.
  styles.icewall_orb = { ...styles.frost_core, size: 1.45, impact: 1.6, trail: false };
  globalThis.SpaceTowerShotStyles = Object.freeze(styles);
})();
