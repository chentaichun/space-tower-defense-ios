CREATE TABLE IF NOT EXISTS ranked_profiles (
  player_key TEXT PRIMARY KEY,
  rating INTEGER NOT NULL DEFAULT 1200 CHECK(rating >= 0),
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  reward_total INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS ranked_results (
  match_id TEXT NOT NULL,
  player_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  rating_after INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  losses INTEGER NOT NULL,
  obsidian INTEGER NOT NULL,
  opponent_kind TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(match_id,player_key)
);
CREATE TRIGGER IF NOT EXISTS ranked_result_apply AFTER INSERT ON ranked_results BEGIN
  INSERT INTO ranked_profiles(player_key,rating,wins,losses,reward_total)
  VALUES(NEW.player_key,NEW.rating_after,NEW.wins,NEW.losses,NEW.obsidian)
  ON CONFLICT(player_key) DO UPDATE SET rating=NEW.rating_after,wins=NEW.wins,losses=NEW.losses,reward_total=ranked_profiles.reward_total+NEW.obsidian;
END;
