export const TURRET_IDS = Object.freeze([
  "emergency_shield", "frost_core", "flame_core", "full_hp_berserk", "weakening_curse", "heavy_cannon", "pulse_quantum", "gatling", "split_cannon", "arcane_core", "reflect_bastion", "scatter_heavy", "double_burst", "annihilation_laser", "void_devourer", "vulnerability_mark",
  "missile_nest", "charged_laser", "frost_rail", "shield_generator", "flame_sprayer", "long_range_sniper", "chain_arc", "crit_resonance", "time_slow", "cluster_bomb", "mining_gold", "soul_drain", "shadow_replica", "antimatter"
]);

export const ULTIMATE_IDS = Object.freeze([
  "core_self_destruct", "black_hole_detonation", "coin_railgun", "barrage_reversal", "allegiance_swap", "satellite_judgment", "system_reboot", "absolute_defense", "nano_first_aid", "shield_overload", "death_mark", "global_emp", "phase_shelter", "overclock_a", "overclock_b", "giant_barrage", "blood_rage", "energy_devourer", "frozen_world", "execution_aura", "judgment_chain", "golden_touch", "emergency_blueprint", "bounty_order", "space_exploration", "divine_sanctuary"
]);

export const PERMANENT_UPGRADE_IDS = Object.freeze([
  "physicalAttack", "magicAttack", "attackSpeed", "critChance", "critDamage", "physicalDefense", "magicDefense", "maxHp", "regen", "startShield", "heavyCore", "eliteHunter", "supplySense", "deathCounter", "chainLightning", "range"
]);

export const TACTICAL_CARD_IDS = Object.freeze([
  "chance_slow", "blind_rounds", "defection", "black_hole", "extra_row", "frost_rounds", "knockback_rounds", "command_relay", "chain_blast", "overload_magazine", "weakpoint_mark", "piercing_sniper", "reactive_shield"
]);

export const PREMIUM_BACKGROUND_IDS = Object.freeze([
  "gilded_citadel", "obsidian_singularity", "aurora_garden", "crimson_event_horizon", "prismatic_wormhole"
]);

