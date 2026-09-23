// Transactions are fetched directly from Apple's authenticated HTTPS API.
// Never pass a client-supplied JWS to the private response decoder below.
const BUNDLE_ID = "com.mrchen.spacetowerdefense";
const encoder = new TextEncoder();
const encode = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
const encodeJson = (value) => encode(encoder.encode(JSON.stringify(value)));

export function getAppleStoreSettings(env) {
  const keyId = String(env.APPLE_IAP_KEY_ID || "").trim();
  const issuerId = String(env.APPLE_IAP_ISSUER_ID || "").trim();
  const privateKey = String(env.APPLE_IAP_PRIVATE_KEY || "");
  return { bundleId: BUNDLE_ID, keyId, issuerId, privateKey,
    ready: Boolean(keyId && issuerId && privateKey),
    sandboxPlayers: new Set(String(env.APPLE_IAP_SANDBOX_PLAYERS || "").split(",").map((x) => x.trim()).filter(Boolean)) };
}

export async function appleAppAccountToken(playerKey) {
  if (!playerKey) throw new Error("Player identity is required.");
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(`space-tower-defense:apple-account:v1:${playerKey}`))).slice(0, 16);
  // RFC 9562 UUIDv8: deterministic, domain-separated, without exposing the player key.
  bytes[6] = (bytes[6] & 15) | 128;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function authorization(settings) {
  const pem = settings.privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const data = `${encodeJson({ alg: "ES256", kid: settings.keyId, typ: "JWT" })}.${encodeJson({ iss: settings.issuerId, iat: now, exp: now + 300, aud: "appstoreconnect-v1", bid: settings.bundleId })}`;
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, encoder.encode(data));
  return `${data}.${encode(new Uint8Array(signature))}`;
}

function fail(code, status = 409) {
  const error = new Error(code);
  error.code = code;
  error.status = status;
  throw error;
}

function decodeAppleResponse(jws) {
  if (typeof jws !== "string" || jws.length > 32768 || jws.split(".").length !== 3) fail("APPLE_INVALID_RESPONSE", 502);
  try {
    const encoded = jws.split(".")[1].replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "="));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))));
  } catch { fail("APPLE_INVALID_RESPONSE", 502); }
}

export async function verifyAppleStorePurchase(settings, { transactionId, productId, playerKey, nonConsumable = false, environment = "Production" }) {
  if (!settings.ready) fail("APPLE_SETUP_REQUIRED", 503);
  if (!/^\d{1,40}$/.test(String(transactionId)) || !productId || !playerKey) fail("INVALID_PURCHASE", 400);
  if (!["Production", "Sandbox"].includes(environment)) fail("INVALID_ENVIRONMENT", 400);
  if (environment === "Sandbox" && !settings.sandboxPlayers.has(playerKey)) fail("SANDBOX_NOT_ALLOWED", 403);
  const host = environment === "Sandbox" ? "api.storekit-sandbox.apple.com" : "api.storekit.apple.com";
  const response = await fetch(`https://${host}/inApps/v1/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${await authorization(settings)}`, Accept: "application/json" },
    // Workers supports manual/follow; manual also prevents forwarding the JWT.
    redirect: "manual", signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    console.warn("Apple verification upstream failure", JSON.stringify({status: response.status, code: detail.errorCode || null, environment}));
    fail("PURCHASE_VERIFICATION_FAILED", response.status === 404 ? 404 : 502);
  }
  const data = await response.json();
  const purchase = decodeAppleResponse(data.signedTransactionInfo);
  if (purchase.bundleId !== settings.bundleId) fail("BUNDLE_MISMATCH");
  if (purchase.transactionId !== String(transactionId) || purchase.productId !== productId) fail("PRODUCT_MISMATCH");
  if (purchase.environment !== environment) fail("ENVIRONMENT_MISMATCH");
  if (purchase.appAccountToken?.toLowerCase() !== await appleAppAccountToken(playerKey)) fail("ACCOUNT_MISMATCH", 403);
  if (purchase.revocationDate != null || purchase.revocationReason != null) fail("PURCHASE_REVOKED");
  if (purchase.type !== (nonConsumable ? "Non-Consumable" : "Consumable") || purchase.quantity !== 1 || purchase.inAppOwnershipType !== "PURCHASED") fail("UNSUPPORTED_PURCHASE");
  if (!/^\d{1,40}$/.test(purchase.originalTransactionId || "") || !Number.isSafeInteger(purchase.purchaseDate) || purchase.purchaseDate <= 0 || purchase.purchaseDate > Date.now() + 300000) fail("APPLE_INVALID_RESPONSE", 502);
  return { ...purchase, purchaseToken: `apple:${environment}:${nonConsumable ? purchase.originalTransactionId : purchase.transactionId}` };
}
