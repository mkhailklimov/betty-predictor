# Betty Predictor — Masterdata Reference

This document describes the data model used by Betty Predictor. **D1 is the primary data store**. Google Sheets is used for manual match input and monitoring.

---

## Data Sources

| Source | ID | Purpose |
|--------|----|---------|
| **D1 Database** | `betty-db` (`a064b461-a310-484e-80de-66a684e71c7c`) | Primary data store — all tables live here |
| **Google Sheet (Data)** | [`1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus`](https://docs.google.com/spreadsheets/d/1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus) | Admin input for matches + backup/monitoring mirror |
| **Google Sheet (Masterdata)** | [`1YNbdBiJs30ftSI-KHApp3DpJSlKRpsDNltKAbazkPRI`](https://docs.google.com/spreadsheets/d/1YNbdBiJs30ftSI-KHApp3DpJSlKRpsDNltKAbazkPRI) | Field descriptions and data dictionary |

### Data Flow

```
Google Sheet (admin fills matches)
  → Sync to D1 matches table
  → App reads from D1

TG App (user places bets)
  → Bets saved to D1
  → After all matches in a week end:
      → Compute Champions (weekly results)
      → Update Leaderboard (all-time)
      → Award TON to weekly winner
  → Sync snapshots to Google Sheet for monitoring
```

---

## Table 1: Matches

Source of truth for match schedule. Admin enters matches in Google Sheet, synced to D1.

### D1 Schema

```sql
CREATE TABLE matches (
  id              INTEGER PRIMARY KEY,           -- Sequential: 1, 2, 3, ...
  week_id         TEXT NOT NULL,                  -- Format: YYYY_WW (e.g., '2026_24')
  match_date_utc  TEXT NOT NULL,                  -- Kickoff UTC: '2026-06-12 01:00:00'
  match_date_local TEXT,                          -- Display: '06/11/2026 9:00 PM ET'
  league          TEXT DEFAULT 'WC',              -- Competition: WC = World Cup
  grp             TEXT,                           -- Group: A-L, R16, QF, SF, F
  home_team       TEXT NOT NULL,
  away_team       TEXT NOT NULL,
  venue           TEXT,
  card_home       TEXT,                           -- Image filename: MEX.png
  card_away       TEXT,                           -- Image filename: SAF.png
  is_active       INTEGER DEFAULT 0,             -- 0=hidden, 1=open, 2=locked, 3=ended
  result          TEXT,                           -- NULL until ended. '1'=home win, 'X'=draw, '2'=away win
  score_home      INTEGER,                        -- NULL until ended. Goals scored by home team
  score_away      INTEGER                         -- NULL until ended. Goals scored by away team
);
```

### Is Active Status Codes

| Code | Name | Visible | Bettable | Description |
|------|------|---------|----------|-------------|
| **0** | Hidden | No | No | Match scheduled but not yet open |
| **1** | Open | Yes | Yes | Predictions accepted until kickoff |
| **2** | Locked | Yes | No | Match started, betting closed |
| **3** | Ended | Yes | No | Match finished, result + scores filled |

### Lifecycle

```
0 (Hidden) → 1 (Open) → 2 (Locked at kickoff) → 3 (Ended, result filled) 
```

### Google Sheet Columns (Matches tab)

| Sheet Column | Maps to D1 | Notes |
|-------------|------------|-------|
| Match ID | id | Sequential number |
| Week ID | week_id | YYYY_WW format |
| Weekstart | — | Human-readable week start date |
| Matchdate Universal time | match_date_utc | |
| Matchdate Local Time | match_date_local | |
| League | league | |
| Group | grp | |
| Home Team | home_team | |
| Away Team | away_team | |
| Venue | venue | |
| Card Name Home | card_home | |
| Card Name Away | card_away | |
| Is active | is_active | |
| Result | result | 1 / X / 2 |
| Score_1 | score_home | |
| Score_2 | score_away | |

---

## Table 2: Bets

All predictions placed by players. One bet per user per match. Users can update until kickoff.

### D1 Schema

```sql
CREATE TABLE bets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT NOT NULL,                  -- FK → users.tg_id
  match_id        INTEGER NOT NULL,               -- FK → matches.id
  week_id         TEXT NOT NULL,                  -- Denormalized from match for fast queries
  prediction      TEXT NOT NULL,                  -- '1', 'X', or '2'
  score_home      INTEGER NOT NULL,               -- Predicted home goals
  score_away      INTEGER NOT NULL,               -- Predicted away goals
  points_earned   INTEGER,                        -- NULL until match ends. 0, 1, or 3
  created_at      TEXT DEFAULT (datetime('now')), -- First bet placed
  updated_at      TEXT DEFAULT (datetime('now')), -- Last modification
  UNIQUE(user_id, match_id)                       -- One bet per user per match
);
```

### Scoring Rules

| Prediction | Points | Description |
|------------|--------|-------------|
| Wrong | **0** | Neither outcome nor score correct |
| Correct outcome (1/X/2) | **+1** | Predicted the right result |
| Correct exact score | **3** | Predicted the exact score (includes correct outcome). This is the total, not added to +1. |

### Rules

- One bet per user per match (UNIQUE constraint, upsert on update)
- Bets lock at kickoff (`match_date_utc`) — backend rejects with 403 after this time
- `points_earned` stays NULL until match status → 3 (Ended), then computed
- `updated_at` is used as tiebreaker for TON distribution (earlier = better)

---

## Table 3: Champions

Weekly results per player. Computed after all matches in a week end. Powers the Champions page.

### D1 Schema

```sql
CREATE TABLE champions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id           TEXT NOT NULL,                -- '2026_24'
  user_id           TEXT NOT NULL,                -- FK → users.tg_id
  username          TEXT,                         -- Display name (snapshot at computation time)
  total_points      INTEGER DEFAULT 0,            -- Sum of points_earned from bets this week
  correct_outcomes  INTEGER DEFAULT 0,            -- Count of bets with correct 1/X/2
  correct_scores    INTEGER DEFAULT 0,            -- Count of bets with exact score match
  matches_predicted INTEGER DEFAULT 0,            -- How many matches the user bet on
  last_bet_at       TEXT,                         -- UTC of user's latest updated_at in bets for this week
  rank              INTEGER,                      -- 1 = best, computed after sorting
  ton_earned        REAL DEFAULT 0.0,             -- TON awarded this week (1.0 for winner, 0 for rest)
  computed_at       TEXT DEFAULT (datetime('now')),
  UNIQUE(week_id, user_id)
);
```

### Computation Logic

```
For each user who placed bets in this week_id:
  1. Sum points_earned from bets WHERE week_id = X AND user_id = Y
  2. Count correct outcomes (points_earned >= 1)
  3. Count correct scores (points_earned >= 3)
  4. Get MAX(updated_at) from bets as last_bet_at
  5. Rank by total_points DESC, last_bet_at ASC
  6. Rank 1 gets ton_earned = 1.0
```

### When to Compute

Triggered when the last match of a week transitions to `is_active = 3` (Ended).

---

## Table 4: Leaderboard

All-time player rankings. Aggregated from Champions table. Powers the Leaderboard page.

### D1 Schema

```sql
CREATE TABLE leaderboard (
  user_id           TEXT PRIMARY KEY,             -- FK → users.tg_id
  username          TEXT,                         -- Display name
  total_points      INTEGER DEFAULT 0,            -- Sum across all weeks
  correct_outcomes  INTEGER DEFAULT 0,
  correct_scores    INTEGER DEFAULT 0,
  weeks_played      INTEGER DEFAULT 0,            -- Number of weeks participated
  weeks_won         INTEGER DEFAULT 0,            -- Number of weeks ranked #1
  ton_earned        REAL DEFAULT 0.0,             -- Total TON earned all-time
  ton_distributed   REAL DEFAULT 0.0,             -- Total TON actually sent to wallet
  updated_at        TEXT DEFAULT (datetime('now'))
);
```

### Computation Logic

```sql
-- Recompute from champions table:
SELECT
  user_id,
  username,
  SUM(total_points) as total_points,
  SUM(correct_outcomes) as correct_outcomes,
  SUM(correct_scores) as correct_scores,
  COUNT(*) as weeks_played,
  SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) as weeks_won,
  SUM(ton_earned) as ton_earned
FROM champions
GROUP BY user_id
ORDER BY total_points DESC;
```

---

## Table 5: Users

Registered players. Created automatically on first Telegram Mini App open.

### D1 Schema

```sql
CREATE TABLE users (
  id              TEXT PRIMARY KEY,               -- UUID
  tg_id           TEXT UNIQUE NOT NULL,            -- Telegram user ID
  username        TEXT,                            -- Display name
  first_name      TEXT,
  last_name       TEXT,
  is_premium      INTEGER DEFAULT 0,              -- Telegram Premium: 0/1
  ton_wallet      TEXT,                            -- TON wallet address for payouts
  ton_consent     INTEGER DEFAULT 0,              -- Agreed to receive TON: 0/1
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);
```

---

## TON Distribution Rules

### Current Stage (audience building)

| Rule | Value |
|------|-------|
| **Prize pool per week** | **1 TON** |
| **Winner** | Player with **maximum points** in the week |
| **Tiebreaker** | Player whose **last bet was placed earliest** (MIN `last_bet_at`) |
| **Principle** | First come, first served — early bettors rewarded |

### Distribution Flow

```
1. All matches in week end (is_active → 3)
2. Compute Champions table for the week
3. Rank: ORDER BY total_points DESC, last_bet_at ASC
4. Rank 1 → ton_earned = 1.0
5. Update Leaderboard (aggregate all Champions)
6. Winner sees reward in app → provides TON wallet
7. Admin transfers 1 TON → ton_distributed updated
```

### Future Stages

Prize pool and distribution rules will expand as audience grows. The schema supports any distribution model — just update `ton_earned` in Champions.
