const KEY_URL = "https://www.gstatic.com/admob/reward/verifier-keys.json";
const ALLOWED_TRIAL_UNITS = new Set(["9681205002", "3779611211"]);
const encoder = new TextEncoder();

const decodeBase64Url = (input) => {
  const normalized = String(input || "").replaceAll("-", "+").replaceAll("_", "/");
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")), (char) => char.charCodeAt(0));
};

function derToP1363(der) {
  let offset = 0;
  const readLength = () => {
    const first = der[offset++];
    if (first < 128) return first;
    const count = first & 127;
    if (count < 1 || count > 2) throw new Error("INVALID_SSV_SIGNATURE");
    let length = 0;
    for (let i = 0; i < count; i += 1) length = length * 256 + der[offset++];
    return length;
  };
  if (der[offset++] !== 0x30) throw new Error("INVALID_SSV_SIGNATURE");
  const sequenceLength = readLength();
  if (offset + sequenceLength !== der.length) throw new Error("INVALID_SSV_SIGNATURE");
  const result = new Uint8Array(64);
  for (let part = 0; part < 2; part += 1) {
    if (der[offset++] !== 0x02) throw new Error("INVALID_SSV_SIGNATURE");
    const length = readLength();
    const integer = der.slice(offset, offset + length);
    offset += length;
    const trimmed = integer[0] === 0 ? integer.slice(1) : integer;
    if (!trimmed.length || trimmed.length > 32) throw new Error("INVALID_SSV_SIGNATURE");
    result.set(trimmed, part * 32 + 32 - trimmed.length);
  }
  if (offset !== der.length) throw new Error("INVALID_SSV_SIGNATURE");
  return result;
}

export async function verifyAdMobTrialCallback(request, now = Date.now(), fetcher = fetch) {
  const url = new URL(request.url);
  const raw = url.search.slice(1);
  const parts = raw.split("&");
  if (parts.length < 7 || !parts.at(-2)?.startsWith("signature=") || !parts.at(-1)?.startsWith("key_id=")) throw new Error("INVALID_SSV_QUERY");
  const signedContent = parts.slice(0, -2).join("&");
  const params = new URLSearchParams(raw);
  for (const key of ["signature", "key_id", "ad_unit", "custom_data", "transaction_id", "timestamp"]) {
    if (params.getAll(key).length !== 1) throw new Error("INVALID_SSV_QUERY");
  }
  const adUnit = String(params.get("ad_unit"));
  const intentId = String(params.get("custom_data") || "");
  const transactionId = String(params.get("transaction_id") || "");
  const timestamp = Number(params.get("timestamp"));
  if (!ALLOWED_TRIAL_UNITS.has(adUnit) || !/^trial:[0-9a-f-]{36}$/i.test(intentId) || !/^[0-9a-f]{16,128}$/i.test(transactionId)) throw new Error("INVALID_SSV_REWARD");
  if (!Number.isSafeInteger(timestamp) || Math.abs(now - timestamp) > 30 * 60_000) throw new Error("INVALID_SSV_TIME");
  const response = await fetcher(KEY_URL, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("SSV_KEYS_UNAVAILABLE");
  const keys = await response.json();
  const key = keys?.keys?.find((item) => String(item.keyId) === params.get("key_id"));
  if (!key?.base64) throw new Error("SSV_KEY_UNKNOWN");
  const publicKey = await crypto.subtle.importKey("spki", Uint8Array.from(atob(key.base64), (char) => char.charCodeAt(0)), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  const signature = derToP1363(decodeBase64Url(params.get("signature")));
  const valid = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publicKey, signature, encoder.encode(signedContent));
  if (!valid) throw new Error("INVALID_SSV_SIGNATURE");
  return { intentId: intentId.slice(6), transactionId, timestamp, adUnit };
}
