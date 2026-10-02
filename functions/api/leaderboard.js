import { readLeaderboard, readOwnLeaderboardRank } from "../_shared/leaderboard-store.js";
import { authenticatePlayerSession, digest } from "../_shared/player-auth.js";
import { jsonResponse, optionsResponse } from "../_shared/cors.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const named = url.searchParams.get("display") === "names";
  const leaderboard = await readLeaderboard(env, 100, named);
  if (!leaderboard) return jsonResponse(request, { code: "LEADERBOARD_UNAVAILABLE" }, 503);
  const auth = await authenticatePlayerSession(request, env);
  const installationId = url.searchParams.get("installationId") || "";
  const playerKey = auth?.accountKey || (/^[a-zA-Z0-9._:-]{16,96}$/.test(installationId)
    ? `player:guest-${(await digest(`space-tower-commerce:${installationId}`)).slice(0, 32)}` : "");
  const profile = named && auth ? await env.COMMERCE_DB.prepare(
    "SELECT public_name AS publicName, suppressed FROM leaderboard_profiles WHERE player_key = ?"
  ).bind(auth.accountKey).first() : null;
  return jsonResponse(request, {
    ok: true,
    totalEligible: leaderboard.total,
    entries: leaderboard.entries.map((entry, index) => ({ rank: index + 1, ...entry })),
    me: playerKey ? await readOwnLeaderboardRank(env, playerKey, named) : null,
    ...(named ? { profile: profile && !profile.suppressed ? { name: profile.publicName } : null } : {})
  });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "GET, OPTIONS"); }
