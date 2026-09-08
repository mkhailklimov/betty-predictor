# Betty Scores 2.1 — Fun Predictions & Multi-Platform Growth

## Status

**Release:** 2.1
**Current status:** Challenge engine implemented; integration, leaderboard, web identity and production rollout still in progress.
**Target production window:** **September 21–28, 2026**
**Preferred release date:** **Monday, September 21, 2026**

This document is the source of truth for the Betty 2.1 release.

The original September 7 deployment date is no longer applicable. The September 7–20 period is used for stabilization, integration, testing and release preparation.

---

# 1. Vision

Betty stops being a dry score-prediction spreadsheet and becomes a fun, shareable football prediction game.

Instead of asking players to predict 10 match scores every week, Betty presents **5–6 hand-crafted football questions** with different difficulty levels.

The game becomes:

* easier to understand;
* faster to play;
* more suitable for short-form video;
* easier to promote on social media;
* accessible from the web as well as Telegram.

The 2.1 game experience is based on **challenges only**. The previous 10-match score-prediction cards are not displayed as part of the 2.1 weekly game.

The product has two acquisition paths:

1. **Telegram** — existing Mini App / TWA experience.
2. **Web** — players acquired from YouTube, TikTok and Facebook.

Social players can play using a nickname without OAuth. They can later connect their Betty account to Telegram to become eligible for Telegram Stars prizes.

---

# 2. Weekly Prediction Formats

Each week Betty contains **5–6 hand-crafted questions**.

The recommended scoring system is deliberately discrete:

* **1 point** — simple/binary prediction;
* **3 points** — more difficult prediction.

There is no 2-point or 5-point scoring in 2.1.

| # | Format             | Example                                                  | Answer type          | Points |
| - | ------------------ | -------------------------------------------------------- | -------------------- | -----: |
| 1 | **Exact Score**    | "Arsenal vs Chelsea — what's the final score?"           | Two score reels      |  **3** |
| 2 | **Will He Score?** | "Will Haaland score against Everton?"                    | Yes / No             |  **1** |
| 3 | **Over/Under 2.5** | "Liverpool vs Man City — over or under 2.5 total goals?" | Over / Under         |  **1** |
| 4 | **Clean Sheet**    | "Will Onana keep a clean sheet vs Brighton?"             | Yes / No             |  **1** |
| 5 | **First to Score** | "North London Derby — who scores first?"                 | Home / Away / Nobody |  **3** |
| 6 | **Derby Prophet**  | "Merseyside Derby — predict the exact score"             | Two score reels      |  **3** |

### Rules

* Every challenge is connected to a real football match unless explicitly designed as a non-match challenge in a future release.
* Each week contains 5–6 questions.
* Questions are manually curated in the `Challenges` sheet.
* Binary questions are worth **1 point**.
* Harder prediction formats are worth **3 points**.
* A player can submit one prediction per challenge.
* A prediction can be changed until the associated match kickoff.
* After kickoff, the prediction is locked.
* Each challenge can be used as the basis for a short promotional video.

### Week 37 scoring

The first fun-format week already follows the 1/3 scoring model:

| Challenge type | Points |
| -------------- | -----: |
| Will He Score? |      1 |
| Over/Under     |      1 |
| Clean Sheet    |      1 |
| Exact Score    |      3 |
| First to Score |      3 |

This scoring model is the intended 2.1 model.

---

# 3. Football Focus

## Primary — English Premier League

The Premier League is the primary source of weekly questions.

All 380 Premier League matches are available as the match pool.

Normally **4–5 challenges per week** should come from Premier League matches.

## Secondary — British clubs in Europe

Challenges may also use matches involving British clubs in European competitions.

### Champions League

* Arsenal
* Liverpool
* Manchester City
* Aston Villa

### Europa League

* Manchester United
* Tottenham Hotspur
* Newcastle United
* West Ham United

## Tertiary — Cups and national teams

From the appropriate stage:

* FA Cup
* England
* Scotland
* Wales
* Northern Ireland
* Republic of Ireland
* Nations League
* World Cup qualifiers

