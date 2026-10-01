const DEFAULT_PACKAGE_NAME = "com.mrchen.spacetowerdefense";
const ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const GOOGLE_TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token";

let cachedAccessToken = "";
let cachedAccessTokenExpiresAt = 0;

const base64Url = (value) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(value)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

const pemToBytes = (pem) => {
  const encoded = String(pem || "")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(encoded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const readServiceAccount = (env) => {
  try {
    const source = typeof env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON === "string"
      ? JSON.parse(env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON)
      : env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    if (!source || typeof source !== "object") return null;
    return {
      clientEmail: String(source.client_email || ""),
      privateKey: String(source.private_key || ""),
      tokenUri: String(source.token_uri || GOOGLE_TOKEN_AUDIENCE)
    };
  } catch {
    return null;
  }
};

export function getGooglePlaySettings(env) {
  const serviceAccount = readServiceAccount(env);
  const packageName = String(env.GOOGLE_PLAY_PACKAGE_NAME || DEFAULT_PACKAGE_NAME);
  return {
    packageName,
    serviceAccount,
    ready: Boolean(
      packageName &&
      serviceAccount?.clientEmail &&
      serviceAccount?.privateKey &&
      serviceAccount?.tokenUri
    )
  };
}

async function createServiceAccountAssertion(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: serviceAccount.clientEmail,
    scope: ANDROID_PUBLISHER_SCOPE,
    aud: serviceAccount.tokenUri,
    iat: now,
    exp: now + 3600
  }));
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(serviceAccount.privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `${unsigned}.${encodedSignature}`;
}

async function getGoogleAccessToken(settings, forceRefresh = false) {
  if (!settings.ready) throw new Error("Google Play server verification is not configured.");
  if (!forceRefresh && cachedAccessToken && cachedAccessTokenExpiresAt > Date.now() + 60000) {
    return cachedAccessToken;
  }
  const assertion = await createServiceAccountAssertion(settings.serviceAccount);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });
  const response = await fetch(settings.serviceAccount.tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(`Google OAuth failed (${response.status}).`);
  }
  cachedAccessToken = String(data.access_token);
  cachedAccessTokenExpiresAt = Date.now() + Math.max(60, Number(data.expires_in) || 3600) * 1000;
  return cachedAccessToken;
}

async function googlePlayRequest(settings, url, options = {}, allowRetry = true) {
  const accessToken = await getGoogleAccessToken(settings);
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });
  if (response.status === 401 && allowRetry) {
    await getGoogleAccessToken(settings, true);
    return googlePlayRequest(settings, url, options, false);
  }
  return response;
}

const purchasePath = (settings, productId, purchaseToken) =>
  `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(settings.packageName)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;

export async function verifyGooglePlayProductPurchase(settings, productId, purchaseToken) {
  const response = await googlePlayRequest(settings, purchasePath(settings, productId, purchaseToken));
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Google Play purchase verification failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function consumeGooglePlayProductPurchase(settings, productId, purchaseToken) {
  const response = await googlePlayRequest(
    settings,
    `${purchasePath(settings, productId, purchaseToken)}:consume`,
    { method: "POST" }
  );
  if (response.ok) return { consumed: true, alreadyConsumed: false };
  if ([404, 409, 410].includes(response.status)) {
    return { consumed: true, alreadyConsumed: true };
  }
  const error = new Error(`Google Play purchase consumption failed (${response.status}).`);
  error.status = response.status;
  throw error;
}

export async function acknowledgeGooglePlayProductPurchase(settings, productId, purchaseToken) {
  const response = await googlePlayRequest(settings, `${purchasePath(settings, productId, purchaseToken)}:acknowledge`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}"
  });
  if (!response.ok) throw new Error(`Google Play acknowledgement failed (${response.status}).`);
}

export async function verifyGooglePlaySubscription(settings, purchaseToken) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(settings.packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
  const response = await googlePlayRequest(settings, url);
  if (!response.ok) {
    const error = new Error("SUBSCRIPTION_VERIFICATION_FAILED");
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function acknowledgeGooglePlaySubscription(settings, productId, purchaseToken) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(settings.packageName)}/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;
  const response = await googlePlayRequest(settings, url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}"
  });
  if (!response.ok) throw new Error("SUBSCRIPTION_ACKNOWLEDGEMENT_FAILED");
}
