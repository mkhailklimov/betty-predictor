# CHANGELOG 2026-10-07 — Kickoff lock, real kickoff times, fixture feed repair

## Context

Release 2.1 bug: week-41 challenges stayed open after their match kicked off.
Investigating it showed three deeper problems:

- Week-41 kickoff times in D1 were hand-typed placeholders and mostly wrong
  (e.g. Arsenal–Leeds set to Wed 7 Oct 19:00; real kickoff is Sat 10 Oct 11:30).
- `bronze_fixtures` (ESPN feed) had not updated since 2026-07-31. ESPN stopped
  answering date-range queries (`dates=YYYYMMDD-YYYYMMDD` returns 0 events), so
  the daily ingest landed nothing without raising an error.
- Cloudflare Pages (`betty-scores-app`) stopped building from GitHub after
  `64f1727`. Pushes to `main` no longer deploy the frontend.

## Changes — live in production

- **Kickoff lock (Worker, deployed 18:30 UTC).** Each challenge has its own
  `kickoff_utc` (migration `0008_v21_challenge_kickoff.sql`). The predict endpoint
  returns 403 at or after kickoff; `/api/challenges/current` marks each card
  `locked` and orders cards by kickoff.
- **Week-41 kickoffs corrected from ESPN (D1):**

  | Challenge | Fixture | Kickoff (UTC) |
  |---|---|---|
  | preview-ch-41-02, -06 | Arsenal vs Leeds United | Sat 10 Oct 11:30 |
  | preview-ch-41-05 | Chelsea vs AFC Bournemouth | Sat 10 Oct 14:00 |
  | preview-ch-41-03 | Manchester United vs Tottenham Hotspur | Sat 10 Oct 16:30 |
  | preview-ch-41-04 | Liverpool vs Manchester City | Sun 11 Oct 15:30 |

  The matching `matches` rows were updated too.
- **England–Croatia (preview-ch-41-01)** resolved as 7:0; 3 points awarded to
  7–0 picks.
- **Frontend (direct upload to Pages, `f19d86e`):**
  - The carousel opens on the first card that hasn't started and jumps to the next
    open card the moment the viewed one kicks off (timer at the exact kickoff).
    Started cards stay reachable with the back arrow and show "🔒 The event is
    locked".
  - No more "❌ Wrong": a missed pick reads
    `Result: 7:0 · Your pick: 2:1 — next one's yours!` in soft yellow, not red.
    "We play for joy, not for troubles."

## Changes — committed, not yet deployed (`cc54b9b` on `fix/task1-kickoff-lock`)

- `parseKickoffUtc`: a date-only value (`2026-10-08`) means 00:00 UTC.
- `ingestFixtures`: queries ESPN by month (`dates=YYYYMM&limit=1000`), keeps
  events inside the window (3-day lookback so recent results reach
  `bronze_match_results`), returns `ok: false` when every league is empty.
- `publishChallengesFromSheet` (Release2.1 tab):
  - reads new columns F `Kickoff UTC` and G `Source ID` (ESPN event id);
  - takes teams and kickoff from `bronze_fixtures` (the sheet kickoff is only
    a cross-check, and a mismatch is reported as a warning);
  - refuses rows with no kickoff, outside the week, already started, or whose
    Source ID belongs to a different fixture;
  - refuses to replace a week that has predictions unless `force=1`;
  - creates the `weeks` row if missing;
  - stores `kickoff_utc`, `home_team`, `away_team`, `source_id` on each challenge.
- `wrangler.toml`: removed `DEV_PREVIEW_WEEK = "2026_41"` (prod and dev), so the
  API follows the real current week from Monday 12 Oct.

## Validation

- Frontend production build passed.
- Live API checked: all week-41 kickoffs match ESPN; only England–Croatia locked.
- New ingest run locally against live ESPN: 875 fixtures from 34 leagues, 0
  failures; all six week-42 Source IDs present with the expected kickoffs.
- Publisher tested end to end on in-memory SQLite: week 42 publishes 6
  challenges; refusals and `force=1` behave as intended.

## Open — next session

1. **Subrequest limit (blocker before deploying `cc54b9b`).** The Worker is on
   Workers Free (50 outgoing requests per invocation). Month queries make one
   request per league per month: 34 in a one-month window, 68 when the window
   spans two months, plus the Google Sheets calls in the same cron. Reduce
   (e.g. trim `LEAGUES` to the leagues we actually use, or split the work)
   before deploying.
2. **Pages GitHub integration.** Check `betty-scores-app` → Settings → Builds &
   deployments; until fixed, frontend changes need a direct upload.
3. **Merge and deploy** `cc54b9b`: push branch and `main`, `npx wrangler deploy`.
4. **Week 42 (12–18 Oct):** pick events, run
   `POST /api/admin/ingest-fixtures?sheet=0`, fill Release2.1 F/G, then
   `POST /api/admin/publish-challenges?week=2026_42&dry=1`, then without `dry`.
   Must be done before Monday 00:00 UTC; the Monday cron publishes the
   *following* week (43).
5. Housekeeping: `backups/betty-d1-pre-kickoff-lock.sql` is untracked (keep out
   of git); `frontend/package-lock.json` has an unrelated local change.
