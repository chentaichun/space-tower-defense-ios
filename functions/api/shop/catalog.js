import { authenticatePlayerSession, digest } from "../../_shared/player-auth.js";
import { getCommerceConfig, getSpaceCoinWallet, getWallet, json, publicCatalog } from "../../_shared/commerce.js";
import { getEcpaySettings, isEcpayTestPlayerAllowed } from "../../_shared/ecpay.js";
import { getGooglePlaySettings } from "../../_shared/google-play.js";
import { getAppleStoreSettings, appleAppAccountToken } from "../../_shared/apple-store.js";
import { optionsResponse } from "../../_shared/cors.js";
import { STARTER_PACK, getStarterPackEntitlement } from "../../_shared/starter-pack.js";
import { getPlayerEntitlements, publicEntitlementCatalog } from "../../_shared/entitlements.js";

export async function onRequestGet({ request, env }) {
  const commerce = await getCommerceConfig(env);
  const payment = getEcpaySettings(env);
  const googlePlay = getGooglePlaySettings(env);
  const auth = await authenticatePlayerSession(request, env);
  const testAccessAllowed = payment.mode !== "test" || isEcpayTestPlayerAllowed(env, auth?.account?.name);
  const wallet = auth && env.COMMERCE_DB ? await getWallet(env, auth.accountKey) : null;
  const spaceCoinWallet = auth && env.COMMERCE_DB ? await getSpaceCoinWallet(env, auth.accountKey) : null;
  let orders = [];
  if (auth && env.COMMERCE_DB) {
    const result = await env.COMMERCE_DB.prepare(
      "SELECT id, product_id AS productId, credited_amount AS creditedAmount, currency, unit_amount AS unitAmount, status, created_at AS createdAt FROM commerce_orders WHERE player_key = ? ORDER BY created_at DESC LIMIT 10"
    ).bind(auth.accountKey).all();
    orders = result.results || [];
  }
  return json({
    ok: true,
    catalog: publicCatalog(commerce),
    starterPack: { ...STARTER_PACK, owned: Boolean(await getStarterPackEntitlement(env, auth?.accountKey)) },
    entitlementProducts: publicEntitlementCatalog(),
    entitlements: auth ? await getPlayerEntitlements(env, auth.accountKey) : [],
    provider: "ecpay",
    providerReady: Boolean(payment.ready && env.COMMERCE_DB && testAccessAllowed),
    testMode: payment.mode === "test",
    testAccessAllowed,
    googlePlayReady: Boolean(googlePlay.ready && env.COMMERCE_DB),
    googlePlayAccountId: auth ? await digest(auth.accountKey) : "",
    appleStoreReady: Boolean(getAppleStoreSettings(env).ready && env.COMMERCE_DB),
    appleAppAccountToken: auth ? await appleAppAccountToken(auth.accountKey) : "",
    authenticated: Boolean(auth),
    wallet,
    spaceCoinWallet,
    orders
  }, 200, request);
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "GET, OPTIONS");
}
