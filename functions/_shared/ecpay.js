const STAGE = Object.freeze({
  merchantId: "3002607",
  hashKey: "pwFHCqoQZGmho4w6",
  hashIv: "EkRm7iFT261dpevs",
  checkoutUrl: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
});

const LIVE_CHECKOUT_URL = "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

const encodeHex = (buffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const ecpayEncode = (value) => encodeURIComponent(value)
  .replace(/%20/g, "+")
  .replace(/%2D/gi, "-")
  .replace(/%5F/gi, "_")
  .replace(/%2E/gi, ".")
  .replace(/%21/gi, "!")
  .replace(/%2A/gi, "*")
  .replace(/%28/gi, "(")
  .replace(/%29/gi, ")")
  .toLowerCase();

export async function createEcpayCheckMac(parameters, hashKey, hashIv) {
  const entries = Object.entries(parameters)
    .filter(([key, value]) => key !== "CheckMacValue" && value !== undefined && value !== null)
    .sort(([left], [right]) => left.toLowerCase().localeCompare(right.toLowerCase()));
  const query = entries.map(([key, value]) => `${key}=${String(value)}`).join("&");
  const encoded = ecpayEncode(`HashKey=${hashKey}&${query}&HashIV=${hashIv}`);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(encoded));
  return encodeHex(digest).toUpperCase();
}

export async function verifyEcpayCheckMac(parameters, settings) {
  const received = String(parameters.CheckMacValue || "").toUpperCase();
  if (!received) return false;
  return received === await createEcpayCheckMac(parameters, settings.hashKey, settings.hashIv);
}

export function getEcpaySettings(env) {
  const live = String(env.ECPAY_MODE || "").toLowerCase() === "live";
  if (!live) return { ...STAGE, mode: "test", ready: true };
  const merchantId = String(env.ECPAY_MERCHANT_ID || "").trim();
  const hashKey = String(env.ECPAY_HASH_KEY || "").trim();
  const hashIv = String(env.ECPAY_HASH_IV || "").trim();
  return {
    merchantId,
    hashKey,
    hashIv,
    checkoutUrl: LIVE_CHECKOUT_URL,
    mode: "live",
    ready: Boolean(merchantId && hashKey && hashIv)
  };
}

export function isEcpayTestPlayerAllowed(env, playerName) {
  const allowedPlayers = String(env.ECPAY_TEST_PLAYER_IDS || "")
    .split(/[\r\n,]+/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const normalizedPlayerName = String(playerName || "").trim().toLowerCase();
  return Boolean(normalizedPlayerName && allowedPlayers.includes(normalizedPlayerName));
}

export function createEcpayTradeNo() {
  const time = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `STD${time}${random}`.slice(0, 20);
}

export function taipeiTradeDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}/${value.month}/${value.day} ${value.hour}:${value.minute}:${value.second}`;
}

export function formDataToObject(formData) {
  return Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value)]));
}
