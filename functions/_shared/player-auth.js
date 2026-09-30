import {
  getPlayerAccount,
  getPlayerSession,
  putPlayerAccount,
  putPlayerSession
} from "./player-storage.js";

const SESSION_PREFIX = "player-session:";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const SESSION_REFRESH_SECONDS = 60 * 60 * 24;
const PASSWORD_VERSION = 2;
const PASSWORD_ITERATIONS = 100000;

export const normalizeName = (value) => String(value || "").trim().slice(0, 32);
export const normalizePassword = (value) => String(value || "").trim().slice(0, 80);
export const playerKey = (name) => `player:${normalizeName(name).toLowerCase()}`;

const encodeHex = (buffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

export const digest = async (value) =>
  encodeHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));

export const hashLegacyPassword = async (name, password, salt) =>
  digest(`${normalizeName(name).toLowerCase()}:${salt}:${normalizePassword(password)}`);

export const hashPassword = async (name, password, salt) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(normalizePassword(password)),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    hash: "SHA-256",
    iterations: PASSWORD_ITERATIONS,
    salt: encoder.encode(`${normalizeName(name).toLowerCase()}:${salt}`)
  }, key, 256);
  return encodeHex(bits);
};

const safeEqual = (left, right) => {
  const a = String(left || "");
  const b = String(right || "");
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
};

export async function verifyPlayerPassword(account, name, password) {
  if (!account?.salt || !account?.passwordHash) {
    return { valid: false, needsUpgrade: false, passwordHash: "" };
  }
  const usesCurrentHash = Number(account.passwordVersion) === PASSWORD_VERSION;
  const passwordHash = usesCurrentHash
    ? await hashPassword(name, password, account.salt)
    : await hashLegacyPassword(name, password, account.salt);
  if (!safeEqual(passwordHash, account.passwordHash)) {
    return { valid: false, needsUpgrade: false, passwordHash: "" };
  }
  if (usesCurrentHash) {
    return { valid: true, needsUpgrade: false, passwordHash };
  }
  return {
    valid: true,
    needsUpgrade: true,
    passwordHash: await hashPassword(name, password, account.salt)
  };
}

const getBearerToken = (request) => {
  const header = request.headers.get("Authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
};

export async function createPlayerSession(env, accountKey, accountName) {
  const token = `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
  const sessionKey = `${SESSION_PREFIX}${await digest(token)}`;
  const now = new Date().toISOString();
  await putPlayerSession(env, sessionKey, {
    accountKey,
    accountName,
    createdAt: now,
    lastUsedAt: now
  }, SESSION_TTL_SECONDS);
  return token;
}

export async function authenticatePlayerSession(request, env) {
  if (!env.COMMERCE_DB && !env.FEEDBACK_STORE) return null;
  const token = getBearerToken(request);
  if (!token) return null;
  const sessionKey = `${SESSION_PREFIX}${await digest(token)}`;
  const session = await getPlayerSession(env, sessionKey);
  if (!session?.accountKey) return null;
  const account = await getPlayerAccount(env, session.accountKey);
  if (!account) return null;
  // Legacy KV sessions must not authenticate a newly registered account with the same name.
  if (Date.parse(session.createdAt) < Date.parse(account.createdAt)) return null;
  const lastUsedAt = Date.parse(session.lastUsedAt || session.createdAt || 0);
  if (!Number.isFinite(lastUsedAt) || Date.now() - lastUsedAt >= SESSION_REFRESH_SECONDS * 1000) {
    session.lastUsedAt = new Date().toISOString();
    await putPlayerSession(env, sessionKey, session, SESSION_TTL_SECONDS);
  }
  return { account, accountKey: session.accountKey, session };
}

export async function authenticatePlayerCredentials(env, rawName, rawPassword) {
  if (!env.COMMERCE_DB && !env.FEEDBACK_STORE) return null;
  const name = normalizeName(rawName);
  const password = normalizePassword(rawPassword);
  if (!name || !password) return null;
  const accountKey = playerKey(name);
  const account = await getPlayerAccount(env, accountKey);
  const verification = await verifyPlayerPassword(account, name, password);
  if (verification.valid && env.COMMERCE_DB) await putPlayerAccount(env, accountKey, account);
  return verification.valid ? { account, accountKey } : null;
}
