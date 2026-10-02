const parseJson = (value) => {
  if (!value) return null;
  try { return JSON.parse(value); }
  catch { return null; }
};

export const playerStorageAvailable = (env) => Boolean(env.COMMERCE_DB || env.FEEDBACK_STORE);

export async function getPlayerAccount(env, accountKey) {
  if (env.COMMERCE_DB) {
    try {
      const row = await env.COMMERCE_DB.prepare(
        "SELECT account_json AS accountJson FROM player_accounts WHERE player_key = ?"
      ).bind(accountKey).first();
      const account = parseJson(row?.accountJson);
      if (account) return account;
    } catch { /* Older test/local schemas fall back to KV. */ }
  }
  return env.FEEDBACK_STORE ? env.FEEDBACK_STORE.get(accountKey, "json") : null;
}

export async function putPlayerAccount(env, accountKey, account) {
  const value = JSON.stringify(account);
  if (env.COMMERCE_DB) {
    try {
      const now = String(account?.updatedAt || new Date().toISOString());
      await env.COMMERCE_DB.prepare(
        "INSERT INTO player_accounts (player_key, account_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(player_key) DO UPDATE SET account_json = excluded.account_json, updated_at = excluded.updated_at"
      ).bind(accountKey, value, now).run();
      return;
    } catch { /* Older test/local schemas fall back to KV. */ }
  }
  if (!env.FEEDBACK_STORE) throw new Error("Player storage is unavailable.");
  await env.FEEDBACK_STORE.put(accountKey, value);
}

export async function deletePlayerAccount(env, accountKey) {
  if (env.COMMERCE_DB) {
    await env.COMMERCE_DB.batch([
      env.COMMERCE_DB.prepare("DELETE FROM player_sessions WHERE account_key = ?").bind(accountKey),
      env.COMMERCE_DB.prepare("DELETE FROM leaderboard_entries WHERE player_key = ?").bind(accountKey),
      env.COMMERCE_DB.prepare("DELETE FROM leaderboard_profiles WHERE player_key = ?").bind(accountKey),
      env.COMMERCE_DB.prepare("DELETE FROM player_accounts WHERE player_key = ?").bind(accountKey)
    ]);
  }
  // Remove the legacy copy too, otherwise the KV fallback can resurrect it.
  if (env.FEEDBACK_STORE) await env.FEEDBACK_STORE.delete(accountKey);
}

export async function putPlayerSession(env, sessionKey, session, ttlSeconds) {
  if (env.COMMERCE_DB) {
    try {
      const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
      await env.COMMERCE_DB.prepare(
        "INSERT INTO player_sessions (session_key, account_key, account_name, created_at, last_used_at, expires_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(session_key) DO UPDATE SET account_key = excluded.account_key, account_name = excluded.account_name, last_used_at = excluded.last_used_at, expires_at = excluded.expires_at"
      ).bind(sessionKey, session.accountKey, session.accountName, session.createdAt, session.lastUsedAt, expiresAt).run();
      return;
    } catch { /* Older test/local schemas fall back to KV. */ }
  }
  if (!env.FEEDBACK_STORE) throw new Error("Player storage is unavailable.");
  await env.FEEDBACK_STORE.put(sessionKey, JSON.stringify(session), { expirationTtl: ttlSeconds });
}

export async function getPlayerSession(env, sessionKey) {
  if (env.COMMERCE_DB) {
    try {
      const row = await env.COMMERCE_DB.prepare(
        "SELECT account_key AS accountKey, account_name AS accountName, created_at AS createdAt, last_used_at AS lastUsedAt FROM player_sessions WHERE session_key = ? AND expires_at > ?"
      ).bind(sessionKey, Math.floor(Date.now() / 1000)).first();
      if (row?.accountKey) return row;
    } catch { /* Older test/local schemas fall back to KV. */ }
  }
  return env.FEEDBACK_STORE ? env.FEEDBACK_STORE.get(sessionKey, "json") : null;
}

export async function putEphemeralAuth(env, key, value, ttlSeconds) {
  if (env.COMMERCE_DB) {
    try {
      await env.COMMERCE_DB.prepare(
        "INSERT INTO auth_ephemeral (auth_key, value_json, expires_at) VALUES (?, ?, ?) ON CONFLICT(auth_key) DO UPDATE SET value_json = excluded.value_json, expires_at = excluded.expires_at"
      ).bind(key, JSON.stringify(value), Math.floor(Date.now() / 1000) + ttlSeconds).run();
      return;
    } catch { /* Older test/local schemas fall back to KV. */ }
  }
  if (!env.FEEDBACK_STORE) throw new Error("Player storage is unavailable.");
  await env.FEEDBACK_STORE.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
}

export async function getEphemeralAuth(env, key) {
  if (env.COMMERCE_DB) {
    try {
      const row = await env.COMMERCE_DB.prepare(
        "SELECT value_json AS valueJson FROM auth_ephemeral WHERE auth_key = ? AND expires_at > ?"
      ).bind(key, Math.floor(Date.now() / 1000)).first();
      const value = parseJson(row?.valueJson);
      if (value !== null) return value;
    } catch { /* Older test/local schemas fall back to KV. */ }
  }
  return env.FEEDBACK_STORE ? env.FEEDBACK_STORE.get(key, "json") : null;
}

export async function deleteEphemeralAuth(env, key) {
  if (env.COMMERCE_DB) {
    try {
      await env.COMMERCE_DB.prepare("DELETE FROM auth_ephemeral WHERE auth_key = ?").bind(key).run();
      return;
    } catch { /* Older test/local schemas fall back to KV. */ }
  }
  if (env.FEEDBACK_STORE) await env.FEEDBACK_STORE.delete(key);
}
