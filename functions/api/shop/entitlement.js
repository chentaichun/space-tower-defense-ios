import { authenticatePlayerSession, digest } from "../../_shared/player-auth.js";
import { findEntitlementProduct, getPlayerEntitlements, grantPlayerEntitlement } from "../../_shared/entitlements.js";
import { getGooglePlaySettings, verifyGooglePlayProductPurchase, acknowledgeGooglePlayProductPurchase } from "../../_shared/google-play.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { playerStorageAvailable } from "../../_shared/player-storage.js";

export async function onRequestPost({ request, env }) {
  if (!env.COMMERCE_DB || !playerStorageAvailable(env)) return jsonResponse(request, { code: "SHOP_UNAVAILABLE" }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return jsonResponse(request, { code: "LOGIN_REQUIRED" }, 401);
  const body = await request.json().catch(() => null);
  const product = findEntitlementProduct(body?.productId);
  const purchaseToken = String(body?.purchaseToken || "");
  if (!product || !purchaseToken || purchaseToken.length > 4096) return jsonResponse(request, { code: "INVALID_PURCHASE" }, 400);
  const settings = getGooglePlaySettings(env);
  if (!settings.ready) return jsonResponse(request, { code: "SHOP_UNAVAILABLE" }, 503);
  let purchase;
  try { purchase = await verifyGooglePlayProductPurchase(settings, product.id, purchaseToken); }
  catch { return jsonResponse(request, { code: "PURCHASE_VERIFICATION_FAILED" }, 502); }
  if (purchase.productId && purchase.productId !== product.id) return jsonResponse(request, { code: "PRODUCT_MISMATCH" }, 409);
  if (Number(purchase.purchaseState) === 2) return jsonResponse(request, { pending: true, fulfilled: false }, 202);
  if (Number(purchase.purchaseState) !== 0) return jsonResponse(request, { code: "PURCHASE_NOT_COMPLETED" }, 409);
  if (purchase.obfuscatedExternalAccountId !== await digest(auth.accountKey)) return jsonResponse(request, { code: "ACCOUNT_MISMATCH" }, 403);
  const grant = await grantPlayerEntitlement(env, {
    playerKey: auth.accountKey,
    product,
    purchaseToken,
    orderId: String(purchase.orderId || body?.orderId || "").slice(0, 160)
  });
  if (!grant.fulfilled) return jsonResponse(request, grant, 409);
  let acknowledged = Number(purchase.acknowledgementState) === 1;
  if (!acknowledged) {
    try { await acknowledgeGooglePlayProductPurchase(settings, product.id, purchaseToken); acknowledged = true; }
    catch { /* Restore retries acknowledgement without granting twice. */ }
  }
  return jsonResponse(request, {
    ok: true,
    verified: true,
    ...grant,
    acknowledged,
    productId: product.id,
    entitlement: product.entitlement,
    entitlements: await getPlayerEntitlements(env, auth.accountKey),
    transactionId: String(purchase.orderId || body?.orderId || "")
  });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "POST, OPTIONS"); }
