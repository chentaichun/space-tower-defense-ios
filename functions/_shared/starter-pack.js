export const STARTER_PACK = Object.freeze({
  id: "starter_emerald_v1", turretId: "emerald_drake", strengthGrade: 8,
  obsidian: 2400, spaceCoins: 2000, stars: 1, nonConsumable: true,
  consumables: Object.freeze({ reviveTicket: 3, obsidianDoubleVoucher: 3, goldDoubleVoucher: 3, freeUpgradeVoucher: 5, skipWaveVoucher: 3, bossSealVoucher: 1, stageProtectionVoucher: 2 }),
  priceUsdCents: 99, referenceProductId: "obsidian_120", referenceAmountWithFirstBonus: 240
});

export function applyStarterPackSupplies(save, account, entitlement) {
  if (!entitlement || account.starterPackSuppliesApplied === STARTER_PACK.id) return false;
  for (const [id, amount] of Object.entries(STARTER_PACK.consumables)) save.expansionProgress.consumables[id] += amount;
  save.expansionProgress.revision += 1;
  account.starterPackSuppliesApplied = STARTER_PACK.id;
  return true;
}

// Explicit commercial tiers requested by the developer; not income classifications.
export const STARTER_PRICE_TIERS = Object.freeze([
  { tier: "A", usdCents: 99, countries: ["US", "CA", "AU", "GB", "SG", "HK", "MO"] },
  { tier: "B", usdCents: 79, countries: ["TW", "CL"] },
  { tier: "C", usdCents: 59, countries: ["MX", "AR", "MY", "CO", "PE"] },
  { tier: "D", usdCents: 49, countries: ["EC", "GT", "PY", "SV", "ID", "PH", "LK"] },
  { tier: "E", usdCents: 29, countries: ["IN", "PK", "BD", "NP", "NG", "GH", "KE", "TZ", "ZM", "ZW", "BO", "HN", "NI"] },
  { tier: "F", usdCents: 19, countries: ["UG", "RW"] }
]);

export async function getStarterPackEntitlement(env, playerKey) {
  if (!env.COMMERCE_DB || !playerKey) return null;
  return env.COMMERCE_DB.prepare(
    "SELECT product_id AS productId, granted_at AS grantedAt FROM starter_pack_purchases WHERE player_key = ? AND granted_at IS NOT NULL"
  ).bind(playerKey).first();
}

export function applyStarterPackEntitlement(save, entitlement) {
  const id = STARTER_PACK.turretId;
  save.starterPackOwned = Boolean(entitlement);
  const progress = save.v2Progress;
  if (!progress) return;
  if (!entitlement) {
    for (const bucket of ["assembled", "stars", "active", "fragments", "cores"]) delete progress[bucket]?.[id];
    for (const preset of Object.values(progress.loadoutPresets || {})) delete preset[id];
    if (progress.fragmentWishlist === id) progress.fragmentWishlist = "";
    return;
  }
  // This one-star package turret does not dilute the existing shard/loot pools.
  if (progress.stars[id] !== 1 || progress.assembled[id] !== 1) progress.revision += 1;
  progress.stars[id] = 1;
  progress.assembled[id] = 1;
  progress.active[id] = Math.min(1, Math.max(0, Number(progress.active[id]) || 0));
}

export async function grantStarterPack(env, { playerKey, purchaseToken, orderId }) {
  const now = new Date().toISOString();
  const grantToken = crypto.randomUUID();
  const db = env.COMMERCE_DB;
  // D1 batch is one transaction. Unique player and purchase-token constraints,
  // plus this invocation's grant token, make simultaneous restores idempotent.
  await db.batch([
    db.prepare("INSERT OR IGNORE INTO starter_pack_purchases (player_key, product_id, purchase_token, order_id, grant_token, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(playerKey, STARTER_PACK.id, purchaseToken, orderId, grantToken, now),
    db.prepare("INSERT INTO commerce_wallets (player_key, balance, lifetime_purchased, first_purchase_claimed, updated_at) SELECT player_key, ?, ?, 0, ? FROM starter_pack_purchases WHERE grant_token = ? AND granted_at IS NULL ON CONFLICT(player_key) DO UPDATE SET balance = commerce_wallets.balance + excluded.balance, lifetime_purchased = commerce_wallets.lifetime_purchased + excluded.lifetime_purchased, updated_at = excluded.updated_at")
      .bind(STARTER_PACK.obsidian, STARTER_PACK.obsidian, now, grantToken),
    db.prepare("INSERT INTO space_coin_wallets (player_key, balance, lifetime_purchased, updated_at) SELECT player_key, ?, ?, ? FROM starter_pack_purchases WHERE grant_token = ? AND granted_at IS NULL ON CONFLICT(player_key) DO UPDATE SET balance = space_coin_wallets.balance + excluded.balance, lifetime_purchased = space_coin_wallets.lifetime_purchased + excluded.lifetime_purchased, updated_at = excluded.updated_at")
      .bind(STARTER_PACK.spaceCoins, STARTER_PACK.spaceCoins, now, grantToken),
    db.prepare("UPDATE starter_pack_purchases SET granted_at = ? WHERE grant_token = ? AND granted_at IS NULL").bind(now, grantToken)
  ]);
  const row = await db.prepare("SELECT player_key AS playerKey, purchase_token AS purchaseToken, grant_token AS grantToken, granted_at AS grantedAt FROM starter_pack_purchases WHERE player_key = ? OR purchase_token = ?")
    .bind(playerKey, purchaseToken).first();
  if (!row || row.playerKey !== playerKey || row.purchaseToken !== purchaseToken || !row.grantedAt) {
    return { fulfilled: false, code: "STARTER_ALREADY_OWNED" };
  }
  return { fulfilled: true, newlyFulfilled: row.grantToken === grantToken };
}
