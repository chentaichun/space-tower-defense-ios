import { authenticatePlayerSession, digest } from "../_shared/player-auth.js";
import { jsonResponse, optionsResponse } from "../_shared/cors.js";

const reasons = new Set(["inappropriate_name", "harassment", "impersonation", "other"]);

export async function onRequestPost({ request, env }) {
  if (!env.FEEDBACK_STORE) return jsonResponse(request, { code: "REPORT_UNAVAILABLE" }, 503);
  const body = await request.json().catch(() => null);
  const targetId = String(body?.targetId || "");
  const reason = String(body?.reason || "");
  if (!/^Pilot-[0-9A-F]{12}$/.test(targetId) || !reasons.has(reason)) {
    return jsonResponse(request, { code: "REPORT_INVALID" }, 400);
  }
  const auth = await authenticatePlayerSession(request, env);
  const installationId = String(body?.installationId || "");
  if (!auth && !/^[a-zA-Z0-9._:-]{16,96}$/.test(installationId)) {
    return jsonResponse(request, { code: "REPORT_ID_REQUIRED" }, 400);
  }
  const reporter = await digest(auth?.accountKey || `install:${installationId}`);
  const day = new Date().toISOString().slice(0, 10);
  const rateKey = `leaderboard-report-limit:${day}:${reporter}`;
  const count = Number(await env.FEEDBACK_STORE.get(rateKey)) || 0;
  if (count >= 5) return jsonResponse(request, { code: "REPORT_LIMIT" }, 429);
  const duplicateKey = `leaderboard-report:${day}:${reporter}:${targetId}`;
  if (await env.FEEDBACK_STORE.get(duplicateKey)) return jsonResponse(request, { ok: true, alreadyReported: true });
  const now = new Date().toISOString();
  const id = `${now}_${crypto.randomUUID()}`;
  await env.FEEDBACK_STORE.put(`feedback:${id}`, JSON.stringify({
    id, message: `[Leaderboard report] ${reason} · ${targetId}`,
    reportTargetId: targetId, reportReason: reason,
    reporterKey: reporter, player: auth?.account?.name || "Guest",
    page: "/leaderboard", createdAt: now
  }));
  await env.FEEDBACK_STORE.put(duplicateKey, "1", { expirationTtl: 172800 });
  await env.FEEDBACK_STORE.put(rateKey, String(count + 1), { expirationTtl: 172800 });
  return jsonResponse(request, { ok: true });
}

export async function onRequestOptions({ request }) { return optionsResponse(request, "POST, OPTIONS"); }
