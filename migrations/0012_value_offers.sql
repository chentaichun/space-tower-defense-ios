-- Monthly value packs and the Invincible Pass.
-- Every reward (pack purchase or pass level claim) becomes one ledger row with a
-- unique source key; player saves apply rows above their last applied id.
CREATE TABLE IF NOT EXISTS offer_purchases (
  purchase_token TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  product_id TEXT NOT NULL,
  month TEXT NOT NULL,
  order_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS offer_purchases_player_month ON offer_purchases (player_key, month);

CREATE TABLE IF NOT EXISTS offer_reward_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_key TEXT NOT NULL,
  source TEXT NOT NULL UNIQUE,
  rewards TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS offer_reward_ledger_player ON offer_reward_ledger (player_key, id);

CREATE TABLE IF NOT EXISTS monthly_pass (
  player_key TEXT NOT NULL,
  month TEXT NOT NULL,
  noble INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  login_day TEXT NOT NULL DEFAULT '',
  wave_day TEXT NOT NULL DEFAULT '',
  wave_xp INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (player_key, month)
);
