# 2026-04-26 — TON Connect integration + @tApps_bot submission

## Decisions reversed
- **TON integration: back in scope.** Yesterday's read was that TON was rejected; today user confirmed Betty will integrate TON Connect to enable on-chain prize payouts and unlock the @tApps_bot catalog listing. Memory updated (`project_betty_ton.md` added, `MEMORY.md` index updated).
- **Payout model**: manual on-chain send from a treasury wallet to the winner's connected address. No automated hot wallet, no smart contract escrow — not justified at 1 TON/week.
- **Analytics SDK token source**: `@DataChief_bot` redirects to TON Builders Portal (`builders.ton.org`); the actual API key form lives there, not in @tApps_bot.

## TON Connect implementation
- Installed `@tonconnect/ui-react` and `@telegram-apps/analytics` in `frontend/`.
- Hosted manifest at `frontend/public/tonconnect-manifest.json`. Dev branch points at `dev.betty-scores-app.pages.dev`; main branch points at `app.bettyscores.com`.
- `frontend/src/main.tsx`: wrapped App in `<TonConnectUIProvider manifestUrl=...>`; analytics SDK init was env-var-guarded, then later hardcoded once we got the real token.
- `frontend/src/pages/LeaderboardPage.tsx`: added `<TonConnectButton/>` at bottom in a `.ton-connect-zone` div. Gating evolved twice:
  - First rule: `rank <= 3` (top 3 only).
  - Final rule (per user): `points > 0` — show to anyone who has earned TON. Hide entire zone if 0 TON. After connect, swap copy from "connect a wallet" to "Wallet connected — prizes will be sent here" (lets user change wallet).
- `frontend/src/services/api.ts`: added `userApi.saveWallet(ton_address)` → `POST /api/user/wallet`.
- Auto-saves the connected address to backend via a `useEffect` hook that fires when `tonAddress` changes.

## Worker
- Added `POST /api/user/wallet` to `cf-worker/src/worker.js`. Reads `tg_id` from Bearer token, writes `ton_wallet` and `ton_consent=1` for that user. Uses existing schema columns — no migration needed.
- **Deploy mistake**: ran `npx wrangler deploy` without `--env`, which deployed to **prod (`betty-api`)** first instead of dev. Caught immediately, deployed `--env dev` (`betty-api-dev`) right after. Mitigations:
  - Both workers share the same D1, so no data divergence.
  - The two changes that landed (privacy field drop + new wallet endpoint) were already destined for prod, just out of order.
  - Confirmed both deploys live: `/health` returns 200, `POST /api/user/wallet` returns 400 on empty body (validation works).

## Landing site
- `deploy/index.html` Payout rule rewritten: was "paid in TON to the Telegram Wallet linked to the winning Telegram account"; now "winner connects a TON wallet on the Leaderboard page in the Mini App; payment is sent on-chain to that address."
- Privacy text from yesterday already covered wallet collection — left alone.

