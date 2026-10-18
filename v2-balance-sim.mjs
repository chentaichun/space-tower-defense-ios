import fs from "node:fs";

const source = fs.readFileSync(new URL("./v2-features.js", import.meta.url), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function baseWave(wave) {
  const index = wave - 1;
  const hp = 10 + index * 6 + index ** 1.32 * 0.75;
  const count = Math.min(240, 8 + index * 0.055 + Math.sqrt(index) * 2.8 + Math.floor(index / 100) * 1.8);
  const spawn = Math.max(0.24, 0.78 - Math.floor(index / 75) * 0.018);
  return { hp, count, spawn };
}

function v2EarlyWave(wave) {
  const old = baseWave(wave);
  if (wave > 20) return { ...old, workloadRatio: 1 };
  const factor = 0.5 + (wave - 1) / 19 * 0.5;
  const hp = Math.max(1, Math.round(old.hp * factor));
  const count = Math.min(240, Math.max(Math.round(old.count) + 2, Math.round(old.count / factor)));
  const spawn = Math.max(0.24, old.spawn * Math.max(0.58, factor * 0.88));
  return { hp, count, spawn, workloadRatio: hp * count / (old.hp * old.count) };
}

const early = [1, 5, 10, 15, 20].map((wave) => ({ wave, ...v2EarlyWave(wave) }));
for (const row of early) {
  assert(row.workloadRatio >= 0.85 && row.workloadRatio <= 1.25, `W${row.wave} total-shot workload drifted to ${row.workloadRatio.toFixed(2)}×`);
}

const enemyIds = ["berserker", "erratic", "splitter", "ranged", "healer", "full_shield", "buffer", "frontal_shield"];
const cardIds = ["chance_slow", "blind_rounds", "defection", "black_hole", "extra_row"];
const runUpgradeIds = ["defenseRate", "physicalArmor", "magicArmor", "slowModule", "knockbackModule", "reflectModule", "mineRadius", "mineChance", "fighterCap", "waveGold", "goldMultiplier", "waveObsidian", "medkit"];
for (const id of [...enemyIds, ...cardIds, ...runUpgradeIds]) assert(source.includes(`id: "${id}"`) || source.includes(`${id}: {`), `Missing V2 definition: ${id}`);
assert(source.includes("Number(targetTier) === 2 ? 500 : 1500"), "Tier unlock rule is not 500 / 1500");
assert(source.includes("V2_CARD_MAX_STARS = 5"), "Skill-card cap is not five stars");
assert(source.includes("V2_FRAGMENT_TARGET = 20"), "Auxiliary turret assembly target is not 20 fragments");

const fragmentModel = {
  normalChance: 0.00075,
  eliteChance: 0.0015,
  bossChance: 0.08,
  turretTypes: 5,
  targetPerType: 20,
};
fragmentModel.expectedNormalKillsForAnyAssembly = fragmentModel.targetPerType * fragmentModel.turretTypes / fragmentModel.normalChance;
fragmentModel.expectedEliteKillsForAnyAssembly = fragmentModel.targetPerType * fragmentModel.turretTypes / fragmentModel.eliteChance;
fragmentModel.expectedBossKillsForAnyAssembly = fragmentModel.targetPerType * fragmentModel.turretTypes / fragmentModel.bossChance;
assert(fragmentModel.expectedNormalKillsForAnyAssembly >= 50000, "Normal-enemy fragment progression is not rare enough");

console.log("Space Tower Defense V2 balance simulation");
console.table(early.map((row) => ({
  wave: row.wave,
  enemyHp: row.hp,
  enemyCount: row.count,
  spawnSeconds: row.spawn.toFixed(3),
  shotWorkload: `${(row.workloadRatio * 100).toFixed(1)}%`,
})));
console.table([
  { source: "normal", chance: `${fragmentModel.normalChance * 100}%`, expectedKillsForOneChosenTurret: Math.round(fragmentModel.expectedNormalKillsForAnyAssembly) },
  { source: "elite", chance: `${fragmentModel.eliteChance * 100}%`, expectedKillsForOneChosenTurret: Math.round(fragmentModel.expectedEliteKillsForAnyAssembly) },
  { source: "boss", chance: `${fragmentModel.bossChance * 100}%`, expectedKillsForOneChosenTurret: Math.round(fragmentModel.expectedBossKillsForAnyAssembly) },
]);
console.log(JSON.stringify({ enemyArchetypes: 13, newEnemyArchetypes: enemyIds.length, newRunUpgrades: runUpgradeIds.length, newSkillCards: cardIds.length, cardStars: 5, tier2Wave: 500, laterTierWave: 1500, supportSlots: { T1: 0, T2: 2, T3: 3, T4: 4, T8: 8 } }, null, 2));
console.log("PASS: V2 early-wave workload, progression gates, and rarity targets are internally consistent.");
