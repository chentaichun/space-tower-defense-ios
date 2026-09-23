import { createPlayerSession, digest } from "../../_shared/player-auth.js";
import { appleAppAccountToken } from "../../_shared/apple-store.js";
import { getPlayerEntitlements } from "../../_shared/entitlements.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { getPlayerAccount, playerStorageAvailable, putPlayerAccount } from "../../_shared/player-storage.js";

const normalizeInstallationId = (value) => String(value || "").trim().slice(0, 96);

export async function onRequestPost({ request, env }) {
  if (!playerStorageAvailable(env)) return jsonResponse(request, { code: "PLAYER_STORE_UNAVAILABLE" }, 503);
  const body = await request.json().catch(() => null);
  const installationId = normalizeInstallationId(body?.installationId);
  if (!/^[a-zA-Z0-9._:-]{16,96}$/.test(installationId)) {
    return jsonResponse(request, { code: "INVALID_INSTALLATION_ID" }, 400);
  }

  const fingerprint = await digest(`space-tower-commerce:${installationId}`);
  const accountKey = `player:guest-${fingerprint.slice(0, 32)}`;
  let account = await getPlayerAccount(env, accountKey);
  if (!account) {
    const now = new Date().toISOString();
    account = {
      name: `Guest-${fingerprint.slice(0, 8).toUpperCase()}`,
      guestCommerce: true,
      leaderboardEligible: false,
      createdAt: now,
      updatedAt: now
    };
    await putPlayerAccount(env, accountKey, account);
  }

  const sessionToken = await createPlayerSession(env, accountKey, account.name);
  return jsonResponse(request, {
    ok: true,
    player: { name: account.name, guestCommerce: true },
    sessionToken,
    googlePlayAccountId: await digest(accountKey),
    appleAppAccountToken: await appleAppAccountToken(accountKey),
    entitlements: await getPlayerEntitlements(env, accountKey)
  });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "POST, OPTIONS"); }
