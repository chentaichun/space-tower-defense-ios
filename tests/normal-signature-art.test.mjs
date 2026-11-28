import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WEB_FILES } from "../tools/ios-release.mjs";

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("normal mode draws the special turrets' signature effects", () => {
  const html = read("index.html"), art = read("normal-signature-art.js"), v2 = read("v2-features.js");
  // Loaded after v2-features (it wraps drawEffects), with the shared projectile painters before it.
  const shots = html.indexOf('src="ranked-shot-styles.js'), features = html.indexOf('src="v2-features.js'), sig = html.indexOf('src="normal-signature-art.js');
  assert.ok(shots > 0 && shots < features && features < sig);
  assert.ok(WEB_FILES.includes("normal-signature-art.js") && WEB_FILES.includes("ranked-shot-styles.js"));
  for (const state of ["v2IceWalls", "v2PhoenixDives", "v2Pentas", "v2SealFlashes", "v2Shurikens", "v2Sunrays", "v2SunMarks", "v2Singularities", "v2Leviathans", "v2TimeStop", "v2EntUntil", "afterimage"]) assert.match(art, new RegExp(state));
  assert.match(v2, /const v2SealFlashes = \[\]/);
  // Special-turret shots use their ranked projectile art in normal mode too.
  assert.match(v2, /SpaceTowerShotStyles\?\.\[bullet\.sourceKind === "sword_orb"/);
});
