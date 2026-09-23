export const COMMERCE_PRODUCTS = Object.freeze([
  { id: "obsidian_120", currencyType: "obsidian", amount: 120, priceTwd: 30, priceUsdCents: 99, badge: "Starter" },
  { id: "obsidian_420", currencyType: "obsidian", amount: 420, priceTwd: 90, priceUsdCents: 299, badge: "Value" },
  { id: "obsidian_1100", currencyType: "obsidian", amount: 1100, priceTwd: 220, priceUsdCents: 699, badge: "Popular" },
  { id: "obsidian_1800", currencyType: "obsidian", amount: 1800, priceTwd: 350, priceUsdCents: 1099, badge: "Boost" },
  { id: "obsidian_2650", currencyType: "obsidian", amount: 2650, priceTwd: 490, priceUsdCents: 1499, badge: "Power" },
  { id: "obsidian_5800", currencyType: "obsidian", amount: 5800, priceTwd: 990, priceUsdCents: 2999, badge: "Best" },
  { id: "obsidian_10000", currencyType: "obsidian", amount: 10000, priceTwd: 1500, priceUsdCents: 4999, badge: "Elite" },
  { id: "obsidian_24000", currencyType: "obsidian", amount: 24000, priceTwd: 3000, priceUsdCents: 9999, badge: "Ultimate" },
  { id: "spacecoin_1000", currencyType: "spaceCoin", amount: 1000, priceTwd: 50, priceUsdCents: 199, badge: "Launch" },
  { id: "spacecoin_6000", currencyType: "spaceCoin", amount: 6000, priceTwd: 300, priceUsdCents: 999, badge: "Orbit" },
  { id: "spacecoin_11000", currencyType: "spaceCoin", amount: 11000, priceTwd: 500, priceUsdCents: 1699, badge: "Nova" },
  { id: "spacecoin_25000", currencyType: "spaceCoin", amount: 25000, priceTwd: 1000, priceUsdCents: 3299, badge: "Galaxy" },
  { id: "spacecoin_80000", currencyType: "spaceCoin", amount: 80000, priceTwd: 3000, priceUsdCents: 9999, badge: "Cosmos" }
]);

export const FIRST_PURCHASE_BONUS_RATE = 1;

import { corsHeaders } from "./cors.js";

export const json = (data, status = 200, request = null) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(request ? corsHeaders(request) : {})
    }
  });

const clampInt = (value, min, max) => Math.min(max, Math.max(min, Math.floor(Number(value) || 0)));

export function sanitizeCommerceConfig(config) {
  const source = config?.commerce;
  const bonusRate = Math.min(5, Math.max(0, Number(source?.firstPurchaseBonusRate ?? FIRST_PURCHASE_BONUS_RATE) || 0));
  const configured = source?.products && typeof source.products === "object" ? source.products : {};
  return {
    firstPurchaseBonusRate: bonusRate,
    products: COMMERCE_PRODUCTS.map((fallback) => {
      const item = configured[fallback.id] || {};
      return {
        id: fallback.id,
        currencyType: fallback.currencyType,
        amount: clampInt(item.amount ?? fallback.amount, 1, 1000000),
        priceTwd: clampInt(item.priceTwd ?? fallback.priceTwd, 1, 1000000),
        priceUsdCents: clampInt(item.priceUsdCents ?? fallback.priceUsdCents, 1, 100000000),
        badge: String(item.badge || fallback.badge).slice(0, 32)
      };
    })
  };
}

export async function getCommerceConfig(env) {
  if (!env.FEEDBACK_STORE) return sanitizeCommerceConfig(null);
  const balance = await env.FEEDBACK_STORE.get("balance:official", "json");
  return sanitizeCommerceConfig(balance?.config);
}

export async function getWallet(env, playerKey) {
  if (!env.COMMERCE_DB) return { balance: 0, lifetimePurchased: 0, firstPurchaseClaimed: false };
  const row = await env.COMMERCE_DB.prepare(
    "SELECT balance, lifetime_purchased AS lifetimePurchased, first_purchase_claimed AS firstPurchaseClaimed FROM commerce_wallets WHERE player_key = ?"
  ).bind(playerKey).first();
  return {
    balance: Math.max(0, Number(row?.balance) || 0),
    lifetimePurchased: Math.max(0, Number(row?.lifetimePurchased) || 0),
    firstPurchaseClaimed: Boolean(row?.firstPurchaseClaimed)
  };
}

export async function getSpaceCoinWallet(env, playerKey) {
  if (!env.COMMERCE_DB) return { balance: 0, lifetimePurchased: 0 };
  const row = await env.COMMERCE_DB.prepare(
    "SELECT balance, lifetime_purchased AS lifetimePurchased FROM space_coin_wallets WHERE player_key = ?"
  ).bind(playerKey).first();
  return {
    balance: Math.max(0, Number(row?.balance) || 0),
    lifetimePurchased: Math.max(0, Number(row?.lifetimePurchased) || 0)
  };
}

export const publicCatalog = (commerce) => ({
  currency: "TWD",
  firstPurchaseBonusRate: commerce.firstPurchaseBonusRate,
  products: commerce.products.map(({ id, currencyType, amount, priceTwd, priceUsdCents, badge }) => ({
    id,
    currencyType,
    amount,
    priceTwd,
    priceUsd: (priceUsdCents / 100).toFixed(2),
    badge
  }))
});

