import { authenticatePlayerSession } from "../../_shared/player-auth.js";
import { playerStorageAvailable } from "../../_shared/player-storage.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { getAppleStoreSettings, verifyAppleStorePurchase } from "../../_shared/apple-store.js";
import { fulfillCommerceOrder, getCommerceConfig, getSpaceCoinWallet, getWallet } from "../../_shared/commerce.js";
import { STARTER_PACK, grantStarterPack } from "../../_shared/starter-pack.js";
import { findEntitlementProduct, grantPlayerEntitlement, getPlayerEntitlements } from "../../_shared/entitlements.js";

async function findOrder(env, token) {
  return env.COMMERCE_DB.prepare("SELECT id, player_key AS playerKey, product_id AS productId, credited_amount AS creditedAmount, status, currency, unit_amount AS unitAmount FROM commerce_orders WHERE provider = 'apple_store' AND provider_session_id = ?").bind(token).first();
}

export async function onRequestPost({ request, env }) {
  const respond = (data, status = 200) => jsonResponse(request, data, status);
  if (!playerStorageAvailable(env) || !env.COMMERCE_DB) return respond({ code: "STORAGE_UNAVAILABLE" }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return respond({ code: "LOGIN_REQUIRED" }, 401);
  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const commerce = await getCommerceConfig(env);
  const consumable = commerce.products.find((item) => item.id === productId);
  const entitlement = findEntitlementProduct(productId);
  const starter = productId === STARTER_PACK.id;
  if (!consumable && !entitlement && !starter) return respond({ code: "UNKNOWN_PRODUCT" }, 404);
  let purchase;
  try {
    purchase = await verifyAppleStorePurchase(getAppleStoreSettings(env), {
      transactionId: body?.transactionId, productId, playerKey: auth.accountKey,
      nonConsumable: !consumable, environment: body?.environment || "Production"
    });
  } catch (error) {
    return respond({ code: error.code || "PURCHASE_VERIFICATION_FAILED" }, error.status || 502);
  }
  const args = { playerKey: auth.accountKey, purchaseToken: purchase.purchaseToken, orderId: purchase.transactionId };
  let result;
  let order;
  if (starter) result = await grantStarterPack(env, args);
  else if (entitlement) result = await grantPlayerEntitlement(env, { ...args, product: entitlement });
  else {
    // Apple's price is in milliunits, not cents. Preserve the actual storefront currency.
    const currency = purchase.currency;
    if (!/^[A-Z]{3}$/.test(currency || "") || !Number.isSafeInteger(purchase.price) || purchase.price <= 0) return respond({ code: "APPLE_PRICE_UNAVAILABLE" }, 409);
    const digits = new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits;
    const unitAmount = purchase.price * 10 ** digits / 1000;
    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) return respond({ code: "APPLE_PRICE_INVALID" }, 409);
    order = await findOrder(env, purchase.purchaseToken);
    if (!order) {
      const now = new Date().toISOString();
      await env.COMMERCE_DB.prepare("INSERT OR IGNORE INTO commerce_orders (id, player_key, player_name, product_id, base_amount, max_bonus_amount, currency, unit_amount, provider, provider_session_id, provider_payment_id, status, created_at, updated_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'apple_store', ?, ?, 'pending', ?, ?, ?)").bind(
        `apple_${crypto.randomUUID()}`, auth.accountKey, String(auth.account.name || "Player").slice(0, 32), productId,
        consumable.amount, consumable.currencyType === "obsidian" ? Math.floor(consumable.amount * commerce.firstPurchaseBonusRate) : 0,
        currency, unitAmount, purchase.purchaseToken, purchase.transactionId, now, now, now
      ).run();
      order = await findOrder(env, purchase.purchaseToken);
    }
    if (!order || order.playerKey !== auth.accountKey || order.productId !== productId || order.currency !== currency || order.unitAmount !== unitAmount) return respond({ code: "TOKEN_REUSED" }, 409);
    const grant = order.status === "fulfilled" ? { fulfilled: false } : await fulfillCommerceOrder(env, {
      orderId: order.id, providerSessionId: purchase.purchaseToken, providerPaymentId: purchase.transactionId,
      paidAmountMinor: unitAmount, paidCurrency: currency
    });
    order = await findOrder(env, purchase.purchaseToken);
    result = { fulfilled: order?.status === "fulfilled", newlyFulfilled: grant.fulfilled };
  }
  if (!result.fulfilled) return respond({ ok: false, verified: true, fulfilled: false, code: result.code || "FULFILLMENT_PENDING" }, 409);
  return respond({ ok: true, verified: true, ...result, transactionId: purchase.transactionId,
    starterPackOwned: starter || undefined,
    order: order ? { id: order.id, productId, creditedAmount: order.creditedAmount, status: order.status } : undefined,
    entitlements: await getPlayerEntitlements(env, auth.accountKey),
    wallet: await getWallet(env, auth.accountKey), spaceCoinWallet: await getSpaceCoinWallet(env, auth.accountKey) });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "POST, OPTIONS"); }
