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
    MAX_SIMULATION_STEP:1/60, MAX_FAST_SIMULATION_STEP:1/20,
    document:{hidden:false}, commerceAppActive:true, commercePurchaseActive:false,
    gameStarted:true, running:true, choosingCard:false, getQualityFrameRate:()=>45,
    isPaused:false, pauseButton:{}, currentLanguage:'en',
    EXTRA_I18N:{en:{resume:'Resume'}}, runStats:{}, wave:10, activeRunTier:1,
    updateScaledTime:()=>{throw new Error('simulation failure')}, updateVisualEffects(){}, trackGameEvent(){},
    window:{spaceTowerRecordException:()=>recorded++,spaceTowerRendering:{shouldDraw:()=>true,shakeOffset:()=>({x:0,y:0})}},
    canvas:{width:400,height:600},width:400,height:600,
    ctx:{setTransform(){},save(){},translate(){},restore(){}} };
  for (const name of render.matchAll(/\b(draw\w+)\(/g)) context[name[1]] = () => {};
  vm.runInNewContext(render,context);
  context.render(10);context.render(20);
  assert.equal(scheduled,2);assert.equal(recorded,1);assert.equal(context.isPaused,true);
  assert.equal(context.pauseButton.textContent,'Resume');
});

test("quality frame caps reduce drawing on fast displays and menus idle at 15 FPS", () => {
  for (const cap of [30, 45, 60]) {
    for (const hz of [30, 60, 90, 120, 144]) {
      const context = { window: {} }; vm.runInNewContext(script, context);
      const renderer = context.window.spaceTowerRendering;
      for (let frame = 0; frame < hz * 10; frame++) renderer.shouldDraw(frame * 1000 / hz, cap);
      assert.ok(renderer.stats.frames <= cap * 10 + 1, `${hz} Hz at ${cap} FPS produced ${renderer.stats.frames} draws`);
      assert.ok(renderer.stats.frames >= Math.min(hz, cap) * 10 - 2, `${hz} Hz at ${cap} FPS produced ${renderer.stats.frames} draws`);
      assert.equal(renderer.stats.callbacks, hz * 10);
      assert.equal(renderer.targetFrameRate, 60);
    }
  }
  const context = { window: {} }; vm.runInNewContext(script, context);
  const renderer = context.window.spaceTowerRendering;
  for (let frame = 0; frame < 1200; frame++) renderer.shouldDraw(frame * 1000 / 120, 15);
  assert.ok(renderer.stats.frames <= 151 && renderer.stats.frames >= 149);
});

test("opaque lobby and tutorial do no battle work; resuming does not catch up hidden time", () => {
  const render = html.match(/    function render\(time\) \{[\s\S]*?\n    \}/)[0];
  let simulated = 0, draws = 0;
  const c = { window:{}, gameStarted:false, document:{hidden:false}, commerceAppActive:true, commercePurchaseActive:false,
    lastTime:0, gameSpeed:1, running:true, isPaused:false, choosingCard:false, getQualityFrameRate:()=>45,
    MAX_SIMULATION_STEP:1/60, MAX_FAST_SIMULATION_STEP:1/20, requestAnimationFrame(){},
    updateScaledTime:dt=>simulated+=dt, updateVisualEffects(){}, shake:0, width:400,height:600,
    canvas:{width:400,height:600},ctx:{setTransform(){},save(){},translate(){},restore(){}} };
  vm.runInNewContext(script,c);
  for(const match of render.matchAll(/\b(draw\w+)\(/g)) c[match[1]]=()=>draws++;
  vm.runInNewContext(render,c);
  for(let i=0;i<1200;i++)c.render(i*1000/120);
  assert.equal(draws,0);assert.equal(simulated,0);
  c.gameStarted=true;c.window.SpaceTowerIntroActive=true;c.render(12000);
  assert.equal(draws,0);assert.equal(simulated,0);
  c.window.SpaceTowerIntroActive=false;c.render(12016);
  assert.ok(draws>0);assert.ok(Math.abs(simulated-.016)<1e-10);
});

test("every speed keeps bounded physics steps and advances the full scaled interval", () => {
  const updateScaledTime = html.match(/    function updateScaledTime\(scaledDt, maxStep = MAX_SIMULATION_STEP\) \{[\s\S]*?\n    \}/)[0];
  const steps = [];
  const context = { MAX_SIMULATION_STEP: 1 / 60, update: dt => steps.push(dt) };
  vm.runInNewContext(updateScaledTime, context);
  for (const speed of [1, 2, 3, 4, 5, 10]) {
    steps.length = 0;
    const maxStep = speed >= 5 ? 1 / 20 : speed >= 3 ? 1 / 30 : 1 / 60;
    context.updateScaledTime(speed / 60, maxStep);
    assert.ok(steps.every(dt => dt > 0 && dt <= maxStep + 1e-12), `${speed}x physics step`);
    assert.ok(Math.abs(steps.reduce((sum, dt) => sum + dt, 0) - speed / 60) < 1e-10, `${speed}x elapsed time`);
  }
  steps.length = 0;
  context.updateScaledTime(10 / 30, 1 / 20);
  assert.ok(steps.length <= 7, `10x needs at most 7 updates per 30 FPS frame, got ${steps.length}`);
});

test("fast bullets hit enemies crossing their path between physics steps", () => {
  const closest = html.match(/    function closestPointOnSegment[\s\S]*?\n    \}/)[0];
  const sweptHit = html.match(/    function getBulletSweepHit[\s\S]*?\n    \}/)[0];
  const context = { clamp: (value, min, max) => Math.min(max, Math.max(min, value)) };
  vm.runInNewContext(`${closest}\n${sweptHit}`, context);
  const bullet = { x: 100, y: 0, r: 2 };
  const crossingEnemy = { stepStartX: 50, stepStartY: -50, x: 50, y: 50, size: 5 };
  const hit = context.getBulletSweepHit(bullet, 0, 0, crossingEnemy);
  assert.ok(hit, "crossing enemy must not pass through a fast projectile");
  assert.ok(Math.abs(hit.x - 50) < 1e-10 && Math.abs(hit.y) < 1e-10);
  assert.equal(context.getBulletSweepHit(bullet, 0, 0,
    { stepStartX: 50, stepStartY: 30, x: 50, y: 60, size: 5 }), null);
  assert.ok(context.getBulletSweepHit(bullet, 0, 0,
    { x: 50, y: 0, size: 5 }), "enemies spawned during a physics step need a finite starting position");
});

