import { authenticatePlayerSession } from "../../_shared/player-auth.js";
import { addPassXp, claimPassRewards, getOfferState } from "../../_shared/value-offers.js";
import { jsonResponse, optionsResponse } from "../../_shared/cors.js";
import { playerStorageAvailable } from "../../_shared/player-storage.js";

// action: "state" (also grants today's login XP), "waves" (normal-mode waves cleared), "claim" (all reached levels).
export async function onRequestPost({ request, env }) {
  if (!env.COMMERCE_DB || !playerStorageAvailable(env)) return jsonResponse(request, { code: "PASS_UNAVAILABLE" }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return jsonResponse(request, { code: "LOGIN_REQUIRED" }, 401);
  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || "state");
  if (action === "state") await addPassXp(env, auth.accountKey, { login: true });
  else if (action === "waves") await addPassXp(env, auth.accountKey, { waves: Math.min(60, Math.max(0, Math.floor(Number(body?.waves) || 0))) });
  else if (action !== "claim") return jsonResponse(request, { code: "INVALID_ACTION" }, 400);
  const claimed = action === "claim" ? await claimPassRewards(env, auth.accountKey) : 0;
  return jsonResponse(request, { ok: true, claimed, offers: await getOfferState(env, auth.accountKey) });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "POST, OPTIONS"); }
