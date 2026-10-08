# Changelog — April 22, 2026

## Summary

Staged **Week 2 (2026_25)** on the dev instance as a full-scale rehearsal for the eventual switchover, while leaving prod untouched on Week 1. Entire flow is clickable and registers bets against the dev Worker. Cards for 15 of 20 Week-2 teams are now bundled; the remaining 5 use an SVG-flag fallback.

Main thrust of the day was getting **dev/prod isolation right** end-to-end — see next section.

---

## Dev ↔ Prod isolation

The rule: any change to prod (code, data, storage, bot target) must require an explicit action. Dev changes must not leak.

### Code isolation — Git branch `dev`

- Created branch `dev` off `main`. All Week-2 work is committed on `dev` only.
- `main` is the single source of truth for prod — unchanged today.
- Cloudflare Pages project `betty-scores-app` auto-publishes:
  - `main` commits → `app.bettyscores.com` (prod).
  - Non-`main` commits → `<hash>.betty-scores-app.pages.dev` preview URLs (dev).
  - A branch alias URL `dev.betty-scores-app.pages.dev` follows the tip of `dev` for a stable test target (to be confirmed once bot menu is pointed at it).
- The dev bot `@betty_worldcup2026_bot` menu button will be pointed at the dev preview URL. The prod bot `@bettyscores_bot` continues to point at `app.bettyscores.com`. Both bots untouched on the server side; only the dev bot's URL needs an update when the user is ready.

### Runtime isolation — host-based switches in `frontend/src/data/matches.ts` and `frontend/src/services/api.ts`

Rather than environment variables (which are per-project, not per-branch in Cloudflare Pages), the dev build makes two decisions at runtime based on `window.location.hostname`:

| | Prod host (`app.bettyscores.com`) | Anything else |
|---|---|---|
| Active match set | `WEEK1_MATCHES` (IDs 1–10) | `WEEK25_MATCHES` (IDs 11–20) |
| API base URL | `https://api.bettyscores.com` | `https://betty-api-dev.mihel-klimm.workers.dev` |
| Week label | `Week 1` | `Week 2` |

Consequence: even if a prod user somehow hit a preview URL, they'd see dev data; and even if the dev-branch code were merged to `main`, prod's host-check would still serve Week 1. Belt-and-braces.

### Storage isolation — distinct match IDs in shared D1

Dev and prod Workers still share the D1 database `betty-db` (a deliberate near-term call from the 04-21 notes). To keep predictions from colliding:

- Week-1 predictions use `match-1` … `match-10`.
- Week-2 predictions use `match-11` … `match-20`.
- IDs come directly from the `Match ID` column of the Matches sheet for `Week ID = 2026_25`, so we're not inventing a parallel scheme.

When we eventually split to a dedicated dev D1 (tracked as an open item), this distinct-ID discipline remains useful but becomes less load-bearing.

### API / Worker isolation (inherited from 04-21)

Already in place before today:

- Prod Worker `betty-api` at `api.bettyscores.com`, with hourly + Friday 06:00 UTC crons.
- Dev Worker `betty-api-dev` at `betty-api-dev.mihel-klimm.workers.dev`, no crons.
- Dev frontend resolves to dev Worker via the host-based switch above.

---

## Week 2 content (ISO week 2026_25)

Ten matches pulled from the Matches sheet filtered by `Week ID = 2026_25`, for `2026-06-18` through `2026-06-23`:

| # | ID | Group | Match | Kickoff (UTC) |
|---|----|-------|-------|---------------|
| 1 | 11 | A | SAF vs CZE | 2026-06-18 16:00 |
| 2 | 12 | B | SWZ vs BIH | 2026-06-18 19:00 |
| 3 | 13 | B | CAN vs QAT | 2026-06-18 22:00 |
| 4 | 14 | A | MEX vs KOR | 2026-06-19 01:00 |
| 5 | 15 | D | USA vs AUS | 2026-06-19 19:00 |
| 6 | 16 | C | SCO vs MOR | 2026-06-19 22:00 |
| 7 | 17 | D | PAR vs TUR | 2026-06-20 03:00 |
| 8 | 18 | F | NED vs SWE | 2026-06-20 17:00 |
| 9 | 19 | I | NOR vs SEN | 2026-06-23 00:00 |
| 10 | 20 | K | POR vs UZB | 2026-06-23 17:00 |

