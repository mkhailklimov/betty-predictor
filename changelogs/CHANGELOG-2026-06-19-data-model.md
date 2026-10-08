# Changelog — 2026-06-19 (Data model: Kimball + medallion)

Reworked Champions/Leaderboard from ad-hoc/live-computed data into a proper
Kimball + medallion pipeline, switched the results fact-source to FIFA, fixed the
public landing page, and rebranded the leaderboard currency TON → GRAMs.
Full design + DDL: `docs/DESIGN-DATA-MODEL.md`. All phases **live on prod**.

## Added

- **Medallion + Kimball schema in D1** (`cf-worker/migrations/001_medallion.sql`,
  `002_*`, `003_fifa.sql`):
  - 🥉 bronze: `bronze_adjustments` (manual scoring), `bronze_match_results`
    (source-agnostic results landing) + existing `users`/`predictions`/`matches`.
  - 🥈 silver star: `silver_dim_user/week/team`, `silver_fact_bet/result/score`.
  - 🥇 gold marts: `gold_champions` (user×week), `gold_leaderboard` (user).
- **`rebuildMarts(env)`** — idempotent, deterministic full rebuild bronze→silver→gold.
  Triggers: hourly cron + `POST /api/admin/rebuild`.
- **Canonical scoring** (`scoreBet`) — the single definition: correct outcome = 1,
  exact score = 3 total. Replaces the old `+1 then +3 = 4` bug.
- **Manual adjustments**: sheet `Adjustments` tab (`Week ID | Username | Points Delta
  | Reason`) → `syncAdjustmentsFromSheet()` → `bronze_adjustments`, applied in the
  gold rollup. `POST /api/admin/sync-adjustments` (`?dry=1` to preview).
- **Sheet mirror**: `exportMartsToSheet()` writes gold → `Champions`/`Leaderboard`
  tabs (one-way). Weekly Friday cron + `POST /api/admin/export-marts`.
- **FIFA results ingestion**: `ingestFifaResults()` (api.fifa.com v3, competition 17 /
  season 285023, `MatchStatus 0` = finished) + `reconcileResults()` (match by
  normalized team identity + ±1.5d window). `POST /api/admin/results` (`?apply=1`).
  **Dry by default, not in cron** — applying results is an explicit admin action.
- **Landing live data** (`deploy/index.html`): Champions + Leaderboard now fetch the
  gold API (were static placeholders).
- **`grams` field** on `/api/leaderboard` = `weeks_won` (1 whole Gram per week won).

## Changed

- **`/api/champions`** — now serves `gold_champions` for the latest week (was: read
  the Google Sheet Champions tab). Champions page reads it (was: all-time leaderboard
  mislabeled "Last Round Results").
- **`/api/leaderboard[/overall]`** — now serves `gold_leaderboard` (was: live-compute
  from predictions with the buggy +4 scoring; both routes returned identical data).
- **Internal/test accounts excluded** from all marts via `dim_user.is_internal`
  (MikeKlimov, bettyscores, bet_monitoring, TestUser).
- **Results source ESPN → FIFA**; bronze landing made source-agnostic
  (`bronze_match_results` with a `source` column).
- **Landing Matches → Current/Next** (`resolveCadence()` from sheet Weekstart),
  matching the app's `resolveWeeks()` (was: one tab per week).
- **Leaderboard currency TON → GRAMs 💎** (app + landing): header `GRAMs 💎`, value =
  whole `weeks_won` (no decimals; old `points × 0.1` removed), 💎 shown only when > 0.
  Winner (Mishanna45, Week 1) shows `1 💎`. App title → "GRAM Leaderboard"; wallet
  prompt gated on `grams > 0`. TON-Connect payout rail kept.

## Decisions

- **D1 is the source of truth; the sheet is one-way I/O.** IN: schedule → `matches`,
  `Adjustments` → `bronze_adjustments`. OUT: `Users`/`Champions`/`Leaderboard`
  mirrored from gold. No tab is both source and sink.
- **Manual scoring stays manual** but is recorded as an INPUT (`bronze_adjustments`),
  never an edit of computed output — marts remain fully recomputable.
- **FIFA `apply` is manual-only** (user decision) — never auto-applied / not in cron,
  so a name-mapping error can't silently overwrite prod results.
- **week_id (ISO calendar week) ≠ the betty week** (Fri→Thu, matches Sat→Thu); group
  by Weekstart, not week_id.

## Validation

- Gold reproduces the official sheet exactly: Mishanna45 4 (4/0), islavutin 2 (2/0),
  ippolitovdenis 2 (2/0) for week 2026_24.
- FIFA reconcile: 10/10 week-24 games matched, 0 discrepancies (independently
  confirms admin-entered results were correct).

## Deploy

- Worker `betty-api` (prod) / `betty-api-dev` (dev). App `betty-scores-app`
  (main = app.bettyscores.com). Landing `betty-scores` (main = bettyscores.com).
- New D1 tables are additive; dev+prod share `betty-db`.