export const GACHA_PACKS = Object.freeze({
  normal: {
    id: "normal", name: "星隕補給艙", currency: "obsidian", oneCost: 200, tenCost: 1800,
    rewards: [
      { id: "turret_core", weight: 10, kind: "turretCore", amount: 1 },
      { id: "obsidian_100000", weight: 5, kind: "obsidian", amount: 20000 },
      { id: "obsidian_50000", weight: 8, kind: "obsidian", amount: 10000 },
      { id: "obsidian_10000", weight: 5, kind: "obsidian", amount: 4000 },
      { id: "obsidian_5000", weight: 10, kind: "obsidian", amount: 2000 },
      { id: "obsidian_2000", weight: 20, kind: "obsidian", amount: 1000 },
      { id: "obsidian_1000", weight: 50, kind: "obsidian", amount: 500 },
      { id: "obsidian_500", weight: 100, kind: "obsidian", amount: 300 },
      { id: "obsidian_200", weight: 200, kind: "obsidian", amount: 200 },
      { id: "obsidian_100", weight: 500, kind: "obsidian", amount: 100 },
      { id: "space_coin_10", weight: 100, kind: "spaceCoins", amount: 10 },
      { id: "space_coin_3", weight: 400, kind: "spaceCoins", amount: 3 },
      { id: "turret_shard_20", weight: 30, kind: "turretFragments", amount: 20 },
      { id: "turret_shard_10", weight: 60, kind: "turretFragments", amount: 10 },
      { id: "turret_shard_5", weight: 120, kind: "turretFragments", amount: 5 },
      { id: "turret_shard_2", weight: 290, kind: "turretFragments", amount: 2 },
      { id: "ultimate_shard_3", weight: 200, kind: "ultimateFragments", amount: 3 },
      { id: "ultimate_shard_1", weight: 1400, kind: "ultimateFragments", amount: 1 },
      { id: "turret_shard_8", weight: 82, kind: "turretFragments", amount: 8 },
      { id: "obsidian_20", weight: 3000, kind: "obsidian", amount: 40 },
      { id: "obsidian_50", weight: 1000, kind: "obsidian", amount: 80 },
      { id: "obsidian_1", weight: 400, kind: "obsidian", amount: 25 },
      { id: "space_coin_19000", weight: 10, kind: "spaceCoins", amount: 19000 },
      { id: "space_coin_1", weight: 2000, kind: "spaceCoins", amount: 1 }
    ]
  },
  supreme: {
    id: "supreme", name: "皇極星庫", currency: "spaceCoins", oneCost: 2000, tenCost: 19000,
    rewards: [
      { id: "turret_core", weight: 20, kind: "turretCore", amount: 1 },
      { id: "obsidian_100000", weight: 10, kind: "obsidian", amount: 30000 },
      { id: "obsidian_50000", weight: 20, kind: "obsidian", amount: 15000 },
      { id: "obsidian_20000", weight: 50, kind: "obsidian", amount: 8000 },
      { id: "obsidian_10000", weight: 100, kind: "obsidian", amount: 5000 },
      { id: "space_coin_50000", weight: 1, kind: "spaceCoins", amount: 50000 },
      { id: "space_coin_5000", weight: 20, kind: "spaceCoins", amount: 5000 },
      { id: "speed_4", weight: 80, kind: "speedVoucher", speed: 4 },
      { id: "speed_5", weight: 40, kind: "speedVoucher", speed: 5 },
      { id: "speed_10", weight: 10, kind: "speedVoucher", speed: 10 },
      { id: "premium_background", weight: 50, kind: "premiumBackground" },
      { id: "permanent_upgrade", weight: 100, kind: "permanentUpgrade", amount: 1 },
      { id: "tactical_card", weight: 100, kind: "tacticalCard" },
      { id: "wishlist_turret_100", weight: 10, kind: "wishlistTurretFragments", amount: 100 },
      { id: "wishlist_ultimate_50", weight: 20, kind: "wishlistUltimateFragments", amount: 50 },
      { id: "all_turret_2", weight: 20, kind: "allTurretFragments", amount: 2 },
      { id: "all_ultimate_1", weight: 40, kind: "allUltimateFragments", amount: 1 },
      { id: "turret_shard_50", weight: 30, kind: "turretFragments", amount: 50 },
      { id: "ultimate_shard_20", weight: 75, kind: "ultimateFragments", amount: 20 },
      { id: "elite_bundle", weight: 100, kind: "eliteBundle", turretAmount: 10, ultimateAmount: 5 },
      { id: "revive_ticket", weight: 4, kind: "reviveTicket", amount: 1 },
      { id: "obsidian_double_voucher", weight: 100, kind: "obsidianDoubleVoucher", amount: 1 },
      { id: "turret_shard_1", weight: 2500, kind: "turretFragments", amount: 1 },
      { id: "turret_shard_2", weight: 1250, kind: "turretFragments", amount: 2 },
      { id: "ultimate_shard_1", weight: 2500, kind: "ultimateFragments", amount: 1 },
      { id: "ultimate_shard_2", weight: 1250, kind: "ultimateFragments", amount: 2 },
      { id: "skip_wave_voucher", weight: 300, kind: "skipWaveVoucher", amount: 1 },
      { id: "free_upgrade_voucher", weight: 300, kind: "freeUpgradeVoucher", amount: 1 },
      { id: "gold_double_voucher", weight: 300, kind: "goldDoubleVoucher", amount: 1 },
      { id: "boss_seal_voucher", weight: 300, kind: "bossSealVoucher", amount: 1 },
      { id: "stage_protection_voucher", weight: 300, kind: "stageProtectionVoucher", amount: 1 }
    ]
  }
});

const randomIndex = (items) => Math.floor(Math.random() * items.length);
const pick = (items) => items[randomIndex(items)];

export function drawReward(pack) {
  const total = pack.rewards.reduce((sum, reward) => sum + reward.weight, 0);
  let roll = Math.floor(Math.random() * total);
  for (const reward of pack.rewards) {
    if (roll < reward.weight) return { ...reward };
    roll -= reward.weight;
  }
  return { ...pack.rewards[pack.rewards.length - 1] };
}

const RARE_GACHA_KINDS = new Set([
  "turretCore", "speedVoucher", "premiumBackground", "permanentUpgrade", "tacticalCard",
  "wishlistTurretFragments", "wishlistUltimateFragments", "allTurretFragments", "allUltimateFragments"
]);

export function isRareGachaReward(reward) {
  return Number(reward?.weight) <= 500 || RARE_GACHA_KINDS.has(String(reward?.kind || ""));
}

const focusKindForPack = (packId, alternate = false) => {
  const turret = String(packId) !== "supreme";
  return turret !== alternate ? "wishlistTurretFragments" : "wishlistUltimateFragments";
};

const syntheticReward = (id, kind, amount) => ({ id, kind, amount, weight: 0, bonus: true });

export const GACHA_PITY_TARGET = 10;

