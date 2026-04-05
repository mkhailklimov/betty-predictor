# Betty Predictor — Masterdata Reference

This document describes the data model used by Betty Predictor. Data is stored in **Cloudflare D1** (SQLite-compatible) and mirrored in **Google Sheets** for manual administration.

---

## Data Sources

| Source | ID | Purpose |
|--------|----|---------|
| **D1 Database** | `betty-db` (`a064b461-a310-484e-80de-66a684e71c7c`) | Production data store — backend reads/writes here |
| **Google Sheet (Data)** | [`1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus`](https://docs.google.com/spreadsheets/d/1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus) | Admin view — matches schedule + user registry |
| **Google Sheet (Masterdata)** | [`1YNbdBiJs30ftSI-KHApp3DpJSlKRpsDNltKAbazkPRI`](https://docs.google.com/spreadsheets/d/1YNbdBiJs30ftSI-KHApp3DpJSlKRpsDNltKAbazkPRI) | Field descriptions and data dictionary |

---

## Matches

Stores the match schedule. Each row represents a single game. Matches are organized by weekly tours for TON distribution.

### Schema

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| **Weekstart** | Date | `2026-06-12` | Nominal start date of the tour. Groups matches into weekly rounds for TON prize distribution. All matches within one tour share the same Weekstart. |
| **Matchdate Universal time** | Datetime (UTC) | `2026-06-12 01:00:00` | Kickoff time in UTC. Used to enforce prediction deadlines — predictions expire at this exact moment. The source of truth for lockout logic. |
| **Matchdate Local Time** | String | `06/11/2026 9:00 PM ET` | Kickoff time displayed to users in the app. Eastern Time (ET), the most common timezone across USA, Canada, and Mexico. |
| **League** | String | `WC` | Competition identifier. Currently `WC` (World Cup). Supports future expansion to other leagues. |
| **Group** | String | `A` | Tournament group or stage identifier (e.g., A–L for group stage, R16/QF/SF/F for knockout). |
| **Home Team** | String | `Mexico` | Full name of the home team. |
| **Away Team** | String | `South Africa` | Full name of the away team. |
| **Venue** | String | `Mexico City` | Stadium or city where the match is played. |
| **Card Name Home** | String | `MEX.png` | Filename of the home team's illustrated player card image. Stored in `frontend/public/teams/Cards/`. |
| **Card Name Away** | String | `SAF.png` | Filename of the away team's illustrated player card image. Stored in `frontend/public/teams/Cards/`. |
| **Is Active** | Integer | `1` | Controls match visibility and betting availability. See status codes below. |

### Is Active Status Codes

| Code | Name | Visible | Bettable | Description |
|------|------|---------|----------|-------------|
| **0** | Hidden | No | No | Match scheduled but not yet open. Not shown to users. |
| **1** | Open | Yes | Yes | Match visible, predictions accepted. Default for upcoming matches. |
| **2** | Locked | Yes | No | Match started. Card displayed with "betting closed" badge, predictions frozen. |
| **3** | Ended | No | No | Match finished and archived. Not displayed in active views. |

### Lifecycle

```
0 (Hidden) → 1 (Open) → 2 (Locked at kickoff) → 3 (Ended after final whistle)
```

---

## Users

Stores registered players. A user is created automatically when they first open the Telegram Mini App.

### Schema

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| **id** | UUID | `e457e786-...` | Internal unique identifier. Auto-generated on registration. |
| **tg_id** | String | `123456789` | Telegram user ID. Unique per user. Used as authentication token in API requests. |
| **username** | String | `TestUser` | Display name shown in leaderboards and champions tables. Populated from Telegram username or first name. |
| **is_premium** | Integer | `0` | Telegram Premium status. `0` = regular, `1` = premium. |
| **points** | Integer | `0` | Total points accumulated across all tours. Correct result = +1, correct score = +3. |
| **predictions_count** | Integer | `0` | Total number of predictions submitted across all tours. |
| **tours_played** | Integer | `0` | Number of unique weekly tours the user participated in. |
| **ton_wallet** | String | `UQ...` | User's TON blockchain wallet address. Required for receiving prize payouts. Set when user first claims a reward. |
| **ton_consent** | Integer | `0` | Whether user has agreed to receive TON payments. `0` = not yet, `1` = consented. |
| **ton_earned** | Real | `0.0` | Total TON earned by the user across all tours (accumulated). |
| **ton_distributed** | Real | `0.0` | Total TON actually transferred to the user's wallet. Difference with ton_earned = pending payout. |
| **created_at** | Datetime | `2026-04-05 09:43:33` | When the user first opened the app and registered. |
| **updated_at** | Datetime | `2026-04-05 09:43:33` | Last recorded activity timestamp. |

### Scoring Rules

| Prediction | Points | Description |
|------------|--------|-------------|
| Correct result (1/X/2) | **+1** | Predicted the right match outcome (home win, draw, or away win). |
| Correct exact score | **+3** | Predicted the exact final score (e.g., 2:1). Awarded on top of the +1 for correct result. |
| Maximum per match | **+4** | Correct result (+1) + correct score (+3). |

### TON Distribution Flow

```
1. Tour ends (all matches in a Weekstart group are finished)
2. Admin calculates points per user for the tour
3. TON prizes allocated based on ranking
4. ton_earned updated for qualifying users
5. User opens app → sees "Claim reward" in Leaderboard tab
6. User provides TON wallet address → ton_wallet + ton_consent saved
7. Admin transfers TON → ton_distributed updated
```

---

## Predictions

Stores individual match predictions made by users.

### Schema

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| **id** | UUID | `a1b2c3...` | Internal unique identifier. |
| **user_id** | UUID | `e457e786-...` | Reference to the user who made the prediction. |
| **match_id** | String | `match-1` | Reference to the match being predicted. |
| **prediction_type** | String | `1` | Outcome prediction: `1` = home win, `X` = draw, `2` = away win. |
| **predicted_score** | JSON | `{"home":2,"away":1}` | Exact score prediction. Stored as JSON string. |
| **points_earned** | Integer | `4` | Points awarded after match finishes. Null while match is upcoming. |
| **created_at** | Datetime | `2026-06-11 20:30:00` | When the prediction was submitted. |
| **updated_at** | Datetime | `2026-06-11 20:30:00` | Last modification time. |

### Rules

- One prediction per user per match.
- Predictions are **locked at kickoff** — no submissions or edits after `Matchdate Universal time`.
- If a user misses the deadline for a match, they can still predict later matches in the tour.

---

## Rewards

Tracks TON prize allocations per user per tour.

### Schema

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| **id** | UUID | `r1r2r3...` | Internal unique identifier. |
| **user_id** | UUID | `e457e786-...` | Reference to the rewarded user. |
| **week** | Integer | `1` | Tour number (corresponds to Weekstart grouping). |
| **points** | Integer | `12` | Points earned by the user in this tour. |
| **ton_amount** | Real | `1.5` | TON amount allocated as reward. |
| **status** | String | `pending` | `pending` = not yet claimed, `claimed` = transferred to wallet. |
| **claimed_at** | Datetime | `null` | When the reward was claimed / transferred. |
| **created_at** | Datetime | `2026-06-18 10:00:00` | When the reward record was created. |
| **updated_at** | Datetime | `2026-06-18 10:00:00` | Last modification time. |

---

## Data Sync Process

```
Google Sheet (admin fills matches)
  → Claude reads sheet on "sync matches" command
  → Upserts into D1 database
  → Updates frontend match data
  → Deploy to dev → test → promote to prod
```

Users flow in the opposite direction:

```
TG Mini App (user opens bot)
  → Frontend calls POST /api/user/register
  → User created in D1
  → Can be synced to Google Sheet Users tab for admin visibility
```
