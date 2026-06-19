-- Switch results fact-source to FIFA (api.fifa.com). Generic, source-agnostic
-- bronze landing replaces the ESPN-specific table.
DROP TABLE IF EXISTS bronze_espn_results;

CREATE TABLE IF NOT EXISTS bronze_match_results (
  source     TEXT,
  source_id  TEXT,
  date_utc   TEXT,
  home_team  TEXT,
  away_team  TEXT,
  home_score INTEGER,
  away_score INTEGER,
  status     TEXT,
  fetched_at TEXT,
  PRIMARY KEY (source, source_id)
);
