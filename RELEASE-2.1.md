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

**DB schema change (applied 2026-08-26):**
```sql
ALTER TABLE users ADD COLUMN provider TEXT;       -- 'telegram','youtube','tiktok','facebook','web'
ALTER TABLE users ADD COLUMN display_name TEXT;    -- the nickname they chose
ALTER TABLE users ADD COLUMN avatar_url TEXT;
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
[6-9s]  Text: "Will he score?"
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

Applied to live D1 on 2026-08-26 via migration `0007_v21_challenges.sql`.

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

## 6. API Endpoints (implemented 2026-08-26)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/challenges/current` | GET | Optional | This week's challenges + caller's predictions. Enriched with match data (crests, team names) when linked. |
| `/api/challenges/:id/predict` | POST | Telegram/guest | Submit or update an answer. Validates against allowed options. Kickoff lockout when linked to a match. |
| `/api/admin/publish-challenges` | POST | ADMIN_TOKEN | Read Challenges sheet tab → D1. Supports `?dry=1` and `?week=`. |
| `/api/admin/resolve-challenges` | POST | ADMIN_TOKEN | Set correct answers and score all predictions. Body: `{"answers":{"<id>":"Yes",...}}` |

---

## 7. Frontend (implemented 2026-08-26)

### ChallengeCard component (`frontend/src/components/ChallengeCard.tsx`)

Renders differently per challenge type:
- **will_score, clean_sheet** → two buttons: Yes / No
- **over_under** → two buttons: Over / Under
- **first_to_score** → three buttons: Home / Away / Nobody
- **exact_score** → reuses existing ScoreReels component

Visual layout:
- When linked to a match → team crests (from ESPN) + league name + type icon
- When no match linked → large sticker-style emoji icon
- Points badge (top-right corner)
- Centered question text
- Green/red result display after resolution

### MainPage changes

- **Removed Current/Next week tabs** — single week view, deployed on Monday
- **Unified card carousel**: challenges first, then match cards
- Single progress bar, dot navigation across all cards
- Challenge predictions saved optimistically with backend sync

---

## 8. Betty_Master_Data Sheet Changes

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

## 9. Illustrations (TODO — Misha)

Challenge cards currently show ESPN team crests (when linked to a match) or
emoji icons as fallback. The goal is custom sticker-style animated illustrations
that make each card feel alive and shareable.

### 9.1 Strikers — "Will He Score?" stickers (8 stickers)

| # | Player | Club | Jersey | Kit colors | Visual |
|---|--------|------|--------|------------|--------|
| 1 | Erling Haaland | Man City | #9 | Sky blue | Celebrating, arms wide, ball in net |
| 2 | Dominik Szoboszlai | Liverpool | #8 | Red | Striking the ball with power, dramatic shooting pose |
| 3 | Bukayo Saka | Arsenal | #7 | Red & white | Dribbling past defender |
| 4 | Cole Palmer | Chelsea | #20 | Blue | Cool celebration, finger wag |
| 5 | Alexander Isak | Newcastle | #14 | Black & white stripes | Heading the ball |
| 6 | Bruno Fernandes | Man Utd | #8 | Red | Shooting, dramatic pose |
| 7 | Son Heung-min | Tottenham | #7 | White | Sprint with ball |
| 8 | Ollie Watkins | Aston Villa | #11 | Claret & blue | Sliding celebration |

### 9.2 Goalkeepers — "Clean Sheet?" stickers (5 stickers)

| # | Player | Club | Jersey | Kit colors | Visual |
|---|--------|------|--------|------------|--------|
| 9 | Andre Onana | Man Utd | #24 | Green/black | Diving full stretch, gloves out |
| 10 | Alisson | Liverpool | #1 | Yellow/green | Catching a high ball |
| 11 | David Raya | Arsenal | #22 | Yellow | Low save, ball at fingertips |
| 12 | Ederson | Man City | #31 | Green | Punching a cross away |
| 13 | Robert Sanchez | Chelsea | #1 | Yellow | Spreading to block |

### 9.3 Stadiums — exact score & derby stickers (8 stickers)

| # | Stadium | Club | Visual hint |
|---|---------|------|-------------|
| 14 | Emirates Stadium | Arsenal | Angular roof, red seats, cannon |
| 15 | Anfield | Liverpool | "You'll Never Walk Alone" gate, red glow |
| 16 | Old Trafford | Man Utd | Red brick, "Theatre of Dreams" sign |
| 17 | Stamford Bridge | Chelsea | Blue seats, compact, lion |
| 18 | Etihad Stadium | Man City | Curved roof, sky blue seats |
| 19 | Tottenham Hotspur Stadium | Spurs | Golden cockerel, modern glass |
| 20 | St James' Park | Newcastle | Hillside, black & white |
| 21 | Villa Park | Aston Villa | Holte End, claret seats |

### 9.4 Derby matchups — rivalry stickers (5 stickers)

| # | Derby name | Teams | Visual |
|---|------------|-------|--------|
| 22 | North London | Arsenal vs Tottenham | Red vs White split, lightning between crests |
| 23 | Merseyside | Liverpool vs Everton | Red vs Blue split, fire between crests |
| 24 | Manchester | Man City vs Man Utd | Sky blue vs Red, thunder |
| 25 | West London | Chelsea vs Fulham | Blue vs White, sparks |
| 26 | The Big One | Liverpool vs Man Utd | Red vs Red (different shades), flames |

