import { authenticatePlayerSession, digest } from "../_shared/player-auth.js";
import { getAppleStoreSettings, verifyAppleVipSubscription } from "../_shared/apple-store.js";
import { getGooglePlaySettings, verifyGooglePlaySubscription, acknowledgeGooglePlaySubscription } from "../_shared/google-play.js";
import { trialCalendar } from "../_shared/trial-store.js";
import { jsonResponse, optionsResponse } from "../_shared/cors.js";

export const VIP_PRODUCT_ID = "vip_monthly_v1";
export const VIP_RARE_PRICE = 2600;
export const VIP_LEGENDARY_PRICE = 500;
const RARE = new Set(["vip_prism_lancer", "vip_thunder_throne", "vip_frost_bloom", "vip_star_phoenix", "vip_abyssal_tide"]);
const LEGENDARY = new Set(["vip_quantum_crown", "vip_singularity_king", "vip_solar_judgment", "vip_nebula_hymn", "vip_chrono_axis"]);

const validTime = (value) => {
  const time = Date.parse(String(value || ""));
  return Number.isFinite(time) ? time : 0;
};

async function refreshSubscription(env, playerKey, subscription, now = Date.now()) {
  if (!subscription) return null;
  try {
    if (subscription.provider === "google_play") {
      const data = await verifyGooglePlaySubscription(getGooglePlaySettings(env), subscription.purchaseToken);
      const validStates = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD", "SUBSCRIPTION_STATE_CANCELED"]);
      const expiresAt = Math.max(0, ...(data.lineItems || []).filter((item) => item.productId === VIP_PRODUCT_ID).map((item) => validTime(item.expiryTime)));
      if (!validStates.has(data.subscriptionState) || expiresAt <= now) return null;
      const accountId = data.externalAccountIdentifiers?.obfuscatedExternalAccountId;
      if (accountId && accountId !== await digest(playerKey)) return null;
      return { ...subscription, expiresAt };
    }
    if (subscription.provider === "apple_store") {
      const result = await verifyAppleVipSubscription(getAppleStoreSettings(env), {
        transactionId: subscription.transactionId,
        productId: VIP_PRODUCT_ID,
        playerKey,
        environment: subscription.environment
      });
      return { ...subscription, expiresAt: result.expiresAt };
    }
  } catch { /* Failed verification never grants VIP access. */ }
  return null;
}

export async function currentSubscription(env, playerKey, now = Date.now()) {
  const row = await env.COMMERCE_DB.prepare("SELECT provider, purchase_token AS purchaseToken, product_id AS productId, expires_at AS expiresAt, verified_at AS verifiedAt, transaction_id AS transactionId, environment FROM vip_subscriptions WHERE player_key = ?")
    .bind(playerKey).first();
  if (!row || row.productId !== VIP_PRODUCT_ID) return null;
  if (Number(row.verifiedAt) > now - 5 * 60_000 && Number(row.expiresAt) > now) return row;
  const verified = await refreshSubscription(env, playerKey, row, now);
  if (!verified) return null;
  await env.COMMERCE_DB.prepare("UPDATE vip_subscriptions SET expires_at = ?, verified_at = ? WHERE player_key = ? AND purchase_token = ?")
    .bind(verified.expiresAt, now, playerKey, row.purchaseToken).run();
  return { ...row, expiresAt: verified.expiresAt, verifiedAt: now };
}

async function status(env, playerKey, now = Date.now()) {
  const subscription = await currentSubscription(env, playerKey, now);
  const { week } = trialCalendar(now);
  const purchases = await env.COMMERCE_DB.prepare("SELECT turret_id AS turretId, rarity, week_key AS weekKey FROM vip_obsidian_purchases WHERE player_key = ?")
    .bind(playerKey).all();
  const rows = purchases.results || [];
  return {
    active: Boolean(subscription && Number(subscription.expiresAt) > now),
    expiresAt: subscription?.expiresAt || 0,
    rareOwned: rows.filter((item) => item.rarity === "rare").map((item) => item.turretId),
    legendaryWeeklyUsed: rows.some((item) => item.rarity === "legendary" && item.weekKey === week) ? 10 : 0,
    week
  };
}

