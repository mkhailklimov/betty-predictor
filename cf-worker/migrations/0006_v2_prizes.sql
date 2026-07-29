-- v2.0 — Stars prizes (§5.5 of docs/RELEASE-2.0.md)
--
-- ADDITIVE ONLY. New table; no drops or renames.

CREATE TABLE IF NOT EXISTS weekly_prizes (
  id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  week_id   TEXT NOT NULL,
  rank      INTEGER NOT NULL,
  user_id   TEXT NOT NULL,
  stars     INTEGER NOT NULL,           -- 100 for 1st, 50 for 2nd
  status    TEXT NOT NULL DEFAULT 'owed',  -- owed | paid | void
  awarded_at TEXT DEFAULT (datetime('now')),
  paid_at   TEXT,
  note      TEXT,
  UNIQUE(week_id, rank)
);

CREATE INDEX IF NOT EXISTS idx_weekly_prizes_user ON weekly_prizes (user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_prizes_week ON weekly_prizes (week_id);
