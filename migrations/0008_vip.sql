CREATE TABLE IF NOT EXISTS vip_subscriptions (
  player_key TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('google_play', 'apple_store')),
  purchase_token TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  verified_at INTEGER NOT NULL,
  transaction_id TEXT NOT NULL DEFAULT '',
  environment TEXT NOT NULL DEFAULT 'Production'
);

CREATE TABLE IF NOT EXISTS vip_obsidian_purchases (
  id TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  turret_id TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('rare', 'legendary')),
  price INTEGER NOT NULL CHECK (price > 0),
  shards INTEGER NOT NULL CHECK (shards IN (0, 10)),
  week_key TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS vip_rare_once
  ON vip_obsidian_purchases(player_key, turret_id) WHERE rarity = 'rare';

CREATE UNIQUE INDEX IF NOT EXISTS vip_legendary_weekly_limit
  ON vip_obsidian_purchases(player_key, week_key) WHERE rarity = 'legendary';

CREATE INDEX IF NOT EXISTS vip_purchases_player
  ON vip_obsidian_purchases(player_key, created_at DESC);
