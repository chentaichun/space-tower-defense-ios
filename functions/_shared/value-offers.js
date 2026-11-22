import "../../turret-catalog.js";

// Monthly value packs and the Invincible Pass. Client copy: value-offers.js.
export const VALUE_PACKS = Object.freeze({
  value_pack_199_v1: { turrets: ["vital_orb"], cores: 5, pulls: 20 },
  value_pack_299_v1: { turrets: ["icewall_orb", "bomb_orb"], cores: 5, pulls: 50 },
  value_pack_499_v1: { turrets: ["phoenix_orb", "afterimage_orb", "sword_orb", "missile_orb", "ninja_orb", "frostbite_orb"], cores: 5, pulls: 100 }
});
export const PASS_PRODUCTS = Object.freeze({ monthly_pass_666_v1: 1, monthly_pass_1000_v1: 2, monthly_pass_2000_v1: 4 });
export const OFFER_PRODUCT_IDS = Object.freeze([...Object.keys(VALUE_PACKS), ...Object.keys(PASS_PRODUCTS)]);
export const OFFER_TURRET_IDS = Object.freeze([...new Set(Object.values(VALUE_PACKS).flatMap((pack) => pack.turrets))]);

export const PASS = Object.freeze({ levels: 30, xpPerLevel: 100, loginXp: 60, waveXpCap: 60 });
export const FREE_TRACK = Object.freeze({ 1: ["obs", 10], 3: ["obs", 50], 5: ["obs", 50], 8: ["obs", 10], 10: ["shard", 1], 15: ["obs", 50], 20: ["shard", 3], 25: ["obs", 50], 28: ["obs", 20], 29: ["obs", 20], 30: ["shard", 10] });
export const NOBLE_TRACK = Object.freeze({ 1: ["revive", 1], 2: ["obs", 50], 3: ["obs", 250], 4: ["coin", 50], 5: ["obs", 250], 6: ["coin", 100], 7: ["coin", 100], 8: ["obs", 250], 9: ["obsDouble", 1], 10: ["shard", 5], 11: ["coin", 100], 12: ["skip", 1], 13: ["coin", 100], 14: ["obs", 250], 15: ["obs", 250], 16: ["coin", 50], 17: ["seal", 1], 18: ["coin", 100], 19: ["goldDouble", 1], 20: ["shard", 10], 21: ["skip", 1], 22: ["dice", 50], 23: ["coin", 100], 24: ["obs", 250], 25: ["meteor", 10], 26: ["coin", 200], 27: ["revive", 2], 28: ["obs", 250], 29: ["obs", 200], 30: ["imperial", 10] });
const CONSUMABLE_FOR = Object.freeze({ revive: "reviveTicket", obsDouble: "obsidianDoubleVoucher", skip: "skipWaveVoucher", seal: "bossSealVoucher", goldDouble: "goldDoubleVoucher" });

export const offerMonth = (date = new Date()) => date.toISOString().slice(0, 7);
export const offerDay = (date = new Date()) => date.toISOString().slice(0, 10);
export const passLevel = (xp) => Math.min(PASS.levels, Math.floor(Math.max(0, Number(xp) || 0) / PASS.xpPerLevel));

function shardPool() {
  return (globalThis.SpaceTowerCatalog?.turrets || [])
    .filter((item) => !item.starterExclusive && !item.offerExclusive && !item.tutorialExclusive && !item.vipExclusive)
    .map((item) => item.id);
}

// Random parts are rolled once, when the ledger row is written, so applying a row is deterministic.
export function rollRewards(kind, amount, random = Math.random) {
  const rewards = { obsidian: 0, spaceCoins: 0, normalPulls: 0, supremePulls: 0, consumables: {}, shards: {}, turrets: [], cores: {} };
  if (kind === "obs") rewards.obsidian = amount;
  else if (kind === "coin") rewards.spaceCoins = amount;
  else if (kind === "meteor") rewards.normalPulls = amount;
  else if (kind === "imperial") rewards.supremePulls = amount;
  else if (kind === "dice") for (let i = 0; i < amount; i += 1) rewards.obsidian += 1 + Math.floor(random() * 6);
  else if (kind === "shard") {
    const pool = shardPool();
    for (let i = 0; i < amount && pool.length; i += 1) {
      const id = pool[Math.floor(random() * pool.length)];
      rewards.shards[id] = (rewards.shards[id] || 0) + 1;
    }
  } else if (CONSUMABLE_FOR[kind]) rewards.consumables[CONSUMABLE_FOR[kind]] = amount;
  return rewards;
}

