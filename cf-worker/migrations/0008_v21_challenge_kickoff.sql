-- v2.1 — per-challenge kickoff lock (bug: started matches still predictable).
--
-- ADDITIVE ONLY. Nullable columns; a rolled-back Worker ignores them.
--
-- A challenge locks at its own kickoff_utc, so lockout no longer depends on a
-- linked `matches` row (the 2026_41 preview challenges had none, so they never
-- locked). home_team / away_team carry the fixture label for display when no
-- match row is linked.

ALTER TABLE challenges ADD COLUMN kickoff_utc TEXT;   -- ISO 8601 UTC, e.g. 2026-10-17T11:30:00Z
ALTER TABLE challenges ADD COLUMN home_team TEXT;
ALTER TABLE challenges ADD COLUMN away_team TEXT;
ALTER TABLE challenges ADD COLUMN source_id TEXT;     -- ESPN event id when known

CREATE INDEX IF NOT EXISTS idx_challenges_kickoff ON challenges (week_id, kickoff_utc);

-- Backfill from linked matches where one exists.
UPDATE challenges
SET kickoff_utc = COALESCE(
      (SELECT COALESCE(m.match_date_utc, m.time) FROM matches m WHERE m.id = challenges.match_id),
      kickoff_utc),
    home_team = COALESCE(home_team, (SELECT m.home_team FROM matches m WHERE m.id = challenges.match_id)),
    away_team = COALESCE(away_team, (SELECT m.away_team FROM matches m WHERE m.id = challenges.match_id))
WHERE match_id IS NOT NULL;
