PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS space_coin_wallets (
  player_key TEXT PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_purchased INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_purchased >= 0),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS space_coin_wallet_ledger (
  id TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  delta INTEGER NOT NULL CHECK (delta > 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id)
);

CREATE INDEX IF NOT EXISTS space_coin_ledger_player_created
  ON space_coin_wallet_ledger(player_key, created_at DESC);
