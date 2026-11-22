/* Distinct silhouettes for every ranked enemy type. Painted once per
   type/size into a cached sprite, nose toward +X. `s` is the ship radius. */
(() => {
  const TAU = Math.PI * 2;
  const path = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  const body = (c, pts) => { path(c, pts); c.fill(); c.stroke(); };
  const shine = (c, pts, a = .32) => { c.save(); c.fillStyle = `rgba(255,255,255,${a})`; path(c, pts); c.fill(); c.restore(); };
  const dot = (c, x, y, r, color) => { c.save(); c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); };
  const engine = (c, x, y, r, color) => { c.save(); c.globalAlpha = .85; c.fillStyle = color; c.beginPath(); c.ellipse(x, y, r * 1.6, r * .7, 0, 0, TAU); c.fill(); c.restore(); };

  const styles = {
    // Standard fighter: compact delta wing with a cockpit.
    basic(c, s) {
      body(c, [[s * .85, 0], [-s * .2, -s * .3], [-s * .7, -s * .75], [-s * .5, 0], [-s * .7, s * .75], [-s * .2, s * .3]]);
      shine(c, [[s * .6, 0], [-s * .15, -s * .16], [-s * .15, s * .16]]);
      dot(c, s * .2, 0, s * .14, '#eaffff');
    },
    // Fast: a long thin needle with twin engine flares.
    runner(c, s) {
      body(c, [[s * 1.05, 0], [-s * .55, -s * .26], [-s * .8, -s * .48], [-s * .62, 0], [-s * .8, s * .48], [-s * .55, s * .26]]);
      engine(c, -s * .9, -s * .22, s * .16, '#d6ffe8'); engine(c, -s * .9, s * .22, s * .16, '#d6ffe8');
      c.save(); c.strokeStyle = 'rgba(200,255,225,.55)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-s * 1.1, -s * .22); c.lineTo(-s * 1.7, -s * .22); c.moveTo(-s * 1.1, s * .22); c.lineTo(-s * 1.7, s * .22); c.stroke(); c.restore();
    },
    // Swarm: a tiny round drone with three fins.
    swarm(c, s) {
      for (let i = 0; i < 3; i++) { c.save(); c.rotate(Math.PI + (i - 1) * .9); body(c, [[s * .35, -s * .14], [s * .95, 0], [s * .35, s * .14]]); c.restore(); }
      c.beginPath(); c.arc(0, 0, s * .5, 0, TAU); c.fill(); c.stroke();
      dot(c, s * .14, 0, s * .2, '#fff6d0');
    },
    // Tank: a wide armored hull with tread plates and a front ram.
    tank(c, s) {
      body(c, [[s * .9, -s * .25], [s * .9, s * .25], [s * .55, s * .7], [-s * .8, s * .7], [-s * .8, -s * .7], [s * .55, -s * .7]]);
      c.save(); c.fillStyle = 'rgba(40,10,20,.45)'; c.fillRect(-s * .8, -s * .7, s * 1.35, s * .22); c.fillRect(-s * .8, s * .48, s * 1.35, s * .22); c.restore();
      c.save(); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { const x = -s * .65 + i * s * .38; c.beginPath(); c.moveTo(x, -s * .7); c.lineTo(x, -s * .48); c.moveTo(x, s * .48); c.lineTo(x, s * .7); c.stroke(); } c.restore();
      shine(c, [[s * .55, -s * .2], [s * .55, s * .2], [-s * .3, s * .2], [-s * .3, -s * .2]], .22);
    },
    // Armored: a beetle shell of two stacked plates.
    armored(c, s) {
      body(c, [[s * .9, 0], [s * .1, -s * .7], [-s * .75, -s * .55], [-s * .75, s * .55], [s * .1, s * .7]]);
      c.save(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(s * .45, -s * .45); c.lineTo(-s * .05, 0); c.lineTo(s * .45, s * .45); c.moveTo(s * .05, -s * .58); c.lineTo(-s * .45, 0); c.lineTo(s * .05, s * .58); c.stroke(); c.restore();
    },
    // Berserker: a jagged, spiked raider with a red eye.
    berserker(c, s) {
      body(c, [[s * .95, 0], [s * .35, -s * .25], [s * .45, -s * .7], [-s * .05, -s * .35], [-s * .45, -s * .8], [-s * .35, -s * .2], [-s * .85, 0], [-s * .35, s * .2], [-s * .45, s * .8], [-s * .05, s * .35], [s * .45, s * .7], [s * .35, s * .25]]);
      dot(c, s * .25, 0, s * .17, '#ff3d3d'); dot(c, s * .27, 0, s * .07, '#fff0e8');
    },
    // Erratic: an asymmetric lightning-bolt glider.
    erratic(c, s) {
      body(c, [[s * .9, -s * .1], [s * .15, -s * .3], [s * .3, -s * .75], [-s * .55, -s * .15], [-s * .1, s * .05], [-s * .8, s * .7], [s * .05, s * .3], [-s * .1, s * .1]]);
      shine(c, [[s * .6, -s * .1], [s * .05, -s * .2], [s * .05, 0]]);
    },
    // Splitter: two hulls joined along a visible seam.
    splitter(c, s) {
      for (const side of [-1, 1]) { c.save(); c.translate(0, side * s * .3); c.beginPath(); c.ellipse(0, 0, s * .8, s * .34, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
      c.save(); c.strokeStyle = '#fff6c8'; c.setLineDash([3, 3]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(-s * .75, 0); c.lineTo(s * .75, 0); c.stroke(); c.restore();
      dot(c, s * .45, -s * .3, s * .1, '#fff6c8'); dot(c, s * .45, s * .3, s * .1, '#fff6c8');
    },
    // Ranged: a gunship with a long forward barrel and a lens.
    ranged(c, s) {
      c.save(); c.lineWidth = s * .22; c.lineCap = 'round'; c.strokeStyle = c.fillStyle; c.beginPath(); c.moveTo(s * .2, 0); c.lineTo(s * 1.15, 0); c.stroke(); c.restore();
      body(c, [[s * .45, -s * .3], [-s * .25, -s * .7], [-s * .75, -s * .35], [-s * .75, s * .35], [-s * .25, s * .7], [s * .45, s * .3]]);
      dot(c, -s * .1, 0, s * .22, '#fff0fb'); dot(c, -s * .1, 0, s * .1, '#ff4fc0');
    },
    // Healer: a round medic pod with a white cross.
    healer(c, s) {
      c.beginPath(); c.arc(0, 0, s * .68, 0, TAU); c.fill(); c.stroke();
      c.save(); c.fillStyle = '#ffffff'; c.fillRect(-s * .12, -s * .42, s * .24, s * .84); c.fillRect(-s * .42, -s * .12, s * .84, s * .24); c.restore();
      engine(c, -s * .78, 0, s * .14, '#d6ffe5');
    },
    // Full shield: a small core inside a hexagonal barrier frame.
    full_shield(c, s) {
      c.save(); c.globalAlpha = .35; path(c, Array.from({ length: 6 }, (_, i) => [Math.cos(i * TAU / 6) * s * .85, Math.sin(i * TAU / 6) * s * .85])); c.fill(); c.globalAlpha = 1; c.stroke(); c.restore();
      body(c, [[s * .5, 0], [-s * .3, -s * .35], [-s * .15, 0], [-s * .3, s * .35]]);
    },
    // Buffer: a ship carrying a ringed emitter dish.
    buffer(c, s) {
      body(c, [[s * .7, 0], [-s * .4, -s * .55], [-s * .2, 0], [-s * .4, s * .55]]);
      c.save(); c.strokeStyle = '#fbffc9'; c.lineWidth = 1.3; for (const r of [.3, .52]) { c.beginPath(); c.arc(-s * .05, 0, s * r, -1.1, 1.1); c.stroke(); } c.restore();
      dot(c, -s * .05, 0, s * .12, '#ffffff');
    },
    // Frontal shield: a hull behind a thick curved plate.
    frontal_shield(c, s) {
      body(c, [[s * .35, -s * .3], [-s * .75, -s * .5], [-s * .55, 0], [-s * .75, s * .5], [s * .35, s * .3]]);
      c.save(); c.lineWidth = s * .2; c.lineCap = 'round'; c.strokeStyle = '#e0e7ff'; c.beginPath(); c.arc(-s * .1, 0, s * .82, -.95, .95); c.stroke(); c.restore();
    }
  };
  globalThis.SpaceTowerEnemyStyles = Object.freeze(styles);
})();
