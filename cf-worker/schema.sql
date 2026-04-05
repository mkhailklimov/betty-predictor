CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tg_id TEXT UNIQUE NOT NULL,
  username TEXT,
  is_premium INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  predictions_count INTEGER DEFAULT 0,
  tours_played INTEGER DEFAULT 0,
  ton_wallet TEXT,
  ton_consent INTEGER DEFAULT 0,
  ton_earned REAL DEFAULT 0,
  ton_distributed REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  date TEXT,
  time TEXT,
  round TEXT,
  status TEXT DEFAULT 'upcoming',
  home_score INTEGER,
  away_score INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  prediction_type TEXT NOT NULL,
  predicted_score TEXT,
  points_earned INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  week INTEGER,
  points INTEGER,
  ton_amount REAL,
  status TEXT DEFAULT 'pending',
  claimed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_tg_id ON users(tg_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
