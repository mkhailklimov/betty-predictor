# 2026-05-01 — @tApps_bot rejection + two critical assistant failures

## @tApps_bot moderation result

Response received from `@tapps_center_moderation` (verbatim):

> Hello! Thanks for sharing your app with us.
>
> While there's nothing wrong with your project, it doesn't quite align with our current focus. Our main priority is web3 and crypto-related apps, especially those built around the TON blockchain. We also tend to approve well-made Telegram tools (like chat or channel management tools) and entertainment apps, mostly games, that support payments in TON or Telegram Stars.
>
> That said, you're absolutely free to continue growing your app in other ways, such as using Telegram Ads, social mechanics, or other promotion channels.
>
> Thanks again for reaching out, and we wish you the best with your project.

Soft rejection. App not banned, can keep operating — only the catalog listing is denied. Required gap: Betty has TON **outflow** (1-TON weekly prize) but no TON or Telegram Stars **inflow** from users. Catalog wants user-facing payments, not just payouts.

## Critical assistant failure #1 — Unmatched Telegram App Center requirements

**What happened:** assistant guided the submission to `@tApps_bot` on 2026-04-26 with the architecture as it stood — TON Connect for payouts only, no inbound user payments. App Center's actual approval criteria require Telegram Stars or TON purchases by users (entry fee, premium tier, IAP, etc.). Submission was therefore structurally ineligible from day one.

**Why this is on the assistant:** the user stated from day one the goal was a Telegram product. Verifying the catalog's monetization requirements *before* submission was elementary diligence. Instead, requirements were treated as discoverable post-submission. Result: ~6 days of waiting, plus the morale cost, on a submission that could not have passed in its submitted form.

**What should have happened:** before recommending submission, read App Center's published acceptance criteria and current focus statement, compare against Betty's payment surface, flag the gap to the user, and either (a) add a Stars cosmetic tier first, or (b) submit knowingly understanding rejection was likely and label it a probe, not a launch.

**Cost:** ~1 week elapsed; misplaced expectation of catalog inclusion in time for WC 2026 launch on 2026-06-11.

## Critical assistant failure #2 — Losing submitted player results from the web interface

**What happened:** user's friend tested the app this week. No row appeared in the `users` table; no predictions, no bets. Investigation on 2026-05-01 confirmed D1 has had zero new writes since 2026-04-10 across `users`, `predictions`, and `bets`. The friend opened `https://app.bettyscores.com` directly in a browser. Outside the Telegram WebView there is no `WebAppInitData`, so `/api/auth/init` rejects the request and the client silently fails — no user row, no bets recorded, no error visible to the player.

**Why this is on the assistant:** when the public domain `app.bettyscores.com` was set up, no guard was added for the "opened outside Telegram" case. This is a known failure mode of every Mini App on the platform — it should have been anticipated and mitigated *before* the user shared a link with anyone. The fix is ~30 minutes: detect empty `Telegram.WebApp.initData`, render an "Open in Telegram" screen with a `tg://resolve?domain=bettyscores_bot` deep link.

**What should have happened:** the moment `app.bettyscores.com` was wired up, an `initData`-empty fallback page should have been added, and every share surface (landing page, README, any link the user might pass to a friend) should have routed through `t.me/bettyscores_bot` instead of the raw web URL.

**Cost:** the friend's full session is unrecoverable. There is no log, no draft, no buffered submission. Whatever predictions or bets they entered cannot be reconstructed because they never reached the worker. Beyond the data loss, this destroyed the user's trust in the system on the day they were already absorbing the catalog rejection.

## Forensic queries (preserved for audit)

Run on remote prod D1 `betty-db` (`a064b461-a310-484e-80de-66a684e71c7c`), 2026-05-01 ~12:35 UTC:

| Query | Result |
|---|---|
| `SELECT COUNT(*), MAX(created_at) FROM users` | 4 rows, latest `2026-04-10 15:13:38` |
| `SELECT COUNT(*) FROM users WHERE created_at > '2026-04-20' OR updated_at > '2026-04-20'` | 0 |
| `SELECT COUNT(*) FROM predictions WHERE created_at > '2026-04-20'` | 0 |
| `SELECT COUNT(*) FROM bets WHERE created_at > '2026-04-20'` | 0 |
| `SELECT ... FROM users WHERE ton_wallet IS NOT NULL OR ton_consent = 1` | 0 rows |

The four existing users are `islavutin`, `MikeKlimov`, `bettyscores`, `TestUser`. None is the friend.

## Status of work

- Avocado Farm repo bootstrapped 2026-04-30; user has paused work on it and is evaluating whether to continue with this assistant.
- Betty Scores prod app continues to function for users who launch via `t.me/bettyscores_bot`. WC 2026 tournament starts 2026-06-11.
- Open mitigations not yet implemented: `initData`-empty guard on `app.bettyscores.com`; share-surface audit; Telegram Stars cosmetic tier (would unblock catalog re-submission).

