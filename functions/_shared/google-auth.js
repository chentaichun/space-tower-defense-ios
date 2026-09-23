import { createPlayerSession, digest, normalizeName } from "./player-auth.js";
import {
  deleteEphemeralAuth,
  getEphemeralAuth,
  getPlayerAccount,
  playerStorageAvailable,
  putEphemeralAuth,
  putPlayerAccount
} from "./player-storage.js";

const STATE_PREFIX = "google-oauth-state:";
const BRIDGE_PREFIX = "google-auth-code:";
const STATE_TTL_SECONDS = 10 * 60;
const BRIDGE_TTL_SECONDS = 2 * 60;
const DEFAULT_REDIRECT_URI = "https://space-tower-defense.pages.dev/api/auth/google/callback";
const APP_CALLBACK_URI = "spacetowerdefense://auth";

const randomToken = () =>
  `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;

const keyedToken = async (prefix, token) => `${prefix}${await digest(token)}`;

export const googleAuthConfigured = (env) =>
  Boolean(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET && playerStorageAvailable(env));

export const googleRedirectUri = (env) =>
  String(env.GOOGLE_OAUTH_REDIRECT_URI || DEFAULT_REDIRECT_URI);

export async function createGoogleState(env, flow) {
  const state = randomToken();
  await putEphemeralAuth(env,
    await keyedToken(STATE_PREFIX, state),
    {
      flow: flow === "app" ? "app" : "web",
      createdAt: new Date().toISOString()
    },
    STATE_TTL_SECONDS
  );
  return state;
}

export async function consumeGoogleState(env, state) {
  if (!state) return null;
  const key = await keyedToken(STATE_PREFIX, state);
  const record = await getEphemeralAuth(env, key);
  if (record) await deleteEphemeralAuth(env, key);
  return record;
}

export function googleAuthorizationUrl(env, state) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_OAUTH_CLIENT_ID);
  url.searchParams.set("redirect_uri", googleRedirectUri(env));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "online");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleAuthorizationCode(env, code) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: googleRedirectUri(env)
    })
  });
  const token = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !token.access_token) {
    throw new Error(token.error_description || token.error || "Google token exchange failed.");
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  const profile = await profileResponse.json().catch(() => ({}));
  if (!profileResponse.ok || !profile.sub) {
    throw new Error("Google profile verification failed.");
  }
  if (profile.email && profile.email_verified !== true) {
    throw new Error("Google email is not verified.");
  }
  return profile;
}

const googleAccountKey = (subject) => `player-google:${String(subject).slice(0, 128)}`;

const googleAccountName = (profile) => {
  const suffix = String(profile.sub || "").slice(-6);
  const source = String(profile.name || profile.email?.split("@")[0] || "Google Player")
    .replace(/[^\p{L}\p{N} _.-]/gu, "")
    .trim();
  const base = normalizeName(source || "Google Player").slice(0, 23);
  return normalizeName(`${base}-${suffix}`);
};

export async function getOrCreateGoogleAccount(env, profile) {
  const accountKey = googleAccountKey(profile.sub);
  let account = await getPlayerAccount(env, accountKey);
  if (!account) {
    const now = new Date().toISOString();
    account = {
      name: googleAccountName(profile),
      authProvider: "google",
      googleSubject: String(profile.sub),
      save: {},
      createdAt: now,
      updatedAt: now
    };
    await putPlayerAccount(env, accountKey, account);
  }
  return { account, accountKey };
}

export async function createGoogleBridgeCode(env, accountKey, accountName) {
  const code = randomToken();
  await putEphemeralAuth(env,
    await keyedToken(BRIDGE_PREFIX, code),
    {
      accountKey,
      accountName,
      createdAt: new Date().toISOString()
    },
    BRIDGE_TTL_SECONDS
  );
  return code;
}

export async function exchangeGoogleBridgeCode(env, code) {
  if (!code) return null;
  const key = await keyedToken(BRIDGE_PREFIX, code);
  const bridge = await getEphemeralAuth(env, key);
  if (!bridge?.accountKey) return null;
  await deleteEphemeralAuth(env, key);

  const account = await getPlayerAccount(env, bridge.accountKey);
  if (!account) return null;
  const sessionToken = await createPlayerSession(env, bridge.accountKey, account.name);
  return { account, accountKey: bridge.accountKey, sessionToken };
}

export function googleAuthResultUrl(flow, result) {
  const isApp = flow === "app";
  const url = new URL(isApp ? APP_CALLBACK_URI : "https://space-tower-defense.pages.dev/");
  if (result.code) url.searchParams.set("google_auth_code", result.code);
  if (result.error) url.searchParams.set("google_auth_error", result.error);
  return url.toString();
}
