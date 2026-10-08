# CHANGELOG 2026-10-08 — Week 42 preparation, fixture feed live, admin access

## Context

Follow-up to `CHANGELOG-2026-10-07-kickoff-lock.md`. Goal: publish week 42
(12–18 Oct) with real ESPN kickoff times so each challenge freezes at its own
kickoff, and let the assistant run the routine admin steps.

## Changes — live in production

- **Worker deployed (18:32 UTC, `main` @ `512a46c`).** Includes the fixture feed
  repair (ESPN month queries), the Release2.1 week publisher, the date-only
  kickoff fix and the removal of `DEV_PREVIEW_WEEK` (the API follows the real
  current week; week 42 appears on Monday 12 Oct 00:00 UTC).
- **Fixture leagues trimmed to 9** (`eng.1`, `eng.2`, `sco.1`, `uefa.champions`,
  `uefa.europa`, `uefa.europa.conf`, `fifa.world`, `uefa.nations`,
  `uefa.euro`). Workers Free allows 50 outgoing requests per invocation; the
  daily cron now makes at most ~30 (18 ESPN + FIFA + Google Sheets).
- **Fixture data refreshed** (18:34 UTC): 228 fixtures in `bronze_fixtures`,
  including all six week-42 matches.
- **`ADMIN_TOKEN` rotated** (write-only Cloudflare secret). The value lives only
  in `cf-worker/.admin-token` (git-ignored). Verified with a dry-run call.

## Betty_Master_Data — Release2.1 tab

- Column F stays `Picture_name` (sticker note). New columns:
  **G `Kickoff UTC`** and **H `Source ID`** (ESPN event id). The publisher reads
  G/H; teams and kickoff come from `bronze_fixtures` via the Source ID, and the
  sheet kickoff is only a cross-check.
- Week 42 rows written (rows 8–13):

  | # | Kickoff (UTC) | Fixture | Challenge | Pts | Source ID |
  |---|---|---|---|---|---|
  | 1 | Sat 17 Oct 11:30 | Everton vs Chelsea | Will Pickford keep a clean sheet against Chelsea? | 1 | 401878771 |
  | 2 | Sat 17 Oct 14:00 | Brentford vs Liverpool | Over or under 2.5 goals? | 1 | 401879262 |
  | 3 | Sat 17 Oct 14:00 | Manchester City vs Ipswich Town | Will Manchester City beat Ipswich Town? | 1 | 401879259 |
  | 4 | Sun 18 Oct 13:00 | Brighton & Hove Albion vs Crystal Palace | M23 derby — predict the exact score! | 3 | 401879261 |
  | 5 | Sun 18 Oct 13:00 | Leeds United vs Manchester United | Who scores first? | 3 | 401879260 |
  | 6 | Sun 18 Oct 15:30 | Nottingham Forest vs Arsenal | Predict the exact score! | 3 | 401878769 |

- Choices: Pickford (3 clean sheets in 5) replaced the Chelsea clean-sheet
  question; Man City vs Ipswich kept over the midweek Man City vs PSG option.

## Validation

- Week-42 **dry-run publish on production: ok, 0 errors, 0 warnings**; six
  challenges with ESPN kickoffs and real team names.
- Local end-to-end tests (in-memory SQLite + live ESPN): publish, refusals
  (no kickoff, outside week, already started, wrong Source ID, predictions
  without `force=1`) and `force=1` all behave as intended.

## Repo

- `.claude/settings.local.json` is no longer tracked (personal permissions).
- Google service-account key stored as `cf-worker/.betty-sa.json` (git-ignored).

## Open — next session

1. **Publish week 42** (not done yet — must happen before Mon 12 Oct 00:00 UTC):
   `POST /api/admin/publish-challenges?week=2026_42` with the admin token.
2. **Stickers.** Ready (untracked): `Pickford.png`, `BRE_LIV.png`, `MCi_IPS.png`.
   Still to make: `BHA_CRY`, `LEE_MUN`, `NFO_ARS`. Then: normalise file names
   (Pages URLs are case-sensitive), wire them to week-42 cards in
   `ChallengeCard.tsx`, fill `Picture_name` in the sheet, deploy the frontend.
3. **Pages GitHub integration** still not building on push (frontend changes
   need `wrangler pages deploy` until fixed).
4. Claude Code permission rules were added to `.claude/settings.local.json`;
   they take effect after a restart.
