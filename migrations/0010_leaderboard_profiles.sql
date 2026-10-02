CREATE TABLE IF NOT EXISTS leaderboard_profiles (
  player_key TEXT PRIMARY KEY,
  public_name TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  suppressed INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS leaderboard_profiles_name_idx
  ON leaderboard_profiles (public_name);