## Dropped as regular content

The following leagues are no longer regular challenge sources in 2.1:

* La Liga
* Serie A
* Bundesliga
* Ligue 1
* MLS

They may return in a future release if the product strategy changes.

---

# 4. Weekly Game Experience

The 2.1 weekly game consists of the challenge carousel.

Example:

```text
┌──────────────────────────────┐
│       Challenge 1            │
│                              │
│  Will Haaland score?         │
│                              │
│       [ YES ] [ NO ]         │
│                              │
│             +1               │
└──────────────────────────────┘

              ↓

┌──────────────────────────────┐
│       Challenge 2            │
│                              │
│  Arsenal vs Chelsea          │
│  Predict the exact score     │
│                              │
│       [ SCORE REELS ]        │
│                              │
│             +3               │
└──────────────────────────────┘

              ↓

              ...

              ↓

┌──────────────────────────────┐
│       Challenge 6            │
└──────────────────────────────┘
```

The old 10-match prediction cards are **not displayed after the challenges**.

The old prediction functionality remains in the code/database for backward compatibility and rollback purposes, but it is not part of the active 2.1 user experience.

---

# 5. Multi-Platform Player Acquisition

## Architecture

```text
                         ┌─────────────┐
                         │   YouTube   │
                         │   Shorts    │
                         └──────┬──────┘
                                │
                                │ link in bio
                                ▼

┌─────────────┐     ┌───────────────────────┐     ┌─────────────┐
│   TikTok    │────▶│                       │◀────│  Facebook   │
│   Reels     │     │   app.bettyscores.com │     │  Reels      │
└─────────────┘     │                       │     └─────────────┘
                    │      BETTY GAME       │
                    │                       │
                    │   5–6 challenges      │
                    │   predict in 2 taps   │
                    │   leaderboard         │
                    │   prizes              │
                    │                       │
                    └───────────┬───────────┘
                                ▲
                                │
                         Telegram Mini App
                                │
                         @bettyscores_bot
```

The web app is the primary acquisition surface.

Telegram remains the primary authenticated/prize-claiming environment.

---

# 6. Player Registration

## Telegram

Telegram users continue to use the existing Telegram Mini App authentication.

The Telegram ID is the authenticated identity.

## Web / Social

Players arriving from YouTube, TikTok or Facebook register with:

```text
nickname
+
platform source
```

No OAuth is required for initial registration.

Example:

```text
Nickname: FootballMike
Source: TikTok
```

The user can immediately play.

### Platform attribution

Supported providers:

```text
telegram
youtube
tiktok
facebook
web
```

The provider is stored with the Betty user.

### Optional email

Email may be collected optionally for future account recovery/communication, but email is not required to play.

---

# 7. Telegram Account Linking

Social-only users can play and appear on the leaderboard.

However, Telegram Stars prizes require a Telegram-linked account.

The intended flow is:

```text
Social player
      │
      ▼
Web Betty account
      │
      │ plays
      ▼
Leaderboard
      │
      │ "Connect Telegram to claim Stars"
      ▼
Telegram Mini App
      │
      ▼
Telegram identity verified
      │
      ▼
Link existing Betty account
      │
      ▼
One Betty account
      │
      ▼
Eligible for Stars
```

## Merge rules

The merge must be based on authenticated account identity, **never on nickname**.

The system must handle:

* web account with no Telegram account;
* Telegram account with no web history;
* web account already linked;
* Telegram account already linked;
* repeated link attempts;
* duplicate nickname;
* existing predictions on both sides.

Predictions and historical points must not be duplicated during a merge.

---

# 8. Challenges Database

The challenge engine uses two primary tables.

## `challenges`

```sql
CREATE TABLE challenges (
  id          TEXT PRIMARY KEY,
  week_id     TEXT NOT NULL,
  match_id    TEXT,
  type        TEXT NOT NULL,
  question    TEXT NOT NULL,
  options     TEXT NOT NULL,
  points      INTEGER NOT NULL,
  correct_answer TEXT,
  resolved_at TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  illustration_url TEXT,
  FOREIGN KEY (week_id) REFERENCES weeks(week_id)
);
```

