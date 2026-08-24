# Betty Scores 2.1 — EPL Focus & Multi-Platform Content Pivot

## Vision

Betty pivots from grey multi-league score predictions to engaging, fun football content
centered on the English Premier League and Great Britain / Ireland national teams.
The product becomes a content-first prediction game distributed via short-form video
(TikTok, YouTube Shorts, Instagram Reels, Facebook) with the prediction as the CTA.

## What Changes

### 1. Content Focus: EPL + GB/Ireland

**Primary:** English Premier League — all 380 season matches.

**Secondary (when scheduled):**
- Champions League / Europa League — matches involving British clubs only
  (Arsenal, Chelsea, Liverpool, Man City, Aston Villa, Man Utd, Newcastle, etc.)
- National teams — England, Scotland, Wales, Northern Ireland, Republic of Ireland
  (Nations League, World Cup qualifiers, friendlies)

**Dropped:** La Liga, Serie A, Ligue 1, Bundesliga, MLS, Brazilian, etc. as standalone content.
Top matches from other leagues may appear as specials but are not the core.

### 2. Fun Prediction Formats (replace dry 1/X/2)

Instead of "predict the score", users answer catchy yes/no and multiple-choice questions:

| Format | Example | Options | Points |
|--------|---------|---------|--------|
| **Will They Score?** | "Will Arsenal score today?" | Yes / No | 1 |
| **Over/Under** | "Arsenal vs Chelsea — over 2.5 goals?" | Over / Under | 1 |
| **First Blood** | "Who scores first? Man Utd vs Man City" | Home / Away / Nobody | 2 |
| **Red Card Roulette** | "Will there be a red card?" | Yes / No | 3 (rare event) |
| **Derby Prophet** | "North London Derby — exact score?" | Free input | 5 |
| **Weekend Accumulator** | "Pick 5 correct outcomes this weekend" | 5 selections | 10 if all correct |

Each format maps to one short video. The prediction IS the engagement hook.

- 6 good questions per week > 10 boring ones
- Mix of easy (Will They Score) and hard (Derby Prophet) for range
- Keep it fun, not a spreadsheet

### 3. Multi-Platform User Acquisition

**Content pipeline:**
```
Goal clip (5-15s) + prediction question overlay
  -> Post to TikTok / YouTube Shorts / Instagram Reels / Facebook
  -> CTA: "Think Arsenal scores 3+? Prove it -> link in bio"
  -> User lands on app.bettyscores.com
  -> Signs in with their platform account
  -> Makes prediction in 2 taps
```

**Target platforms for distribution:**
- TikTok (new)
- YouTube Shorts (new)
- Facebook / Instagram Reels (new)
- Telegram (existing — keep Mini App as one channel)

### 4. Multi-Platform Authentication

Users can register/login via any of these — no Telegram requirement:

| Provider | Auth Method | Status |
|----------|------------|--------|
| Google/YouTube | OAuth 2.0 | Planned — Phase 1 |
| Facebook | Facebook Login SDK | Planned — Phase 1 |
| Telegram | Existing TWA auth | Keep as-is |
| TikTok | TikTok Login Kit | Planned — Phase 2 (slower approval) |

**DB schema change:**
```sql
ALTER TABLE users ADD COLUMN provider TEXT;      -- 'telegram','google','facebook','tiktok'
ALTER TABLE users ADD COLUMN provider_id TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
-- Unique constraint on (provider, provider_id)
-- Existing telegram users: provider='telegram', provider_id=tg_id
```

**The web app (app.bettyscores.com) becomes the primary product.**
Telegram Mini App remains as one channel but is no longer the only entry point.

### 5. Shareable Result Cards

After each prediction round, users get a canvas-rendered image (1080x1920)
showing their picks and results — designed for sharing to Stories/TikTok/etc.
Creates a viral loop: share card -> friends see -> they join.

## Betty_Master_Data Sheet Changes

New **Challenges** tab structure:

| Week ID | Match Source ID | League | Kickoff UTC | Home | Away | Challenge Type | Question Text | Options | Correct Answer | Points |
|---------|----------------|--------|-------------|------|------|---------------|---------------|---------|----------------|--------|

- Replaces the old Fixtures tab as the source of truth for weekly content
- Misha approves challenges in the sheet before they go live
- Correct Answer filled after match completes
- Old tabs (Users, Predictions, Leaderboards) stay untouched

## Development Plan

### Phase 1: Content & Challenge Engine (next 2 sessions)
- [ ] New `challenges` table in D1 (type, question, options, points, answer)
- [ ] New Challenges tab in Betty_Master_Data
- [ ] Admin endpoint: publish challenges from sheet to D1
- [ ] Frontend: render challenge cards instead of match score inputs
- [ ] Scoring engine for yes/no, over/under, first_blood, accumulator
- [ ] Populate week 37-38 with EPL challenges

### Phase 2: Multi-Platform Auth (1-2 sessions)
- [ ] Standalone web app login page (not TWA-only)
- [ ] Google OAuth 2.0 integration
- [ ] Facebook Login integration
- [ ] Unified user table with provider/provider_id
- [ ] Migrate existing Telegram users (backfill provider columns)

### Phase 3: Content & Sharing (1 session)
- [ ] Shareable prediction card (canvas render, 1080x1920)
- [ ] Share to Story / copy link flow
- [ ] Link-in-bio landing page optimized for social traffic

### Phase 4: TikTok Auth + Polish
- [ ] TikTok Login Kit integration (requires app review)
- [ ] Onboarding flow for social media newcomers
- [ ] Points/leaderboard across all challenge types

## Rollback

Betty 2.0 stable state saved as git tag `v2.0`:
- GitHub release: https://github.com/MihelKlimm/betty-predictor/releases/tag/v2.0
- Rollback: `git checkout v2.0`

## Schedule

| Week | ISO | Content |
|------|-----|---------|
| 34 | Aug 17-23 | Current format (already live) |
| 35 | Aug 24-30 | Current format (already live) |
| 36 | Aug 31 - Sep 6 | Current format (already live) |
| 37 | Sep 7-13 | **First fun format week** — EPL only |
| 38 | Sep 14-20 | Fun format + CL group stage begins (British clubs) |