export async function fulfillCommerceOrder(env, { orderId, providerSessionId, paidAmountMinor, paidCurrency = "TWD", providerPaymentId = "" }) {
  const processingToken = crypto.randomUUID();
  const now = new Date().toISOString();
  const lock = await env.COMMERCE_DB.prepare(
    "UPDATE commerce_orders SET status = 'processing', processing_token = ?, paid_at = COALESCE(paid_at, ?), provider_payment_id = ?, updated_at = ? WHERE id = ? AND provider_session_id = ? AND status IN ('pending', 'failed') AND currency = ? AND unit_amount = ?"
  ).bind(processingToken, now, String(providerPaymentId), now, orderId, String(providerSessionId), paidCurrency, Number(paidAmountMinor) || 0).run();
  if (!lock.meta?.changes) return { fulfilled: false, duplicate: true };

  const lockedOrder = await env.COMMERCE_DB.prepare(
    "SELECT product_id AS productId FROM commerce_orders WHERE id = ? AND status = 'processing' AND processing_token = ?"
  ).bind(orderId, processingToken).first();
  const isSpaceCoin = String(lockedOrder?.productId || "").startsWith("spacecoin_");
  const ledgerId = `credit_${crypto.randomUUID()}`;
  try {
    const creditCommands = isSpaceCoin ? [
      env.COMMERCE_DB.prepare(
        "INSERT OR IGNORE INTO space_coin_wallet_ledger (id, player_key, order_id, delta, balance_after, reason, created_at) SELECT ?, o.player_key, o.id, o.base_amount, COALESCE(w.balance, 0) + o.base_amount, 'purchase', ? FROM commerce_orders o LEFT JOIN space_coin_wallets w ON w.player_key = o.player_key WHERE o.id = ? AND o.status = 'processing' AND o.processing_token = ?"
      ).bind(ledgerId, now, orderId, processingToken),
      env.COMMERCE_DB.prepare(
        "INSERT INTO space_coin_wallets (player_key, balance, lifetime_purchased, updated_at) SELECT player_key, balance_after, delta, ? FROM space_coin_wallet_ledger WHERE order_id = ? ON CONFLICT(player_key) DO UPDATE SET balance = excluded.balance, lifetime_purchased = space_coin_wallets.lifetime_purchased + excluded.lifetime_purchased, updated_at = excluded.updated_at"
      ).bind(now, orderId),
      env.COMMERCE_DB.prepare(
        "UPDATE commerce_orders SET status = 'fulfilled', credited_amount = (SELECT delta FROM space_coin_wallet_ledger WHERE order_id = ?), fulfilled_at = ?, updated_at = ?, processing_token = NULL, failure_reason = NULL WHERE id = ? AND status = 'processing' AND processing_token = ?"
      ).bind(orderId, now, now, orderId, processingToken)
    ] : [
      env.COMMERCE_DB.prepare(
        "INSERT OR IGNORE INTO commerce_wallet_ledger (id, player_key, order_id, delta, balance_after, reason, created_at) SELECT ?, o.player_key, o.id, o.base_amount + CASE WHEN COALESCE(w.first_purchase_claimed, 0) = 0 THEN o.max_bonus_amount ELSE 0 END, COALESCE(w.balance, 0) + o.base_amount + CASE WHEN COALESCE(w.first_purchase_claimed, 0) = 0 THEN o.max_bonus_amount ELSE 0 END, 'purchase', ? FROM commerce_orders o LEFT JOIN commerce_wallets w ON w.player_key = o.player_key WHERE o.id = ? AND o.status = 'processing' AND o.processing_token = ?"
      ).bind(ledgerId, now, orderId, processingToken),
      env.COMMERCE_DB.prepare(
        "INSERT INTO commerce_wallets (player_key, balance, lifetime_purchased, first_purchase_claimed, updated_at) SELECT player_key, balance_after, delta, 1, ? FROM commerce_wallet_ledger WHERE order_id = ? ON CONFLICT(player_key) DO UPDATE SET balance = excluded.balance, lifetime_purchased = commerce_wallets.lifetime_purchased + excluded.lifetime_purchased, first_purchase_claimed = 1, updated_at = excluded.updated_at"
      ).bind(now, orderId),
      env.COMMERCE_DB.prepare(
        "UPDATE commerce_orders SET status = 'fulfilled', credited_amount = (SELECT delta FROM commerce_wallet_ledger WHERE order_id = ?), fulfilled_at = ?, updated_at = ?, processing_token = NULL, failure_reason = NULL WHERE id = ? AND status = 'processing' AND processing_token = ?"
      ).bind(orderId, now, now, orderId, processingToken)
    ];
    await env.COMMERCE_DB.batch(creditCommands);
    return { fulfilled: true, duplicate: false };
  } catch (error) {
    await env.COMMERCE_DB.prepare(
      "UPDATE commerce_orders SET status = 'failed', processing_token = NULL, failure_reason = 'fulfillment_retry', updated_at = ? WHERE id = ? AND processing_token = ?"
    ).bind(new Date().toISOString(), orderId, processingToken).run();
    throw error;
  }
}
