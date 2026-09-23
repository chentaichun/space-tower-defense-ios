import { fulfillCommerceOrder, getCommerceConfig, getSpaceCoinWallet, getWallet } from "../../_shared/commerce.js";
import {
  consumeGooglePlayProductPurchase,
  getGooglePlaySettings,
  verifyGooglePlayProductPurchase
} from "../../_shared/google-play.js";
import { authenticatePlayerSession, digest } from "../../_shared/player-auth.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { playerStorageAvailable } from "../../_shared/player-storage.js";

const readBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const publicOrder = (row) => row ? {
  id: row.id,
  productId: row.productId,
  creditedAmount: Math.max(0, Number(row.creditedAmount) || 0),
  status: row.status,
  createdAt: row.createdAt
} : null;

async function findOrderByPurchaseToken(env, purchaseToken) {
  return env.COMMERCE_DB.prepare(
    "SELECT id, player_key AS playerKey, product_id AS productId, credited_amount AS creditedAmount, status, created_at AS createdAt FROM commerce_orders WHERE provider = 'google_play' AND provider_session_id = ?"
  ).bind(purchaseToken).first();
}

export async function onRequestPost({ request, env }) {
  if (!playerStorageAvailable(env) || !env.COMMERCE_DB) {
    return jsonResponse(request, { error: "Commerce storage is not configured." }, 503);
  }
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return jsonResponse(request, { error: "Please sign in before purchasing.", code: "LOGIN_REQUIRED" }, 401);

  const body = await readBody(request);
  const productId = String(body?.productId || "").slice(0, 80);
  const purchaseToken = String(body?.purchaseToken || "").slice(0, 4096);
  if (!productId || !purchaseToken) {
    return jsonResponse(request, { error: "Google Play purchase data is incomplete.", code: "INVALID_PURCHASE" }, 400);
  }

  const commerce = await getCommerceConfig(env);
  const product = commerce.products.find((item) => item.id === productId);
  if (!product) return jsonResponse(request, { error: "Unknown product.", code: "UNKNOWN_PRODUCT" }, 404);

  const settings = getGooglePlaySettings(env);
  if (!settings.ready) {
    return jsonResponse(request, {
      error: "Google Play server verification is being configured.",
      code: "GOOGLE_PLAY_SETUP_REQUIRED"
    }, 503);
  }

  let purchase;
  try {
    purchase = await verifyGooglePlayProductPurchase(settings, productId, purchaseToken);
  } catch (error) {
    return jsonResponse(request, {
      error: "Google Play could not verify this purchase.",
      code: "PURCHASE_VERIFICATION_FAILED"
    }, Number(error.status) === 404 ? 404 : 502);
  }

  if (purchase.productId && purchase.productId !== productId) {
    return jsonResponse(request, { error: "Purchase product does not match.", code: "PRODUCT_MISMATCH" }, 409);
  }
  if (Number(purchase.purchaseState) === 2) {
    return jsonResponse(request, { ok: true, pending: true, fulfilled: false }, 202);
  }
  if (Number(purchase.purchaseState) !== 0) {
    return jsonResponse(request, { error: "Purchase was not completed.", code: "PURCHASE_NOT_COMPLETED" }, 409);
  }

  const expectedAccountId = await digest(auth.accountKey);
  if (purchase.obfuscatedExternalAccountId && purchase.obfuscatedExternalAccountId !== expectedAccountId) {
    return jsonResponse(request, { error: "Purchase belongs to another player account.", code: "ACCOUNT_MISMATCH" }, 403);
  }

  let order = await findOrderByPurchaseToken(env, purchaseToken);
  if (order && (order.playerKey !== auth.accountKey || order.productId !== productId)) {
    return jsonResponse(request, { error: "Purchase token has already been used.", code: "TOKEN_REUSED" }, 409);
  }

  const orderId = order?.id || `gplay_${crypto.randomUUID()}`;
  if (!order) {
    const now = new Date().toISOString();
    const playerName = String(auth.account.name || auth.session.accountName || "Player").slice(0, 32);
    const potentialBonus = product.currencyType === "obsidian"
      ? Math.floor(product.amount * commerce.firstPurchaseBonusRate)
      : 0;
    await env.COMMERCE_DB.prepare(
      "INSERT OR IGNORE INTO commerce_orders (id, player_key, player_name, product_id, base_amount, max_bonus_amount, currency, unit_amount, provider, provider_session_id, provider_payment_id, status, created_at, updated_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, 'TWD', ?, 'google_play', ?, ?, 'pending', ?, ?, ?)"
    ).bind(
      orderId,
      auth.accountKey,
      playerName,
      product.id,
      product.amount,
      potentialBonus,
      product.priceTwd * 100,
      purchaseToken,
      String(purchase.orderId || body?.orderId || "").slice(0, 160),
      now,
      now,
      now
    ).run();
    order = await findOrderByPurchaseToken(env, purchaseToken);
  }

  let fulfillment = { fulfilled: false, duplicate: order?.status === "fulfilled" };
  if (order?.status !== "fulfilled") {
    fulfillment = await fulfillCommerceOrder(env, {
      orderId: order.id,
      providerSessionId: purchaseToken,
      paidAmountMinor: product.priceTwd * 100,
      providerPaymentId: purchase.orderId || body?.orderId || ""
    });
  }

  let consumption = { consumed: false, alreadyConsumed: false };
  try {
    consumption = await consumeGooglePlayProductPurchase(settings, productId, purchaseToken);
  } catch {
    // The entitlement is already safely recorded. A later restore call retries consumption.
  }

  order = await findOrderByPurchaseToken(env, purchaseToken);
  const wallet = await getWallet(env, auth.accountKey);
  const spaceCoinWallet = await getSpaceCoinWallet(env, auth.accountKey);
  return jsonResponse(request, {
    ok: true,
    verified: true,
    fulfilled: order?.status === "fulfilled",
    newlyFulfilled: Boolean(fulfillment.fulfilled),
    consumed: consumption.consumed,
    order: publicOrder(order),
    wallet,
    spaceCoinWallet
  });
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "POST, OPTIONS");
}
