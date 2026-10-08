# Changelog — 2026-07-04 (Week 4 Round-of-16 completed — final 2 ties)

Appended the **last 2 Round-of-16 ties** (IDs 39–40) to Week 4 (`2026_27`) once
the final Jul 3 R32 winners resolved, completing the R16 bracket. All three
layers + both worker environments + landing now serve all **8 R16 ties**.

## Bracket resolution (FIFA feed, comp 17 / season 285023)

Held from yesterday pending two R32 results:

- **Atlanta** (Jul 7 16:00 UTC) — was both-TBD. Now **Argentina v Egypt**
  (ARG beat Cape Verde 3–2; EGY advanced past Australia). Both feeders `status=0`.
- **Vancouver** (Jul 7 20:00 UTC) — was Switzerland v TBD. The feeder tie
  **Colombia 1–0 Ghana** (Kansas City) went final in stoppage (`status=0`,
  decisive `Winner` set, Colombia the only scorer). Vancouver → **Switzerland v
  Colombia**. Appended on the R32 result rather than waiting for the FIFA feed
  to propagate the advancement into the R16 fixture object (deterministic).

## The 2 R16 ties added (IDs 39–40)

| ID | Tie | Kickoff (UTC) | Venue |
|----|-----|---------------|-------|
| 39 | Argentina v Egypt      | Jul 7 16:00 | Atlanta |
| 40 | Switzerland v Colombia | Jul 7 20:00 | Vancouver |

Display strings in ET (EDT, UTC−4): 12:00 PM / 4:00 PM ET.

## Written to all three layers

- **Frontend** (`frontend/src/data/matches.ts`) — appended IDs 39–40 to
  `WEEK4_MATCHES` (`group: 'R16'`). Cards reused: ARG/EGY/COL already present;
  Switzerland uses code **SWZ** (`SWZ.png` present, in `TEAM_CARDS`), key player
  Granit Xhaka. `npm run build` clean.
- **D1** (`betty-db`, shared dev + prod) — `INSERT OR REPLACE` `match-39..40`,
  `week_id='2026_27'`, `is_active=1`, `status='upcoming'` (4 rows written).
- **Sheet** (`Betty_Master_Data` → **Matches** `A40:M41`) via SA
  `betty-sheets-sync@betty-games`. `Weekstart` written `USER_ENTERED` →
  date-typed serial **46206** (2026-07-03) confirmed via UNFORMATTED_VALUE,
  avoiding the gviz null-text trap.

## Deployed (dev-first)

- **Dev** — `wrangler pages deploy frontend/dist --project-name betty-scores-app
  --branch dev` (dev tonconnect manifest). Alias `dev.betty-scores-app.pages.dev`.
- **Prod** — rebuilt artifact `/home/misha/betty-r16-prod-dist` (new `dist` +
  **prod** `tonconnect-manifest.json`), `wrangler pages deploy … --branch main`.
  Content-identical assets already uploaded (dedup); prod manifest correct.

## Verified end-to-end

- Prod `betty-api` and dev `betty-api-dev` `/api/matches/active` both return all
  **8** active R16 ties (33–40); the 2 finished R32 ties (31–32, `is_active=3`)
  correctly dropped out.
- Landing gviz exports both new rows under `Weekstart 2026-07-03`; 10 `2026_27`
  rows total, no TBD leaked. No landing redeploy needed (static gviz fetch).

## Still ahead

- Fill R32/R16 results as ties finish (rolling bookkeeping in the sheet).
- Pay 1 GRAM to each winner (Mishanna45, ippolitovdenis) once they connect a
  wallet — still not connected.
