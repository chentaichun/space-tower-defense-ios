CREATE TABLE IF NOT EXISTS commerce_entitlements (
  player_key TEXT NOT NULL,
  entitlement TEXT NOT NULL,
  product_id TEXT NOT NULL,
  purchase_token TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  grant_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  granted_at TEXT NOT NULL,
  PRIMARY KEY (player_key, entitlement)
);

CREATE INDEX IF NOT EXISTS commerce_entitlements_player_idx
  ON commerce_entitlements (player_key, granted_at);
