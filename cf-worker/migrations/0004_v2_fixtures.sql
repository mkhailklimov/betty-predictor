-- v2.0 — fixture pipeline (§5.1 of docs/RELEASE-2.0.md)
--
-- ADDITIVE ONLY. A rolled-back v1 Worker must still run against this schema:
-- new tables it never reads, and new nullable columns on `matches` it ignores.
-- No drops, no renames, no type changes. See §4.1.

-- Raw league fixtures as pulled from the feed. One row per (source, source_id);
-- re-ingesting the same fixture overwrites it, so kickoff moves are picked up.
CREATE TABLE IF NOT EXISTS bronze_fixtures (
  source      TEXT NOT NULL,          -- 'espn'
  source_id   TEXT NOT NULL,          -- feed event id, stable across pulls
  league      TEXT NOT NULL,          -- our slug, e.g. 'eng.1'
  league_name TEXT,                   -- human label from the feed
  kickoff_utc TEXT NOT NULL,          -- ISO 8601 Z
  home_team   TEXT NOT NULL,
  away_team   TEXT NOT NULL,
  home_code   TEXT,                   -- feed abbreviation
  away_code   TEXT,
  home_crest  TEXT,                   -- logo URL — club football has no TEAM_CARDS entry
  away_crest  TEXT,
  status      TEXT,                   -- 'scheduled' | 'live' | 'finished'
  fetched_at  TEXT,
  PRIMARY KEY (source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_bronze_fixtures_kickoff ON bronze_fixtures (kickoff_utc);

-- The weekly game itself. week_id is the existing 'YYYY_WW' convention already
-- carried on matches.week_id and gold_champions.week_id.
CREATE TABLE IF NOT EXISTS weeks (
  week_id      TEXT PRIMARY KEY,
  starts_at    TEXT NOT NULL,         -- Monday 00:00 UTC
  ends_at      TEXT NOT NULL,         -- Sunday 23:59:59 UTC
  status       TEXT NOT NULL DEFAULT 'draft',  -- draft | published | closed
  published_at TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

-- Provenance on the served fixture, so a published match can be traced back to
-- the feed row it came from (and de-duplicated against it).
ALTER TABLE matches ADD COLUMN league TEXT;
ALTER TABLE matches ADD COLUMN source TEXT;
ALTER TABLE matches ADD COLUMN source_id TEXT;
ALTER TABLE matches ADD COLUMN crest_home TEXT;
ALTER TABLE matches ADD COLUMN crest_away TEXT;
-- Feed abbreviations. The frontend prefers the crest, but a national-team
-- fixture can still hit the local TEAM_CARDS art when the code is one we have.
ALTER TABLE matches ADD COLUMN code_home TEXT;
ALTER TABLE matches ADD COLUMN code_away TEXT;

CREATE INDEX IF NOT EXISTS idx_matches_week ON matches (week_id);
