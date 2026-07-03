# Changelog — 2026-07-03 (Week 4 Round-of-16 ties appended — partial)

Appended the **6 Round-of-16 ties whose pairings are already set** to Week 4
(`2026_27`), across all three layers, and deployed dev → prod. The remaining
**2 R16 ties depend on tonight's R32 winners** (AUS/EGY, ARG/CVE) and are held
for tomorrow morning once the bracket resolves.

## Source of truth

Pulled the real R16 bracket live from the **FIFA API** (competition 17 / season
285023, the same feed the worker ingests). Of the 8 R16 fixtures, **6 have both
teams confirmed** (`MatchStatus` scheduled, real teams); **2 still carry TBD**
slots seeded by the two Jul 3 R32 ties:

- **Atlanta** (Jul 7 16:00 UTC) — both teams TBD
- **Vancouver** (Jul 7 20:00 UTC) — Switzerland v TBD

Per the user's call: build the set pairs now, add the other two tomorrow.

## The 6 R16 ties added (IDs 33–38)

| ID | Tie | Kickoff (UTC) | Venue |
|----|-----|---------------|-------|
| 33 | Canada v Morocco    | Jul 4 17:00 | Houston |
| 34 | Paraguay v France   | Jul 4 21:00 | Philadelphia |
| 35 | Brazil v Norway     | Jul 5 20:00 | New Jersey |
| 36 | Mexico v England    | Jul 6 00:00 | Mexico City |
| 37 | Portugal v Spain    | Jul 6 19:00 | Dallas |
| 38 | USA v Belgium       | Jul 7 00:00 | Seattle |

All display strings use ET (EDT, UTC−4), matching the existing R32 rows.

## Written to all three layers

- **Frontend** (`frontend/src/data/matches.ts`) — appended IDs 33–38 to
  `WEEK4_MATCHES` (`group: 'R16'`). Team `code`/`flag`/`keyPlayer` reused from
  the existing group-stage cards; all 12 codes are in `TEAM_CARDS` (card PNGs
  exist). `npm run build` clean.
- **D1** (`betty-db`, shared by dev + prod) — `INSERT OR REPLACE` `match-33..38`,
  `week_id='2026_27'`, `is_active=1`, `status='upcoming'`. Verified 8 rows for
  the week (2 R32 + 6 R16).
- **Sheet** (`Betty_Master_Data` → **Matches** `A34:M39`) — via SA
  `betty-sheets-sync@betty-games`. `Weekstart` written `USER_ENTERED` so it
  coerces to a **date** (serial 46206 = 2026-07-03) — confirmed date-typed via
  the Sheets API effectiveValue, avoiding the gviz null-text trap. `Weekstart`
  is the Friday anchor `2026-07-03`, not the match dates.

## Deployed (dev-first)

- **Dev** — `wrangler pages deploy frontend/dist --branch dev` (dev tonconnect
  manifest). Bundle verified to contain the new venues/players.
- **Prod** — rebuilt artifact `/home/misha/betty-r16-prod-dist` (dev `dist`
  with the **prod** `tonconnect-manifest.json` swapped in), `DEBUG_TIME=null`,
  deployed `--branch main`. `app.bettyscores.com` serving the new bundle
  (`index-CUB-nDhY.js`) after CDN refresh; prod manifest correct.
- **Verified end-to-end:** prod worker `betty-api` and dev `betty-api-dev`
  `/api/matches/active` both return all 8 `2026_27` ties. Landing gviz exports
  all 8 rows under `Weekstart 2026-07-03`. No landing redeploy needed.

## Still ahead (tomorrow, Jul 4 AM)

- Append the **final 2 R16 ties** (Atlanta, Vancouver → IDs 39–40) once the
  Jul 3 R32 ties finish and the FIFA feed fills the TBD slots. Same pipeline:
  `WEEK4_MATCHES` + D1 `match-39..40` + sheet `A40:M41` (Weekstart date-typed
  `2026-07-03`) → redeploy dev then prod.
- Fill R32/R16 results as ties finish (rolling bookkeeping in the sheet).
- Pay 1 GRAM to each winner (Mishanna45, ippolitovdenis) once they connect a
  wallet — still not connected.
