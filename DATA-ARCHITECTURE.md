# Betty Scores — Data Architecture

## Medallion Model (Bronze / Silver / Gold)

```
                    EXTERNAL SOURCES
                    ================
     ESPN API          FIFA API         Google Sheets
    (fixtures)        (results)      (Fixtures, Adjustments)
        |                |                    |
        v                v                    v
  +-----------+   +---------------+   +------------------+
  | bronze_   |   | bronze_match_ |   | bronze_          |
  | fixtures  |   | results       |   | adjustments      |
  +-----------+   +---------------+   +------------------+
        |                |                    |
        |        reconcileResults()           |
        |                |                    |
        v                v                    v
  +----------+     +-----------+       +-------------+
  | matches  |     | matches   |       |             |
  | (INSERT) |     | (UPDATE   |       |             |
  |          |     |  scores)  |       |             |
  +----------+     +-----------+       |             |
                                       |             |
              APP ENDPOINTS            |             |
              =============            |             |
     users  predictions  matches       |             |
        \       |       /              |             |
         \      |      /               |             |
          v     v     v                v             v
        +-----------------------------------+
        |        rebuildMarts()              |
        +-----------------------------------+
                    |
          +---------+---------+
          v                   v
    SILVER LAYER         GOLD LAYER
    ============         ==========
    dim_user             gold_champions
    dim_week             gold_leaderboard
    dim_team
    fact_bet
    fact_result
    fact_score
          |                   |
          |                   v
          |            +-----------+
          |            | weekly_   |
          |            | prizes    |
          |            +-----------+
          |                   |
          v                   v
        +-----------------------------------+
        |     Google Sheets (monitoring)    |
        |  Users | Bets | Champions |       |
        |  Leaderboard | Prizes             |
        +-----------------------------------+
```

---

## Bronze Layer — Raw Ingestion

Raw data lands here unchanged. All tables use INSERT OR REPLACE (idempotent).

### bronze_fixtures
- **Source:** ESPN API (`site.api.espn.com`)
- **Trigger:** Daily 03:00 UTC cron
- **Key:** `(source, source_id)` where source = `espn`
- **Contains:** Team names, codes, crests, kickoff times, league, match status
- **Leagues:** 40+ (eng.1, esp.1, ger.1, ita.1, fra.1, usa.1, fifa.world, uefa.champions, etc.)
- **Used by:** `publishWeekFromSheet()` — human picks 10 matches from this pool

### bronze_match_results
- **Source:** FIFA API (`api.fifa.com`)
- **Trigger:** Daily 03:00 UTC cron
- **Key:** `(source, source_id)` where source = `fifa`
- **Contains:** Final scores for World Cup matches
- **Used by:** `reconcileResults()` — auto-updates match scores in the `matches` table

### bronze_adjustments
- **Source:** Google Sheet "Adjustments" tab (admin fills manually)
- **Trigger:** Hourly (before every rebuild)
- **Refresh:** Full DELETE + re-INSERT each sync
- **Contains:** Week ID, username, points delta, reason
- **Used by:** `rebuildMarts()` — applied to gold_champions totals

---

## Operational Tables — App State

These are the live tables the app reads and writes directly.

### users
| Column | Description |
|--------|-------------|
| id | UUID primary key |
| tg_id | Telegram user ID (unique), or `guest:<uuid>` for guests |
| username | Display name |
| auth_source | `miniapp`, `widget`, or `guest` |
| guest_token | Opaque token for guest sessions |
| merged_into | Set when guest merges into real account (tombstone) |
| is_premium | 1 if purchased via Telegram Stars |
| fav_team | 3-letter team code (premium feature) |
| ref_source | UTM source from first visit |

### matches
| Column | Description |
|--------|-------------|
| id | `espn-{source_id}` |
| week_id | `YYYY_WW` format (e.g. `2026_34`) |
| match_date_utc | Kickoff time |
| home_team / away_team | Team names |
| league | League code (e.g. `eng.1`) |
| source / source_id | Feed origin |
| crest_home / crest_away | Logo URLs |
| is_active | 0=hidden, 1=open, 2=locked, 3=ended |
| result | `1` (home), `X` (draw), `2` (away) |
| score_home / score_away | Final goals |

**Lifecycle:** `0 (hidden) -> 1 (open) -> 2 (locked at kickoff) -> 3 (ended)`

### predictions
| Column | Description |
|--------|-------------|
| id | UUID |
| user_id | FK to users.id |
| match_id | FK to matches.id |
| prediction_type | `1`, `X`, or `2` |
| predicted_score | JSON `{home, away}` (nullable for outcome-only bets) |
| UNIQUE | (user_id, match_id) — one bet per user per match |

### weeks
| Column | Description |
|--------|-------------|
| week_id | `YYYY_WW` primary key |
| starts_at | Monday 00:00 UTC |
| ends_at | Sunday 23:59:59 UTC |
| status | `draft` -> `published` -> `closed` |

### weekly_prizes
| Column | Description |
|--------|-------------|
| week_id + rank | Unique (one prize per rank per week) |
| user_id | Winner |
| stars | 100 (1st) or 50 (2nd) |
| status | `owed` -> `paid` (or `void`) |

---

## Silver Layer — Transformed Facts & Dimensions

Built by `rebuildMarts()`. Full DELETE + INSERT each run (idempotent).

### Dimensions

| Table | Source | Key | Purpose |
|-------|--------|-----|---------|
| silver_dim_user | users (where merged_into IS NULL) | user_id | Username, premium, fav_team, is_internal flag |
| silver_dim_week | matches (distinct week_ids) | week_id | Week labels |
| silver_dim_team | matches (distinct teams) | team | Team codebook |

