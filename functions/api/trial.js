import { authenticatePlayerSession } from "../_shared/player-auth.js";
import { claimTrialPrize, finishTrial, startTrial, trialCalendar, trialMilestoneRewards, trialRankPrize, trialStatus, unlockedTrialTier } from "../_shared/trial-store.js";
import { jsonResponse, optionsResponse } from "../_shared/cors.js";
import { getPlayerEntitlements } from "../_shared/entitlements.js";

async function requireTrialPlayer(request, env) {
  if (!env.COMMERCE_DB) return { error: jsonResponse(request, { code: "TRIAL_UNAVAILABLE" }, 503) };
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return { error: jsonResponse(request, { code: "LOGIN_REQUIRED" }, 401) };
  return { auth };
}

export async function onRequestGet({ request, env }) {
  const access = await requireTrialPlayer(request, env);
  if (access.error) return access.error;
  const unlockedTier = unlockedTrialTier(access.auth.account?.save);
  return jsonResponse(request, { ok: true, ...await trialStatus(env, access.auth.accountKey), unlockedTier,
    milestoneRewardsByTier: Object.fromEntries(Array.from({ length: unlockedTier }, (_, index) => [index + 1, trialMilestoneRewards(index + 1)])),
    rankRewardsByTier: Object.fromEntries(Array.from({ length: unlockedTier }, (_, index) => [index + 1,
      [1, 2, 3].map((rank) => ({ rank, ...trialRankPrize(rank, index + 1) }))])) });
}

export async function onRequestPost({ request, env }) {
  const access = await requireTrialPlayer(request, env);
  if (access.error) return access.error;
  const body = await request.json().catch(() => null);
  const playerKey = access.auth.accountKey;
  if (body?.action === "start") {
    const tier = Math.floor(Number(body.tier) || 0);
    const unlocked = unlockedTrialTier(access.auth.account?.save);
    if (tier < 1 || tier > unlocked) return jsonResponse(request, { code: "TRIAL_TIER_LOCKED" }, 409);
    const run = await startTrial(env, playerKey, tier);
    return run ? jsonResponse(request, { ok: true, run }) : jsonResponse(request, { code: "TRIAL_DAILY_LIMIT" }, 429);
  }
  if (body?.action === "finish") {
    const run = await finishTrial(env, playerKey, String(body.runId || "").slice(0, 80), body.wave);
    return run ? jsonResponse(request, { ok: true, run }) : jsonResponse(request, { code: "TRIAL_RUN_INVALID" }, 409);
  }
  if (body?.action === "adIntent") {
    const { day } = trialCalendar();
    const existing = await env.COMMERCE_DB.prepare("SELECT 1 AS used FROM trial_ad_bonus WHERE player_key = ? AND day_key = ?").bind(playerKey, day).first();
    if (existing) return jsonResponse(request, { code: "TRIAL_AD_ALREADY_USED" }, 409);
    const count = await env.COMMERCE_DB.prepare("SELECT COUNT(*) AS count FROM trial_ad_intents WHERE player_key = ? AND day_key = ?").bind(playerKey, day).first();
    if (Number(count?.count) >= 5) return jsonResponse(request, { code: "TRIAL_AD_RETRY_LIMIT" }, 429);
    const id = crypto.randomUUID();
    await env.COMMERCE_DB.prepare("INSERT INTO trial_ad_intents(id, player_key, day_key, created_at) VALUES (?, ?, ?, ?)").bind(id, playerKey, day, Date.now()).run();
    return jsonResponse(request, { ok: true, intentId: id });
  }
  if (body?.action === "adBonus") {
    const { day } = trialCalendar();
    const entitlements = await getPlayerEntitlements(env, playerKey);
    const noAds = entitlements.includes("remove_ads");
    const intentId = String(body.intentId || "");
    if (!noAds && !/^[0-9a-f-]{36}$/i.test(intentId)) return jsonResponse(request, { code: "TRIAL_AD_UNVERIFIED" }, 425);
    const result = noAds
      ? await env.COMMERCE_DB.prepare("INSERT OR IGNORE INTO trial_ad_bonus(player_key, day_key) VALUES (?, ?)").bind(playerKey, day).run()
      : await env.COMMERCE_DB.prepare("INSERT OR IGNORE INTO trial_ad_bonus(player_key, day_key) SELECT player_key, day_key FROM trial_ad_intents WHERE id = ? AND player_key = ? AND day_key = ? AND verified_at IS NOT NULL")
        .bind(intentId, playerKey, day).run();
    if (result?.meta?.changes) return jsonResponse(request, { ok: true, bonusAttempts: 1 });
    const already = await env.COMMERCE_DB.prepare("SELECT 1 AS used FROM trial_ad_bonus WHERE player_key = ? AND day_key = ?").bind(playerKey, day).first();
    return jsonResponse(request, { code: already ? "TRIAL_AD_ALREADY_USED" : "TRIAL_AD_PENDING" }, already ? 409 : 425);
  }
  if (body?.action === "claim") {
    const prize = await claimTrialPrize(env, playerKey, body.tier, String(body.shardId || ""));
    return prize && !prize.alreadyClaimed ? jsonResponse(request, { ok: true, prize }) : jsonResponse(request, { code: prize?.alreadyClaimed ? "TRIAL_PRIZE_CLAIMED" : "TRIAL_PRIZE_UNAVAILABLE" }, 409);
  }
  return jsonResponse(request, { code: "INVALID_ACTION" }, 400);
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "GET, POST, OPTIONS"); }
