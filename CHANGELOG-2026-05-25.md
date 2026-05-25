# 2026-05-25 — Share-link funnel fix + dog-face favicons

User sent the app link to several friends and expected new rows in the
`betty_master_data` sheet, but saw no changes. Session diagnosed why, fixed the
underlying funnel problem, and replaced the default grey-globe favicon on both
web properties with Betty's face.

## Item 1 — Friends left zero trace (same root cause as 2026-05-01)

**Investigation.** Queried prod D1 (`betty-db`) directly — the authoritative
store; the sheet is only a monitoring mirror that syncs Fridays 06:00 UTC
(`0 6 * * FRI`), so it lags by design and was a red herring.

| Check | Result |
|---|---|
| Total users in prod D1 | **5** (no new rows) |
| Newest user | `modertma` (tg_id 7320728424), 2026-05-04 — the @tApps_bot moderator |
| Friends' rows | **none** |

**Root cause (recurrence of the May 1 incident, see `MASTERDATA.md`):** a
Telegram Mini App only writes a user row when launched *inside* Telegram via
`t.me/bettyscores_bot` — that path injects the signed `WebAppInitData` blob
that `/api/auth/init` verifies. Opening `app.bettyscores.com` in a browser has
no Telegram session → silent auth failure → nothing created. User confirmed
they shared *both* the web link and the bot link, so browser-opens explain the
no-shows.

**Fix — splash-then-redirect funnel.** The existing `OutsideTelegramScreen`
(shown when `initData` is empty) was a passive "Open in Telegram" page. Changed
it to a branded splash ("Opening Betty Scores…" + spinner) that **auto-redirects
to `https://t.me/bettyscores_bot` after 2s**, with the original button as manual
fallback. Now both links funnel into the only path that can register a user.

- `frontend/src/components/OutsideTelegramScreen.tsx` — `setTimeout` →
  `window.location.href` redirect; updated copy.
- `frontend/src/styles/OutsideTelegramScreen.css` — spinner + keyframes.
- Commit `593ed02` (cherry-picked to `main` from dev `9447b51`).

Deployed dev → prod. Verified on both `dev.betty-scores-app.pages.dev` and
`app.bettyscores.com`: new splash present, old copy gone, redirect wired.

**Still open:** user to send a friend `https://t.me/bettyscores_bot`, open it
*inside Telegram*, place a bet — then re-query D1 to confirm a new `users` row
(sheet will catch up on the Friday cron, or trigger a manual sync sooner).

## Items 2 & 3 — Grey-globe favicon → Betty's dog face

**Diagnosis.**
- `app.bettyscores.com` (Mini App, `betty-scores-app` project, from
  `frontend/`): favicon was `/vite.svg` — the Vite placeholder, not even
  present → browser fell back to the grey globe.
- `bettyscores.com` (landing, `betty-scores` project, served from `deploy/`):
  **no** favicon `<link>` at all; `/favicon.ico` returned the HTML page → grey
  globe.

**Fix.** Cropped Betty's face (ears + snout + beard + tongue) from
`betty-logo.png` (1024² black schnauzer on brand-yellow) into a proper icon set
via PIL: `favicon.ico` (16/32/48), `favicon-16.png`, `favicon-32.png`,
`apple-touch-icon.png` (180px). Wired `<link>` tags into both pages.

| Property | Source | Commits | Status |
|---|---|---|---|
| `app.bettyscores.com` | `frontend/public/` + `frontend/index.html` | dev `5e6717c` → main `7d7f502` | ✅ verified live (real PNG/ICO bytes, correct content-types) |
| `bettyscores.com` | `deploy/` + `deploy/index.html` | dev `59a6d27` → main `64e07e7` | dev verified; **prod propagating at time of writing** |

Caching note: Chrome's favicon cache (and especially its separate
bookmark/folder favicon store) is sticky — needs hard-refresh or an Incognito
window to show the new icon past the cached grey globe. User confirmed
`app.bettyscores.com` shows Betty after the cache cleared.

## Process notes

- **Dev-first** honored for all three changes (dev preview verified before
  prod).
- **Branch divergence guarded:** `dev` is stale relative to `main` (missing the
  cron-`FRI` hardening, `dr/`, and several changelogs committed directly to
  main; `tonconnect-manifest.json` is branch-specific per 2026-04-28). To avoid
  a `dev→main` merge reverting prod's TON Connect manifest, each change was
  **cherry-picked** onto `main` rather than merged. `dev` still needs a future
  reconciliation from `main`.