export function applyGachaPityGuarantee(packId, rawResults, pityBefore = 0) {
  const results = rawResults.map((reward) => ({ ...reward }));
  let pity = Math.min(GACHA_PITY_TARGET - 1, Math.max(0, Math.floor(Number(pityBefore) || 0)));
  for (let index = 0; index < results.length; index += 1) {
    if (isRareGachaReward(results[index])) {
      pity = 0;
      continue;
    }
    pity += 1;
    if (pity < GACHA_PITY_TARGET) continue;
    const kind = focusKindForPack(packId);
    results[index] = syntheticReward(`pity_guarantee_${index + 1}`, kind, 5);
    pity = 0;
  }
  return { results, pity };
}

export function ensureTenPullGuarantee(packId, rawResults, pullBefore = 0) {
  const legacyPity = Math.max(0, Math.floor(Number(pullBefore) || 0)) % GACHA_PITY_TARGET;
  return applyGachaPityGuarantee(packId, rawResults, legacyPity).results;
}

export function getGachaMilestoneRewards(packId, pullBefore, pullAfter) {
  const before = Math.max(0, Math.floor(Number(pullBefore) || 0));
  const after = Math.max(before, Math.floor(Number(pullAfter) || 0));
  const rewards = [];
  for (let total = before + 1; total <= after; total += 1) {
    const position = total % 100;
    const mainKind = focusKindForPack(packId);
    if (position === 30) rewards.push(syntheticReward(`milestone_${total}_30`, mainKind, 10));
    if (position === 50) rewards.push(syntheticReward(`milestone_${total}_50`, mainKind, 25));
    if (position === 0) rewards.push(syntheticReward(`milestone_${total}_100`, mainKind, 50));
    if (total % 200 === 0) rewards.push(syntheticReward(`milestone_${total}_200`, focusKindForPack(packId, true), 50));
  }
  return rewards;
}

export function getSupportVoucherPulls(paidBefore, paidAfter) {
  const before = Math.max(0, Math.floor(Number(paidBefore) || 0));
  const after = Math.max(before, Math.floor(Number(paidAfter) || 0));
  let vouchers = 0;
  for (let milestone = (Math.floor(before / 100) + 1) * 100; milestone <= after; milestone += 100) {
    vouchers += milestone === 100 ? 50 : 20;
  }
  return vouchers;
}

const addMapValue = (map, id, amount) => {
  map[id] = Math.max(0, Math.floor(Number(map[id]) || 0)) + Math.max(0, Math.floor(Number(amount) || 0));
};