export function packRewards(productId) {
  const pack = VALUE_PACKS[productId];
  if (!pack) return null;
  return {
    obsidian: 0, spaceCoins: 0, normalPulls: pack.pulls, supremePulls: pack.pulls, consumables: {}, shards: {},
    turrets: [...pack.turrets], cores: Object.fromEntries(pack.turrets.map((id) => [id, pack.cores]))
  };
}

async function insertLedger(db, playerKey, source, rewards) {
  const result = await db.prepare("INSERT OR IGNORE INTO offer_reward_ledger (player_key, source, rewards, created_at) VALUES (?, ?, ?, ?)")
    .bind(playerKey, source, JSON.stringify(rewards), new Date().toISOString()).run();
  return Number(result?.meta?.changes || 0) > 0;
}

// One row per Google Play purchase token: pack rewards or a pass tier for that month.
export async function grantOfferPurchase(env, { playerKey, productId, purchaseToken, orderId }) {
  const db = env.COMMERCE_DB;
  const month = offerMonth();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR IGNORE INTO offer_purchases (purchase_token, player_key, product_id, month, order_id, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(purchaseToken, playerKey, productId, month, orderId, now).run();
  const row = await db.prepare("SELECT player_key AS playerKey, product_id AS productId, month FROM offer_purchases WHERE purchase_token = ?").bind(purchaseToken).first();
  if (!row || row.playerKey !== playerKey || row.productId !== productId) return { fulfilled: false, code: "TOKEN_REUSED" };
  let newlyFulfilled = false;
  if (VALUE_PACKS[productId]) {
    newlyFulfilled = await insertLedger(db, playerKey, `pack:${purchaseToken}`, packRewards(productId));
  } else {
    const tier = PASS_PRODUCTS[productId];
    const before = await getPassRow(db, playerKey, row.month);
    await db.prepare("INSERT INTO monthly_pass (player_key, month, noble, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(player_key, month) DO UPDATE SET noble = MAX(monthly_pass.noble, excluded.noble), updated_at = excluded.updated_at")
      .bind(playerKey, row.month, tier, now).run();
    newlyFulfilled = (before?.noble || 0) < tier;
  }
  return { fulfilled: true, newlyFulfilled, month: row.month };
}

async function getPassRow(db, playerKey, month) {
  return db.prepare("SELECT noble, xp, login_day AS loginDay, wave_day AS waveDay, wave_xp AS waveXp FROM monthly_pass WHERE player_key = ? AND month = ?").bind(playerKey, month).first();
}

export async function getOfferState(env, playerKey) {
  const db = env.COMMERCE_DB;
  const month = offerMonth();
  const pass = await getPassRow(db, playerKey, month) || { noble: 0, xp: 0, loginDay: "", waveDay: "", waveXp: 0 };
  const claims = await db.prepare("SELECT source FROM offer_reward_ledger WHERE player_key = ? AND source LIKE ?").bind(playerKey, `pass:${month}:%`).all();
  const claimedFree = [], claimedNoble = [];
  for (const { source } of claims?.results || []) {
    const [, , track, level] = String(source).split(":");
    (track === "free" ? claimedFree : claimedNoble).push(Number(level));
  }
  const bought = await db.prepare("SELECT product_id AS productId FROM offer_purchases WHERE player_key = ? AND month = ?").bind(playerKey, month).all();
  return {
    month, noble: Number(pass.noble) || 0, xp: Number(pass.xp) || 0, level: passLevel(pass.xp),
    claimedFree, claimedNoble, boughtThisMonth: [...new Set((bought?.results || []).map((item) => item.productId))]
  };
}

// Login XP once per UTC day; wave XP capped per day. Client-reported waves are bounded by the cap.
export async function addPassXp(env, playerKey, { login = false, waves = 0 } = {}) {
  const db = env.COMMERCE_DB;
  const month = offerMonth(), day = offerDay(), now = new Date().toISOString();
  await db.prepare("INSERT OR IGNORE INTO monthly_pass (player_key, month, updated_at) VALUES (?, ?, ?)").bind(playerKey, month, now).run();
  const row = await getPassRow(db, playerKey, month);
  let xp = Number(row.xp) || 0, loginDay = row.loginDay, waveDay = row.waveDay, waveXp = Number(row.waveXp) || 0;
  if (login && loginDay !== day) { xp += PASS.loginXp; loginDay = day; }
  if (waveDay !== day) { waveDay = day; waveXp = 0; }
  const gain = Math.max(0, Math.min(PASS.waveXpCap - waveXp, Math.floor(Number(waves) || 0)));
  xp += gain; waveXp += gain;
  xp = Math.min(xp, PASS.levels * PASS.xpPerLevel);
  await db.prepare("UPDATE monthly_pass SET xp = ?, login_day = ?, wave_day = ?, wave_xp = ?, updated_at = ? WHERE player_key = ? AND month = ?")
    .bind(xp, loginDay, waveDay, waveXp, now, playerKey, month).run();
}

export async function claimPassRewards(env, playerKey, random = Math.random) {
  const state = await getOfferState(env, playerKey);
  let claimed = 0;
  for (let level = 1; level <= state.level; level += 1) {
    if (FREE_TRACK[level] && !state.claimedFree.includes(level)) {
      const [kind, amount] = FREE_TRACK[level];
      if (await insertLedger(env.COMMERCE_DB, playerKey, `pass:${state.month}:free:${level}`, rollRewards(kind, amount, random))) claimed += 1;
    }
    if (state.noble > 0 && NOBLE_TRACK[level] && !state.claimedNoble.includes(level)) {
      const [kind, amount] = NOBLE_TRACK[level];
      if (await insertLedger(env.COMMERCE_DB, playerKey, `pass:${state.month}:noble:${level}`, rollRewards(kind, amount * state.noble, random))) claimed += 1;
    }
  }
  return claimed;
}

export async function getOfferLedger(env, playerKey) {
  // null means "unknown" (no database or a read error): callers must not strip turrets then.
  if (!env.COMMERCE_DB || !playerKey) return null;
  try {
    const rows = await env.COMMERCE_DB.prepare("SELECT id, rewards FROM offer_reward_ledger WHERE player_key = ? ORDER BY id").bind(playerKey).all();
    return (rows?.results || []).map((row) => ({ id: Number(row.id), rewards: JSON.parse(row.rewards || "{}") }));
  } catch { return null; }
}

// Applies ledger rows newer than account.offerLedgerApplied, then strips pack turrets the player never bought.
export function applyOfferLedger(save, account, ledger) {
  if (!Array.isArray(ledger)) return false;
  const applied = Math.max(0, Number(account.offerLedgerApplied) || 0);
  const owned = new Set(ledger.flatMap((row) => row.rewards?.turrets || []));
  let changed = false;
  for (const { id, rewards: r } of ledger) {
    if (id <= applied) continue;
    const progress = save.v2Progress, expansion = save.expansionProgress;
    save.obsidian += Math.max(0, Math.floor(Number(r.obsidian) || 0));
    save.spaceCoins += Math.max(0, Math.floor(Number(r.spaceCoins) || 0));
    if (r.obsidian || r.spaceCoins) save.economyRevision += 1;
    expansion.packVouchers.normal += Math.max(0, Math.floor(Number(r.normalPulls) || 0));
    expansion.packVouchers.supreme += Math.max(0, Math.floor(Number(r.supremePulls) || 0));
    for (const [key, amount] of Object.entries(r.consumables || {})) {
      if (key in expansion.consumables) expansion.consumables[key] += Math.max(0, Math.floor(Number(amount) || 0));
    }
    expansion.revision += 1;
    for (const [turretId, amount] of Object.entries(r.shards || {})) {
      progress.fragments[turretId] = (progress.fragments[turretId] || 0) + amount;
      progress.lifetimeFragments += amount;
    }
    for (const turretId of r.turrets || []) {
      if ((progress.assembled[turretId] || 0) > 0) progress.stars[turretId] = Math.min(5, Math.max(1, progress.stars[turretId] || 1) + 1);
      else { progress.assembled[turretId] = 1; progress.stars[turretId] = 1; }
    }
    for (const [turretId, amount] of Object.entries(r.cores || {})) progress.cores[turretId] = (progress.cores[turretId] || 0) + amount;
    progress.revision += 1;
    account.offerLedgerApplied = id;
    changed = true;
  }
  const progress = save.v2Progress;
  for (const turretId of OFFER_TURRET_IDS) {
    if (owned.has(turretId) || !(progress.assembled?.[turretId] > 0 || progress.stars?.[turretId] > 0)) continue;
    for (const bucket of ["assembled", "stars", "active", "fragments", "cores"]) delete progress[bucket]?.[turretId];
    for (const preset of Object.values(progress.loadoutPresets || {})) delete preset[turretId];
    changed = true;
  }
  return changed;
}
