import {
  authenticatePlayerCredentials,
  authenticatePlayerSession,
  createPlayerSession,
  hashPassword,
  normalizeName,
  normalizePassword,
  playerKey,
  verifyPlayerPassword
} from "../_shared/player-auth.js";
import { getSpaceCoinWallet, getWallet } from "../_shared/commerce.js";
import { getStarterPackEntitlement, applyStarterPackEntitlement, applyStarterPackSupplies } from "../_shared/starter-pack.js";
import { getPlayerEntitlements } from "../_shared/entitlements.js";
import { upsertLeaderboardEntry } from "../_shared/leaderboard-store.js";
import { getTrialRewardTotals } from "../_shared/trial-store.js";
import { rankedRewardTotal } from "../_shared/ranked-store.js";
import { jsonResponse, optionsResponse } from "../_shared/cors.js";
import { deletePlayerAccount, getPlayerAccount, playerStorageAvailable, putPlayerAccount } from "../_shared/player-storage.js";

const requireBindings = (env) => {
  if (!playerStorageAvailable(env)) return "Missing player storage binding.";
  return "";
};

const MAX_TIER = 20;

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const normalizeProgressMap = (value = {}) => {
  const source = value && typeof value === "object" ? value : {};
  const output = {};
  for (const [key, raw] of Object.entries(source)) {
    output[String(key).slice(0, 48)] = Math.max(0, Math.floor(Number(raw) || 0));
  }
  return output;
};
const normalizeBoolMap = (value = {}) => {
  const source = value && typeof value === "object" ? value : {};
  const output = {};
  for (const [key, raw] of Object.entries(source)) {
    output[String(key).slice(0, 48)] = Boolean(raw);
  }
  return output;
};
const normalizeTierRecords = (records = {}) => {
  const output = {};
  const source = records && typeof records === "object" ? records : {};
  for (let tier = 1; tier <= MAX_TIER; tier += 1) {
    output[tier] = Math.max(1, Math.floor(Number(source[tier]) || 1));
  }
  return output;
};
const getUnlockedTierFromRecords = (records) => {
  let unlocked = 1;
  for (let tier = 1; tier < MAX_TIER; tier += 1) {
    if ((Number(records[tier]) || 1) >= 1500) unlocked = tier + 1;
  }
  return unlocked;
};
const normalizeDailyTasks = (tasks = {}) => ({
  date: String(tasks?.date || ""),
  progress: normalizeProgressMap(tasks?.progress),
  claimed: normalizeBoolMap(tasks?.claimed),
  bonusClaimed: normalizeBoolMap(tasks?.bonusClaimed),
  specialIds: Array.isArray(tasks?.specialIds) ? tasks.specialIds.map((id) => String(id).slice(0, 48)).slice(0, 3) : []
});
const mergeDailyTasks = (stored, incoming) => {
  const current = normalizeDailyTasks(stored);
  const next = normalizeDailyTasks(incoming);
  if (!current.date) return next;
  if (!next.date) return current;
  if (current.date !== next.date) return next.date > current.date ? next : current;
  const progress = {};
  for (const key of new Set([...Object.keys(current.progress), ...Object.keys(next.progress)])) {
    progress[key] = Math.max(current.progress[key] || 0, next.progress[key] || 0);
  }
  return {
    date: current.date,
    progress,
    claimed: { ...current.claimed, ...next.claimed },
    bonusClaimed: { ...current.bonusClaimed, ...next.bonusClaimed },
    specialIds: next.specialIds.length ? next.specialIds : current.specialIds
  };
};
const normalizeAchievements = (achievements = {}) => ({
  progress: normalizeProgressMap(achievements?.progress),
  earned: normalizeBoolMap(achievements?.earned),
  loginStreak: Math.max(0, Math.floor(Number(achievements?.loginStreak) || 0)),
  lastLoginDate: String(achievements?.lastLoginDate || "")
});
const BACKGROUND_IDS = new Set([
  "gilded_citadel", "obsidian_singularity", "aurora_garden", "crimson_event_horizon", "emerald_machine_world", "glacial_star_cathedral", "solar_forge_throne", "neon_orbit_metropolis", "astral_ruins_sanctum", "prismatic_wormhole", "obsidian_crown_throne"
]);
const normalizeShopState = (state = {}) => {
  const source = state && typeof state === "object" ? state : {};
  const background = source.backgroundStore && typeof source.backgroundStore === "object" ? source.backgroundStore : {};
  const owned = Array.isArray(background.owned) ? [...new Set(background.owned.map(String).filter((id) => BACKGROUND_IDS.has(id)))].slice(0, 11) : [];
  return {
    firstBonusClaimed: source.firstBonusClaimed === true,
    testPurchases: Array.isArray(source.testPurchases) ? source.testPurchases.slice(-20).map((item) => ({ id: String(item?.id || "").slice(0, 48), amount: Math.max(0, Math.floor(Number(item?.amount) || 0)), source: String(item?.source || "test").slice(0, 24), at: Math.max(0, Math.floor(Number(item?.at) || 0)) })).filter((item) => item.id && item.amount > 0) : [],
    backgroundStore: { owned, equipped: owned.includes(String(background.equipped)) ? String(background.equipped) : "default" }
  };
};
const normalizeWeeklyTasks = (tasks = {}) => ({
  week: String(tasks?.week || "").slice(0, 16),
  progress: normalizeProgressMap(tasks?.progress),
  claimed: normalizeBoolMap(tasks?.claimed)
});
const normalizeEconomyLimits = (value = {}) => ({
  day: String(value?.day || "").slice(0, 10),
  rewardedSupplyClaims: Math.min(5, Math.max(0, Math.floor(Number(value?.rewardedSupplyClaims) || 0))),
  battleObsidianEarned: Math.min(25, Math.max(0, Math.floor(Number(value?.battleObsidianEarned) || 0)))
});
const mergeEconomyLimits = (stored, incoming) => {
  const current = normalizeEconomyLimits(stored);
  const next = normalizeEconomyLimits(incoming);
  if (!current.day) return next;
  if (!next.day) return current;
  if (current.day !== next.day) return next.day > current.day ? next : current;
  return {
    day: current.day,
    rewardedSupplyClaims: Math.max(current.rewardedSupplyClaims, next.rewardedSupplyClaims),
    battleObsidianEarned: Math.max(current.battleObsidianEarned, next.battleObsidianEarned)
  };
};
const mergeWeeklyTasks = (stored, incoming) => {
  const current = normalizeWeeklyTasks(stored);
  const next = normalizeWeeklyTasks(incoming);
  if (!current.week) return next;
  if (!next.week) return current;
  if (current.week !== next.week) return next.week > current.week ? next : current;
  const progress = {};
  for (const key of new Set([...Object.keys(current.progress), ...Object.keys(next.progress)])) progress[key] = Math.max(current.progress[key] || 0, next.progress[key] || 0);
  return { week: current.week, progress, claimed: { ...current.claimed, ...next.claimed } };
};
const normalizeFirstDeployment = (state = {}) => {
  const completed = Array.from({ length: 4 }, (_, index) => state?.completed?.[index] === true);
  return { completed, finished: completed.every(Boolean) || state?.finished === true };
};
const normalizeCommanderProgress = (state = {}) => ({
  xp: Math.max(0, Math.floor(Number(state?.xp) || 0))
});
const mergeFirstDeployment = (stored, incoming) => normalizeFirstDeployment({ completed: Array.from({ length: 4 }, (_, index) => stored?.completed?.[index] === true || incoming?.completed?.[index] === true), finished: stored?.finished === true || incoming?.finished === true });
const mergeAchievements = (stored, incoming) => {
  const current = normalizeAchievements(stored);
  const next = normalizeAchievements(incoming);
  const progress = {};
  for (const key of new Set([...Object.keys(current.progress), ...Object.keys(next.progress)])) {
    progress[key] = Math.max(current.progress[key] || 0, next.progress[key] || 0);
  }
  return {
    progress,
    earned: { ...current.earned, ...next.earned },
    loginStreak: Math.max(current.loginStreak, next.loginStreak),
    lastLoginDate: next.lastLoginDate > current.lastLoginDate ? next.lastLoginDate : current.lastLoginDate
  };
};
const normalizeV2Progress = (progress = {}) => {
  const source = progress && typeof progress === "object" ? progress : {};
  const introStep=Math.min(11,Math.max(0,Math.floor(Number(source.onboarding?.introStep)||0)));
  const introComplete=introStep===11&&source.onboarding?.introComplete===true;
  const introClaimed=introComplete&&source.onboarding?.introClaimed===true;
  const tutorialComplete=source.onboarding?.tutorialComplete===true;
  const tutorialClaimed=tutorialComplete&&source.onboarding?.tutorialClaimed===true;
  const normalMatches=tutorialClaimed&&Array.isArray(source.onboarding?.normalMatches)?[...new Set(source.onboarding.normalMatches.filter(id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(id)))].slice(0,2):[];
  return {
    onboarding: {introStep,introComplete,introClaimed,tutorialComplete,tutorialClaimed,normalMatches},
    rankedLoadout: Array.isArray(source.rankedLoadout) ? [...new Set(source.rankedLoadout.filter(id => typeof id === 'string' && /^[a-z0-9_]{1,48}$/.test(id) && (id === 'basic_cannon' || Number(source.assembled?.[id]) > 0 && (source.stars?.[id] === undefined || Number(source.stars[id]) > 0))))].slice(0, 5) : [],
    revision: Math.max(0, Math.floor(Number(source.revision) || 0)),
    fragments: normalizeProgressMap(source.fragments),
    assembled: normalizeProgressMap(source.assembled),
    active: normalizeProgressMap(source.active),
    stars: normalizeProgressMap(source.stars),
    cores: normalizeProgressMap(source.cores),
    lifetimeFragments: Math.max(0, Math.floor(Number(source.lifetimeFragments) || 0)),
    fragmentWishlist: String(source.fragmentWishlist || "").slice(0, 48),
    fragmentPity: Math.max(0, Math.floor(Number(source.fragmentPity) || 0)),
    loadoutPresets: Object.fromEntries(["progress", "boss", "resource"].map((key) => [key, normalizeProgressMap(source.loadoutPresets?.[key])])),
    slotOrder: Object.fromEntries(["main", "auxiliary"].map((role) => [role, Array.isArray(source.slotOrder?.[role]) ? source.slotOrder[role].slice(0, 60).map((id) => String(id || "").slice(0, 48)) : []])),
    activePreset: ["progress", "boss", "resource"].includes(source.activePreset) ? source.activePreset : ""
  };
};
const normalizeUltimateProgress = (progress = {}) => {
  const source = progress && typeof progress === "object" ? progress : {};
  return {
    revision: Math.max(0, Math.floor(Number(source.revision) || 0)),
    fragments: normalizeProgressMap(source.fragments),
    stars: normalizeProgressMap(source.stars),
    equipped: String(source.equipped || "").slice(0, 48),
    lifetimeFragments: Math.max(0, Math.floor(Number(source.lifetimeFragments) || 0)),
    fragmentWishlist: String(source.fragmentWishlist || "").slice(0, 48),
    fragmentPity: Math.max(0, Math.floor(Number(source.fragmentPity) || 0))
  };
};
const SPEED_KEYS = ["4", "5", "10"];
const GACHA_PACK_KEYS = ["normal", "supreme"];
const CONSUMABLE_KEYS = ["reviveTicket", "obsidianDoubleVoucher", "skipWaveVoucher", "freeUpgradeVoucher", "goldDoubleVoucher", "bossSealVoucher", "stageProtectionVoucher"];
const UTILITY_WEEK_LIMITS = Object.freeze({ reviveTicket: 3, obsidianDoubleVoucher: 3, skipWaveVoucher: 5, freeUpgradeVoucher: 5, goldDoubleVoucher: 2, bossSealVoucher: 1, stageProtectionVoucher: 2 });
const MUSIC_KEYS = new Set([
  "sunset_orbit", "foundation_pulse", "ion_islands", "moving_starward", "fortaleza_nebula",
  "neon_affinity", "past_the_nebula", "slow_comet_highway", "horizon_signal", "pan_orbit_drive",
  "blizzard_relay", "homeward_signal", "sunday_starway", "happy_day", "water_pop", "earth_wonder",
  "rock", "dark", "emotional_japan", "happy_life", "bright", "anime", "tension"
]);
const normalizeExpansionProgress = (progress = {}) => {
  const source = progress && typeof progress === "object" ? progress : {};
  const ownedMusic = Array.isArray(source.ownedMusic)
    ? [...new Set(source.ownedMusic.map(String).filter((id) => MUSIC_KEYS.has(id)))].slice(0, MUSIC_KEYS.size)
    : [];
  const equippedMusic = ownedMusic.includes(String(source.equippedMusic)) ? String(source.equippedMusic) : "default";
  return {
    revision: Math.max(0, Math.floor(Number(source.revision) || 0)),
    speedUnlocks: Object.fromEntries(SPEED_KEYS.map((key) => [key, source.speedUnlocks?.[key] === true])),
    speedVouchers: Object.fromEntries(SPEED_KEYS.map((key) => [key, Math.max(0, Math.floor(Number(source.speedVouchers?.[key]) || 0))])),
    premiumBackgrounds: Array.isArray(source.premiumBackgrounds) ? [...new Set(source.premiumBackgrounds.map((id) => String(id).slice(0, 48)))].slice(0, 32) : [],
    unlockedCards: Array.isArray(source.unlockedCards) ? [...new Set(source.unlockedCards.map((id) => String(id).slice(0, 48)))].slice(0, 128) : [],
    consumables: Object.fromEntries(CONSUMABLE_KEYS.map((key) => [key, Math.max(0, Math.floor(Number(source.consumables?.[key]) || 0))])),
    utilityClaims: {
      day: String(source.utilityClaims?.day || "").slice(0, 10),
      adClaims: Math.min(3, Math.max(0, Math.floor(Number(source.utilityClaims?.adClaims) || 0))),
      week: String(source.utilityClaims?.week || "").slice(0, 10),
      purchases: Object.fromEntries(CONSUMABLE_KEYS.map((key) => [key, Math.min(UTILITY_WEEK_LIMITS[key], Math.max(0, Math.floor(Number(source.utilityClaims?.purchases?.[key]) || 0)))]))
    },
    fusionStones: Math.max(0, Math.floor(Number(source.fusionStones) || 0)),
    ownedMusic,
    equippedMusic,
    normalPaidPulls: Math.max(0, Math.floor(Number(source.normalPaidPulls) || 0)),
    supremePaidPulls: Math.max(0, Math.floor(Number(source.supremePaidPulls) || 0)),
    gachaPulls: Object.fromEntries(GACHA_PACK_KEYS.map((key) => [key, Math.max(0, Math.floor(Number(source.gachaPulls?.[key]) || 0))])),
    gachaPity: Object.fromEntries(GACHA_PACK_KEYS.map((key) => [key, Math.min(9, Math.max(0, Math.floor(Number(source.gachaPity?.[key] ?? (Number(source.gachaPulls?.[key]) || 0) % 10) || 0)))])),
    starDust: Math.max(0, Math.floor(Number(source.starDust) || 0)),
    promoMail: Object.fromEntries(GACHA_PACK_KEYS.map((key) => [key, Math.max(0, Math.floor(Number(source.promoMail?.[key]) || 0))])),
    packVouchers: Object.fromEntries(GACHA_PACK_KEYS.map((key) => [key, Math.max(0, Math.floor(Number(source.packVouchers?.[key]) || 0))])),
    introVouchersGranted: source.introVouchersGranted === true,
    launchBonusGranted: Math.max(0, Math.floor(Number(source.launchBonusGranted) || 0))
  };
};
const LAUNCH_REWARD_IDS = new Set([
  "first_login", "wave_5", "wave_10", "wave_20", "wave_30", "wave_40", "wave_50", "wave_60", "wave_70", "wave_75", "wave_80", "wave_90", "boss_100",
  "login_d2", "login_d3", "login_d4", "login_d5", "login_d6", "login_d7"
]);
const normalizeLaunchRewards = (value = {}) => {
  const source = value && typeof value === "object" ? value : {};
  const normalizeKnownMap = (input) => Object.fromEntries(
    [...LAUNCH_REWARD_IDS].map((id) => [id, input?.[id] === true])
  );
  return {
    loginDays: Math.floor(clampNumber(source.loginDays, 0, 7)),
    lastLoginDate: String(source.lastLoginDate || "").slice(0, 10),
    unlocked: normalizeKnownMap(source.unlocked),
    claimed: normalizeKnownMap(source.claimed)
  };
};
const mergeLaunchRewards = (stored, incoming) => {
  const current = normalizeLaunchRewards(stored);
  const next = normalizeLaunchRewards(incoming);
  const unlocked = {};
  const claimed = {};
  for (const id of LAUNCH_REWARD_IDS) {
    unlocked[id] = Boolean(current.unlocked[id] || next.unlocked[id]);
    claimed[id] = Boolean(current.claimed[id] || next.claimed[id]);
  }
  return {
    loginDays: Math.max(current.loginDays, next.loginDays),
    lastLoginDate: current.lastLoginDate >= next.lastLoginDate ? current.lastLoginDate : next.lastLoginDate,
    unlocked,
    claimed
  };
};
const AUTO_UPGRADE_IDS = new Set(["attack", "magic", "speed", "hp", "regen", "critChance", "critDamage"]);
const normalizeAutoUpgrade = (config = {}) => {
  const source = config && typeof config === "object" ? config : {};
  const threshold = Number(source.threshold);
  const sequence = Array.isArray(source.sequence)
    ? source.sequence
      .map((id) => String(id))
      .filter((id, index, values) => AUTO_UPGRADE_IDS.has(id) && values.indexOf(id) === index)
    : [];
  return {
    enabled: source.enabled === true,
    threshold: Math.floor(clampNumber(Number.isFinite(threshold) ? threshold : 100, 0, 999999999)),
    sequence: sequence.length ? sequence : ["attack", "magic", "speed"]
  };
};
const chooseRevisionedProgress = (stored, incoming, normalize, options = {}) => {
  const current = normalize(stored);
  const next = normalize(incoming);
  if (options.isNewAccount === true) return next;
  if (options.isSaveAction === true && (
    next.revision > current.revision ||
    (next.revision === 0 && current.revision === 0)
  )) return next;
  return current;
};
const mergeV2Progress = (stored, incoming, options = {}) => {
  const current = normalizeV2Progress(stored);
  const next = normalizeV2Progress(incoming);
  return chooseRevisionedProgress(current, next, normalizeV2Progress, options);
};

