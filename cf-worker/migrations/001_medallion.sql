-- Medallion + Kimball star schema (bronze adjustments, silver, gold).
-- Additive only: does not touch existing operational tables (users/predictions/matches).

CREATE TABLE IF NOT EXISTS bronze_adjustments (
  id           TEXT PRIMARY KEY,
  week_id      TEXT NOT NULL,
  user_id      TEXT NOT NULL,
  points_delta INTEGER NOT NULL,
  reason       TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

-- silver: dimensions
CREATE TABLE IF NOT EXISTS silver_dim_user (
  user_id     TEXT PRIMARY KEY,
  tg_id       TEXT,
  username    TEXT,
  is_premium  INTEGER DEFAULT 0,
  fav_team    TEXT,
  is_internal INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS silver_dim_week (
  week_id   TEXT PRIMARY KEY,
  label     TEXT,
  weekstart TEXT
);

CREATE TABLE IF NOT EXISTS silver_dim_team (
  team TEXT PRIMARY KEY,
  code TEXT
);

-- silver: facts
CREATE TABLE IF NOT EXISTS silver_fact_bet (
  user_id      TEXT,
  match_id     TEXT,
  week_id      TEXT,
  pred_outcome TEXT,
  pred_home    INTEGER,
  pred_away    INTEGER,
  updated_at   TEXT,
  PRIMARY KEY (user_id, match_id)
);

CREATE TABLE IF NOT EXISTS silver_fact_result (
  match_id   TEXT PRIMARY KEY,
  week_id    TEXT,
  home_team  TEXT,
  away_team  TEXT,
  home_score INTEGER,
  away_score INTEGER,
  outcome    TEXT,
  is_final   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS silver_fact_score (
  user_id            TEXT,
  match_id           TEXT,
  week_id            TEXT,
  points_base        INTEGER,
  is_correct_outcome INTEGER,
  is_correct_score   INTEGER,
  PRIMARY KEY (user_id, match_id)
);

-- gold: marts
CREATE TABLE IF NOT EXISTS gold_champions (
  week_id           TEXT,
  user_id           TEXT,
  username          TEXT,
  total_points      INTEGER,
  correct_outcomes  INTEGER,
  correct_scores    INTEGER,
  matches_predicted INTEGER,
  adjustment_points INTEGER DEFAULT 0,
  last_bet_at       TEXT,
  rank              INTEGER,
  computed_at       TEXT,
  PRIMARY KEY (week_id, user_id)
);

CREATE TABLE IF NOT EXISTS gold_leaderboard (
  user_id          TEXT PRIMARY KEY,
  username         TEXT,
  is_premium       INTEGER DEFAULT 0,
  fav_team         TEXT,
  total_points     INTEGER,
  correct_outcomes INTEGER,
  correct_scores   INTEGER,
  weeks_played     INTEGER,
  weeks_won        INTEGER,
  computed_at      TEXT
);