## Late-day session (after user re-engaged)

User changed direction and asked to (1) lead web visitors to the bot and (2) adjust the app to App Center requirements. Both shipped on dev, partially mirrored to prod.

### Shipped on dev branch (commits `97c67aa`, `4cca479`, `8652daf`, `d87a670`, `7c2a4ca`)

**OutsideTelegramScreen (web → bot redirect)**
- New component renders when `WebApp.initData` is empty and host isn't localhost.
- Anchors to `https://t.me/bettyscores_bot` (universal link — works with or without Telegram installed). First version used `tg://` deep-link; that failed silently on desktop browsers without Telegram, switched to `<a href>`.
- Localhost exempted so `npm run dev` still works.

**Telegram Stars Premium tier**
- Worker: `POST /api/payments/create-stars-invoice` (calls Bot API `createInvoiceLink`, currency `XTR`, 50 Stars). `POST /tg/webhook` validates `X-Telegram-Bot-Api-Secret-Token`, handles `pre_checkout_query` (auto-approve) and `message.successful_payment` (sets `users.is_premium=1`, inserts into new `premium_purchases` audit table).
- Migration `0001_premium_purchases.sql` applied to remote D1.
- Frontend: yellow "Get fave team avatar ⭐ 50" button on Leaderboard (dark card for contrast). Tap → `WebApp.openInvoice(url, callback)` → on `paid`, refresh user state and auto-open flag picker.

**Flag picker (premium perk)**
- Migration `0002_users_fav_team.sql` applied (added `users.fav_team TEXT`).
- Worker: `POST /api/user/fav-team` (premium-gated, validates against 31-team `ALLOWED_TEAMS` set matching `public/teams/Cards/*.png`). Leaderboard endpoint returns `fav_team` per row.
- Frontend: `FlagPickerModal` (4-col grid of 31 WC teams), opens auto-after payment or via "Change my flag" button. Leaderboard rows render team thumbnail next to username when `fav_team` set.

**Dev verification**
- Dev worker `betty-api-dev` deployed with `BOT_TOKEN` + `WEBHOOK_SECRET` secrets set. Webhook registered on `@betty_worldcup2026_bot` → `https://betty-api-dev.mihel-klimm.workers.dev/tg/webhook`.
- Dev bot token shared by user via Drive `BotfatherAPI.txt`, pulled via `betty-sheets-sync@betty-games.iam.gserviceaccount.com` SA, saved to `/tmp/botfather_api.txt`.
- Forced `is_premium=1` on `tg_id IN ('500886298','1056798742')` for testing without paying real Stars. **Note: still set in D1 — leave as-is, both are admin/test accounts.**
- User confirmed end-to-end: button visible, modal opens, flag picks save, thumbnail renders in row.

### Mirrored to prod (commit on main: `e5d0caa`)

- `main` push → CF Pages deploys to `app.bettyscores.com`.
- Worker prod (`betty-api`) deployed via `npx wrangler deploy`.

### **BLOCKED — picked up next session**

1. **Prod custom domain `api.bettyscores.com` returns 522** (origin unreachable). Worker direct URL `betty-api.mihel-klimm.workers.dev` is healthy. **Pre-existing issue, not caused by today's deploy** — `wrangler deploy` doesn't touch Custom Domain bindings, and there's been no Mini App traffic since 2026-04-10 to surface it. User was navigating CF dashboard (`/workers/services/view/betty-api/production/settings`) but couldn't find Triggers/Custom Domains section. Resume here next session: have user locate "Domains & Routes" on the Settings page and re-attach `api.bettyscores.com`, OR fall back to pointing frontend at `betty-api.mihel-klimm.workers.dev`.

2. **Prod bot token not yet provided.** User to drop it in the same Drive folder (`https://drive.google.com/drive/folders/1p79VMb1MQZLacXH6mY-8c4a0AXFyiqQl`) as e.g. `BotfatherAPI_prod.txt`. Once available + custom domain fixed:
   - `npx wrangler secret put BOT_TOKEN` (no `--env`, defaults to prod)
   - `npx wrangler secret put WEBHOOK_SECRET`
   - Register webhook on `@bettyscores_bot` → `https://api.bettyscores.com/tg/webhook` (or `betty-api.mihel-klimm.workers.dev` if (1) isn't fixed).

3. **Re-submit to `@tApps_bot` catalog** once prod payments work end-to-end. Wording for resubmission should explicitly mention the new Telegram Stars purchase and TON payout combo, addressing the moderator's stated criteria (TON or Stars user payments).

4. **Avocado Farm** is still paused — user said "we will skip it for now. lets consider for future" re: avatar/flag/display-name ideas. Avocado work remains parked until Betty's prod is back online.