Data added as `WEEK25_MATCHES` in `frontend/src/data/matches.ts`. `MainPage.tsx` now consumes `ACTIVE_MATCHES` + `ACTIVE_WEEK_LABEL` (both resolved by host).

---

## Team-card assets

Existing `frontend/public/teams/Cards/` only held Week-1 teams. After the user shared the canonical Cards Drive folder (`1sjPxdO9gP3wGili0BCBycmsxr9zGYlUt`) with the Betty SA, and I enabled the Drive API on `betty-games`, I ran a small download script using the existing SA key and pulled all 26 PNGs into `frontend/public/teams/Cards/`.

- New codes registered in `TEAM_CARDS`: **KOR, NOR, SCO, SWE, TUR, UZB**.
- **Still missing** from the Drive folder (render via Twemoji SVG fallback): **CZE, SWZ, QAT, AUS, POR**.

Pre-existing Week-1 PNGs were overwritten by the Drive-canonical versions. File sizes are large (~2 MB each); worth an optimization pass before Week-1 goes live at scale.

---

## UX fix — all-bets-done screen

First dev test showed the 10th prediction silently appeared to save nothing — the existing "Bets placed!" confirmation lived below the card stack and relied on `scrollIntoView`, which Telegram's WebView ignores in some clients.

Rewired `MainPage.tsx`: when all predictions are in and review mode is off, the page replaces the card/nav with a full-screen confirmation panel carrying:
- "Your bets are saved!"
- "You can change any prediction until that match kicks off."
- "Check your results on **Wed, June 24**" — date computed from the active week's last kickoff so it's correct for any future week without edits.
- A **Review or change my bets** button that flips back to the card stack.

No more reliance on scroll or toasts to deliver the confirmation.

---

## Flag fallback — Twemoji CDN

While the Drive-sync was being set up, I added a CDN-based flag fallback in case a team has no card PNG: `flagToTwemojiUrl()` in `matches.ts` + an `<img class="mc__card-flag-img">` in `MatchCard.tsx`. This is now the path for the 5 teams still missing from the Drive folder. Bundled jsdelivr URL, standard MIT-licensed SVGs.

If jsdelivr is blocked in some Telegram WebViews, we'd need to bundle the 5 SVGs locally — pending user test tomorrow.

---

## GCP project updates

- **Drive API enabled** on project `betty-games` (project number `28485115567`). Previously only Sheets API was enabled — the 04-21 work intentionally avoided Drive.
- Betty SA `betty-sheets-sync@betty-games.iam.gserviceaccount.com` granted Viewer on the Cards Drive folder by the user.
- SA scopes used today: `sheets.readonly` (for Matches sheet read) and `drive.readonly` (for card download).

---

## Commits on `dev`

```
8287dfb Add Week 2 (2026_25) matches on dev branch
4bcf183 Fix flag fallback + all-bets-done UX on dev
1e4ee9b Sync team cards from Drive + register new codes
```

Pushed to `origin/dev`. `main` unchanged.

---

## Open items / next session

1. **User to test the latest preview** (`1e4ee9b` build) in browser + Telegram dev bot. Verify:
   - All 15 cards render; 5 Twemoji-fallback flags render.
   - Betting flow works end-to-end through all 10 matches.
   - Full-screen confirmation appears after 10th prediction.
2. If Twemoji CDN is blocked in TG WebView for some users, inline the 5 missing-card SVGs into the bundle.
3. User to add missing cards to the Drive folder: **CZE, SWZ, QAT, AUS, POR**. Re-run the sync script afterwards.
4. Point the dev bot's menu URL to the stable `dev.betty-scores-app.pages.dev` branch alias (currently preview hashes are used ad-hoc).
5. Consider a dev-only D1 database to eliminate the shared-DB constraint entirely (carried from 04-21).
6. Card PNGs are ~2 MB each — run through `pngquant`/`oxipng` before promoting to prod to cut bandwidth.
7. Walk through every changelog + `.md` file for staleness (still deferred from 04-19 / 04-21).