Supported challenge types:

```text
exact_score
will_score
over_under
clean_sheet
first_to_score
```

Future types, such as `red_card`, are not part of the 2.1 release.

## `challenge_predictions`

```sql
CREATE TABLE challenge_predictions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  challenge_id  TEXT NOT NULL,
  answer        TEXT NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);
```

The existing migration `0007_v21_challenges.sql` establishes the core challenge tables.

---

# 9. Challenge API

The following challenge endpoints are implemented in the current codebase and must be verified as part of the 2.1 release.

| Endpoint                        | Method | Purpose                                                   |
| ------------------------------- | ------ | --------------------------------------------------------- |
| `/api/challenges/current`       | GET    | Return current week's challenges and caller's predictions |
| `/api/challenges/:id/predict`   | POST   | Submit/update a challenge prediction                      |
| `/api/admin/publish-challenges` | POST   | Publish Challenges sheet → D1                             |
| `/api/admin/resolve-challenges` | POST   | Set correct answers and score predictions                 |

## Prediction API requirements

The prediction endpoint must:

1. validate that the challenge exists;
2. validate the answer against allowed options;
3. create or update the user's prediction;
4. prevent prediction after kickoff when the challenge is linked to a match;
5. return the resulting prediction state.

---

# 10. Challenge Resolution

After a match has finished, the challenge receives a `correct_answer`.

Examples:

```text
Will He Score?
correct_answer = "Yes"

Over/Under
correct_answer = "Over"

First to Score
correct_answer = "Home"

Exact Score
correct_answer = "2:1"
```

Scoring:

```text
correct answer → challenge.points
wrong answer   → 0
```

Example:

```text
Exact Score
points = 3

User A → 2:1 → 3 points
User B → 1:0 → 0 points
```

Resolution must be idempotent: running the resolution process again must not award duplicate points.

---

# 11. Challenge Leaderboard

## Current status

**TODO / release blocker.**

The existing Betty leaderboard and prize system must be adapted so that challenge points contribute to the weekly ranking.

The intended calculation is:

```text
challenge_predictions.points_earned
                ↓
          SUM by user
                ↓
        weekly ranking
                ↓
       prizes / Stars
```

Example:

```text
User A
  Challenge 1 → 1
  Challenge 2 → 3
  Challenge 3 → 0
  Challenge 4 → 1
  Challenge 5 → 3
  Challenge 6 → 0
  ----------------
  Total       → 8
```

The existing weekly leaderboard/prize infrastructure should be reused wherever possible.

Do not create a parallel prize system unless required by the implementation.

## Required tests

The leaderboard must correctly handle:

* users with no predictions;
* users with one prediction;
* ties;
* users with all six predictions;
* social users;
* Telegram users;
* guest/internal accounts;
* resolved and unresolved challenges.

---

# 12. Betty Master Data

The weekly source is the `Challenges` tab.

Example:

| Week ID | Match Source ID | Type           | Question                                           | Options          | Points | Correct Answer |
| ------- | --------------- | -------------- | -------------------------------------------------- | ---------------- | -----: | -------------- |
| 2026_37 | espn:123        | will_score     | Will Haaland score against Coventry City?          | Yes,No           |      1 |                |
| 2026_37 | espn:124        | exact_score    | Arsenal vs Chelsea — predict the exact score!      | reels            |      3 |                |
| 2026_37 | espn:125        | over_under     | Everton vs Man Utd — over or under 2.5 goals?      | Over,Under       |      1 |                |
| 2026_37 | espn:126        | clean_sheet    | Will Onana keep a clean sheet vs Everton?          | Yes,No           |      1 |                |
| 2026_37 | espn:127        | first_to_score | Nottingham Forest vs Tottenham — who scores first? | Home,Away,Nobody |      3 |                |
| 2026_37 | espn:128        | will_score     | Will Isak score against Bournemouth?               | Yes,No           |      1 |                |

Misha manually curates 5–6 questions each week.