test("hit and boss visuals remain readable for the same wall time at every speed", () => {
  const updateVisualEffects = html.match(/    function updateVisualEffects\(dt\) \{[\s\S]*?\n    \}/)[0];
  for (const speed of [1, 2, 3, 4, 5, 10]) {
    const context = { gameSpeed: speed, bossWarning: { life: 1, maxLife: 1 },
      enemies: [{ flash: 1, hitKick: 1 }], defeatEchoes: [{ defeatLife: 0.24 }], laserBeams: [{ life: 1 }],
      particles: [{ x: 0, y: 0, vx: 1, vy: 1, life: 1 }],
      shockwaves: [{ r: 0, life: 1 }], scorePopups: [{ y: 0, vy: 1, life: 1 }] };
    vm.runInNewContext(updateVisualEffects, context);
    context.updateVisualEffects(0.1);
    assert.ok(Math.abs(context.bossWarning.life - 0.9) < 1e-12);
    assert.ok(Math.abs(context.laserBeams[0].life - 0.9) < 1e-12);
    assert.ok(Math.abs(context.defeatEchoes[0].defeatLife - 0.14) < 1e-12);
    assert.ok(Math.abs(context.shockwaves[0].life - 0.9) < 1e-12);
    assert.ok(Math.abs(context.scorePopups[0].life - 0.9) < 1e-12);
  }
});

test("visual draws and random samples never touch gameplay simulation or RNG", () => {
  const math = Object.create(Math); math.random = () => { throw new Error("gameplay RNG touched"); };
  const context = { window: {}, Math: math }; vm.runInNewContext(script, context);
  for (let i = 0; i < 1000; i++) assert.ok(context.window.spaceTowerRendering.random(0, 1) < 1);
  const render = html.match(/    function render\(time\) \{[\s\S]*?\n    \}/)[0];
  let simulated = 0, scheduled = 0, draws = 0, frameTransform = [];
  Object.assign(context, { lastTime: 0, gameSpeed: 10, document: { hidden: false }, commerceAppActive: true, commercePurchaseActive: false,
    MAX_SIMULATION_STEP:1/60, MAX_FAST_SIMULATION_STEP:1/20,
    gameStarted: true, running: true, isPaused: false, choosingCard: false, getQualityFrameRate: () => 45,
    updateScaledTime: (dt) => simulated += dt, updateVisualEffects(){},
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
  assert.ok(draws <= 451 && draws >= 449); assert.equal(scheduled, 1201);
  const before = draws;
  context.commercePurchaseActive = true;
  context.render(11000);
  assert.equal(draws, before, "checkout must stop GPU draws");
  context.commercePurchaseActive = false;
  context.commerceAppActive = false;
  context.render(12000);
  assert.equal(draws, before, "background app must stop GPU draws");
});

test("1x through 10x keep labeled game time while visual time stays real", () => {
  const render = html.match(/    function render\(time\) \{[\s\S]*?\n    \}/)[0];
  for (const speed of [1, 2, 3, 4, 5, 10]) {
    let simulated = 0, visual = 0;
    const context = { window: {}, assert, lastTime: 0, gameSpeed: speed, shake: 0,
      MAX_SIMULATION_STEP: 1 / 60, MAX_FAST_SIMULATION_STEP: 1 / 20,
      document: { hidden: false }, commerceAppActive: true, commercePurchaseActive: false,
      gameStarted: true, running: true, isPaused: false, choosingCard: false,
      getQualityFrameRate: () => 60, requestAnimationFrame() {}, width: 400, height: 600,
      canvas: { width: 400, height: 600 }, ctx: { setTransform() {}, save() {}, translate() {}, restore() {} },
      updateScaledTime(dt, maxStep) {
        simulated += dt;
        assert.equal(maxStep, speed >= 5 ? 1 / 20 : speed >= 3 ? 1 / 30 : 1 / 60);
      },
      updateVisualEffects(dt) { visual += dt; }
    };
    vm.runInNewContext(script, context);
    for (const name of render.matchAll(/\b(draw\w+)\(/g)) context[name[1]] = () => {};
    vm.runInNewContext(render, context);
    for (let frame = 0; frame <= 600; frame++) context.render(frame * 1000 / 60);
    assert.ok(Math.abs(simulated - speed * 10) < 1e-8, `${speed}x game time`);
    assert.ok(Math.abs(visual - 10) < 1e-8, `${speed}x visual time`);
  }
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
  const context = { window: {}, gameSpeed: 1, hitCount: 0, shake: 0, particles: [], shockwaves: [], scorePopups: [],
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
