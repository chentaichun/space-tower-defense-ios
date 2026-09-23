import { readLeaderboard } from "../_shared/leaderboard-store.js";
import { jsonResponse, optionsResponse } from "../_shared/cors.js";

export async function onRequestGet({ request, env }) {
  const leaderboard = await readLeaderboard(env, 100);
  if (!leaderboard) return jsonResponse(request, { code: "LEADERBOARD_UNAVAILABLE" }, 503);
  return jsonResponse(request, {
    ok: true,
    totalEligible: leaderboard.total,
    entries: leaderboard.entries.map((entry, index) => ({ rank: index + 1, ...entry }))
  });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "GET, OPTIONS"); }
