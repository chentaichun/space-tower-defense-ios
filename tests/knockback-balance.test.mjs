import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const v2 = readFileSync(new URL('../v2-features.js', import.meta.url), 'utf8');
const ultimate = readFileSync(new URL('../ultimate-system.js', import.meta.url), 'utf8');
const fn = (source, name) => source.match(new RegExp(`function ${name}\\([^]*?^    \\}`, 'm'))?.[0];
const scale = fn(html, 'getKnockbackScale');

test('card knockback applies the current one-eighth boss and minor scaling', () => {
  const math = Object.create(Math); math.random = () => 0;
  const context = { Math: math, cardEffects: { frostLevel: 0, knockbackLevel: 1 },
    tower: { x: 0, y: 0 }, shockwaves: [], pushVisualEffect() {}, knockbackSound() {} };
  vm.runInNewContext(`${scale}\n${fn(html, 'applyBulletControlEffects')}`, context);
  const boss = { x: 100, y: 0, size: 10, isBoss: true };
  const minor = { x: 100, y: 0, size: 10, isBoss: false };
  context.applyBulletControlEffects(boss, { source: 'main' });
  context.applyBulletControlEffects(minor, { source: 'main' });
  assert.equal(boss.x, 100.75);
  assert.equal(minor.x, 103.125);
});

test('turret and chance knockback use the current boss and minor scaling', () => {
  const math = Object.create(Math); math.random = () => 0.9;
  const context = { Math: math, tower: { x: 0, y: 0 },
    towerStats: { slowChance: 0, knockbackChance: 0 }, cardEffects: { chanceSlowLevel: 0, blindLevel: 0 },
    V2_TURRET_DEFS: [], enemies: [], clamp: (x, a, b) => Math.min(b, Math.max(a, x)),
    v2BaseApplyBulletControlEffects() {}, getActiveEnvironment: () => null };
  vm.runInNewContext(`${scale}\n${v2.match(/applyBulletControlEffects = function \(enemy, bullet\) \{[\s\S]*?^};/m)[0]}`, context);
  const boss = { x: 100, y: 0, isBoss: true };
  const minor = { x: 100, y: 0, isBoss: false };
  context.applyBulletControlEffects(boss, { source: 'aux', v2Knockback: 90 });
  context.applyBulletControlEffects(minor, { source: 'aux', v2Knockback: 90 });
  assert.ok(Math.abs(boss.x - 100.825) < 1e-10);
  assert.equal(minor.x, 105.625);
  context.towerStats.knockbackChance = 1;
  math.random = () => 0;
  const chanceBoss = { x: 100, y: 0, isBoss: true };
  const chanceMinor = { x: 100, y: 0, isBoss: false };
  context.applyBulletControlEffects(chanceBoss, { source: 'aux' });
  context.applyBulletControlEffects(chanceMinor, { source: 'aux' });
  assert.ok(Math.abs(chanceBoss.x - (100 + 10 / 24)) < 1e-10);
  assert.equal(chanceMinor.x, 102.125);
});

test('screen-wide shock moves surviving minors halfway toward the edge and leaves bosses in place', () => {
  const execute = ultimate.match(/function executeUltimate\(definition\) \{[\s\S]*?^}/m)[0];
  const minor = { x: 100, y: 0, hp: 100, maxHp: 100, isBoss: false };
  const boss = { x: 100, y: 0, hp: 100, maxHp: 100, isBoss: true };
  const context = { enemies: [minor, boss], tower: { x: 0, y: 0 }, width: 500, height: 300,
    ULTIMATE_GRADE_COLOR: { A: '#fff' }, ultimateRuntime: {},
    getUltimateValue: () => 10, applyEnemyDamage() {}, getUltimateCooldownSeconds: () => 300,
    getUltimateText: () => ['Shock'], getUltimateUi: () => ({ activated: 'Ready' }),
    showTaskToast() {}, addUltimateShockwave() {}, updateHud() {}, updateUltimateTrigger() {},
    saveActiveRunCheckpoint() {}, getKnockbackScale: enemy => enemy.isBoss ? 1 / 3 : 1 / 2 };
  vm.runInNewContext(execute, context);
  assert.equal(context.executeUltimate({ id: 'core_self_destruct', grade: 'A' }), true);
  assert.equal(minor.x, 300);
  assert.equal(boss.x, 100);
});