Correct answers are filled after the relevant matches finish.

---

# 13. Weekly Publishing Flow

The intended 2.1 weekly flow is:

```text
Monday
  │
  ├── close previous week
  │
  ├── finalize / resolve challenges
  │
  ├── calculate leaderboard
  │
  ├── award prizes
  │
  └── publish next week's Challenges
              │
              ▼
             D1
              │
              ▼
           Betty app
```

## Current implementation status

The existing Monday cron already performs the general:

```text
close week
→ award prizes
→ publish next week
```

sequence.

However, the current production code still uses the legacy `publishWeekFromSheet()` publishing flow. The 2.1 release must verify and, if necessary, modify this so that the new `Challenges` tab is the authoritative source for the active weekly challenge game.

The old Fixtures/match publication system may continue to exist for match metadata and result ingestion.

### Important distinction

```text
Fixtures / ESPN
        ↓
match metadata + results

Challenges sheet
        ↓
weekly Betty questions
```

These are separate responsibilities.

---

# 14. Frontend — ChallengeCard

`ChallengeCard` renders according to challenge type.

### `will_score`

```text
[ YES ] [ NO ]
```

### `clean_sheet`

```text
[ YES ] [ NO ]
```

### `over_under`

```text
[ OVER ] [ UNDER ]
```

### `first_to_score`

```text
[ HOME ] [ AWAY ] [ NOBODY ]
```

### `exact_score`

Reuse the existing ScoreReels interaction.

## Visual layout

When linked to a match:

* team crests;
* league;
* challenge type;
* question;
* points badge;
* answer controls.

When no match-specific illustration is available:

* fallback icon/emoji.

After resolution:

* correct/wrong result;
* points earned.

---

# 15. MainPage

The 2.1 MainPage should display **one weekly challenge game**.

Required behavior:

* no Current / Next Week tabs;
* one active week;
* challenge carousel;
* progress indicator;
* dot navigation;
* optimistic prediction save;
* backend synchronization;
* locked state after kickoff;
* result state after resolution.

### Important

The old 2.0 match-prediction cards should **not appear in the active 2.1 weekly game**.

The old components and data remain in the repository for backward compatibility and rollback.

---

# 16. Illustrations

## Status

**P1 — not a release blocker for the core game.**

Challenge cards currently use team crests or fallback emoji/icons.

The goal is to replace these with custom sticker-style illustrations.

## Initial target

The full library contains 30 planned illustrations, but the production release does not need all 30.

An initial set of 8–12 illustrations is sufficient to validate the technical implementation.

The remainder can be added after release.

---

## 16.1 Strikers

| # | Player             | Club        | Jersey | Visual                              |
| - | ------------------ | ----------- | ------ | ----------------------------------- |
| 1 | Erling Haaland     | Man City    | #9     | Celebrating, arms wide, ball in net |
| 2 | Dominik Szoboszlai | Liverpool   | #8     | Powerful shooting pose              |
| 3 | Bukayo Saka        | Arsenal     | #7     | Dribbling past defender             |
| 4 | Cole Palmer        | Chelsea     | #20    | Cool celebration                    |
| 5 | Alexander Isak     | Newcastle   | #14    | Heading the ball                    |
| 6 | Bruno Fernandes    | Man Utd     | #8     | Dramatic shooting pose              |
| 7 | Son Heung-min      | Tottenham   | #7     | Sprint with ball                    |
| 8 | Ollie Watkins      | Aston Villa | #11    | Sliding celebration                 |

---

## 16.2 Goalkeepers

| #  | Player         | Club      | Jersey | Visual                |
| -- | -------------- | --------- | ------ | --------------------- |
| 9  | Andre Onana    | Man Utd   | #24    | Diving full stretch   |
| 10 | Alisson        | Liverpool | #1     | Catching a high ball  |
| 11 | David Raya     | Arsenal   | #22    | Low save              |
| 12 | Ederson        | Man City  | #31    | Punching a cross away |
| 13 | Robert Sanchez | Chelsea   | #1     | Spreading to block    |

