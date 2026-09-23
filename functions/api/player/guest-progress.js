import { digest } from "../../_shared/player-auth.js";
import { upsertLeaderboardEntry } from "../../_shared/leaderboard-store.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { getPlayerAccount, playerStorageAvailable, putPlayerAccount } from "../../_shared/player-storage.js";

const normalizeInstallationId = (value) => String(value || "").trim().slice(0, 96);
const clampInteger = (value, minimum, maximum) =>
  Math.max(minimum, Math.min(maximum, Math.floor(Number(value) || minimum)));
const MAX_TIER = 20;
const TIER_UNLOCK_WAVE = 1500;

const getVerifiedUnlockedTier = (tierRecords = {}) => {
  // Tier 2 is grandfathered because the first leaderboard-enabled Android
  // release only uploaded the current best tier, not the full Tier 1 record.
  let unlocked = 2;
  for (let tier = 2; tier < MAX_TIER; tier += 1) {
    if (clampInteger(tierRecords[tier], 1, 999999) < TIER_UNLOCK_WAVE) break;
    unlocked = tier + 1;
  }
  return unlocked;
};

export async function onRequestPost({ request, env }) {
  if (!playerStorageAvailable(env)) return jsonResponse(request, { code: "PLAYER_STORE_UNAVAILABLE" }, 503);
  const body = await request.json().catch(() => null);
  const installationId = normalizeInstallationId(body?.installationId);
  if (!/^[a-zA-Z0-9._:-]{16,96}$/.test(installationId)) {
    return jsonResponse(request, { code: "INVALID_INSTALLATION_ID" }, 400);
  }

  const fingerprint = await digest(`space-tower-commerce:${installationId}`);
  const accountKey = `player:guest-${fingerprint.slice(0, 32)}`;
  const now = new Date().toISOString();
  const tier = clampInteger(body?.tier, 1, MAX_TIER);
  const wave = clampInteger(body?.wave, 1, 999999);
  const account = (await getPlayerAccount(env, accountKey)) || {
    name: `Guest-${fingerprint.slice(0, 8).toUpperCase()}`,
    guestCommerce: true,
    createdAt: now
  };
  const save = account.save && typeof account.save === "object" ? account.save : {};
  const tierRecords = save.tierRecords && typeof save.tierRecords === "object" ? { ...save.tierRecords } : {};
  const verifiedUnlockedTier = getVerifiedUnlockedTier(tierRecords);
  if (tier > verifiedUnlockedTier) {
    return jsonResponse(request, {
      code: "INVALID_TIER_PROGRESSION",
      verifiedUnlockedTier
    }, 409);
  }
  tierRecords[tier] = Math.max(1, Math.floor(Number(tierRecords[tier]) || 1), wave);
  const previousTier = clampInteger(save.bestRecord?.tier, 1, 20);
  const previousWave = clampInteger(save.bestRecord?.wave, 1, 999999);
  const bestRecord = tier > previousTier || (tier === previousTier && wave > previousWave)
    ? { tier, wave }
    : { tier: previousTier, wave: previousWave };

  account.guestCommerce = true;
  account.leaderboardEligible = bestRecord.tier > 1 || bestRecord.wave > 1;
  account.save = { ...save, bestRecord, tierRecords, updatedAt: now };
  account.updatedAt = now;
  await putPlayerAccount(env, accountKey, account);
  if (account.leaderboardEligible) {
    await upsertLeaderboardEntry(env, {
      playerKey: accountKey,
      name: account.name,
      tier: bestRecord.tier,
      wave: bestRecord.wave,
      isGuest: true,
      updatedAt: now
    });
  }

  return jsonResponse(request, {
    ok: true,
    player: { name: account.name, guestCommerce: true },
    bestRecord
  });
}

export async function onRequestOptions({ request }) {
  return optionsResponse(request, "POST, OPTIONS");
}
