import { authenticatePlayerSession } from "../../_shared/player-auth.js";
import { getCommerceConfig, json } from "../../_shared/commerce.js";
import { createEcpayCheckMac, createEcpayTradeNo, getEcpaySettings, isEcpayTestPlayerAllowed, taipeiTradeDate } from "../../_shared/ecpay.js";
import { getEphemeralAuth, playerStorageAvailable, putEphemeralAuth } from "../../_shared/player-storage.js";

const readBody = async (request) => {
  try { return await request.json(); } catch { return null; }
};

export async function onRequestPost({ request, env }) {
  if (!playerStorageAvailable(env) || !env.COMMERCE_DB) return json({ error: "Commerce storage is not configured." }, 503);
  const payment = getEcpaySettings(env);
  if (!payment.ready) {
    return json({ error: "Secure web payment is being configured.", code: "PAYMENT_SETUP_REQUIRED" }, 503);
  }
  const auth = await authenticatePlayerSession(request, env);
  if (!auth) return json({ error: "Please sign in before purchasing.", code: "LOGIN_REQUIRED" }, 401);
  if (payment.mode === "test" && !isEcpayTestPlayerAllowed(env, auth.account?.name)) {
    return json({ error: "Sandbox checkout is restricted to approved test players.", code: "TEST_ACCESS_REQUIRED" }, 403);
  }
  const body = await readBody(request);
  if (!body?.productId) return json({ error: "A product is required." }, 400);

  const rateKey = `checkout-rate:${auth.accountKey}`;
  const lastCheckoutAt = Number(await getEphemeralAuth(env, rateKey)) || 0;
  if (Date.now() - lastCheckoutAt < 10000) return json({ error: "Please wait before creating another order." }, 429);
  await putEphemeralAuth(env, rateKey, Date.now(), 60);

  const commerce = await getCommerceConfig(env);
  const product = commerce.products.find((item) => item.id === body.productId);
  if (!product) return json({ error: "Unknown product." }, 404);

  const id = `web_${crypto.randomUUID()}`;
  const providerTradeNo = createEcpayTradeNo();
  const now = new Date().toISOString();
  const playerName = String(auth.account.name || auth.session.accountName || "Player").slice(0, 32);
  const potentialBonus = product.currencyType === "obsidian"
    ? Math.floor(product.amount * commerce.firstPurchaseBonusRate)
    : 0;
  await env.COMMERCE_DB.prepare(
    "INSERT INTO commerce_orders (id, player_key, player_name, product_id, base_amount, max_bonus_amount, currency, unit_amount, provider, provider_session_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'TWD', ?, 'ecpay', ?, 'pending', ?, ?)"
  ).bind(id, auth.accountKey, playerName, product.id, product.amount, potentialBonus, product.priceTwd * 100, providerTradeNo, now, now).run();

  const origin = new URL(request.url).origin;
  const clientBackUrl = new URL("/", origin);
  clientBackUrl.searchParams.set("shopPayment", "return");
  clientBackUrl.searchParams.set("order", id);

  try {
    const fields = {
      MerchantID: payment.merchantId,
      MerchantTradeNo: providerTradeNo,
      MerchantTradeDate: taipeiTradeDate(),
      PaymentType: "aio",
      TotalAmount: String(product.priceTwd),
      TradeDesc: "Space Tower Defense",
      ItemName: `${product.amount} ${product.currencyType === "spaceCoin" ? "Space Coin" : "Obsidian"}`,
      ReturnURL: `${origin}/api/shop/ecpay-notify`,
      ChoosePayment: "Credit",
      EncryptType: "1",
      ClientBackURL: clientBackUrl.toString(),
      OrderResultURL: `${origin}/api/shop/ecpay-result`,
      NeedExtraPaidInfo: "N",
      CustomField1: id,
      CustomField2: product.id,
      Language: "CHT"
    };
    fields.CheckMacValue = await createEcpayCheckMac(fields, payment.hashKey, payment.hashIv);
    return json({ ok: true, orderId: id, checkoutUrl: payment.checkoutUrl, fields, testMode: payment.mode === "test" });
  } catch (error) {
    await env.COMMERCE_DB.prepare(
      "UPDATE commerce_orders SET status = 'failed', failure_reason = ?, updated_at = ? WHERE id = ?"
    ).bind(String(error.message || "checkout_failed").slice(0, 300), new Date().toISOString(), id).run();
    return json({ error: "Unable to start secure payment. Please try again later." }, 502);
  }
}
