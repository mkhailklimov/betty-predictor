# Changelog 2026-07-29 — v2 workstreams 5-7

**Commit:** `a003b5e` on `dev`
**Builds on:** v2 fixture pipeline + reels UI (commits `ae13e7a`..`35a793e`)

---

## Workstream 5: Identity & Web Entry (RELEASE-2.0.md §5.3)

### Migration `0005_v2_identity.sql`
- `users.auth_source` — `miniapp` | `widget` | `guest`
- `users.guest_token` — unique opaque token for guest sessions
- `users.merged_into` — tombstone pointing to the real account after merge
- `users.ref_source` — `?ref=` / `utm_source` captured on first load

### Worker: three-mode authentication
`resolveTgId()` now returns `{ tgId, authSource }` and handles:
- `tma <initData>` — Mini App (existing, unchanged)
- `tgauth <json>` — Telegram Login Widget (new). Key derivation: `SHA256(bot_token)`, not `HMAC('WebAppData', bot_token)`. Data-check-string is sorted `k=v\n`. 24h `auth_date` window.
- `guest <token>` — server-issued opaque token (new)

All existing callers updated via `resolveTgIdStr()` wrapper (returns just the tg_id string).

### Worker: guest & merge endpoints
- `POST /api/user/guest` — mints a guest user (`tg_id = 'guest:<uuid>'`) with an opaque token. Accepts `?ref=` for attribution.
- `POST /api/user/merge` — moves guest predictions to the real Telegram account on first login. Conflict rule: real account's existing bet wins. Sets `merged_into` tombstone on the guest row.
- `rebuildMarts()` now queries `WHERE merged_into IS NULL` to prevent double-counting merged guests on the leaderboard.

### Frontend: web entry point
- `OutsideTelegramScreen` rewritten from a "Telegram-only" wall to a real entry point:
  - Telegram Login Widget (`data-telegram-login`, callback `onTelegramAuth`)
  - "Play as guest" button
  - Clear copy: guests are prize-ineligible until they log in
- `api.ts` interceptor handles auth priority: `tma` > `tgauth` (localStorage `betty_tgauth`) > `guest` (localStorage `betty_guest_token`) > legacy `Bearer`
- `App.tsx` orchestrates all three flows: Mini App init, widget login (with guest merge), guest creation
- `?ref=` / `utm_source` captured on first load into `users.ref_source`

### Blocker
- BotFather `/setdomain` for `app.bettyscores.com` is still required for the Telegram Login Widget to function. Code is ready; the widget will render but reject auth until the domain is whitelisted.

---

## Workstream 6: Site Structure (RELEASE-2.0.md §5.4)

### History API routing
- `App.tsx` now uses `pushState`/`popstate` for real URLs:
  - `/` and `/matches` — Matches
  - `/leaderboard` — Leaderboard
  - `/champions` — Champions
  - `/about` — About
- No router dependency — a small hook in `App.tsx`.

### Navigation
- 4th tab added: **About** (info icon)
- `Page` type extended to `'champions' | 'matches' | 'leaderboard' | 'about'`

### About page
- Rewritten for v2: weekly cadence, score reels, scoring rules (1 pt outcome / 3 pts exact), Stars prizes (100/50), week schedule, guest eligibility note.
- New `AboutPage.css` with scoring grid layout.

### SPA fallback
- `frontend/public/_redirects` — Cloudflare Pages serves `index.html` for all paths.

### OG / Twitter Card meta
- `index.html` updated with proper OG tags, description, favicon links.
- Title changed from "Betty - World Cup Predictions" to "Betty Scores".

---

## Workstream 7: Stars Prizes + Cron Reshape (RELEASE-2.0.md §5.5, §5.6)

### Migration `0006_v2_prizes.sql`
- `weekly_prizes(id, week_id, rank, user_id, stars, status, awarded_at, paid_at, note)`
- `status`: `owed` | `paid` | `void`
- Unique constraint on `(week_id, rank)`

