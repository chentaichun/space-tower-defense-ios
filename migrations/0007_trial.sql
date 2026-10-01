CREATE TABLE IF NOT EXISTS trial_runs (
  id TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  tier INTEGER NOT NULL,
  day_key TEXT NOT NULL,
  week_key TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  reached_wave INTEGER NOT NULL DEFAULT 0,
  finished_at INTEGER,
  ad_entry INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS trial_runs_daily_idx ON trial_runs(player_key, day_key);
CREATE TABLE IF NOT EXISTS trial_ad_bonus (
  player_key TEXT NOT NULL,
  day_key TEXT NOT NULL,
  PRIMARY KEY(player_key, day_key)
);
CREATE TABLE IF NOT EXISTS trial_ad_intents (
  id TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  day_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  verified_at INTEGER,
  transaction_id TEXT UNIQUE
);
CREATE INDEX IF NOT EXISTS trial_ad_intents_player_idx ON trial_ad_intents(player_key, day_key);
CREATE TABLE IF NOT EXISTS trial_weekly_best (
  week_key TEXT NOT NULL,
  tier INTEGER NOT NULL,
  player_key TEXT NOT NULL,
  best_wave INTEGER NOT NULL,
  achieved_at INTEGER NOT NULL,
  PRIMARY KEY(week_key, tier, player_key)
);
CREATE INDEX IF NOT EXISTS trial_weekly_rank_idx ON trial_weekly_best(week_key, tier, best_wave DESC, achieved_at ASC);
CREATE TABLE IF NOT EXISTS trial_reward_ledger (
  reward_key TEXT PRIMARY KEY,
  player_key TEXT NOT NULL,
  obsidian INTEGER NOT NULL DEFAULT 0,
  shard_id TEXT NOT NULL DEFAULT '',
  shards INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS trial_reward_player_idx ON trial_reward_ledger(player_key);
