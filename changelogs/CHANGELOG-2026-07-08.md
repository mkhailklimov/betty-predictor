# Changelog — 2026-07-08 (Week 5 QF2 + QF4 appended — bracket complete)

All four Week-5 quarter-finals (`2026_28`) are now paired and live. Following the
Week-4 append model, QF2 and QF4 were held back until their R16 feeders finished
(Jul 6–7); both feeders resolved cleanly against the FIFA feed, so the last two QF
cards were appended today. The QF bracket is now fully populated — no TBD cards.

---

## R16 feeders → QF2 / QF4 (FIFA feed, comp 17 / season 285023)

| R16 | Result | Winner → QF slot |
|-----|--------|------------------|
| id 37 — Portugal v Spain (Jul 6 19:00Z)     | **0–1** | Spain → QF2 home |
| id 38 — USA v Belgium (Jul 7 00:00Z)        | **1–4** | Belgium → QF2 away |
| id 39 — Argentina v Egypt (Jul 7 16:00Z)    | **3–2** | Argentina → QF4 home |
| id 40 — Switzerland v Colombia (Jul 7 20:00Z) | **0–0** (adv. on pens) | Switzerland → QF4 away |

FIFA already lists both QFs with these pairings and matching venues/kickoffs:
**Spain v Belgium** (LA, Jul 10 19:00Z) and **Argentina v Switzerland** (Kansas
City, Jul 12 01:00Z).

## Appended

- **QF2 — id 42**: Spain v Belgium · Los Angeles · Fri Jul 10 19:00 UTC (3:00 PM ET).
  Cards `ESP.png` / `BEL.png` present. Key players Nico Williams / Kevin De Bruyne.
- **QF4 — id 44**: Argentina v Switzerland · Kansas City · Sun Jul 12 01:00 UTC
  (Sat 9:00 PM ET). Cards `ARG.png` / `SWZ.png` present. Key players Lionel Messi /
  Granit Xhaka.

### Written (all three surfaces, per the open-a-week runbook)

- **Frontend** (`frontend/src/data/matches.ts`) — appended ids 42 & 44 to
  `WEEK5_MATCHES`; refreshed the append-plan comment (all 4 QFs now resolved).
  `npm run build` clean (bundle `index-6-TFFoOg.js`).
- **D1** (`betty-db`, shared dev+prod) — `INSERT OR IGNORE` of `match-42` and
  `match-44` (`upcoming`, `week_id=2026_28`). Both verified live on the prod API:
  `GET /api/matches/match-42` → Spain v Belgium, `/match-44` → Argentina v
  Switzerland. Predictions now work (avoids the QF1 404 bug from 07-06).
- **Sheet** (`Betty_Master_Data` → **Matches** `A44:M45`) via SA
  `betty-sheets-sync@betty-games`, `USER_ENTERED` so `Weekstart` (2026-07-10)
  coerces to a date serial (gviz type-inference gotcha).

## Deploy (dev-first, file-sync to main)

Prod is git-built from `main` on push; matches.ts was file-synced (single file
cherry-picked onto `main`, `tonconnect-manifest.json` untouched).

| Change | dev | main (→ prod build) |
|--------|-----|---------------------|
| QF2+QF4 append (matches.ts) | `2ef1a8f` | `ea7e369` |

## Week 5 QF status — 4 of 4 paired ✅

| ID | QF | Pairing | State |
|----|----|---------|-------|
| 41 | QF1 | France v Morocco | ✅ live |
| 42 | QF2 | Spain v Belgium | ✅ appended today, in D1, live |
| 43 | QF3 | Norway v England | ✅ live |
| 44 | QF4 | Argentina v Switzerland | ✅ appended today, in D1, live |

## Still open

- **R16 results → D1** — Week-4 (R16) scores land at the **Friday** 06:00 UTC
  close-out per the runbook (players don't see mid-week results by design).
- **Unpaid prizes** — W1 (Mishanna45), W2 (ippolitovdenis).
