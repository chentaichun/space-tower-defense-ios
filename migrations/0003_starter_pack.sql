CREATE TABLE IF NOT EXISTS starter_pack_purchases (
  player_key TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  purchase_token TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  grant_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  granted_at TEXT
);