export async function onRequestGet({ request, env }) {
  if (!env.COMMERCE_DB) return jsonResponse(request, { code: "VIP_UNAVAILABLE" }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return jsonResponse(request, { code: "LOGIN_REQUIRED" }, 401);
  return jsonResponse(request, { ok: true, ...await status(env, auth.accountKey) });
}

export async function onRequestPost({ request, env }) {
  if (!env.COMMERCE_DB) return jsonResponse(request, { code: "VIP_UNAVAILABLE" }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return jsonResponse(request, { code: "LOGIN_REQUIRED" }, 401);
  const body = await request.json().catch(() => null);
  const playerKey = auth.accountKey;
  if (body?.action === "verify") {
    const provider = String(body.provider || "");
    let verified;
    let token;
    let transactionId = "";
    let environment = "Production";
    try {
      if (provider === "google_play") {
        token = String(body.purchaseToken || "");
        if (!token || token.length > 4096) return jsonResponse(request, { code: "INVALID_PURCHASE" }, 400);
        const settings = getGooglePlaySettings(env);
        if (!settings.ready) return jsonResponse(request, { code: "GOOGLE_PLAY_SETUP_REQUIRED" }, 503);
        const data = await verifyGooglePlaySubscription(settings, token);
        const accountId = data.externalAccountIdentifiers?.obfuscatedExternalAccountId;
        if (accountId !== await digest(playerKey)) return jsonResponse(request, { code: "ACCOUNT_MISMATCH" }, 403);
        const states = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD", "SUBSCRIPTION_STATE_CANCELED"]);
        const expiresAt = Math.max(0, ...(data.lineItems || []).filter((item) => item.productId === VIP_PRODUCT_ID).map((item) => validTime(item.expiryTime)));
        if (!states.has(data.subscriptionState) || expiresAt <= Date.now()) return jsonResponse(request, { code: "SUBSCRIPTION_INACTIVE" }, 409);
        if (data.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING") await acknowledgeGooglePlaySubscription(settings, VIP_PRODUCT_ID, token);
        verified = { expiresAt };
      } else if (provider === "apple_store") {
        transactionId = String(body.transactionId || "");
        environment = body.environment === "Sandbox" ? "Sandbox" : "Production";
        verified = await verifyAppleVipSubscription(getAppleStoreSettings(env), { transactionId, productId: VIP_PRODUCT_ID, playerKey, environment });
        token = verified.purchaseToken;
      } else return jsonResponse(request, { code: "INVALID_PROVIDER" }, 400);
    } catch (error) { return jsonResponse(request, { code: error.code || "SUBSCRIPTION_VERIFICATION_FAILED" }, error.status || 502); }
    const now = Date.now();
    await env.COMMERCE_DB.prepare("INSERT INTO vip_subscriptions(player_key, provider, purchase_token, product_id, expires_at, verified_at, transaction_id, environment) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(player_key) DO UPDATE SET provider=excluded.provider, purchase_token=excluded.purchase_token, expires_at=excluded.expires_at, verified_at=excluded.verified_at, transaction_id=excluded.transaction_id, environment=excluded.environment")
      .bind(playerKey, provider, token, VIP_PRODUCT_ID, verified.expiresAt, now, transactionId, environment).run();
    return jsonResponse(request, { ok: true, ...await status(env, playerKey) });
  }
  if (body?.action === "purchase") {
    const turretId = String(body.turretId || "");
    const rarity = RARE.has(turretId) ? "rare" : LEGENDARY.has(turretId) ? "legendary" : "";
    if (!rarity) return jsonResponse(request, { code: "UNKNOWN_TURRET" }, 400);
    const now = Date.now();
    const subscription = await currentSubscription(env, playerKey, now);
    if (!subscription || Number(subscription.expiresAt) <= now) return jsonResponse(request, { code: "VIP_REQUIRED" }, 403);
    const { week } = trialCalendar(now);
    const price = rarity === "rare" ? VIP_RARE_PRICE : VIP_LEGENDARY_PRICE;
    const purchaseId = crypto.randomUUID();
    const ownerCheck = rarity === "rare"
      ? "AND NOT EXISTS (SELECT 1 FROM vip_obsidian_purchases WHERE player_key = ? AND turret_id = ? AND rarity = 'rare')"
      : "AND NOT EXISTS (SELECT 1 FROM vip_obsidian_purchases WHERE player_key = ? AND week_key = ? AND rarity = 'legendary')";
    const ownerArg = rarity === "rare" ? turretId : week;
    const path = `$.save.v2Progress.${rarity === "rare" ? "assembled" : "fragments"}.${turretId}`;
    const starPath = `$.save.v2Progress.stars.${turretId}`;
    const updated = new Date(now).toISOString();
    const gain = rarity === "rare" ? 1 : 10;
    const results = await env.COMMERCE_DB.batch([
      env.COMMERCE_DB.prepare(`INSERT OR IGNORE INTO vip_obsidian_purchases(id, player_key, turret_id, rarity, price, shards, week_key, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ? FROM player_accounts WHERE player_key = ? AND CAST(json_extract(account_json, '$.save.obsidian') AS INTEGER) >= ? ${ownerCheck}`)
        .bind(purchaseId, playerKey, turretId, rarity, price, rarity === "rare" ? 0 : 10, week, now, playerKey, price, playerKey, ownerArg),
      env.COMMERCE_DB.prepare(`UPDATE player_accounts SET account_json = json_set(account_json,
        '$.save.obsidian', CAST(json_extract(account_json, '$.save.obsidian') AS INTEGER) - ?,
        '$.save.economyRevision', COALESCE(CAST(json_extract(account_json, '$.save.economyRevision') AS INTEGER), 0) + 1,
        '$.save.v2Progress.revision', COALESCE(CAST(json_extract(account_json, '$.save.v2Progress.revision') AS INTEGER), 0) + 1,
        ?, COALESCE(CAST(json_extract(account_json, ?) AS INTEGER), 0) + ?,
        ?, CASE WHEN ? = 'rare' THEN MAX(1, COALESCE(CAST(json_extract(account_json, ?) AS INTEGER), 0)) ELSE COALESCE(CAST(json_extract(account_json, ?) AS INTEGER), 0) END,
        '$.save.v2Progress.lifetimeFragments', COALESCE(CAST(json_extract(account_json, '$.save.v2Progress.lifetimeFragments') AS INTEGER), 0) + ?,
        '$.save.updatedAt', ?, '$.updatedAt', ?), updated_at = ?
        WHERE player_key = ? AND EXISTS (SELECT 1 FROM vip_obsidian_purchases WHERE id = ?)`)
        .bind(price, path, path, gain, starPath, rarity, starPath, starPath, rarity === "legendary" ? 10 : 0, updated, updated, updated, playerKey, purchaseId)
    ]);
    if (!results?.[0]?.meta?.changes || !results?.[1]?.meta?.changes) return jsonResponse(request, { code: "VIP_PURCHASE_UNAVAILABLE" }, 409);
    return jsonResponse(request, { ok: true, turretId, rarity, price, shards: rarity === "legendary" ? 10 : 0, ...await status(env, playerKey) });
  }
  return jsonResponse(request, { code: "INVALID_ACTION" }, 400);
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "GET, POST, OPTIONS"); }