export const sanitizeRecord = (record = {}) => {
  const tierRecords = normalizeTierRecords(record.tierRecords);
  const bestRecord = {
    tier: Math.floor(clampNumber(record.bestRecord?.tier, 1, MAX_TIER)),
    wave: Math.max(1, Math.floor(Number(record.bestRecord?.wave) || 1))
  };
  if (tierRecords[bestRecord.tier] < bestRecord.wave) tierRecords[bestRecord.tier] = bestRecord.wave;
  const unlockedTier = Math.floor(clampNumber(
    Math.max(Number(record.unlockedTier) || 1, getUnlockedTierFromRecords(tierRecords)),
    1,
    MAX_TIER
  ));
  return {
    obsidian: Math.max(0, Math.floor(Number(record.obsidian) || 0)),
    spaceCoins: Math.max(0, Math.floor(Number(record.spaceCoins) || 0)),
    economyRevision: Math.max(0, Math.floor(Number(record.economyRevision) || 0)),
    metaUpgrades: normalizeProgressMap(record.metaUpgrades),
    bestRecord,
    tierRecords,
    unlockedTier,
    dailyTasks: normalizeDailyTasks(record.dailyTasks),
    launchRewards: normalizeLaunchRewards(record.launchRewards),
    achievements: normalizeAchievements(record.achievements),
    shopState: normalizeShopState(record.shopState),
    starterPackOwned: record.starterPackOwned === true,
    weeklyTasks: normalizeWeeklyTasks(record.weeklyTasks),
    economyLimits: normalizeEconomyLimits(record.economyLimits),
    firstDeployment: normalizeFirstDeployment(record.firstDeployment),
    commanderProgress: normalizeCommanderProgress(record.commanderProgress),
    v2Progress: normalizeV2Progress(record.v2Progress),
    ultimateProgress: normalizeUltimateProgress(record.ultimateProgress),
    expansionProgress: normalizeExpansionProgress(record.expansionProgress),
    autoUpgrade: normalizeAutoUpgrade(record.autoUpgrade),
    updatedAt: String(record.updatedAt || new Date(0).toISOString())
  };
};

