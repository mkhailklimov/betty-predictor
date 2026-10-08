# Changelog — 2026-07-06 (Week 5 QF3 appended + QF1 predictions bug fixed)

Monday cadence ops for **Week 5 (Quarter-finals, `2026_28`)**. Two shipped changes,
both live on prod: (1) appended **QF3 — Norway v England** now that its R16 feeders
resolved; (2) fixed a **live prediction bug** — QF1 was visible in the app but its
D1 row was never synced, so bets on it 404'd. Both QF1 and QF3 are now backed by D1
rows and verified predictable on prod.

---

## 1. QF3 appended — Norway v England (ID 43)

**Miami (Hard Rock), Sat Jul 11 21:00 UTC** (5:00 PM ET, EDT UTC−4).

R16 feeders both finished (FIFA feed, comp 17 / season 285023):

| R16 | Result | Winner |
|-----|--------|--------|
| id 35 — Brazil v Norway (Jul 5) | **1–2** | Norway (upset) |
| id 36 — Mexico v England (Jul 6) | **2–3** | England |

FIFA already lists the Jul 11 Miami QF as **Norway v England**, matching our bracket
(id 43 = W35 winner v W36 winner). Cards `NOR.png` / `ENG.png` already present — full
art, no flag fallback. Key players Erling Haaland / Jude Bellingham.

### Written

- **Frontend** (`frontend/src/data/matches.ts`) — appended id 43 to `WEEK5_MATCHES`;
  updated the append-plan comment (QF1 + QF3 now resolved; QF2/QF4 still pending).
  `npm run build` clean.
- **Sheet** (`Betty_Master_Data` → **Matches** `A43:P43`) via SA
  `betty-sheets-sync@betty-games`, `USER_ENTERED`. `Weekstart` = **2026-07-10**,
  `Is active = 1`, `Week ID` `2026_28`, `MatchdateUTC` `2026-07-11 21:00:00`.
- **D1** (`betty-db`) — inserted `match-43` (see §2 below, batched with the QF1 fix).

---

## 2. Fixed: QF1 was unpredictable (missing D1 row)

**Problem.** Week 5 opened as "Next" on Jul 6 00:00 UTC with QF1 (France v Morocco)
visible in the app, but the `match-41` row was **never synced to D1**. `POST
/api/predictions` does `SELECT * FROM matches WHERE id=?` and returns **404 "Match
not found"** when the row is absent — so nobody could actually bet on QF1.

**Fix.** Inserted both QF rows into `betty-db` (shared dev+prod) via
`wrangler d1 execute betty-db --remote`, `INSERT OR IGNORE` (idempotent):

| id | teams | week_id | is_active | status | kickoff (UTC) |
|----|-------|---------|-----------|--------|---------------|
| match-41 | France v Morocco | 2026_28 | 1 | upcoming | 2026-07-09T20:00:00Z |
| match-43 | Norway v England | 2026_28 | 1 | upcoming | 2026-07-11T21:00:00Z |

Both verified live: `GET https://api.bettyscores.com/api/matches/match-41` and
`.../match-43` return the rows. Predictions now work for the open QF week.

**Root cause / prevention.** The 2026-07-05 changelog deferred the QF D1 sync to
"the append batch once all four QFs resolve" — but a week visible in the app needs
its D1 rows *as it opens*, not at Friday results. The weekly runbook memory + repo
runbook were updated to make the D1 insert a required part of opening any week.

---

## Deploy (both changes, dev-first)

Prod is git-built from `main` on push; dev/main are reconciled except the
branch-specific `tonconnect-manifest.json`, so the matches.ts change was
**file-synced** (single file cherry-picked onto `main`, manifest untouched). The D1
changes are backend and took effect immediately (shared `betty-db`).

| Change | dev | main (→ prod build) |
|--------|-----|---------------------|
| QF3 append (matches.ts) | `ca91c89` | `b04717f` |

Prod verified live via bundle-hash change (`index-Jt27Nx97.js` → `index-ZZw4CRXm.js`);
QF3 kickoff `2026-07-11T21:00:00Z` present in the deployed bundle. Sheet row A43
confirmed. D1 rows confirmed on the prod API.

Committer identity: `MihelKlimm <mihel.klimm@gmail.com>`.

## Week 5 QF status — 2 of 4 paired

| ID | QF | Pairing | State |
|----|----|---------|-------|
| 41 | QF1 | France v Morocco | ✅ paired, in D1, live |
| 42 | QF2 | W37 (Portugal/Spain) v W38 (USA/Belgium) | ⏳ feeders Jul 6 19:00Z / Jul 7 |
| 43 | QF3 | Norway v England | ✅ paired, in D1, live |
| 44 | QF4 | W39 (Argentina/Egypt) v W40 (Switzerland/Colombia) | ⏳ feeders Jul 7 |

## Still open

- **Append QF2 & QF4** (ids 42, 44) to matches.ts + sheet + D1 as their R16 feeders
  finish (Jul 7), then dev→main file-sync each.
- **R16 results → D1** — no Week-4 results in D1 yet; scores land at the **Friday**
  06:00 UTC close-out per the runbook (players don't see mid-week results by design).
- **Unpaid prizes** — W1 (Mishanna45), W2 (ippolitovdenis).