### 9.5 Generic type stickers — reusable (4 stickers)

| # | Type | Visual |
|---|------|--------|
| 27 | **over_under** | Scoreboard showing "2.5" with green arrow up / red arrow down |
| 28 | **first_to_score** | Two players racing to the ball — split left vs right |
| 29 | **exact_score** | Slot machine with footballs — casino-game feel |
| 30 | **red_card** | Referee holding up red card — dramatic pose, future challenge type |

### Total: 30 stickers

### Specs

- **Format:** PNG with transparency, or animated WebP/GIF
- **Size:** 400x400px minimum (displayed at ~200px on mobile, 2x for retina)
- **Style:** Cartoon/sticker — bold outlines, flat colors, slightly exaggerated proportions.
  Think Telegram sticker packs, not photorealism.
- **Color palette:** Match Betty's forest theme — greens (#31572C, #90A955), cream (#ECF39E), white (#FAF9F6)
- **No real player faces** — use jersey number + team colors to suggest identity.
  "Haaland" = Man City sky blue #9, not a portrait.

### How they'll be used

1. **`illustration_url` column** will be added to the `challenges` table (future migration)
2. Misha fills the URL in the Challenges sheet tab per question
3. ChallengeCard renders the illustration above the question, replacing the emoji icon
4. Same illustrations reused in Reels/Shorts video thumbnails

### Where to source

- **AI generation:** Midjourney or DALL-E with prompt like:
  `"telegram sticker style, football goalkeeper #24 in green kit diving to save, flat illustration, bold outline, transparent background, no face details"`
- **Sticker artists:** Fiverr "telegram sticker pack" — $5-20 per sticker, $50-100 for a full set of 30
- **Free packs:** Search Telegram sticker packs for football/soccer — some are Creative Commons

---

## 10. Development Plan

### Phase 1: Challenge Engine — DONE (2026-08-26)
- [x] `challenges` + `challenge_predictions` tables in D1 (migration 0007)
- [x] `users.provider`, `users.display_name`, `users.avatar_url` columns
- [x] `POST /api/admin/publish-challenges` — sheet to D1
- [x] `GET /api/challenges/current` — serve this week's questions with match data
- [x] `POST /api/challenges/:id/predict` — submit answer with validation + lockout
- [x] `POST /api/admin/resolve-challenges` — set correct answers, score predictions
- [x] Frontend: ChallengeCard component (Yes/No, Over/Under, First to Score, reels)
- [x] Frontend: unified carousel (challenges + matches), removed week tabs
- [x] Deployed to dev, tested end-to-end
- [ ] Leaderboard works across challenge types (TODO)

### Phase 2: Nickname Registration
- [ ] Web signup: pick a nickname, tag platform source
- [ ] No OAuth — just nickname + optional email
- [ ] "Connect Telegram" prompt for Stars eligibility
- [ ] Merge flow: web account → Telegram account

### Phase 3: Illustrations & Content
- [ ] Misha prepares illustration set (see section 9)
- [ ] Add `illustration_url` column to challenges table
- [ ] ChallengeCard renders custom illustration when URL is set
- [ ] Shareable result cards (canvas, 1080x1920)
- [ ] First batch of Reels scripts from week 37 questions
- [ ] Link-in-bio landing page optimized for social traffic

### Phase 4: Polish & Scale
- [ ] Onboarding flow for social media newcomers
- [ ] Weekly content calendar automation
- [ ] A/B test question formats by engagement

---

## 11. Rollback

Betty 2.0 backup verified and committed:
- Backup: `backups/betty-d1-v2.0.sql` (verified 2026-08-26)
- Rollback procedure: `docs/BACKUP-2.0.md`
- Git tag: `v2.0`

---

## 12. Schedule

**Prod deploy: Monday Sep 7, 2026 at 00:00 UTC** (midnight Sun→Mon).
The Monday 00:00 cron already runs `closeWeek → award prizes → publish next week`,
so 2.1 deploys right before that cron fires on the new code.

### Deploy sequence (Sun Sep 6, ~23:50 UTC)

1. Take a fresh D1 backup: `npx wrangler d1 export betty-db --output=backups/betty-d1-pre-2.1.sql --remote`
2. Run D1 migrations (already applied — verify with `PRAGMA table_info(challenges)`)
3. Deploy Worker: `cd cf-worker && npx wrangler deploy`
4. Deploy Frontend: `cd frontend && VITE_API_BASE=https://api.bettyscores.com npm run build && npx wrangler pages deploy dist --project-name=betty-scores-app --branch=main`
5. Verify: `curl https://api.bettyscores.com/api/challenges/current`
6. Monday 00:00 cron fires → closes week 36, publishes week 37 challenges

### Timeline

| Week | ISO | What happens |
|------|-----|--------------|
| 35 | Aug 24-30 | Current format (10 matches). Challenge engine built & deployed to dev. |
| 36 | Aug 31 - Sep 6 | **Last old-style week.** Build nickname registration. Misha prepares illustrations + week 37 challenges. |
| — | Sun Sep 6 23:50 UTC | **DEPLOY 2.1 to prod** |
| 37 | Sep 7-13 | **First fun format** — 5-6 EPL challenges + first Reels batch |
| 38 | Sep 14-20 | Fun format + CL group stage (British clubs) |
