-- v2.1 — Fun prediction challenges (RELEASE-2.1.md §5)
--
-- ADDITIVE ONLY. New tables + new nullable columns on `users`.
-- A rolled-back v2.0 Worker ignores these tables entirely.

-- Challenge questions: 5-6 per week, hand-curated in Betty_Master_Data.
CREATE TABLE IF NOT EXISTS challenges (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  week_id        TEXT NOT NULL,
  match_id       TEXT,                          -- links to matches table; NULL for combo questions
  type           TEXT NOT NULL,                 -- exact_score | will_score | over_under | clean_sheet | first_to_score
  question       TEXT NOT NULL,                 -- "Will Haaland score against Everton?"
  options        TEXT NOT NULL,                 -- JSON: ["Yes","No"] or ["Over","Under"] or ["Home","Away","Nobody"]
  points         INTEGER NOT NULL,              -- max points for correct answer
  correct_answer TEXT,                          -- filled after match: "Yes", "Over", "2:1", etc.
  resolved_at    TEXT,                          -- when the answer was set
  created_at     TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (week_id) REFERENCES weeks(week_id)
);

CREATE INDEX IF NOT EXISTS idx_challenges_week ON challenges (week_id);

-- User answers to challenges.
CREATE TABLE IF NOT EXISTS challenge_predictions (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id        TEXT NOT NULL,
  challenge_id   TEXT NOT NULL,
  answer         TEXT NOT NULL,                 -- "Yes", "Over", "Home", "2:1", etc.
  points_earned  INTEGER DEFAULT 0,             -- set when challenge is resolved
  created_at     TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_preds_user ON challenge_predictions (user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_preds_challenge ON challenge_predictions (challenge_id);

-- Multi-platform identity: nickname registration from YouTube/TikTok/Facebook.
-- Existing telegram users get provider='telegram', display_name=username.
ALTER TABLE users ADD COLUMN provider TEXT;        -- telegram | youtube | tiktok | facebook | web
ALTER TABLE users ADD COLUMN display_name TEXT;     -- the nickname they chose
ALTER TABLE users ADD COLUMN avatar_url TEXT;
