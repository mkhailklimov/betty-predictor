# Betty Scores 2.1 — Fun Predictions & Multi-Platform Growth

## Vision

Betty stops being a boring score-prediction spreadsheet and becomes a fun,
shareable football prediction game. 5-6 creative questions per week replace
10 dry score guesses. The game lives on the web and acquires players from
four social media platforms — YouTube, TikTok, Facebook, and Telegram.

---

## 1. Fun Prediction Formats

Each week: **5-6 hand-crafted questions** instead of 10 score predictions.

| # | Format | Example | Answer type | Points |
|---|--------|---------|-------------|--------|
| 1 | **Exact Score** | "Arsenal vs Chelsea — what's the final score?" | Two reels (existing) | 5 |
| 2 | **Will He Score?** | "Will Haaland score against Everton?" | Yes / No | 2 |
| 3 | **Over/Under 2.5** | "Liverpool vs Man City — over or under 2.5 total goals?" | Over / Under | 2 |
| 4 | **Clean Sheet** | "Will Onana keep a clean sheet vs Brighton?" | Yes / No | 3 |
| 5 | **First to Score** | "North London Derby — who scores first?" | Home / Away / Nobody | 3 |
| 6 | **Derby Prophet** | "Merseyside Derby — pick the exact score" | Two reels | 5 |

**Rules:**
- Every question ties to a real match that week
- Mix of easy (Yes/No) and hard (exact score) keeps it fun for everyone
- Questions are curated by Misha in the sheet, not auto-generated
- Each question = one potential Reels/Shorts script (see section 4)

---

## 2. Football Focus: British Football

**Primary — English Premier League:**
All 380 season matches as the pool. 4-5 questions per week from EPL.

**Secondary — British clubs in Europe:**
- Champions League — Arsenal, Liverpool, Man City, Aston Villa
- Europa League — Man Utd, Tottenham, Newcastle, West Ham

**Tertiary — Cup & National:**
- FA Cup (from Round 3 onward)
- England, Scotland, Wales, Northern Ireland, Republic of Ireland
  (Nations League, World Cup qualifiers)

**Dropped from 2.0:** La Liga, Serie A, Bundesliga, Ligue 1, MLS as regular content.

---

## 3. Multi-Platform Player Acquisition

### Architecture

```
                        ┌─────────────┐
                        │   YouTube   │
                        │   Shorts    │
                        └──────┬──────┘
                               │ "Think Haaland scores?
                               │  Prove it → link in bio"
                               ▼
┌─────────────┐     ┌───────────────────────┐     ┌─────────────┐
│   TikTok    │────▶│                       │◀────│  Facebook   │
│   Reels     │     │   app.bettyscores.com │     │  Reels      │
└─────────────┘     │                       │     └─────────────┘
                    │      BETTY GAME       │
                    │                       │
                    │   5-6 fun questions   │
                    │   predict in 2 taps   │
                    │   leaderboard & stars │
                    │                       │
                    └───────────┬───────────┘
                               ▲
                               │ Mini App (existing)
                        ┌──────┴──────┐
                        │  Telegram   │
                        │  @bettyscores_bot
                        └─────────────┘
```

### Player Registration by Nickname

Players from YouTube, TikTok, and Facebook sign up with just a **nickname** —
no OAuth, no complex login. The web app is the primary product.

| Platform | How they arrive | Registration |
|----------|----------------|--------------|
| YouTube | Shorts → link in bio → web app | Nickname + "from YouTube" tag |
| TikTok | Reels → link in bio → web app | Nickname + "from TikTok" tag |
| Facebook | Reels → link → web app | Nickname + "from Facebook" tag |
| Telegram | Mini App (existing TWA auth) | Automatic (Telegram ID) |

**Stars eligibility:** To earn Telegram Stars prizes, a player must link
their account to the Telegram Mini App. Social-only players see their
stats and leaderboard position but get a prompt: "Connect Telegram to
claim your Stars."

**DB schema change:**
```sql
ALTER TABLE users ADD COLUMN provider TEXT;       -- 'telegram','youtube','tiktok','facebook','web'
ALTER TABLE users ADD COLUMN display_name TEXT;    -- the nickname they chose
ALTER TABLE users ADD COLUMN avatar_url TEXT;
-- Existing telegram users: provider='telegram', display_name=username
-- Social users: provider='youtube', display_name='FootballFan99'
```

### Merge Flow

When a YouTube/TikTok/Facebook player opens the Telegram Mini App:
1. App detects their Telegram ID
2. Prompts: "Link your Betty account?"
3. Merges predictions and stats from the web account into the Telegram account
4. Now eligible for Stars prizes

---

