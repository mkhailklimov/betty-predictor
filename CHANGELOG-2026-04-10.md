# Changelog — April 10, 2026

## Summary

Data model redesign: created 3 new D1 tables (bets, champions, leaderboard), migrated existing predictions, updated Google Sheet with monitoring tabs, new Betty logo, and match schedule improvements.

---

## D1 Database Changes

### New Tables

| Table | Purpose | Rows |
|-------|---------|------|
| **bets** | All player predictions (replaces predictions table) | 21 (migrated) |
| **champions** | Weekly results per player (computed after week ends) | 0 (pending) |
| **leaderboard** | All-time player rankings (aggregated from champions) | 0 (pending) |

### Matches Table — New Columns
| Column | Type | Purpose |
|--------|------|---------|
| week_id | TEXT | Week identifier: YYYY_WW format (e.g., 2026_24) |
| result | TEXT | Match result: 1/X/2 (NULL until match ends) |
| match_date_utc | TEXT | Kickoff in UTC |
| match_date_local | TEXT | Kickoff display string (ET) |

### Data Migration
- 21 predictions migrated from old `predictions` table → new `bets` table
- All 10 Week 1 matches backfilled with week_id = `2026_24`, match_date_utc, match_date_local
- Old `predictions` and `rewards` tables kept for reference (not deleted)

### Bets Table Schema
```sql
CREATE TABLE bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  week_id TEXT NOT NULL,
  prediction TEXT NOT NULL,       -- 1, X, 2
  score_home INTEGER NOT NULL,
  score_away INTEGER NOT NULL,
  points_earned INTEGER,          -- NULL → 0/1/3/4 after match ends
  created_at TEXT,
  updated_at TEXT,
  UNIQUE(user_id, match_id)
);
```

### Champions Table Schema
```sql
CREATE TABLE champions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT,
  total_points INTEGER DEFAULT 0,
  correct_outcomes INTEGER DEFAULT 0,
  correct_scores INTEGER DEFAULT 0,
  matches_predicted INTEGER DEFAULT 0,
  last_bet_at TEXT,               -- Tiebreaker: earliest wins
  rank INTEGER,
  ton_earned REAL DEFAULT 0.0,    -- 1.0 for rank 1, 0 for rest
  computed_at TEXT,
  UNIQUE(week_id, user_id)
);
```

### Leaderboard Table Schema
```sql
CREATE TABLE leaderboard (
  user_id TEXT PRIMARY KEY,
  username TEXT,
  total_points INTEGER DEFAULT 0,
  correct_outcomes INTEGER DEFAULT 0,
  correct_scores INTEGER DEFAULT 0,
  weeks_played INTEGER DEFAULT 0,
  weeks_won INTEGER DEFAULT 0,
  ton_earned REAL DEFAULT 0.0,
  ton_distributed REAL DEFAULT 0.0,
  updated_at TEXT
);
```

---

## Google Sheet Updates

### Matches Tab — New Columns
| Column | Description |
|--------|-------------|
| Match ID (L) | Sequential number: 1–34 |
| Week ID (M) | 2026_24 (Week 1), 2026_25 (Week 2) |
| Result (N) | 1/X/2 — to be filled after match |
| Score_1 (O) | Home goals |
| Score_2 (P) | Away goals |

### New Tabs Created
| Tab | Headers | Purpose |
|-----|---------|---------|
| **Bets** | ID, User ID, Match ID, Week ID, Prediction, Score_1, Score_2, Points Earned, Created At, Updated At | Mirror of D1 bets table |
| **Champions** | ID, Week ID, User ID, Username, Total Points, Correct Outcomes, Correct Scores, Matches Predicted, Last Bet At, Rank, TON Earned, Computed At | Weekly results |
| **Leaderboard** | User ID, Username, Total Points, Correct Outcomes, Correct Scores, Weeks Played, Weeks Won, TON Earned, TON Distributed, Updated At | All-time standings |

Bets tab pre-populated with 21 existing bets from D1.

---

## TON Distribution Rules

| Rule | Value |
|------|-------|
| Prize pool per week | **1 TON** |
| Winner | Player with **maximum total_points** in the week |
| Tiebreaker | **Earliest last_bet_at** (MIN updated_at across user's bets in the week) |
| Principle | First come, first served |

---

## Landing Site

- **New Betty logo**: schnauzer with football on yellow background
- **Match schedule**: reads from Google Sheet with new column format, week tabs to toggle between weeks
- **CTA button**: now links to prod bot @bettyscores_bot

---

## Scoring Rules

| Prediction | Points |
|------------|--------|
| Wrong | 0 |
| Correct outcome (1/X/2) | +1 |
| Correct exact score | +3 |
| Max per match | +4 (1+3) |

---

## Commits

```
cd9fb6c Update Betty logo, add week tabs to match schedule
43e081c Redesign data model: 5 tables, D1 primary, TON distribution rules
```
