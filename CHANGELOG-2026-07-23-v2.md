# 2026-07-23 — Betty Scores v2.0 release plan

**Status: PLANNED — development starts the week of 2026-07-27.**
Nothing below has shipped. This entry records the agreed scope, the decisions
behind it, and the rollback anchors captured today. The full spec is
[`docs/RELEASE-2.0.md`](docs/RELEASE-2.0.md).

---

## Why

WC2026 closed out on 2026-07-20 — 48/48 matches scored, champion crowned
(`CHANGELOG-2026-07-20.md`, `docs/TOURNAMENT-CLOSEOUT.md`). v1 was built for one
fixed-length tournament, so with the World Cup over it has no fixtures left to
serve, and three structural limits are now blocking:

- fixtures hardcoded in `frontend/src/data/matches.ts` — a new week means a code
  change and a deploy
- `OutsideTelegramScreen` blocks every browser visit to `app.bettyscores.com`
- GRAM/TON prizes, on a payout path zero of 15 users ever connected a wallet to

v2.0 turns Betty into a **perpetual weekly game**.

---

## What changes for a player

- **A new week every Monday.** 10 matches from the top football events — English
  Premier League and other European leagues, MLS, Champions League, national
  teams, women's football. Week runs Mon 00:00 → Sun 23:59 UTC; next week's
  fixtures publish Monday 00:00.
- **Two spinning reels, 0–12,** replace the 1/X/2 buttons and the score grid.
  The two values are the whole bet; the outcome is derived. A match counts as
  predicted only once a reel is moved — **an untouched 0:0 is not a bet.**
- **Playable in a browser.** Arriving from YouTube or TikTok no longer means
  hitting a "Betty Scores lives in Telegram" wall — log in with Telegram, or
  play as a guest and merge into a real account later.
- **One link, `app.bettyscores.com`,** with Matches, Leaderboard, Champions and
  About as real linkable URLs. `bettyscores.com` redirects there.
- **Stars prizes: 100★ for 1st, 50★ for 2nd, every week.** GRAM and TON come out
  of all player-facing copy.

## What changes for operations

- **A Monday curation ritual replaces the World Cup fixture bundle.** Each week
  you pick 10 matches in the `Fixtures` tab of Betty_Master_Data, from a
  `Candidates` tab that cron fills automatically from the league feeds. Monday
  00:00 cron loads your picks into D1 and the app serves from there.
- **The sheet curates; D1 serves.** The app never calls Google at runtime — see
  `docs/RELEASE-2.0.md` §3.1 for why putting Sheets on the read path would break
  under traffic. This keeps the rule the codebase already documents at
  `cf-worker/src/worker.js:1071`: mirror tabs are sinks, never sources.
- **Publish guards.** A week refuses to publish unless it has exactly 10 rows,
  no duplicate source ids, and all kickoffs in the future and inside the Mon–Sun
  window. A broken sheet leaves last week live rather than emptying the app.
- **Crons are repurposed, not switched off** — this closes the outstanding
  post-tournament item "turn the hourly cron down".
- **Stars are delivered manually.** The Bot API has no "send Stars to a user"; a
  bot only receives Stars via invoices, or pushes value out as a Gift. The app
  computes and displays 1st/2nd as `owed` until you mark them `paid`.

---

## Locked decisions (2026-07-23)

| # | Decision |
|---|---|
| 1 | Fixtures: feeds → `bronze_*` in D1 → sheet `Candidates` (auto sink) → human picks 10 in sheet `Fixtures` → Monday 00:00 cron → D1 `matches` → `/api/matches` |
| 2 | Reels only; outcome derived from the two values; touch-to-bet |
| 3 | One link, `app.bettyscores.com`, with real routes per page |
| 4 | Telegram Login Widget + guest fallback, merging on later login |
| 5 | 100★/50★ weekly, displayed `owed`/`paid`, delivered manually |

---

## Rollback anchors (captured 2026-07-23)

v2.0 is designed to be reversible in three independent layers. The hard
constraint that makes it work: **all D1 migrations are additive only** — new
nullable columns and new tables, no drops, renames or type changes — so a
rolled-back v1 Worker still runs against a v2 database.

| Anchor | Value |
|---|---|
| Git tag | `prod-v1-final` → `499bd00` (`main` and `dev` identical) |
| Worker `betty-api` version | `26f32105-20c0-41d8-ace3-e45c3b2bdc1a` (2026-07-20T17:48Z) |
| Pages `betty-scores-app` production deployment | `a79f87cd-c808-49ac-85f8-05ee0c5d89eb` (source `499bd00`) |

Rollback commands and the full drill are in `docs/RELEASE-2.0.md` §4 and §8.

---

## Blockers to clear before development

- **BotFather `/setdomain`** for `app.bettyscores.com` — browser action on the
  product owner's side; blocks Telegram Login Widget entirely.
- **Provision a separate `betty-db-dev` D1.** The dev Worker currently points at
  the *production* database. v1 tolerated that because dev was only used for
  read-only probes; v2 dev testing writes fixtures, guest users and prize rows.
- **Verify ESPN league endpoint coverage**, especially women's football, before
  fixing the league list.

---

## Files

- `docs/RELEASE-2.0.md` — full release plan: decisions, rollback strategy, six
  workstreams with the files they touch, sequencing, verification.
- `CHANGELOG-2026-07-23-v2.md` — this entry.

No product code changed in this commit.