---

## 16.3 Stadiums

| #  | Stadium                   | Club        | Visual                          |
| -- | ------------------------- | ----------- | ------------------------------- |
| 14 | Emirates Stadium          | Arsenal     | Angular roof, red seats, cannon |
| 15 | Anfield                   | Liverpool   | Gate, red atmosphere            |
| 16 | Old Trafford              | Man Utd     | Red brick, Theatre of Dreams    |
| 17 | Stamford Bridge           | Chelsea     | Blue seats, compact stadium     |
| 18 | Etihad Stadium            | Man City    | Curved roof, sky-blue seats     |
| 19 | Tottenham Hotspur Stadium | Spurs       | Modern glass, golden cockerel   |
| 20 | St James' Park            | Newcastle   | Hillside, black and white       |
| 21 | Villa Park                | Aston Villa | Holte End, claret seats         |

---

## 16.4 Derby Matchups

| #  | Derby        | Teams                | Visual             |
| -- | ------------ | -------------------- | ------------------ |
| 22 | North London | Arsenal vs Tottenham | Red/white split    |
| 23 | Merseyside   | Liverpool vs Everton | Red/blue split     |
| 24 | Manchester   | Man City vs Man Utd  | Sky blue/red split |
| 25 | West London  | Chelsea vs Fulham    | Blue/white split   |
| 26 | The Big One  | Liverpool vs Man Utd | Red/red split      |

---

## 16.5 Generic Challenge Stickers

| #  | Type           | Visual                                     |
| -- | -------------- | ------------------------------------------ |
| 27 | over_under     | Scoreboard showing 2.5                     |
| 28 | first_to_score | Two players racing to the ball             |
| 29 | exact_score    | Football score-reel / slot-machine concept |
| 30 | red_card       | Referee showing a red card                 |

`red_card` is reserved for a future challenge type and is not part of the 2.1 game.

---

## Illustration specifications

* PNG with transparency or animated WebP/GIF;
* minimum 400×400px;
* cartoon/sticker style;
* bold outlines;
* flat colors;
* slightly exaggerated proportions;
* Betty forest/cream palette;
* no photorealistic player faces.

Players are represented by jersey number and team colors rather than detailed likenesses.

---

# 17. Illustration Integration

Add:

```sql
illustration_url TEXT
```

to `challenges`.

The intended flow:

```text
Challenges sheet
       ↓
illustration_url
       ↓
D1
       ↓
ChallengeCard
       ↓
illustration
```

If `illustration_url` is empty, the card falls back to the existing crest/icon/emoji behavior.

The illustration system must therefore be optional and must never prevent a challenge from being displayed.

---

# 18. Content-to-Game Pipeline

Every challenge can become a short promotional video.

Example:

### Question

> Will Haaland score against Coventry City?

### 15-second video

```text
[0–3s]
Haaland goal clips

[3–6s]
"Haaland vs Coventry this Saturday"

[6–9s]
"Will he score?"

[9–12s]
Betty screen recording
Tap YES

[12–15s]
"Make your pick → link in bio"

Betty logo + @bettyscores
```

## Distribution

* TikTok
* YouTube Shorts
* Facebook Reels
* Telegram channel

## Initial process

Content production is manual for 2.1.

Automation is not a release requirement.

---

# 19. Weekly Content Calendar

### Monday

* publish 5–6 challenges;
* record one short video per challenge.

### Tuesday–Friday

* publish 1–2 videos per day across social platforms.

### Saturday–Sunday

* matches take place;
* results are collected;
* challenges are resolved.

### Sunday / Monday

* update leaderboard;
* publish winner/result cards.

The exact publishing cadence may be adjusted after observing engagement.

---

# 20. Development Plan

## Phase 0 — Documentation and specification

**September 8**

* [x] Update release scope
* [x] Confirm 1/3 scoring model
* [x] Confirm challenges replace old 10-match weekly game
* [x] Move production target to September 21–28
* [x] Separate release blockers from post-release improvements

---

## Phase 1 — Challenge Engine

**Existing implementation — verify and stabilize**

