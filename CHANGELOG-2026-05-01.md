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
