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
