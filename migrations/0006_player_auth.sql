CREATE TABLE IF NOT EXISTS player_accounts (
  player_key TEXT PRIMARY KEY,
  account_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS player_sessions (
  session_key TEXT PRIMARY KEY,
  account_key TEXT NOT NULL,
  account_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS player_sessions_account_idx
  ON player_sessions (account_key);

CREATE INDEX IF NOT EXISTS player_sessions_expiry_idx
  ON player_sessions (expires_at);

CREATE TABLE IF NOT EXISTS auth_ephemeral (
  auth_key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_ephemeral_expiry_idx
  ON auth_ephemeral (expires_at);