### Worker: `closeWeek(weekId)`
- Rebuilds marts, reads `gold_champions` for the week
- Awards 100 Stars to 1st, 50 Stars to 2nd
- Guests (`tg_id LIKE 'guest:%'`) are prize-ineligible
- Tie rule: equal points -> earlier `last_bet_at` wins (inherited from `gold_champions` ranking)
- Marks the week as `closed`

### Worker: admin endpoints
- `POST /api/admin/close-week?week=YYYY_WW` — manually trigger week close + prize award
- `POST /api/admin/prizes/:week/paid?rank=1` — mark a prize as delivered
- `GET /api/prizes?week=YYYY_WW` — public endpoint listing prizes

### Worker: `syncPrizesToSheet(env)`
- Mirrors `weekly_prizes` to a "Prizes" sheet tab (sink), included in Friday sync

### Cron reshape (`wrangler.toml` + `scheduled()`)

| Schedule | Handler |
|---|---|
| `0 0 * * MON` | `closeWeek()` (last week) -> `publishWeekFromSheet()` (new week) |
| `0 3 * * *` | `ingestFixtures()` + `refreshCandidatesTab()` + FIFA results reconcile |
| `0 * * * *` | Match status update (live/finished) + adjustments + `rebuildMarts()` |
| `0 6 * * FRI` | Sheet mirrors: Users, Bets, Marts, **Prizes** |

Both named (`MON`, `FRI`) and numeric (`1`, `5`) day-of-week forms accepted.

### GRAM/TON purge
- `main.tsx`: `TonConnectUIProvider` wrapper removed
- `LeaderboardPage.tsx`: TonConnect imports + wallet connect zone + GRAM column removed. Header changed from "GRAM Leaderboard" to "Leaderboard". Column shows Points instead of GRAMs.
- `ChampionsPage.tsx`: 1st/2nd place rows now show a "100 Stars" / "50 Stars" badge
- `ChampionsPage.css`: `.prize-badge` styling added

---

## Files changed

| File | Change |
|---|---|
| `cf-worker/migrations/0005_v2_identity.sql` | **NEW** — identity columns |
| `cf-worker/migrations/0006_v2_prizes.sql` | **NEW** — weekly_prizes table |
| `cf-worker/src/worker.js` | +348 lines: widget auth, guest/merge endpoints, closeWeek, prizes admin, cron reshape, syncPrizesToSheet |
| `cf-worker/wrangler.toml` | 4 cron triggers (was 2) |
| `frontend/public/_redirects` | **NEW** — SPA fallback |
| `frontend/public/index.html` | OG meta, favicons, title |
| `frontend/src/App.tsx` | Three-mode auth, History API routing, ref capture |
| `frontend/src/components/Navigation.tsx` | About tab |
| `frontend/src/components/OutsideTelegramScreen.tsx` | Login Widget + guest |
| `frontend/src/main.tsx` | TonConnect removed |
| `frontend/src/pages/AboutPage.tsx` | Full rewrite for v2 |
| `frontend/src/pages/ChampionsPage.tsx` | Stars prize badges |
| `frontend/src/pages/LeaderboardPage.tsx` | GRAM/TON purge, Points column |
| `frontend/src/services/api.ts` | Three-mode auth interceptor, guestApi |
| `frontend/src/styles/AboutPage.css` | **NEW** |
| `frontend/src/styles/ChampionsPage.css` | Prize badge |
| `frontend/src/styles/OutsideTelegramScreen.css` | Widget + divider + guest button |

---

## What's next (§6 sequencing, step 8)

- [ ] BotFather `/setdomain` for `app.bettyscores.com` (unblocks widget login)
- [ ] Dev E2E: guest play -> predictions -> widget login -> merge -> leaderboard
- [ ] Dev E2E: `DEBUG_TIME` week rollover (close + prize + publish)
- [ ] Rollback drill on dev (`wrangler rollback` to v1 anchor)
- [ ] Deploy to prod
