CREATE TABLE IF NOT EXISTS leaderboard_entries (
  player_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1,
  wave INTEGER NOT NULL DEFAULT 1,
  is_guest INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS leaderboard_rank_idx
  ON leaderboard_entries (tier DESC, wave DESC, display_name ASC);
