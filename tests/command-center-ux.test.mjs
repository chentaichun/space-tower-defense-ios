import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sanitizeRecord } from "../functions/api/player.js";

const [indexHtml, v2, v2Css, uiCss, playerApi] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../v2-features.js", import.meta.url), "utf8"),
  readFile(new URL("../v2.css", import.meta.url), "utf8"),
  readFile(new URL("../ui-refinement.css", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/player.js", import.meta.url), "utf8")
]);

test("home command center exposes one primary deployment CTA, tier gap, commander XP, and compact account state", () => {
  assert.match(indexHtml, /id="deploymentButton"[^>]*>繼續出擊/);
  assert.match(indexHtml, /id="tierAdvanceText"/);
  assert.match(indexHtml, /id="commanderXpBar"/);
  assert.match(indexHtml, /function getCommanderLevelFloor\(level\)[\s\S]*100 \* Math\.pow/);
  assert.match(indexHtml, /clearedWaves \* \(5 \+ Math\.max\(1,/);
  assert.match(indexHtml, /class="pilot-account-summary"/);
  assert.match(v2Css, /home-pilot-console\.authenticated>input/);
});

test("signed-in players always retain a visible account-switch entry", () => {
  assert.doesNotMatch(uiCss, /authenticated \.pilot-login-toggle \{ display:none/);
  assert.match(uiCss, /authenticated \.pilot-login-toggle \{ display:inline-grid!important/);
  assert.match(v2, /authenticated \? ui\.switchAccount : ui\.expand/);
  assert.match(indexHtml, /accountSwitcher\.hidden = entries\.length === 0/);
  assert.match(indexHtml, /if \(!consoleEl\?\.classList\.contains\("expanded"\)\) pilotLoginToggle\.click\(\)/);
  assert.match(uiCss, /body:not\(\.in-game\) #homePlayPage \.home-action-rail \.home-pilot-console\.expanded/);
  assert.match(uiCss, /linear-gradient\(155deg,#08243a 0%,#07152b 48%,#0d1230 100%\)/);
  assert.doesNotMatch(uiCss, /vmaxlyph/);
});

test("commander XP is monotonic cloud data", () => {
  const save = sanitizeRecord({ commanderProgress: { xp: 9876 } });
  assert.deepEqual(save.commanderProgress, { xp: 9876 });
  assert.match(playerApi, /commanderProgress: \{ xp: Math\.max\(current\.commanderProgress\.xp, next\.commanderProgress\.xp\) \}/);
  assert.match(indexHtml, /Math\.max\(commanderProgress\.xp, remoteCommander\.xp\)/);
});

test("workshop provides formation, presets, filters, in-game canvas portraits, live stats, and animated compare", () => {
  for (const token of ["workshop-formation", "data-v2-save-preset", "data-v2-apply-preset", "data-v2-role", "data-v2-ownership", "data-v2-grade", "data-v2-search", "data-v2-toggle-details", "data-v2-compare", "data-turret-preview", "drawTurretPreviewCanvas", "getTurretActualStats", "getTurretEffectStat", "renderTurretStatGrid", "renderNextStarValues"]) {
    assert.ok(v2.includes(token), `missing workshop feature: ${token}`);
  }
  assert.match(v2, /loadoutPresets: \{ progress: \{\}, boss: \{\}, resource: \{\} \}/);
  assert.match(v2, /workshopCompareIds = \[\.\.\.workshopCompareIds\.slice\(-1\), id\]/);
  assert.match(v2, /if \(stars <= 0\)/);
  assert.match(v2, /if \(stars >= maxStars\)/);
  assert.doesNotMatch(v2, /不會顯示成 \+0|zero-value upgrade|unlockHint/);
  assert.doesNotMatch(v2.match(/function renderNextStarValues\(turret, stars, text\) \{[\s\S]*?\n\}/)?.[0] || "", /const value = \(before, after\)/);
  assert.match(uiCss, /\.turret-portrait canvas/);
  assert.match(uiCss, /@keyframes turret-float/);
  assert.match(uiCss, /@keyframes stat-bar-in/);
  assert.match(playerApi, /loadoutPresets: Object\.fromEntries/);
});

test("battle prioritizes HUD readability, a collapsible consumable drawer, no tutorial overlay, and warning strip", () => {
  assert.match(indexHtml, /id="battlePriorityStrip"/);
  assert.match(indexHtml, /bossPriorityAlert\.classList\.toggle\("critical"/);
  assert.match(v2Css, /in-game \.hud \.chip b/);
  assert.match(indexHtml, /id="consumableDrawerToggle"/);
  assert.match(uiCss, /\.consumable-drawer:not\(\.open\) \.consumable-dock/);
  assert.doesNotMatch(indexHtml, /id="firstDeploymentPanel"/);
  assert.doesNotMatch(indexHtml, /id="tutorialScreen"/);
  assert.match(v2, /activeRunBaseReturnHome\(\);\s+renderConsumableDock\?\.\(\);/);
});
