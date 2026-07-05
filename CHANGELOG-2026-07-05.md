# Changelog — 2026-07-05 (Week 5 Quarter-finals opened + mid-week default-view fix)

Two shipped changes, both live on prod: (1) opened **Week 5 (Quarter-finals,
`2026_28`)** as the "Next" week for the usual Monday cadence, seeded with the one
resolved tie; (2) fixed the match carousel so a **mid-week newcomer lands on the
nearest still-open match** instead of an already-locked card.

---

## 1. Week 5 — Quarter-finals (`2026_28`)

Opens as **Next on Mon Jul 6 00:00 UTC** (usual cadence), becomes **Current Thu
Jul 9 06:00 UTC** — before the first QF (Jul 9 20:00 UTC). Follows the Week-4
**append model**: the week ships with only the *resolved* tie, and the remaining
QFs are appended as their R16 feeders finish (Jul 6–7). Players never see an
unpredictable TBD card.

### Fixed QF schedule / bracket (verified vs FIFA / CBS / Wikipedia)

FIFA matches 97–100. Pairings resolve from the Week-4 R16 winners (IDs 33–40).

| ID | QF | Kickoff (UTC) | Venue | Pairing |
|----|----|---------------|-------|---------|
| 41 | QF1 | Jul 9 20:00  | Boston (Foxborough)   | W34 (Paraguay/France) v W33 (Canada/Morocco) |
| 42 | QF2 | Jul 10 19:00 | Los Angeles (SoFi)    | W37 (Portugal/Spain)  v W38 (USA/Belgium)    |
| 43 | QF3 | Jul 11 21:00 | Miami (Hard Rock)     | W35 (Brazil/Norway)   v W36 (Mexico/England)  |
| 44 | QF4 | Jul 12 01:00 | Kansas City (Arrowhead) | W39 (Argentina/Egypt) v W40 (Switzerland/Colombia) |

Display strings in ET (EDT, UTC−4): 4:00 / 3:00 / 5:00 / 9:00 PM ET.

### Resolved tie shipped (ID 41)

**France v Morocco** — Boston, Thu Jul 9 20:00 UTC. Its R16 feeders both finished
Jul 4: France won id 34 (v Paraguay), Morocco won id 33 (v Canada). Both cards
already present (`FRA.png` / `MOR.png`, in `TEAM_CARDS`) — full art, no flag
fallback. Key players Kylian Mbappé / Achraf Hakimi.

### Written

- **Frontend** (`frontend/src/data/matches.ts`) — added `WEEK5_MATCHES` (id 41
  only) and the `2026_28` / "Week 5" `WEEKS` entry: `becomesCurrent`
  `2026-07-09T06:00Z`, `opensAsNext` `2026-07-06T00:00Z`. QF2–4 documented as an
  append list. `npm run build` clean.
- **Sheet** (`Betty_Master_Data` → **Matches** `A42:P42`) via SA
  `betty-sheets-sync@betty-games`. `Weekstart` = **2026-07-10** (Friday anchor of
  the QF week), written `USER_ENTERED` → gviz parses it as a real date (verified),
  so the landing site groups and shows the week. `Is active = 1`, `Week ID`
  `2026_28`.
- **D1** — *not yet synced.* QF rows go to D1 with the rest of the append batch
  once all four QFs resolve. (R16 results are also still un-synced to D1 — separate
  open thread.)

### Cadence anchor note

`opensAsNext` is the usual Monday (Jul 6), **not** deferred: at open, only QF1 is
resolved; QF3 becomes ready ~Mon Jul 6 (feeders id 35 Jul 5 / id 36 Jul 6), QF2 &
QF4 ~Tue Jul 7. Appended per-match to matches.ts + the sheet, same as Week 4.

---

## 2. Mid-week default view — open on the nearest predictable match

**Problem:** the match carousel (`frontend/src/pages/MainPage.tsx`) initialised
`currentIndex` to `0`. A visitor arriving mid-week opened onto match 1, which may
already have kicked off — a **locked, un-predictable card** that reads as a barrier.

**Fix:** new `nearestOpenIndex(matches, predictions)` helper picks the first match
that **hasn't kicked off** (`!isMatchLocked`), preferring one not yet predicted;
falls back to a locked card only when the whole week has already started. Wired
into both the **initial mount** and **week switching** (replacing the old
first-unpredicted-only logic), so the rule is consistent. `next`-week behavior is
unchanged (those matches are all future).

Matches are chronologically ordered, so "first not-locked" = the nearest upcoming
tie. `npm run build` + `tsc --noEmit` clean.

---

## Deploy (both changes, dev-first)

Prod is git-built from `main` on push; dev/main are reconciled except the
branch-specific `tonconnect-manifest.json`, so each change was **file-synced**
(single file cherry-picked onto `main`, manifest untouched) rather than merged.

| Change | dev | main (→ prod build) |
|--------|-----|---------------------|
| Week 5 QF1 | `3a41ffa` | `86a7a7a` |
| Nearest-open default view | `443f93b` | `80ae29c` |

Prod verified live via bundle-hash change (`index-H65jcGXl.js` → `index-Jt27Nx97.js`);
`2026_28` present in the deployed bundle. Sheet row confirmed in live gviz export.

Committer identity: `MihelKlimm <mihel.klimm@gmail.com>`.

## Still open

- **Append QF2–4** (ids 42–44) to matches.ts + sheet as their R16 feeders finish
  (Jul 6–7), then a single D1 sync of the QF batch.
- **R16 results → D1** — no Week-4 results are in D1 yet; leaderboard is stale
  until that sync.
- **Unpaid prizes** — W1 (Mishanna45), W2 (ippolitovdenis).
