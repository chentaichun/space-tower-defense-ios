import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// drawWorkshopMainTurret(definition, ...) runs every frame in normal battles. A reference to an
// out-of-scope `turret` there threw a ReferenceError each frame, aborting the frame before shots and
// effects were drawn: with Phoenix Blaze / Afterimage / Thousand-Blade / Spirit / Frost Wall equipped,
// battles showed no projectiles or effects at all.
test('the battle main-turret renderer only uses its own definition argument', () => {
  const source = readFileSync(new URL('../v2-features.js', import.meta.url), 'utf8');
  const start = source.indexOf('function drawWorkshopMainTurret(definition');
  assert.ok(start > 0, 'renderer found');
  const end = source.indexOf('\nfunction ', start + 10);
  const body = source.slice(start, end);
  const stray = body.split('\n').filter((line) => /(^|[^\w.])turret\./.test(line));
  assert.deepEqual(stray, [], 'no out-of-scope turret.* references');
});

// index.html's base drawBullets skips every special "*_orb" shot and leaves it to v2-features' renderer.
// That renderer used to accept only main-slot shots, so auxiliary-slot shots (Bomb, Frostbite, ...) were never drawn.
test('special orb shots from auxiliary slots are drawn by the v2 renderer', () => {
  const base = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(base, /\/_orb\$\/\.test\(bullet\.sourceKind \|\| ""\) && globalThis\.SpaceTowerShotStyles\?\.\[bullet\.sourceKind\]\)\) continue;/, 'base renderer hands orb shots over');
  const v2 = readFileSync(new URL('../v2-features.js', import.meta.url), 'utf8');
  const start = v2.indexOf('drawBullets = function () {');
  const body = v2.slice(start, v2.indexOf('\n};', start));
  assert.doesNotMatch(body, /if \(bullet\.source !== "main-workshop"\) continue;/, 'no main-slot-only filter before orb shots');
  assert.match(body, /const specialOrb = \/_orb\$\/\.test\(bullet\.sourceKind \|\| ""\)/);
});

// Twin-Row Barrage (extra_row) used to hook only the starter weapon's fireAt, which workshop main turrets replace,
// so with any workshop main equipped the card added nothing.
test('Twin-Row Barrage side shots are added for workshop main turrets', () => {
  const v2 = readFileSync(new URL('../v2-features.js', import.meta.url), 'utf8');
  assert.match(v2, /fireWorkshopTurret\(def, pos, target, "main-workshop", main\);\s*addV2WorkshopExtraRow\(def, pos, target, shotsBefore\);/);
  assert.match(v2, /function addV2WorkshopExtraRow\([^)]*\) \{\s*if \(cardEffects\.extraRowLevel <= 0/);
});
