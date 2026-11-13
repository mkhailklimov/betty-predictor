-- Leagues: a channel's own table inside Betty (first one: Master League, Arvin's
-- Persian channels, season from week 2026_49 = Mon 30 Nov 2026).
--
-- ADDITIVE ONLY. A rolled-back Worker ignores these tables.
--
-- Players join with t.me/bettyscores_bot/app?startapp=league_<id>. One league per
-- player (user_id is the key). The league table sums the player's gold_champions
-- rows from season_start_week on, so it uses exactly the main game's points.

CREATE TABLE IF NOT EXISTS leagues (
  id                TEXT PRIMARY KEY,          -- slug used in the join link, e.g. 'master'
  name              TEXT NOT NULL,             -- shown in the app, e.g. 'Master League'
  season_start_week TEXT NOT NULL,             -- first week_id that counts, e.g. '2026_49'
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS league_members (
  user_id   TEXT PRIMARY KEY,                  -- users.id; one league per player
  league_id TEXT NOT NULL REFERENCES leagues(id),
  joined_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_league_members_league ON league_members (league_id);

INSERT OR IGNORE INTO leagues (id, name, season_start_week) VALUES ('master', 'Master League', '2026_49');
