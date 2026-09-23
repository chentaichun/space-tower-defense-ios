import { authenticatePlayerSession } from "../../_shared/player-auth.js";
import { getSpaceCoinWallet, getWallet, json } from "../../_shared/commerce.js";

export async function onRequestGet({ request, env }) {
  if (!env.COMMERCE_DB) return json({ error: "Commerce storage is not configured." }, 503);
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return json({ error: "Please sign in.", code: "LOGIN_REQUIRED" }, 401);
  const orderId = new URL(request.url).searchParams.get("id") || "";
  if (!orderId.startsWith("web_") || orderId.length > 80) return json({ error: "Invalid order." }, 400);
  const order = await env.COMMERCE_DB.prepare(
    "SELECT id, product_id AS productId, base_amount AS baseAmount, credited_amount AS creditedAmount, currency, unit_amount AS unitAmount, status, failure_reason AS failureReason, created_at AS createdAt, paid_at AS paidAt, fulfilled_at AS fulfilledAt FROM commerce_orders WHERE id = ? AND player_key = ?"
  ).bind(orderId, auth.accountKey).first();
  if (!order) return json({ error: "Order not found." }, 404);
  return json({
    ok: true,
    order,
    wallet: await getWallet(env, auth.accountKey),
    spaceCoinWallet: await getSpaceCoinWallet(env, auth.accountKey)
  });
}
