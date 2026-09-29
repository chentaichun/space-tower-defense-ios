/* Rendering budgets never limit simulation, projectiles, enemies or rewards. */
(function () {
  const targetFrameRate = 60;
  let nextFrame = 0;
  let currentFrameRate = targetFrameRate;
  let visualSeed = 0x73c21b9a;
  const stats = { callbacks: 0, frames: 0, skipped: 0 };
  window.spaceTowerRendering = {
    particleLimit: 120, popupLimit: 56, shockwaveLimit: 48,
    targetFrameRate,
    stats,
    shouldDraw(time, frameRate = targetFrameRate) {
      stats.callbacks += 1;
      if (frameRate !== currentFrameRate) {
        currentFrameRate = frameRate;
        nextFrame = 0;
      }
      const frameMs = 1000 / currentFrameRate;
      if (time + 0.2 < nextFrame) { stats.skipped += 1; return false; }
      // Displays below the cap naturally draw at their native cadence;
      // faster displays are capped without a catch-up burst.
      nextFrame = nextFrame > 0 && time - nextFrame < frameMs
        ? nextFrame + frameMs : time + frameMs;
      stats.frames += 1;
      return true;
    },
    shakeOffset(intensity, time) {
      const amount = Math.min(2.6, Math.max(0, Number(intensity) || 0));
      if (amount === 0) return { x: 0, y: 0 };
      const phase = Math.max(0, Number(time) || 0) * 0.038;
      return {
        x: Math.sin(phase) * amount,
        y: Math.sin(phase * 1.31 + 0.8) * amount * 0.58
      };
    },
    random(min, max) {
      // Visual randomness must not consume gameplay's loot/critical-hit RNG.
      visualSeed ^= visualSeed << 13; visualSeed ^= visualSeed >>> 17; visualSeed ^= visualSeed << 5;
      return min + ((visualSeed >>> 0) / 4294967296) * (max - min);
    }
  };
})();