* [x] `challenges` table
* [x] `challenge_predictions` table
* [x] Challenge API
* [x] Prediction validation
* [x] Kickoff lockout
* [x] Challenge resolution API
* [x] ChallengeCard
* [x] Challenge carousel
* [x] Week 37 challenge data

### Remaining

* [ ] Verify production D1 schema
* [ ] Verify end-to-end production behavior
* [ ] Make resolution idempotent
* [ ] Verify all challenge types
* [ ] Remove old match cards from active 2.1 game

---

## Phase 2 — Challenge Leaderboard

**P0 — release blocker**

* [ ] Aggregate `points_earned` by user/week
* [ ] Integrate with existing leaderboard
* [ ] Integrate with existing prize system
* [ ] Verify ties
* [ ] Exclude guest/internal accounts appropriately
* [ ] Test full weekly lifecycle

---

## Phase 3 — Weekly Publishing

**P0 — release blocker**

* [ ] Verify Challenges sheet format
* [ ] Verify `/api/admin/publish-challenges`
* [ ] Connect Monday cron to challenge publishing
* [ ] Ensure previous week closes correctly
* [ ] Ensure next week publishes exactly once
* [ ] Test failed/partial publishing
* [ ] Test duplicate execution
* [ ] Preserve old Fixtures/ESPN ingestion for match data

---

## Phase 4 — Web Identity

**P0 — release blocker for multi-platform acquisition**

* [ ] Web nickname registration
* [ ] Provider/source attribution
* [ ] Optional email
* [ ] Web authentication/session mechanism
* [ ] Web users can submit predictions without Telegram
* [ ] Web users appear on leaderboard

---

## Phase 5 — Telegram Linking

**P0 — required for Stars eligibility**

* [ ] "Connect Telegram" UI
* [ ] Telegram identity verification
* [ ] Web → Telegram linking
* [ ] Prediction migration
* [ ] Historical points migration
* [ ] Duplicate protection
* [ ] Already-linked account handling
* [ ] Stars eligibility after successful link

---

## Phase 6 — Illustrations and Content

**P1**

* [ ] `illustration_url` migration
* [ ] ChallengeCard illustration support
* [ ] Initial 8–12 illustrations
* [ ] Remaining illustration library
* [ ] Shareable result cards
* [ ] First Reels/Shorts batch
* [ ] Social landing page

---

## Phase 7 — Release QA

**P0**

* [ ] Fresh D1 backup
* [ ] Production migration rehearsal
* [ ] Mobile browser test
* [ ] Telegram Mini App test
* [ ] Web registration test
* [ ] Account linking test
* [ ] Prediction lockout test
* [ ] Resolution test
* [ ] Leaderboard test
* [ ] Prize test
* [ ] Weekly cron test
* [ ] Rollback rehearsal
* [ ] Release candidate tag

---

# 21. Post-2.1 — 2.2

The following are explicitly **not release blockers for 2.1**:

* automated weekly content calendar;
* automated Reels production;
* A/B testing of challenge formats;
* advanced onboarding;
* additional challenge types;
* automated social distribution;
* advanced player analytics;
* full 30-sticker library if not completed for 2.1.

---

# 22. Rollback Strategy

Betty 2.1 must preserve the existing 2.0 data and functionality.

The challenge migration is additive.

The existing 2.0 backup and rollback documentation remain part of the safety plan:

```text
backups/betty-d1-v2.0.sql
docs/BACKUP-2.0.md
git tag v2.0
```

Before production release, create a new fresh production D1 backup.

The old 2.0 prediction tables and data must not be deleted as part of the 2.1 release.

The new challenge tables can remain in D1 even if the frontend/worker is rolled back to the 2.0 application.

---

# 23. Production Deployment

## Target window

**September 21–28, 2026**

Preferred:

**Monday, September 21**

Fallback:

**September 22–24**

Absolute latest:

**September 28**

The release must not depend on successfully deploying at one exact minute before the Monday cron.

The weekly transition must first be made safe and independently testable.

---

## Pre-release

