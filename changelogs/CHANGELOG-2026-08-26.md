# Changelog — 2026-08-26

## Summary

Betty 2.0 backup secured and documented. Betty 2.1 challenge engine built
end-to-end (DB → API → frontend), deployed to dev, tested. Release plan
updated with full illustration brief and deploy schedule.

---

## Backup & Rollback (v2.0)

- **D1 backup verified** — `backups/betty-d1-v2.0.sql` (1.1MB) compared
  row-by-row against live D1: 61 users, 89 matches, 480 predictions,
  2 prizes, 1589 bronze fixtures — all match.
- **`backups/` added to git** — removed from `.gitignore`, SQL dump now
  tracked on GitHub.
- **`docs/BACKUP-2.0.md` created** — documents how the backup was made,
  how to verify it, and step-by-step rollback for Worker, Frontend, and
  Database independently.
- **Git tag `v2.0`** confirmed at `9fcfd86`.

## Release 2.1 Plan

- **`RELEASE-2.1.md` rewritten** from scratch with Misha's new vision:
  - 5-6 fun questions per week instead of 10 score predictions
  - British football focus (EPL, CL/EL British clubs, FA Cup, GB+Ireland)
  - Nickname registration from YouTube, TikTok, Facebook
  - Every question = a Reels/Shorts script for promotion
  - 4-platform acquisition diagram (YouTube, TikTok, Facebook, Telegram)
- **Deploy date set:** Monday Sep 7, 2026 at 00:00 UTC
- **Deploy sequence documented** with pre-deploy backup step

## DB Migration (0007_v21_challenges.sql)

- `challenges` table — id, week_id, match_id, type, question, options (JSON),
  points, correct_answer, resolved_at
- `challenge_predictions` table — id, user_id, challenge_id, answer,
  points_earned, with unique constraint on (user_id, challenge_id)
- `users` columns added: `provider`, `display_name`, `avatar_url`
- **Applied to live D1** and verified — all tables and columns present.

## Worker API (4 new endpoints)

| Endpoint | What it does |
|----------|-------------|
| `GET /api/challenges/current` | Serves this week's challenges with match data (crests, teams) and caller's predictions |
| `POST /api/challenges/:id/predict` | Submit/update answer with option validation and kickoff lockout |
| `POST /api/admin/publish-challenges` | Read Challenges sheet tab into D1 (supports `?dry=1`) |
| `POST /api/admin/resolve-challenges` | Set correct answers and score all predictions |

- **Tested end-to-end on dev:** insert challenge → predict → resolve → verify
  points_earned = 2 for correct answer.
- Admin token synced on dev worker.

## Frontend

- **ChallengeCard component** — renders per type:
  - Yes/No buttons (will_score, clean_sheet)
  - Over/Under buttons (over_under)
  - Home/Away/Nobody buttons (first_to_score)
  - ScoreReels (exact_score)
  - Points badge, saved indicator, correct/wrong result display
- **Match visuals on cards** — when challenge is linked to a match, shows
  team crests (ESPN) + league name + type icon. Falls back to large emoji.
- **MainPage simplified** — removed Current/Next week tabs. Single week view.
  Unified card carousel: challenges first, then match cards.
- **Challenges API client** — `challengesApi.getCurrent()` and `.predict()`
- **Types** — `Challenge`, `ChallengesResponse` added to `types/index.ts`
- **Deployed to dev** with 5 demo challenges for visual testing.

## Illustrations Brief (for Misha)

30 stickers documented in RELEASE-2.1.md section 9:

- **8 strikers:** Haaland #9, Salah #11, Saka #7, Palmer #20, Isak #14,
  Bruno #8, Son #7, Watkins #11
- **5 goalkeepers:** Onana #24, Alisson #1, Raya #22, Ederson #31, Sanchez #1
- **8 stadiums:** Emirates, Anfield, Old Trafford, Stamford Bridge, Etihad,
  Tottenham, St James', Villa Park
- **5 derby matchups:** North London, Merseyside, Manchester, West London,
  Liverpool vs Man Utd
- **4 generic types:** Over/Under scoreboard, First to Score race, Exact Score
  slot machine, Red Card referee

**Specs:** 400x400px PNG, transparent background, telegram sticker style,
Betty green palette, no real player faces (jersey number + kit colors only).

**Sourcing:** Midjourney/DALL-E or Fiverr sticker artist ($50-100 for full set).

---

## Next Steps (further sessions)

### Must-do before Sep 7 deploy

1. **Nickname registration (Phase 2)** — web signup with nickname + platform
   source tag. No OAuth. "Connect Telegram" prompt for Stars eligibility.
   Merge flow: web account → Telegram account.

2. **Leaderboard for challenges** — current leaderboard uses gold_leaderboard
   mart built from match predictions. Needs to include challenge_predictions
   points. Either extend rebuildMarts or build a parallel challenge leaderboard.

3. **Monday cron update** — `closeWeek` and `publishWeekFromSheet` need a
   companion `publishChallengesFromSheet` call in the Monday 00:00 cron.
   Currently challenges are only publishable via admin endpoint.

4. **Challenges tab in Betty_Master_Data** — create the sheet tab, fill
   week 37 with 5-6 EPL challenges, test publish flow end-to-end.

5. **Clean up demo challenges** — delete demo-1 through demo-5 from D1
   before prod deploy.

### Should-do (week 37-38)

6. **Illustrations** — Misha prepares sticker set (see brief above).
   Add `illustration_url` column to challenges table. Update ChallengeCard
   to render custom image when URL is present.

7. **Shareable result cards** — canvas-rendered 1080x1920 image showing
   player's picks and results, designed for Stories/TikTok sharing.

8. **First Reels batch** — record 5-6 videos from week 37 challenge scripts.
   Post across YouTube Shorts, TikTok, Facebook Reels, Telegram channel.

9. **Link-in-bio landing page** — optimized for social traffic conversion.

### Can wait

10. **Onboarding flow** for social media newcomers (not from Telegram).
11. **Weekly content calendar automation.**
12. **A/B test challenge formats** by engagement data.

---

## Commits

| Hash | Message |
|------|---------|
| `7ba6f96` | Add v2.0 D1 backup and rollback documentation |
| `25e5b0b` | Release 2.1 plan — fun predictions & multi-platform growth |
| `b71839d` | Add 2.1 deploy date: Monday Sep 7 00:00 UTC with deploy sequence |
| `e0ba2d0` | Add v2.1 DB migration: challenges, challenge_predictions, user provider columns |
| `28f6214` | Add v2.1 challenge API endpoints |
| `ae86c0d` | Add challenge cards to frontend — unified carousel with matches |
| `e2e581e` | Remove week tabs, add match crests to challenge cards |
| `a4f1765` | Update RELEASE-2.1 with progress, API docs, and illustration task list |
| `33e271f` | Add concrete illustration list: 30 stickers with players, stadiums, derbies |