## 4. Content-to-Game Pipeline

Every prediction question doubles as a **script for a promotional video**.

### Example: Week 37, Question 2

**Question:** "Will Haaland score against Everton?"

**Video script (15s Reels/Shorts):**
```
[0-3s]  Haaland goal compilation (3 quick clips)
[3-6s]  Text overlay: "Haaland vs Everton this Saturday"
[6-9s]  Text: "Will he score? 🎯"
[9-12s] Screen recording: opening Betty, tapping YES on the question
[12-15s] Text: "Make your pick → link in bio"
        Betty logo + @bettyscores handle
```

**Post to:** TikTok, YouTube Shorts, Facebook Reels, Telegram channel

**Weekly content calendar:**
- Monday: questions published in Betty + 1 video per question recorded
- Tue-Fri: post 1-2 videos per day across all 4 platforms
- Saturday/Sunday: matches play, results come in
- Sunday night: leaderboard update, share winner cards

---

## 5. Challenges Table (D1 Schema)

```sql
CREATE TABLE challenges (
  id          TEXT PRIMARY KEY,
  week_id     TEXT NOT NULL,
  match_id    TEXT,                -- links to matches table (nullable for combo questions)
  type        TEXT NOT NULL,       -- 'exact_score','will_score','over_under','clean_sheet','first_to_score'
  question    TEXT NOT NULL,       -- "Will Haaland score against Everton?"
  options     TEXT NOT NULL,       -- JSON: ["Yes","No"] or ["Over","Under"] or ["Home","Away","Nobody"]
  points      INTEGER NOT NULL,
  correct_answer TEXT,             -- filled after match: "Yes", "Over", "2:1", etc.
  resolved_at TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (week_id) REFERENCES weeks(week_id)
);

CREATE TABLE challenge_predictions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  challenge_id  TEXT NOT NULL,
  answer        TEXT NOT NULL,     -- "Yes", "Over", "Home", "2:1", etc.
  points_earned INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);
```

---

## 6. Betty_Master_Data Sheet Changes

New **Challenges** tab (replaces Fixtures as the weekly source):

| Week ID | Match Source ID | Type | Question Text | Options | Points | Correct Answer |
|---------|----------------|------|---------------|---------|--------|----------------|
| 2026_37 | espn:123 | will_score | Will Haaland score against Everton? | Yes,No | 2 | |
| 2026_37 | espn:124 | over_under | Liverpool vs Man City — over 2.5 goals? | Over,Under | 2 | |
| 2026_37 | espn:125 | exact_score | Arsenal vs Chelsea — final score? | reels | 5 | |

- Misha curates 5-6 questions per week
- Correct Answer filled after match ends
- Monday cron publishes to D1

---

## 7. Development Plan

### Phase 1: Challenge Engine
- [ ] `challenges` + `challenge_predictions` tables in D1
- [ ] Challenges tab in Betty_Master_Data
- [ ] `POST /api/admin/publish-challenges` — sheet to D1
- [ ] `GET /api/challenges/current` — serve this week's questions
- [ ] `POST /api/challenges/:id/predict` — submit answer
- [ ] Frontend: challenge cards (Yes/No buttons, Over/Under, reels for exact score)
- [ ] Scoring engine: resolve answers after match, award points
- [ ] Leaderboard works across challenge types

### Phase 2: Nickname Registration
- [ ] Web signup: pick a nickname, tag platform source
- [ ] No OAuth — just nickname + optional email
- [ ] "Connect Telegram" prompt for Stars eligibility
- [ ] Merge flow: web account → Telegram account

### Phase 3: Content Pipeline
- [ ] Shareable result cards (canvas, 1080x1920)
- [ ] First batch of Reels scripts from week 37 questions
- [ ] Link-in-bio landing page optimized for social traffic
- [ ] Telegram channel posts with prediction CTAs

### Phase 4: Polish & Scale
- [ ] Onboarding flow for social media newcomers
- [ ] Weekly content calendar automation
- [ ] A/B test question formats by engagement

---

## 8. Rollback

Betty 2.0 backup verified and committed:
- Backup: `backups/betty-d1-v2.0.sql` (verified 2026-08-26)
- Rollback procedure: `docs/BACKUP-2.0.md`
- Git tag: `v2.0`

---

## 9. Schedule

| Week | ISO | Content |
|------|-----|---------|
| 35 | Aug 24-30 | Current format (10 matches) |
| 36 | Aug 31 - Sep 6 | Current format (last old-style week) |
| 37 | Sep 7-13 | **First fun format** — 5-6 EPL challenges + first Reels batch |
| 38 | Sep 14-20 | Fun format + CL group stage (British clubs) |
