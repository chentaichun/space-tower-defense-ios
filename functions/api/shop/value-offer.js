import { authenticatePlayerSession, digest } from "../../_shared/player-auth.js";
import { OFFER_PRODUCT_IDS, grantOfferPurchase, getOfferState } from "../../_shared/value-offers.js";
import { getGooglePlaySettings, verifyGooglePlayProductPurchase, consumeGooglePlayProductPurchase } from "../../_shared/google-play.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { playerStorageAvailable } from "../../_shared/player-storage.js";

// Value packs and pass tiers are consumable Play products: verify, record once per token, then consume
// so the same product can be bought again next month.
export async function onRequestPost({ request, env }) {
  if (!env.COMMERCE_DB || !playerStorageAvailable(env)) return jsonResponse(request, { code: "SHOP_UNAVAILABLE" }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return jsonResponse(request, { code: "LOGIN_REQUIRED" }, 401);
  const body = await request.json().catch(() => null);
  const productId = String(body?.productId || "");
  const purchaseToken = String(body?.purchaseToken || "");
  if (!OFFER_PRODUCT_IDS.includes(productId) || !purchaseToken || purchaseToken.length > 4096) return jsonResponse(request, { code: "INVALID_PURCHASE" }, 400);
  const settings = getGooglePlaySettings(env);
  if (!settings.ready) return jsonResponse(request, { code: "SHOP_UNAVAILABLE" }, 503);
  let purchase;
  try { purchase = await verifyGooglePlayProductPurchase(settings, productId, purchaseToken); }
  catch { return jsonResponse(request, { code: "PURCHASE_VERIFICATION_FAILED" }, 502); }
  if (purchase.productId && purchase.productId !== productId) return jsonResponse(request, { code: "PRODUCT_MISMATCH" }, 409);
  if (Number(purchase.purchaseState) === 2) return jsonResponse(request, { pending: true, fulfilled: false }, 202);
  if (Number(purchase.purchaseState) !== 0) return jsonResponse(request, { code: "PURCHASE_NOT_COMPLETED" }, 409);
  if (purchase.obfuscatedExternalAccountId !== await digest(auth.accountKey)) return jsonResponse(request, { code: "ACCOUNT_MISMATCH" }, 403);
  const grant = await grantOfferPurchase(env, { playerKey: auth.accountKey, productId, purchaseToken, orderId: String(purchase.orderId || "").slice(0, 160) });
  if (!grant.fulfilled) return jsonResponse(request, grant, 409);
  let consumed = false;
  try { consumed = (await consumeGooglePlayProductPurchase(settings, productId, purchaseToken)).consumed; }
  catch { /* The grant is recorded; a restore retries consumption without granting twice. */ }
  return jsonResponse(request, { ok: true, verified: true, ...grant, consumed, transactionId: String(purchase.orderId || ""), offers: await getOfferState(env, auth.accountKey) });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "POST, OPTIONS"); }
