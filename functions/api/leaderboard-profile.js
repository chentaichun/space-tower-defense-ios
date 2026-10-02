import { authenticatePlayerSession } from "../_shared/player-auth.js";
import { jsonResponse, optionsResponse } from "../_shared/cors.js";

const reserved = /admin|moderator|developer|official|support|客服|官方|管理員|管理者|開發者|apple|google/i;
const objectionable = /fuck|shit|bitch|nigg|porn|sex|納粹|色情|幹你|操你|去死|自殺|殺人/i;

export function validatePublicName(value) {
  const name = String(value ?? "").normalize("NFKC").trim().replace(/\s+/gu, " ");
  const length = [...name].length;
  if (length < 2 || length > 18 || !/^[\p{L}\p{N} _-]+$/u.test(name)) return null;
  if (reserved.test(name) || objectionable.test(name) || /\d{8,}/.test(name)) return null;
  return name;
}

export async function onRequestPost({ request, env }) {
  if (!env.COMMERCE_DB) return jsonResponse(request, { code: "PROFILE_UNAVAILABLE" }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return jsonResponse(request, { code: "LOGIN_REQUIRED" }, 401);
  const body = await request.json().catch(() => null);
  if (body?.acceptedRules !== true) return jsonResponse(request, { code: "RULES_REQUIRED" }, 400);
  const name = validatePublicName(body.publicName);
  if (!name) return jsonResponse(request, { code: "NAME_INVALID" }, 400);
  const now = new Date().toISOString();
  const existing = await env.COMMERCE_DB.prepare("SELECT updated_at AS updatedAt FROM leaderboard_profiles WHERE player_key = ?")
    .bind(auth.accountKey).first();
  if (existing && Date.now() - Date.parse(existing.updatedAt) < 10 * 60_000) {
    return jsonResponse(request, { code: "NAME_COOLDOWN" }, 429);
  }
  await env.COMMERCE_DB.prepare(`
    INSERT INTO leaderboard_profiles(player_key, public_name, consented_at, updated_at, suppressed)
    VALUES (?, ?, ?, ?, 0)
    ON CONFLICT(player_key) DO UPDATE SET public_name = excluded.public_name,
      updated_at = excluded.updated_at, suppressed = 0
  `).bind(auth.accountKey, name, now, now).run();
  return jsonResponse(request, { ok: true, name });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "POST, OPTIONS"); }
