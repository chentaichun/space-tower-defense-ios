import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFileSync } from "node:fs";
const script = readFileSync(new URL("../render-performance.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("simulation errors pause the run without killing animation or repeating telemetry", () => {
  const render = html.match(/    function render\(time\) \{[\s\S]*?\n    \}/)[0];
  let scheduled = 0, recorded = 0;
  const context = { requestAnimationFrame:()=>scheduled++, lastTime:0, gameSpeed:1, shake:0,
    document:{hidden:true}, isPaused:false, pauseButton:{}, currentLanguage:'en',
    EXTRA_I18N:{en:{resume:'Resume'}}, runStats:{}, wave:10, activeRunTier:1,
    updateScaledTime:()=>{throw new Error('simulation failure')}, trackGameEvent(){},
    window:{spaceTowerRecordException:()=>recorded++} };
  vm.runInNewContext(render,context);
  context.render(10);context.render(20);
  assert.equal(scheduled,2);assert.equal(recorded,1);assert.equal(context.isPaused,true);
  assert.equal(context.pauseButton.textContent,'Resume');
});

test("30/60/90/120/144 Hz displays render smoothly up to the 90 FPS presentation cap", () => {
  for (const hz of [30, 60, 90, 120, 144]) {
    const context = { window: {} }; vm.runInNewContext(script, context);
    const renderer = context.window.spaceTowerRendering;
    for (let frame = 0; frame < hz * 10; frame++) renderer.shouldDraw(frame * 1000 / hz);
    assert.ok(renderer.stats.frames <= 901, `${hz} Hz produced ${renderer.stats.frames} draws`);
    assert.ok(renderer.stats.frames >= Math.min(hz, 90) * 10 - 1);
    assert.equal(renderer.stats.callbacks, hz * 10);
    assert.equal(renderer.targetFrameRate, 90);
  }
});