export function applyGachaReward(save, rawReward) {
  const reward = { ...rawReward };
  save.v2Progress ||= { revision: 0, fragments: {}, cores: {}, stars: {}, assembled: {}, active: {} };
  save.ultimateProgress ||= { revision: 0, fragments: {}, stars: {} };
  save.expansionProgress ||= { revision: 0, speedUnlocks: {}, speedVouchers: {}, premiumBackgrounds: [], unlockedCards: [], consumables: {}, utilityClaims: { day: "", adClaims: 0, week: "", purchases: {} }, fusionStones: 0, ownedMusic: [], equippedMusic: "default", normalPaidPulls: 0, supremePaidPulls: 0, gachaPulls: { normal: 0, supreme: 0 }, gachaPity: { normal: 0, supreme: 0 }, starDust: 0, promoMail: { normal: 0, supreme: 0 }, packVouchers: { normal: 0, supreme: 0 } };
  save.expansionProgress.promoMail ||= { normal: 0, supreme: 0 };
  save.expansionProgress.packVouchers ||= { normal: 0, supreme: 0 };
  save.expansionProgress.consumables ||= {};
  save.expansionProgress.utilityClaims ||= { day: "", adClaims: 0, week: "", purchases: {} };
  save.shopState ||= { firstBonusClaimed: false, testPurchases: [], backgroundStore: { owned: [], equipped: "default" } };
  save.metaUpgrades ||= {};
  const randomTurret = () => pick(TURRET_IDS);
  const randomUltimate = () => pick(ULTIMATE_IDS);
  if (reward.kind === "obsidian") save.obsidian += reward.amount;
  else if (reward.kind === "spaceCoins") save.spaceCoins += reward.amount;
  else if (reward.kind === "turretCore") {
    reward.targetId = randomTurret();
    addMapValue(save.v2Progress.cores, reward.targetId, reward.amount);
    save.v2Progress.revision += 1;
  } else if (reward.kind === "turretFragments" || reward.kind === "wishlistTurretFragments") {
    reward.targetId = reward.kind === "wishlistTurretFragments" && TURRET_IDS.includes(save.v2Progress.fragmentWishlist) ? save.v2Progress.fragmentWishlist : randomTurret();
    addMapValue(save.v2Progress.fragments, reward.targetId, reward.amount);
    save.v2Progress.lifetimeFragments = Math.max(0, Number(save.v2Progress.lifetimeFragments) || 0) + reward.amount;
    save.v2Progress.revision += 1;
  } else if (reward.kind === "ultimateFragments" || reward.kind === "wishlistUltimateFragments") {
    reward.targetId = reward.kind === "wishlistUltimateFragments" && ULTIMATE_IDS.includes(save.ultimateProgress.fragmentWishlist) ? save.ultimateProgress.fragmentWishlist : randomUltimate();
    addMapValue(save.ultimateProgress.fragments, reward.targetId, reward.amount);
    save.ultimateProgress.lifetimeFragments = Math.max(0, Number(save.ultimateProgress.lifetimeFragments) || 0) + reward.amount;
    save.ultimateProgress.revision += 1;
  } else if (reward.kind === "allTurretFragments") {
    for (const id of TURRET_IDS) addMapValue(save.v2Progress.fragments, id, reward.amount);
    save.v2Progress.lifetimeFragments = Math.max(0, Number(save.v2Progress.lifetimeFragments) || 0) + reward.amount * TURRET_IDS.length;
    save.v2Progress.revision += 1;
  } else if (reward.kind === "allUltimateFragments") {
    for (const id of ULTIMATE_IDS) addMapValue(save.ultimateProgress.fragments, id, reward.amount);
    save.ultimateProgress.lifetimeFragments = Math.max(0, Number(save.ultimateProgress.lifetimeFragments) || 0) + reward.amount * ULTIMATE_IDS.length;
    save.ultimateProgress.revision += 1;
  } else if (reward.kind === "eliteBundle") {
    reward.turretTargetId = randomTurret();
    reward.ultimateTargetId = randomUltimate();
    addMapValue(save.v2Progress.fragments, reward.turretTargetId, reward.turretAmount);
    addMapValue(save.ultimateProgress.fragments, reward.ultimateTargetId, reward.ultimateAmount);
    save.v2Progress.lifetimeFragments = Math.max(0, Number(save.v2Progress.lifetimeFragments) || 0) + reward.turretAmount;
    save.ultimateProgress.lifetimeFragments = Math.max(0, Number(save.ultimateProgress.lifetimeFragments) || 0) + reward.ultimateAmount;
    save.v2Progress.revision += 1;
    save.ultimateProgress.revision += 1;
  } else if (reward.kind === "speedVoucher") {
    const key = String(reward.speed);
    addMapValue(save.expansionProgress.speedVouchers, key, 1);
    save.expansionProgress.revision += 1;
  } else if (reward.kind === "premiumBackground") {
    reward.targetId = pick(PREMIUM_BACKGROUND_IDS);
    save.expansionProgress.premiumBackgrounds = [...new Set([...(save.expansionProgress.premiumBackgrounds || []), reward.targetId])];
    save.shopState.backgroundStore ||= { owned: [], equipped: "default" };
    save.shopState.backgroundStore.owned = [...new Set([...(save.shopState.backgroundStore.owned || []), reward.targetId])];
    save.expansionProgress.revision += 1;
  } else if (reward.kind === "permanentUpgrade") {
    reward.targetId = pick(PERMANENT_UPGRADE_IDS);
    addMapValue(save.metaUpgrades, reward.targetId, 1);
  } else if (reward.kind === "tacticalCard") {
    reward.targetId = pick(TACTICAL_CARD_IDS);
    save.metaUpgrades[`cardUnlock:${reward.targetId}`] = 1;
    save.expansionProgress.unlockedCards = [...new Set([...(save.expansionProgress.unlockedCards || []), reward.targetId])];
    save.expansionProgress.revision += 1;
  } else if (["reviveTicket", "obsidianDoubleVoucher", "skipWaveVoucher", "freeUpgradeVoucher", "goldDoubleVoucher", "bossSealVoucher", "stageProtectionVoucher"].includes(reward.kind)) {
    addMapValue(save.expansionProgress.consumables, reward.kind, reward.amount || 1);
    save.expansionProgress.revision += 1;
  }
  return reward;
}

export function isLaunchPromoActive(env, now = Date.now()) {
  const start = Date.parse(String(env.GACHA_LAUNCH_PROMO_START || ""));
  return Number.isFinite(start) && now >= start && now < start + 7 * 24 * 60 * 60 * 1000;
}

export function getLaunchPromoMailBatches(paidBefore, paidAfter) {
  const before = Math.max(0, Math.floor(Number(paidBefore) || 0));
  const after = Math.max(before, Math.floor(Number(paidAfter) || 0));
  return Math.max(0, Math.floor(after / 100) - Math.floor(before / 100));
}