const mergeRecord = (stored, incoming, options = {}) => {
  const current = sanitizeRecord(stored);
  const next = sanitizeRecord(incoming);
  const acceptIncomingEconomy = options.isNewAccount === true ||
    (options.isSaveAction === true && (
      next.economyRevision > current.economyRevision ||
      (next.economyRevision === 0 && current.economyRevision === 0)
    ));
  let metaUpgrades = current.metaUpgrades;
  if (acceptIncomingEconomy) {
    const metaIds = new Set([...Object.keys(current.metaUpgrades), ...Object.keys(next.metaUpgrades)]);
    metaUpgrades = {};
    for (const id of metaIds) {
      metaUpgrades[id] = Math.max(
        0,
        Math.floor(Number(current.metaUpgrades[id]) || 0),
        Math.floor(Number(next.metaUpgrades[id]) || 0)
      );
    }
  }
  const bestRecord = next.bestRecord.tier > current.bestRecord.tier ||
    (next.bestRecord.tier === current.bestRecord.tier && next.bestRecord.wave > current.bestRecord.wave)
      ? next.bestRecord
      : current.bestRecord;
  const tierRecords = {};
  for (let tier = 1; tier <= MAX_TIER; tier += 1) {
    tierRecords[tier] = Math.max(current.tierRecords[tier] || 1, next.tierRecords[tier] || 1);
  }
  if (tierRecords[bestRecord.tier] < bestRecord.wave) tierRecords[bestRecord.tier] = bestRecord.wave;
  const expansionProgress = chooseRevisionedProgress(current.expansionProgress, next.expansionProgress, normalizeExpansionProgress, options);
  const authoritativeExpansion = options.isNewAccount === true ? normalizeExpansionProgress() : current.expansionProgress;
  if (options.isSaveAction === true) {
    // Purchased music is a permanent entitlement. Preserve any valid ownership
    // found in either side so an older API allowlist or an equal-revision cloud
    // record cannot remove a track that still exists in the player's local save.
    expansionProgress.ownedMusic = [...new Set([
      ...current.expansionProgress.ownedMusic,
      ...next.expansionProgress.ownedMusic
    ])];
    if (
      next.expansionProgress.revision >= current.expansionProgress.revision &&
      expansionProgress.ownedMusic.includes(next.expansionProgress.equippedMusic)
    ) {
      expansionProgress.equippedMusic = next.expansionProgress.equippedMusic;
    } else if (!expansionProgress.ownedMusic.includes(expansionProgress.equippedMusic)) {
      expansionProgress.equippedMusic = "default";
    }
  }
  expansionProgress.normalPaidPulls = authoritativeExpansion.normalPaidPulls;
  expansionProgress.supremePaidPulls = authoritativeExpansion.supremePaidPulls;
  expansionProgress.gachaPulls = { ...authoritativeExpansion.gachaPulls };
  expansionProgress.gachaPity = { ...authoritativeExpansion.gachaPity };
  expansionProgress.starDust = authoritativeExpansion.starDust;
  expansionProgress.promoMail = { ...authoritativeExpansion.promoMail };
  expansionProgress.packVouchers = { ...authoritativeExpansion.packVouchers };
  expansionProgress.launchBonusGranted = authoritativeExpansion.launchBonusGranted;
  expansionProgress.introVouchersGranted = authoritativeExpansion.introVouchersGranted;
  const v2Progress = mergeV2Progress(current.v2Progress, next.v2Progress, options);
  // The server's saved flag and voucher balance are authoritative, including after consumption.
  if (v2Progress.onboarding.introClaimed && !expansionProgress.introVouchersGranted) {
    expansionProgress.packVouchers.normal += 10;
    expansionProgress.packVouchers.supreme += 10;
    expansionProgress.introVouchersGranted = true;
    expansionProgress.revision += 1;
  }

  return {
    obsidian: acceptIncomingEconomy ? next.obsidian : current.obsidian,
    spaceCoins: acceptIncomingEconomy ? next.spaceCoins : current.spaceCoins,
    economyRevision: acceptIncomingEconomy ? next.economyRevision : current.economyRevision,
    metaUpgrades,
    bestRecord,
    tierRecords,
    unlockedTier: Math.max(current.unlockedTier, next.unlockedTier, getUnlockedTierFromRecords(tierRecords)),
    dailyTasks: mergeDailyTasks(current.dailyTasks, next.dailyTasks),
    launchRewards: mergeLaunchRewards(current.launchRewards, next.launchRewards),
    achievements: mergeAchievements(current.achievements, next.achievements),
    shopState: options.isNewAccount === true || options.isSaveAction === true ? next.shopState : current.shopState,
    weeklyTasks: mergeWeeklyTasks(current.weeklyTasks, next.weeklyTasks),
    economyLimits: mergeEconomyLimits(current.economyLimits, next.economyLimits),
    firstDeployment: mergeFirstDeployment(current.firstDeployment, next.firstDeployment),
    commanderProgress: { xp: Math.max(current.commanderProgress.xp, next.commanderProgress.xp) },
    v2Progress,
    ultimateProgress: chooseRevisionedProgress(current.ultimateProgress, next.ultimateProgress, normalizeUltimateProgress, options),
    expansionProgress,
    autoUpgrade: options.isNewAccount === true || options.isSaveAction === true
      ? next.autoUpgrade
      : current.autoUpgrade,
    updatedAt: new Date().toISOString()
  };
};