1. Freeze 2.1 feature development.
2. Create release candidate.
3. Take fresh D1 production backup.
4. Verify database migrations.
5. Verify current production data.
6. Run full regression suite.
7. Test weekly publishing manually.
8. Test rollback procedure.

---

## Deployment

```bash
# Fresh production backup
npx wrangler d1 export betty-db \
  --output=backups/betty-d1-pre-2.1.sql \
  --remote

# Verify migrations
npx wrangler d1 execute betty-db --remote \
  --command="PRAGMA table_info(challenges)"

# Deploy Worker
cd cf-worker
npx wrangler deploy

# Build and deploy Frontend
cd frontend
VITE_API_BASE=https://api.bettyscores.com npm run build
npx wrangler pages deploy dist \
  --project-name=betty-scores-app \
  --branch=main

# Verify API
curl https://api.bettyscores.com/api/challenges/current
```

The exact deployment commands must be verified against the current Cloudflare configuration before execution.

---

# 24. Production Smoke Test

Immediately after deployment:

### API

```text
GET /api/challenges/current
```

Expected:

```text
5–6 active challenges
correct week
correct points
correct options
```

### Telegram

```text
open Mini App
→ see challenges
→ submit prediction
→ change prediction
→ verify lockout
```

### Web

```text
open web app
→ register nickname
→ select/source attribution
→ submit prediction
→ refresh
→ prediction remains
```

### Leaderboard

```text
resolve test challenge
→ points appear
→ ranking changes correctly
```

### Admin

```text
publish
→ verify
resolve
→ verify
```

---

# 25. Release Acceptance Criteria

Betty 2.1 is considered successfully released only when all of the following are true.

### Core game

* [ ] 5–6 challenges appear for the active week.
* [ ] Old 10-match prediction cards are not part of the active game.
* [ ] All supported challenge types work.
* [ ] Scoring uses 1/3 points.
* [ ] Predictions can be changed before kickoff.
* [ ] Predictions are locked after kickoff.
* [ ] Results can be resolved.
* [ ] Points are awarded exactly once.

### Leaderboard

* [ ] Challenge points appear in the weekly leaderboard.
* [ ] Rankings are correct.
* [ ] Existing prize infrastructure works.
* [ ] No guest/internal accounts contaminate rankings.

### Web

* [ ] New player can choose a nickname.
* [ ] Player can play without Telegram.
* [ ] Source platform can be recorded.
* [ ] Player can see their leaderboard position.

### Telegram

* [ ] Existing Telegram users continue to work.
* [ ] Social user can connect Telegram.
* [ ] Predictions/history survive linking.
* [ ] Linked user becomes eligible for Stars.

### Operations

* [ ] Monday publishing works.
* [ ] Duplicate publishing is safe.
* [ ] Failed publishing does not destroy the previous week.
* [ ] Fresh backup exists.
* [ ] Rollback procedure is verified.

---

# 26. 2.1 Timeline

| Date       | Work                                     |
| ---------- | ---------------------------------------- |
| Sep 8      | Documentation/specification freeze       |
| Sep 9–10   | Challenge leaderboard                    |
| Sep 10–11  | Remove old match cards from active game  |
| Sep 11–13  | Weekly publishing / cron integration     |
| Sep 12–15  | Web nickname registration                |
| Sep 15–16  | Telegram account linking                 |
| Sep 16–17  | Illustrations / content integration      |
| Sep 17–18  | Full integration testing                 |
| Sep 19     | Release candidate + production rehearsal |
| Sep 20     | Final regression / go-no-go              |
| **Sep 21** | **Preferred production release**         |
| Sep 22–24  | Fallback release window                  |
| Sep 25–28  | Final contingency window                 |

---

# 27. Definition of 2.1

Betty 2.1 is successful if a person can discover Betty through a short football prediction video, open the web game, choose a nickname, answer five or six fun football questions in a few taps, see their position on a weekly leaderboard, and optionally connect their account to Telegram to become eligible for Stars.

The product should feel like a **small football game**, not a spreadsheet of football scores.