test("visual draws and random samples never touch gameplay simulation or RNG", () => {
  const math = Object.create(Math); math.random = () => { throw new Error("gameplay RNG touched"); };
  const context = { window: {}, Math: math }; vm.runInNewContext(script, context);
  for (let i = 0; i < 1000; i++) assert.ok(context.window.spaceTowerRendering.random(0, 1) < 1);
  const render = html.match(/    function render\(time\) \{[\s\S]*?\n    \}/)[0];
  let simulated = 0, scheduled = 0, draws = 0, frameTransform = [];
  Object.assign(context, { lastTime: 0, gameSpeed: 10, document: { hidden: false }, commerceAppActive: true, commercePurchaseActive: false,
    updateScaledTime: (dt) => simulated += dt,
    requestAnimationFrame: () => scheduled++, shake: 0, width: 400, height: 600,
    canvas: { width: 800, height: 1200 },
    ctx: { save() {}, translate() {}, restore() {}, setTransform(...args) { frameTransform = args; } }
  });
  for (const name of render.matchAll(/\b(draw\w+)\(/g)) context[name[1]] = () => {
    if (name[1] === "drawBackground") {
      assert.deepEqual(frameTransform, [2, 0, 0, 2, 0, 0], "GPU state loss must not shrink the battlefield");
      draws++;
    }
  };
  vm.runInNewContext(render, context);
  for (let i = 0; i <= 1200; i++) {
    frameTransform = [1, 0, 0, 1, 0, 0]; // Simulate restored/reset 2D state.
    context.render(i * 1000 / 120);
  }
  assert.ok(Math.abs(simulated - 100) < 1e-8, simulated);
  assert.ok(draws <= 901); assert.equal(scheduled, 1201);
  const before = draws;
  context.commercePurchaseActive = true;
  context.render(11000);
  assert.equal(draws, before, "checkout must stop GPU draws");
  context.commercePurchaseActive = false;
  context.commerceAppActive = false;
  context.render(12000);
  assert.equal(draws, before, "background app must stop GPU draws");
});

test("camera impact stays subtle, smooth, bounded, and independent of battle speed", () => {
  const context = { window: {} }; vm.runInNewContext(script, context);
  const renderer = context.window.spaceTowerRendering;
  for (const intensity of [0, 0.9, 1.5, 2.6, 14, 100]) {
    for (let time = 0; time <= 1000; time += 8) {
      const offset = renderer.shakeOffset(intensity, time);
      assert.ok(Math.abs(offset.x) <= 2.600001);
      assert.ok(Math.abs(offset.y) <= 1.508001);
    }
  }
  const addImpactShake = html.match(/    function addImpactShake[\s\S]*?\n    \}/)[0];
  const shakeContext = { shake: 0, Math, Number };
  vm.runInNewContext(addImpactShake, shakeContext);
  shakeContext.addImpactShake(4.8);
  assert.ok(shakeContext.shake < 0.9);
  shakeContext.addImpactShake(100);
  assert.equal(shakeContext.shake, 2.6);
  const update = html.match(/    function update\(dt\) \{[\s\S]*?\n    \}/)[0];
  const render = html.match(/    function render\(time\) \{[\s\S]*?\n    \}/)[0];
  assert.doesNotMatch(update, /shake\s*=\s*Math\.max\(0/);
  assert.match(render, /shake = Math\.max\(0, shake - dt \* 18\)/);
});

test("1000 hits preserve hit counters while bounding particles, shockwaves and damage text", () => {
  const context = { window: {}, hitCount: 0, shake: 0, particles: [], shockwaves: [], scorePopups: [],
    getExtraText: () => ({ critPopup: "CRIT", magicCritPopup: "M.CRIT" }), formatCompactNumber: String,
    getQualityParticleScale: () => 1, hitSound() {}
  };
  vm.runInNewContext(script, context);
  const push = html.match(/    function pushVisualEffect[\s\S]*?\n    \}/)[0];
  const shake = html.match(/    function addImpactShake[\s\S]*?\n    \}/)[0];
  const hit = html.match(/    function createHit[\s\S]*?\n    \}/)[0];
  vm.runInNewContext(push + "\n" + shake + "\n" + hit, context);
  for (let i = 0; i < 1000; i++) context.createHit(0, 0, { size: 10 }, 20, "#fff", true);
  assert.equal(context.hitCount, 1000);
  assert.equal(context.particles.length, 120);
  assert.equal(context.shockwaves.length, 48);
  assert.equal(context.scorePopups.length, 56);
});

test("Emerald impact visuals stay bounded and expire by wall time at every game speed", () => {
  const effect = readFileSync(new URL("../emerald-effects.js", import.meta.url), "utf8");
  let now = 0, draws = 0;
  const context = new Proxy({}, { get: (_, key) => key.startsWith("create") ? () => ({ addColorStop() {} }) : () => { draws++; }, set: () => true });
  const math = Object.create(Math); math.random = () => { throw new Error("cosmetic effect used combat RNG"); };
  const sandbox = { document: { createElement: () => ({ getContext: () => context }) }, ctx: context,
    performance: { now: () => now }, drawEffects() {}, Math: math, gameStarted: true,
    isRenderVisible: () => true, battleVisualScale: 1, turretVisualScale: 1 };
  vm.runInNewContext(effect, sandbox);
  for (let i = 0; i < 1000; i++) sandbox.addEmeraldImpact({ x: i, y: 0 }, [{ x: i + 60, y: 0 }]);
  assert.equal(vm.runInNewContext("emeraldImpacts.length", sandbox), 24);
  sandbox.drawEmeraldProjectile({ x: 100, y: 100, vx: 100, vy: 0 });
  sandbox.drawEffects(); assert.ok(draws > 0);
  now = 321; sandbox.drawEffects();
  assert.equal(vm.runInNewContext("emeraldImpacts.length", sandbox), 0);
});