const recordsEqual = (a, b) => {
  const left = sanitizeRecord(a);
  const right = sanitizeRecord(b);
  if (left.obsidian !== right.obsidian) return false;
  if (left.spaceCoins !== right.spaceCoins) return false;
  if (left.economyRevision !== right.economyRevision) return false;
  if (left.bestRecord.tier !== right.bestRecord.tier || left.bestRecord.wave !== right.bestRecord.wave) return false;
  if (left.unlockedTier !== right.unlockedTier) return false;
  if (JSON.stringify(left.tierRecords) !== JSON.stringify(right.tierRecords)) return false;
  if (JSON.stringify(left.dailyTasks) !== JSON.stringify(right.dailyTasks)) return false;
  if (JSON.stringify(left.launchRewards) !== JSON.stringify(right.launchRewards)) return false;
  if (JSON.stringify(left.achievements) !== JSON.stringify(right.achievements)) return false;
  if (JSON.stringify(left.shopState) !== JSON.stringify(right.shopState)) return false;
  if (JSON.stringify(left.weeklyTasks) !== JSON.stringify(right.weeklyTasks)) return false;
  if (JSON.stringify(left.economyLimits) !== JSON.stringify(right.economyLimits)) return false;
  if (JSON.stringify(left.firstDeployment) !== JSON.stringify(right.firstDeployment)) return false;
  if (left.commanderProgress.xp !== right.commanderProgress.xp) return false;
  if (JSON.stringify(left.v2Progress) !== JSON.stringify(right.v2Progress)) return false;
  if (JSON.stringify(left.ultimateProgress) !== JSON.stringify(right.ultimateProgress)) return false;
  if (JSON.stringify(left.expansionProgress) !== JSON.stringify(right.expansionProgress)) return false;
  if (JSON.stringify(left.autoUpgrade) !== JSON.stringify(right.autoUpgrade)) return false;
  const metaIds = new Set([...Object.keys(left.metaUpgrades), ...Object.keys(right.metaUpgrades)]);
  for (const id of metaIds) {
    if (Math.max(0, Math.floor(Number(left.metaUpgrades[id]) || 0)) !== Math.max(0, Math.floor(Number(right.metaUpgrades[id]) || 0))) {
      return false;
    }
  }
  return true;
};

