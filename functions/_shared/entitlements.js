export const ENTITLEMENT_PRODUCTS = Object.freeze([
  {
    id: "remove_ads_v1",
    entitlement: "remove_ads",
    priceTwd: 90,
    priceUsdCents: 299,
    badge: "AD-FREE",
    title: "Permanent Ad-Free",
    description: "No automatic interstitials. Rewarded-ad buttons grant the same reward instantly, with the same limits."
  },
  {
    id: "double_gold_v1",
    entitlement: "double_gold",
    priceTwd: 150,
    priceUsdCents: 499,
    badge: "2X GOLD",
    title: "Permanent 2x Battle Gold",
    description: "Doubles Gold earned inside a run. It does not change damage, enemy strength, Obsidian, or paid currency."
  }
]);

export const publicEntitlementCatalog = () => ENTITLEMENT_PRODUCTS.map((product) => ({
  ...product,
  priceUsd: (product.priceUsdCents / 100).toFixed(2),
  nonConsumable: true
}));

export function findEntitlementProduct(productId) {
  return ENTITLEMENT_PRODUCTS.find((product) => product.id === String(productId || "")) || null;
}

export async function getPlayerEntitlements(env, playerKey) {
  if (!env.COMMERCE_DB || !playerKey) return [];
  try {
    const result = await env.COMMERCE_DB.prepare(
      "SELECT entitlement FROM commerce_entitlements WHERE player_key = ? AND granted_at IS NOT NULL ORDER BY granted_at"
    ).bind(playerKey).all();
    return [...new Set((result.results || []).map((row) => String(row.entitlement || "")).filter(Boolean))];
  } catch {
    // A staged client can still log in before migration 0004 reaches production.
    return [];
  }
}

export async function grantPlayerEntitlement(env, { playerKey, product, purchaseToken, orderId }) {
  const now = new Date().toISOString();
  const grantToken = crypto.randomUUID();
  await env.COMMERCE_DB.prepare(
    "INSERT OR IGNORE INTO commerce_entitlements (player_key, entitlement, product_id, purchase_token, order_id, grant_token, created_at, granted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(playerKey, product.entitlement, product.id, purchaseToken, orderId, grantToken, now, now).run();
  const row = await env.COMMERCE_DB.prepare(
    "SELECT player_key AS playerKey, product_id AS productId, purchase_token AS purchaseToken, grant_token AS grantToken, granted_at AS grantedAt FROM commerce_entitlements WHERE player_key = ? AND entitlement = ? OR purchase_token = ?"
  ).bind(playerKey, product.entitlement, purchaseToken).first();
  if (!row || row.playerKey !== playerKey || row.productId !== product.id || row.purchaseToken !== purchaseToken || !row.grantedAt) {
    return { fulfilled: false, code: "ENTITLEMENT_ALREADY_OWNED" };
  }
  return { fulfilled: true, newlyFulfilled: row.grantToken === grantToken };
}
