import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = name => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const html = read('index.html'), juice = read('game-juice.js');

test('game juice loads after every battle wrapper and ships with release assets', () => {
  const order = ['ultimate-system.js', 'expansion-system.js', 'emerald-effects.js', 'game-feel.js', 'game-juice.js'].map(name => html.indexOf(`<script src="${name}`));
  assert.ok(order.every(index => index > 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.ok(html.includes('href="game-juice.css'));
  const release = read('tools/ios-release.mjs');
  assert.ok(release.includes("'game-juice.js'") && release.includes("'game-juice.css'"));
});

test('legacy popup pass skips juice popups so they are drawn once', () => {
  assert.ok(html.includes('if (popup.juice || !isRenderVisible(popup.x, popup.y, 180)) continue;'));
});

test('obsidian drop rate is only slightly raised and capped by the existing run and daily limits', () => {
  assert.ok(html.includes('Math.min(0.0095, 0.003 + wave * 0.0000035)'));
  const chance = w => Math.min(0.0095, 0.003 + w * 0.0000035), old = w => Math.min(0.008, 0.0025 + w * 0.000003);
  for (const w of [1, 100, 500, 1000, 1500]) assert.ok(chance(w) / old(w) <= 1.2 + 1e-9);
  assert.ok(html.includes('BATTLE_OBSIDIAN_DAILY_LIMIT = 25'));
  assert.ok(html.includes('supplyPod: 3'));
  assert.ok(juice.includes("grantBattleObsidian(1, 'supplyPod')"));
});

test('interaction layer is campaign-only and hit-stop respects fast speed and reduced motion', () => {
  assert.ok(juice.includes("const campaign = () => activeRunMode !== 'trial';"));
  assert.match(juice, /function freeze\(seconds\) \{ if \(reduced\(\) \|\| gameSpeed >= 3\) return;/);
  assert.match(juice, /pointerdown[^]*?!campaign\(\)/);
  assert.match(juice, /J\.odTime > 0 && campaign\(\) \? value \* TUNE\.overdriveSpeed/);
});

test('every juice string is localized for the six supported languages', () => {
  const keys = ['mega', 'overdrive', 'ready', 'tap', 'bossDown', 'toContact', 'breakthrough', 'supply', 'weak', 'engage', 'wave'];
  for (const lang of ['zh', 'en', 'ja', 'ko', 'ru', 'es']) {
    const row = juice.match(new RegExp(`\\n    ${lang}: \\{([^\\n]*)\\}`))?.[1] || '';
    for (const key of keys) assert.ok(row.includes(`${key}:`), `${lang}.${key}`);
  }
});