const publicPlayer = (account, record, wallet, spaceCoinWallet) => ({
  name: account.name,
  save: sanitizeRecord(record),
  wallet,
  spaceCoinWallet
});

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  const bindingError = requireBindings(env);
  if (bindingError) return jsonResponse(request, { error: bindingError }, 503);

  const body = await readBody(request);
  if (!body) return jsonResponse(request, { error: "Invalid JSON.", code: "INVALID_JSON" }, 400);

  const sessionAuth = await authenticatePlayerSession(request, env);
  const action = body.action === "register" ? "register" : body.action === "save" ? "save" : "login";
  const name = sessionAuth?.account?.name || normalizeName(body.name);
  const password = normalizePassword(body.password);
  if (!sessionAuth && !name) {
    return jsonResponse(request, { error: "Player ID is required.", code: "PLAYER_ID_REQUIRED" }, 400);
  }
  if (!sessionAuth && action === "register" && name.length < 3) {
    return jsonResponse(request, { error: "Player ID must contain at least 3 characters.", code: "PLAYER_ID_TOO_SHORT" }, 400);
  }
  if (!sessionAuth && !password) {
    return jsonResponse(request, { error: "Password is required.", code: "PASSWORD_REQUIRED" }, 400);
  }
  if (!sessionAuth && action === "register" && password.length < 8) {
    return jsonResponse(request, { error: "Password must contain at least 8 characters.", code: "PASSWORD_TOO_SHORT" }, 400);
  }

  const accountKey = sessionAuth?.accountKey || playerKey(name);
  let account = sessionAuth?.account || await getPlayerAccount(env, accountKey);
  let isNewAccount = false;
  let credentialsUpgraded = false;
  if (!account) {
    if (action !== "register") {
      return jsonResponse(request, { error: "Account not found. Register this Player ID first.", code: "ACCOUNT_NOT_FOUND" }, 404);
    }
    const salt = crypto.randomUUID();
    isNewAccount = true;
    account = {
      name,
      salt,
      passwordHash: await hashPassword(name.toLowerCase(), password, salt),
      passwordVersion: 2,
      createdAt: new Date().toISOString()
    };
  } else if (!sessionAuth) {
    if (action === "register") {
      return jsonResponse(request, { error: "This Player ID is already registered.", code: "ACCOUNT_EXISTS" }, 409);
    }
    const verification = await verifyPlayerPassword(account, name, password);
    if (!verification.valid) {
      return jsonResponse(request, { error: "Player ID or password is incorrect.", code: "INVALID_CREDENTIALS" }, 401);
    }
    if (verification.needsUpgrade) {
      account.passwordHash = verification.passwordHash;
      account.passwordVersion = 2;
      credentialsUpgraded = true;
    }
    account.name = account.name || name;
  }

  const isSaveAction = body.action === "save";
  const merged = mergeRecord(account.save, body.save || {}, {
    isNewAccount,
    isSaveAction
  });
  const wallet = await getWallet(env, accountKey);
  const starterEntitlement = await getStarterPackEntitlement(env, accountKey);
  applyStarterPackEntitlement(merged, starterEntitlement);
  applyStarterPackSupplies(merged, account, starterEntitlement);
  const spaceCoinWallet = await getSpaceCoinWallet(env, accountKey);
  const appliedCredits = Math.max(0, Math.floor(Number(account.commerceCreditsApplied) || 0));
  const pendingCredits = Math.max(0, wallet.lifetimePurchased - appliedCredits);
  if (pendingCredits > 0) {
    merged.obsidian += pendingCredits;
    merged.economyRevision += 1;
    account.commerceCreditsApplied = wallet.lifetimePurchased;
  }
  const appliedSpaceCoinCredits = Math.max(0, Math.floor(Number(account.spaceCoinCreditsApplied) || 0));
  const pendingSpaceCoinCredits = Math.max(0, spaceCoinWallet.lifetimePurchased - appliedSpaceCoinCredits);
  if (pendingSpaceCoinCredits > 0) {
    merged.spaceCoins += pendingSpaceCoinCredits;
    merged.economyRevision += 1;
    account.spaceCoinCreditsApplied = spaceCoinWallet.lifetimePurchased;
  }
  const trialTotals = await getTrialRewardTotals(env, accountKey);
  const rankedTotal = await rankedRewardTotal(env, accountKey);
  const pendingRanked = Math.max(0, rankedTotal - (Number(account.rankedCreditsApplied) || 0));
  if (pendingRanked > 0) {
    merged.obsidian += pendingRanked;
    merged.economyRevision += 1;
    account.rankedCreditsApplied = rankedTotal;
  }
  const trialCreditsApplied = Math.max(0, Math.floor(Number(account.trialCreditsApplied) || 0));
  const pendingTrialCredits = Math.max(0, trialTotals.obsidian - trialCreditsApplied);
  if (pendingTrialCredits > 0) {
    merged.obsidian += pendingTrialCredits;
    merged.economyRevision += 1;
    account.trialCreditsApplied = trialTotals.obsidian;
  }
  const trialPullsApplied = Math.max(0, Math.floor(Number(account.trialPullsApplied) || 0));
  const pendingTrialPulls = Math.max(0, trialTotals.normalPulls - trialPullsApplied);
  if (pendingTrialPulls > 0) {
    merged.expansionProgress.packVouchers.normal += pendingTrialPulls;
    merged.expansionProgress.revision += 1;
    account.trialPullsApplied = trialTotals.normalPulls;
  }
  const appliedTrialShards = account.trialShardsApplied && typeof account.trialShardsApplied === "object" ? account.trialShardsApplied : {};
  let pendingTrialShards = 0;
  for (const [id, total] of Object.entries(trialTotals.shards)) {
    const pending = Math.max(0, total - (Number(appliedTrialShards[id]) || 0));
    if (!pending) continue;
    merged.v2Progress.fragments[id] = (merged.v2Progress.fragments[id] || 0) + pending;
    merged.v2Progress.lifetimeFragments += pending;
    appliedTrialShards[id] = total;
    pendingTrialShards += pending;
  }
  if (pendingTrialShards > 0) {
    merged.v2Progress.revision += 1;
    account.trialShardsApplied = appliedTrialShards;
  }
  const unchanged = !isNewAccount && !credentialsUpgraded && pendingCredits === 0 && pendingSpaceCoinCredits === 0 && pendingTrialCredits === 0 && pendingTrialPulls === 0 && pendingTrialShards === 0 && recordsEqual(account.save, merged);
  account.save = merged;
  account.updatedAt = merged.updatedAt;
  if (!unchanged) await putPlayerAccount(env, accountKey, account);
  if (merged.bestRecord?.tier > 1 || merged.bestRecord?.wave > 1) {
    await upsertLeaderboardEntry(env, {
      playerKey: accountKey,
      name: account.name,
      tier: merged.bestRecord?.tier,
      wave: merged.bestRecord?.wave,
      isGuest: account.guestCommerce === true,
      updatedAt: merged.updatedAt
    });
  }

  const sessionToken = sessionAuth ? "" : await createPlayerSession(env, accountKey, account.name);

  return jsonResponse(request, {
    ok: true,
    player: publicPlayer(account, merged, wallet, spaceCoinWallet),
    entitlements: await getPlayerEntitlements(env, accountKey),
    sessionToken: sessionToken || undefined,
    registered: isNewAccount || undefined,
    writeSkipped: unchanged || undefined
  });
}

