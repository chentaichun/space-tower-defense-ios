import { fulfillCommerceOrder } from "../../_shared/commerce.js";
import { formDataToObject, getEcpaySettings, isEcpayTestPlayerAllowed, verifyEcpayCheckMac } from "../../_shared/ecpay.js";

const text = (value, status = 200) => new Response(value, {
  status,
  headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
});

export async function onRequestPost({ request, env }) {
  if (!env.COMMERCE_DB) return text("0|Storage unavailable", 503);
  const settings = getEcpaySettings(env);
  if (!settings.ready) return text("0|Payment unavailable", 503);
  const fields = formDataToObject(await request.formData());
  if (!await verifyEcpayCheckMac(fields, settings)) return text("0|Invalid checksum", 400);
  if (fields.MerchantID !== settings.merchantId) return text("0|Invalid merchant", 400);
  if (fields.RtnCode !== "1") return text("1|OK");
  const order = await env.COMMERCE_DB.prepare(
    "SELECT id, player_name AS playerName, unit_amount AS unitAmount FROM commerce_orders WHERE provider = 'ecpay' AND provider_session_id = ?"
  ).bind(fields.MerchantTradeNo || "").first();
  if (!order) return text("0|Order not found", 404);
  if (settings.mode === "test" && !isEcpayTestPlayerAllowed(env, order.playerName)) {
    await env.COMMERCE_DB.prepare(
      "UPDATE commerce_orders SET status = 'cancelled', failure_reason = 'sandbox_access_revoked', updated_at = ? WHERE id = ? AND status = 'pending'"
    ).bind(new Date().toISOString(), order.id).run();
    return text("1|OK");
  }
  const tradeAmountMinor = Math.max(0, Math.floor(Number(fields.TradeAmt) || 0)) * 100;
  if (tradeAmountMinor !== Number(order.unitAmount)) return text("0|Amount mismatch", 400);
  await fulfillCommerceOrder(env, {
    orderId: order.id,
    providerSessionId: fields.MerchantTradeNo,
    paidAmountMinor: tradeAmountMinor,
    providerPaymentId: fields.TradeNo || ""
  });
  return text("1|OK");
}
