-- Bronze landing for ESPN match results (fact source). Raw, append/replace by espn_id.
CREATE TABLE IF NOT EXISTS bronze_espn_results (
  espn_id    TEXT PRIMARY KEY,
  date_utc   TEXT,
  home_team  TEXT,
  away_team  TEXT,
  home_score INTEGER,
  away_score INTEGER,
  status     TEXT,
  fetched_at TEXT
);
