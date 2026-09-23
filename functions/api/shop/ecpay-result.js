import { formDataToObject, getEcpaySettings, verifyEcpayCheckMac } from "../../_shared/ecpay.js";

export async function onRequestPost({ request, env }) {
  const settings = getEcpaySettings(env);
  const fields = formDataToObject(await request.formData());
  const valid = settings.ready && await verifyEcpayCheckMac(fields, settings);
  const origin = new URL(request.url).origin;
  let orderId = valid ? String(fields.CustomField1 || "") : "";
  if (!orderId && valid && env.COMMERCE_DB) {
    const order = await env.COMMERCE_DB.prepare(
      "SELECT id FROM commerce_orders WHERE provider = 'ecpay' AND provider_session_id = ?"
    ).bind(fields.MerchantTradeNo || "").first();
    orderId = String(order?.id || "");
  }
  if (valid && fields.RtnCode !== "1" && orderId && env.COMMERCE_DB) {
    await env.COMMERCE_DB.prepare(
      "UPDATE commerce_orders SET status = 'cancelled', failure_reason = ?, updated_at = ? WHERE id = ? AND status = 'pending'"
    ).bind(String(fields.RtnMsg || "payment_cancelled").slice(0, 300), new Date().toISOString(), orderId).run();
  }
  const redirect = new URL("/", origin);
  redirect.searchParams.set("shopPayment", valid && fields.RtnCode === "1" ? "success" : "cancelled");
  if (orderId) redirect.searchParams.set("order", orderId);
  return new Response(null, { status: 303, headers: { Location: redirect.toString(), "Cache-Control": "no-store" } });
}