## Mirror to prod
- `git checkout main && git merge dev` produced two conflicts:
  - `deploy/index.html` (line 545 payout text — took dev's version).
  - `frontend/src/data/matches.ts` — main was at `CARD_ASSETS_VERSION = '1'`; dev had `'5'` plus `LOCAL_FLAGS`/`getLocalFlag`/`flagToTwemojiUrl` helpers. Took dev's version wholesale.
- Swapped manifest `url`/`iconUrl` from `dev.betty-scores-app.pages.dev` to `app.bettyscores.com` before the merge commit.
- Pushed `main` (commits `450d9b2` then `e5cb92c` after analytics token added).
- Smoke-checked prod via curl: manifest serves correct JSON, deployed bundle contains `ton-connect-zone`, `tganalytics.xyz`, `betty_scores`, and the matching token strings.

## @tApps_bot submission
- Pre-flight: BotFather Edit Bot for `@bettyscores_bot` — set About (89 chars), Description (434 chars), 4 slash commands, Privacy Policy URL = `https://bettyscores.com/#about`, Botpic, and the 640×360 Description Picture (user initially uploaded a 360×640 portrait image; corrected to landscape).
- @tApps_bot compliance gate requires the analytics SDK to be working **before** submission, not after.
- Token flow that actually works:
  1. `@DataChief_bot` → "Manage on TON Builders" button.
  2. TON Builders Portal → register project "Betty Scores" with bot link, channel, github.
  3. "Set up Analytics" → Create API Key → enter Analytics Identifier `betty_scores`, Telegram link `https://t.me/bettyscores_bot`, Web app link `https://app.bettyscores.com`.
  4. Token issued (a base64+JWT-ish string ending in a signature segment).
- **Hardcoded the token in `main.tsx`** instead of doing the CF Pages env-var dance — Vite's `VITE_*` vars get baked into the client bundle anyway, so the token is public-by-design (same model as a Google Analytics measurement ID). Committed as `a22a008`, mirrored to prod as `e5cb92c`. Verified `betty_scores` + `tganalytics.xyz` strings present in the deployed bundle.
- Submission form (5 steps via @tApps_bot):
  1. App link: `https://t.me/bettyscores_bot` (no Mini App short_name registered, used the bot link as fallback).
  2. Analytics identifier: `betty_scores`.
  3. Subtitle (3-6 words, ≤60 chars): `Predict scores. Win TON every matchweek.` (40 chars).
  4. Full description (390 chars, plain text, no formatting/emojis).
  5. 3 vertical screenshots; bot logo used as fallback for app logo.
- **Submitted.** Awaiting @tApps_bot moderator review.

## Commits today
- `4674abe` — TON Connect: add wallet connect on Leaderboard, gated to top 3
- `740d95d` — Leaderboard: show Connect Wallet to anyone with TON earned
- `0491f86` — Landing: clarify payout uses TON Connect wallet from Mini App
- `450d9b2` — Merge dev → main (TON Connect + landing payout text)
- `a22a008` — Wire TG Mini Apps Analytics token
- `e5cb92c` — Merge dev → main (analytics token)

## Open items
- **Test TON Connect end-to-end after Week 1 closes** — current user has 0 points so the wallet zone correctly hides; can't fully verify the connect/save flow until a real winner exists. Optional shortcut: bump a dev D1 user's `points` to ≥1 to dry-run.
- **Optional polish**: register a Mini App short_name in BotFather (`/newapp` → `@bettyscores_bot` → short_name e.g. `play` → URL `https://app.bettyscores.com`) so future links can be `https://t.me/bettyscores_bot/play` instead of the bot link.
- **Open items from yesterday still pending**: PNG compression (pngquant/oxipng), dev bot menu URL → stable alias (user did this today via BotFather), dev-only D1 DB, rotate CF API token, scrub leaked CF account ID from commits `218601e`/`9beb9a6`.
- **Watch**: @tApps_bot moderator response. Expect a few days. They'll DM `@bettyscores_bot` owner.

## Bets sheet sync (added late session)
- Friend tested the app; user expected Bets + Users tabs in the match-data spreadsheet (`1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus`) to populate but neither did.
- Root cause: (a) no Bets sync existed at all, (b) Users sync is weekly cron `0 6 * * 5` so it hadn't fired since the test.
- Added `syncBetsToSheet` in `cf-worker/src/worker.js` parallel to `syncUsersToSheet`. JOINs `predictions` with `users` + `matches` so the sheet is human-readable.
  - Bets columns: `id, user_id, tg_id, username, match_id, home_team, away_team, match_time, prediction_type, predicted_score, points_earned, created_at, updated_at`.
- Cron handler now calls both syncs together; `/api/admin/sync-users` returns `{ users, bets }` and triggers both.
- No new secrets — reuses `GOOGLE_SA_JSON`, `SHEETS_SPREADSHEET_ID`, `ADMIN_TOKEN`.
- Deployed dev first (`--env dev`), then prod. Commit `30ad9e3` on main.
- User opted to wait for the natural Friday 2026-05-01 06:00 UTC run rather than fire a manual sync now or schedule a verification agent.
- User confirmed the `Bets` tab already exists in the spreadsheet (sync would 400 on `Bets!A:Z:clear` otherwise).

## Open caveats / mistakes worth remembering
- Deployed worker to **prod before dev** by forgetting `--env dev` on `wrangler deploy`. Doesn't violate dev-first by intent but does by sequence — added to memory tag for future sessions to be more careful with multi-env wrangler configs.
- Initial Connect button gating was top-3, but user re-scoped it twice (once in chat — to "all top 3 plus past winners", then narrower — to "anyone with TON earned"). Final rule lives in `LeaderboardPage.tsx` as `myEntry.points > 0`. If we ever add a real per-week prize history, eligibility will need a rethink.
- Manifest URL is **branch-specific** (`dev.betty-scores-app.pages.dev` on dev, `app.bettyscores.com` on main). Future merges in either direction need to remember to swap, not let the merge auto-resolve.
