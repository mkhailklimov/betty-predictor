# Changelog — 2026-06-27 (Week 2 scoring, prizes, Week 4 knockout build)

Scored **Week 2** and crowned its champion, mirrored results to the sheet +
app, kicked off the **Week 1 & 2 GRAM prize** payouts, and built **Week 4**
(first knockout week) on dev with a scheduled prod deploy. Also established the
"one round per week" curation rule (refined to allow adjacent knockout rounds in
one week).

## Week 2 (`2026_25`) — scored & finalized

- **10/10 results written** to D1 `matches` (all confirmed against the FIFA feed,
  competition 17 / season 285023). Done surgically (direct `wrangler d1` writes
  constrained to `week_id='2026_25'`) to avoid prematurely scoring the 2
  already-finished Week-3 ties that `POST /api/admin/results?apply=1` would have
  also written.
- **Champions rebuilt** (`POST /api/admin/rebuild`). Final Week-2 standings:
  - 🥇 **ippolitovdenis** — 6 pts
  - 🥈 **Mishanna45** — 5 pts
- **Mirrored out**: `POST /api/admin/export-marts` → Betty_Master_Data
  **Champions** + **Leaderboard** tabs. **Matches** tab updated with all 10
  results + statuses (cols K/N/O/P).
- **Data fix**: the sheet **Matches** tab `Week ID` column had mislabeled 6
  matches (IDs 15-20) as `2026_26`; their Weekstart is `2026-06-19` = Week 2.
  User corrected the column so the sheet now agrees with D1/Weekstart (Week 2 =
  10 matches). App Champions page serves `2026_25` live.

## Prizes (1 GRAM / week)

- GRAM = native TON 1:1. Betty wallet = **Antarctic Wallet** (funded ~10 GRAM).
- Payout flow (already built): winner connects a wallet on the **Leaderboard**
  (TonConnect) → address saved to D1 `users.ton_wallet`; we read it and send 1
  TON manually.
- **Week 1 winner Mishanna45** and **Week 2 winner ippolitovdenis** each DM'd the
  claim instructions (open `app.bettyscores.com` → Leaderboard → Connect Wallet).
  Verified the app only authenticates inside Telegram (`initData`/`tg_id`); the
  web URL forwards into `@bettyscores_bot`.
- Neither has connected yet → **not paid**. A background watcher polls
  `users.ton_wallet` for both and alerts the moment an address appears.

## Week 4 (`2026_27`) — first knockout week, ON DEV

- **Knockout week** opens with the 2 late Round-of-32 ties (IDs 31-32):
  - **Australia v Egypt** — Jul 3 18:00 UTC (Dallas)
  - **Argentina v Cape Verde** — Jul 3 22:00 UTC (Miami)
- The 8 **Round-of-16** ties (IDs 33-40) will be **appended** once the bracket
  resolves (~Jul 3-4) — same pipeline.
- Cadence: `opensAsNext 2026-06-29T00:00:00Z` / `becomesCurrent 2026-07-03T06:00:00Z`.
- Written to all three layers: **sheet** (`Matches!A32:P33`), **D1**
  (`match-31..32`, week_id `2026_27`, `is_active=1`), **frontend**
  (`WEEK4_MATCHES` + `WEEKS` entry in `frontend/src/data/matches.ts`).
- **Deployed to dev** (`dev.betty-scores-app.pages.dev`) and verified in the
  bundle (Week 4 + teams present, real cadence). KO scoring uses the 90-min
  result; "Cape Verde" reconciles to FIFA "Cabo Verde" via the `normTeam` alias.

## Decisions

- **Round of 32 mostly skipped** as a featured week; instead the 2 latest R32
  ties seed the knockout week (Week 4), which then grows into Round of 16.
- **One round per week** — never mix *group* with knockout; adjacent knockout
  rounds may share a "knockout week."
- Confirmed **Week 3 is live on prod** (verified the deployed bundle at
  app.bettyscores.com — all of Week 1/2/3 present). The earlier "Week 3 not on
  prod" note was stale.

## Ops

- **PROD deploy of Week 4 SCHEDULED** Mon 2026-06-29 00:00 UTC via system cron
  `0 2 29 6 *` (= 02:00 CEST) → `/home/misha/deploy-betty-week4-prod.sh` →
  prebuilt `/home/misha/betty-week4-prod-dist` (PROD tonconnect-manifest swapped
  in) → `wrangler pages deploy --project-name betty-scores-app --branch main`.
  3 retries, self-removes the cron entry on success, logs to
  `betty-week4-prod-deploy.log`. Mirrors the proven Week-3 mechanism.
- **`ADMIN_TOKEN` rotated** — the prior value was unrecoverable (CF Worker
  secrets are write-only) and not stored on the box. Set a fresh random token
  via `wrangler secret put ADMIN_TOKEN`; nothing else depends on it.

## Still ahead

- Append the 8 Round-of-16 ties to Week 4 (~Jul 3-4), then redeploy.
- Pay 1 GRAM to each winner once they connect a wallet.
- Monitor the scheduled Week-4 prod deploy log on Mon Jun 29.