async function deletePlayerFeedback(env, playerName) {
  const normalizedPlayer = normalizeName(playerName).toLowerCase();
  if (!normalizedPlayer) return;
  let cursor;
  do {
    const listed = await env.FEEDBACK_STORE.list({
      prefix: "feedback:",
      limit: 100,
      cursor
    });
    const matches = await Promise.all(listed.keys.map(async (key) => {
      const record = await env.FEEDBACK_STORE.get(key.name, "json");
      return normalizeName(record?.player).toLowerCase() === normalizedPlayer ? key.name : "";
    }));
    await Promise.all(matches.filter(Boolean).map((key) => env.FEEDBACK_STORE.delete(key)));
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);
}

export async function onRequestDelete({ request, env }) {
  const bindingError = requireBindings(env);
  if (bindingError) return jsonResponse(request, { error: bindingError }, 503);

  let auth = await authenticatePlayerSession(request, env);
  if (!auth) {
    const body = await readBody(request);
    if (!body) return jsonResponse(request, { error: "Invalid JSON.", code: "INVALID_JSON" }, 400);
    auth = await authenticatePlayerCredentials(env, body.name, body.password);
  }
  if (!auth) {
    return jsonResponse(request, { error: "Player ID or password is incorrect.", code: "INVALID_CREDENTIALS" }, 401);
  }

  if (env.COMMERCE_DB) {
    try {
      await env.COMMERCE_DB.batch([
        env.COMMERCE_DB.prepare("DELETE FROM ranked_results WHERE player_key = ?").bind(auth.accountKey),
        env.COMMERCE_DB.prepare("DELETE FROM ranked_profiles WHERE player_key = ?").bind(auth.accountKey)
      ]);
    } catch { /* Older deployments can predate the ranked migration. */ }
    try {
      await env.COMMERCE_DB.batch([
        env.COMMERCE_DB.prepare("DELETE FROM trial_runs WHERE player_key = ?").bind(auth.accountKey),
        env.COMMERCE_DB.prepare("DELETE FROM trial_ad_bonus WHERE player_key = ?").bind(auth.accountKey),
        env.COMMERCE_DB.prepare("DELETE FROM trial_ad_intents WHERE player_key = ?").bind(auth.accountKey),
        env.COMMERCE_DB.prepare("DELETE FROM trial_weekly_best WHERE player_key = ?").bind(auth.accountKey),
        env.COMMERCE_DB.prepare("DELETE FROM trial_reward_ledger WHERE player_key = ?").bind(auth.accountKey)
      ]);
    } catch { /* Older local schemas can predate the trial migration. */ }
    try {
      await env.COMMERCE_DB.batch([
        env.COMMERCE_DB.prepare("DELETE FROM vip_obsidian_purchases WHERE player_key = ?").bind(auth.accountKey),
        env.COMMERCE_DB.prepare("DELETE FROM vip_subscriptions WHERE player_key = ?").bind(auth.accountKey)
      ]);
    } catch { /* Older local schemas can predate the VIP migration. */ }
    await env.COMMERCE_DB.batch([
      env.COMMERCE_DB.prepare(
        "DELETE FROM commerce_entitlements WHERE player_key = ?"
      ).bind(auth.accountKey),
      env.COMMERCE_DB.prepare(
        "DELETE FROM starter_pack_purchases WHERE player_key = ?"
      ).bind(auth.accountKey),
      env.COMMERCE_DB.prepare(
        "DELETE FROM space_coin_wallet_ledger WHERE player_key = ?"
      ).bind(auth.accountKey),
      env.COMMERCE_DB.prepare(
        "DELETE FROM space_coin_wallets WHERE player_key = ?"
      ).bind(auth.accountKey),
      env.COMMERCE_DB.prepare(
        "DELETE FROM commerce_wallet_ledger WHERE player_key = ?"
      ).bind(auth.accountKey),
      env.COMMERCE_DB.prepare(
        "DELETE FROM commerce_orders WHERE player_key = ?"
      ).bind(auth.accountKey),
      env.COMMERCE_DB.prepare(
        "DELETE FROM commerce_wallets WHERE player_key = ?"
      ).bind(auth.accountKey)
    ]);
  }

  await deletePlayerFeedback(env, auth.account?.name || auth.session?.accountName);
  await deletePlayerAccount(env, auth.accountKey);
  return jsonResponse(request, { ok: true, deleted: true });
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "POST, DELETE, OPTIONS");
}
