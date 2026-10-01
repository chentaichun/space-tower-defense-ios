import { verifyAdMobTrialCallback } from "../_shared/admob-ssv.js";

export async function onRequestGet({ request, env }) {
  if (!env.COMMERCE_DB) return new Response("unavailable", { status: 503 });
  try {
    const result = await verifyAdMobTrialCallback(request);
    const row = await env.COMMERCE_DB.prepare("UPDATE trial_ad_intents SET verified_at = ?, transaction_id = ? WHERE id = ? AND verified_at IS NULL AND created_at BETWEEN ? AND ?")
      .bind(result.timestamp, result.transactionId, result.intentId, result.timestamp - 10 * 60_000, result.timestamp).run();
    if (row?.meta?.changes) return new Response("ok");
    const existing = await env.COMMERCE_DB.prepare("SELECT transaction_id AS transactionId FROM trial_ad_intents WHERE id = ?").bind(result.intentId).first();
    return new Response(existing?.transactionId === result.transactionId ? "ok" : "unknown intent", { status: existing?.transactionId === result.transactionId ? 200 : 409 });
  } catch (error) {
    console.warn("Trial ad SSV failed", error?.message || "unknown");
    return new Response("invalid callback", { status: 400 });
  }
}