### Facts

| Table | Source | Key | Purpose |
|-------|--------|-----|---------|
| silver_fact_bet | predictions + matches | (user_id, match_id) | Normalized predictions with week_id |
| silver_fact_result | matches (where scored) | match_id | Normalized results with computed outcome |
| silver_fact_score | fact_bet JOIN fact_result | (user_id, match_id) | Scoring: points (0/1/3), correct outcome, correct score |

### Scoring Rules
```
Exact score match:      3 points (total, not 1+3)
Correct outcome only:   1 point
Wrong:                  0 points
```

---

## Gold Layer — Aggregated Analytics

### gold_champions (weekly results per player)
- **Source:** silver_fact_score grouped by (week_id, user_id) + bronze_adjustments
- **Ranking:** `ORDER BY total_points DESC, last_bet_at ASC` (earlier bets win ties)
- **Excludes:** Internal users (test accounts, bots)
- **Consumed by:** Champions page, closeWeek() for prize allocation

### gold_leaderboard (all-time rankings)
- **Source:** gold_champions grouped by user_id
- **Columns:** Total points, correct outcomes/scores, weeks played, weeks won
- **Joined with:** weekly_prizes (SUM stars) for stars_earned display
- **Consumed by:** Hall of Fame page

---

## Weekly Lifecycle

```
MONDAY 00:00 UTC ──────────────────────────────────────────────
  closeWeek(lastWeek)
    ├── rebuildMarts() (ensure fresh data)
    ├── Read gold_champions for lastWeek
    ├── Award prizes: rank 1 = 100 Stars, rank 2 = 50 Stars
    ├── Guests excluded from prizes
    └── UPDATE weeks SET status='closed'

  publishWeekFromSheet()
    ├── Read "Fixtures" tab from Google Sheet
    ├── Validate: 10 rows, kickoffs in range, all in bronze_fixtures
    ├── DELETE + INSERT matches for new week
    └── INSERT/UPDATE weeks with status='published'

DAILY 03:00 UTC ───────────────────────────────────────────────
  ingestFixtures()
    └── ESPN API → bronze_fixtures (21 days ahead, 40+ leagues)

  ingestFifaResults()
    └── FIFA API → bronze_match_results

  reconcileResults(apply=true)
    ├── Match bronze results to matches table (fuzzy team matching)
    ├── UPDATE matches with scores + is_active=3
    └── If changed → rebuildMarts()

  refreshCandidatesTab()
    └── Write next week's fixture pool to "Candidates" sheet tab

HOURLY ────────────────────────────────────────────────────────
  Match status cascade
    ├── kickoff reached → is_active = 2 (locked)
    └── kickoff + 3h → is_active = 3 (ended)

  syncAdjustmentsFromSheet()
    └── Google Sheet "Adjustments" → bronze_adjustments

  rebuildMarts()
    └── Full silver + gold recalculation

FRIDAY 06:00 UTC ──────────────────────────────────────────────
  Export to Google Sheets (monitoring)
    ├── Users → "Users" tab
    ├── Bets → "Bets" tab
    ├── gold_champions → "Champions" tab
    ├── gold_leaderboard → "Leaderboard" tab
    └── weekly_prizes → "Prizes" tab
```

---

## Google Sheet Tabs

**Sheet ID:** `1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus`

### Source Tabs (admin writes, Worker reads)
| Tab | Purpose | Read by |
|-----|---------|---------|
| **Fixtures** | 10 curated match picks per week | Monday cron → `publishWeekFromSheet()` |
| **Adjustments** | Manual score corrections | Hourly → `syncAdjustmentsFromSheet()` |

### Sink Tabs (Worker writes, admin monitors)
| Tab | Purpose | Written by |
|-----|---------|------------|
| **Users** | All registered users | Friday cron |
| **Bets** | All predictions with user/match info | Friday cron |
| **Champions** | Weekly results + rankings | Friday cron |
| **Leaderboard** | All-time rankings | Friday cron |
| **Prizes** | Stars awards + payment status | Friday cron |
| **Candidates** | ESPN fixture pool for next week | Daily cron |

---

## Internal Users

These accounts are excluded from gold marts (rankings, prizes):

| tg_id | Username | Purpose |
|-------|----------|---------|
| 1056798742 | MikeKlimov | Developer |
| 8513208258 | bettyscores | Bot account |
| 7653593987 | bet_monitoring | Monitoring bot |
| test_123 | TestUser | Test account |

---

## Admin Endpoints

All require `Authorization: Bearer ADMIN_TOKEN`.

| Endpoint | Purpose |
|----------|---------|
| POST `/api/admin/ingest-fixtures` | Pull ESPN fixtures into bronze |
| POST `/api/admin/write-fixtures` | Write picks to Fixtures sheet |
| POST `/api/admin/publish-week` | Validate + publish Fixtures into matches |
| POST `/api/admin/close-week` | Close week, award prizes |
| POST `/api/admin/rebuild` | Force silver + gold rebuild |
| POST `/api/admin/results` | Ingest FIFA results + reconcile |
| POST `/api/admin/sync-adjustments` | Sync Adjustments sheet to bronze |
| POST `/api/admin/sync-users` | Export users to sheet |
| POST `/api/admin/sync-bets` | Export bets to sheet |
| POST `/api/admin/export-marts` | Export Champions + Leaderboard to sheet |
| POST `/api/admin/delete-tabs` | Delete sheet tabs by name |
| POST `/api/admin/prizes/:week/paid` | Mark prize as paid |
