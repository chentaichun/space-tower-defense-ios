PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS commerce_wallets (
  player_key TEXT PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_purchased INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_purchased >= 0),
  first_purchase_claimed INTEGER NOT NULL DEFAULT 0 CHECK (first_purchase_claimed IN (0, 1)),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commerce_orders (
  id TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  player_name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  base_amount INTEGER NOT NULL CHECK (base_amount > 0),
  max_bonus_amount INTEGER NOT NULL DEFAULT 0 CHECK (max_bonus_amount >= 0),
  credited_amount INTEGER,
  currency TEXT NOT NULL,
  unit_amount INTEGER NOT NULL CHECK (unit_amount > 0),
  provider TEXT NOT NULL,
  provider_session_id TEXT UNIQUE,
  provider_payment_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'fulfilled', 'cancelled', 'failed', 'refunded')),
  processing_token TEXT,
  failure_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  fulfilled_at TEXT
);

CREATE INDEX IF NOT EXISTS commerce_orders_player_created
  ON commerce_orders(player_key, created_at DESC);

CREATE INDEX IF NOT EXISTS commerce_orders_provider_session
  ON commerce_orders(provider_session_id);

CREATE TABLE IF NOT EXISTS commerce_wallet_ledger (
  id TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  delta INTEGER NOT NULL CHECK (delta > 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES commerce_orders(id)
);

CREATE INDEX IF NOT EXISTS commerce_ledger_player_created
  ON commerce_wallet_ledger(player_key, created_at DESC);
