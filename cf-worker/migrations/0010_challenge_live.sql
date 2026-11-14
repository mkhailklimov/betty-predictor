-- Release 2.2: the 90-minute score of each card, fetched from ESPN 120 minutes after
-- kickoff, so a card can show the final score and the player's points at once.
--
-- ADDITIVE ONLY. Display only: official points and prizes still come from the admin
-- resolve (challenges.correct_answer), so an ESPN mistake never touches the tables.

CREATE TABLE IF NOT EXISTS challenge_live (
  challenge_id TEXT PRIMARY KEY,   -- challenges.id
  score        TEXT,               -- '2:1' after 90 minutes (extra time and penalties left out)
  status       TEXT,               -- ESPN status, e.g. STATUS_FULL_TIME, STATUS_FINAL_PEN
  final        INTEGER DEFAULT 0,  -- 1 when ESPN marks the match completed
  fetched_at   TEXT DEFAULT (datetime('now'))
);
