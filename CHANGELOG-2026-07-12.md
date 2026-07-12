# Changelog — 2026-07-12 (SF2 appended — bracket's semi-finals complete)

Both of SF2's feeder quarter-finals finished overnight, so SF2 is paired and
appended into the existing `2026_28` week (no new week — SFs share the QF week,
per the append model).

## Feeders resolved (FIFA feed, comp 17 / season 285023)

| id | tie | score | winner |
|----|-----|-------|--------|
| 43 | Norway v England (QF3) | 1–2 | England |
| 44 | Argentina v Switzerland (QF4) | 3–1 | Argentina |

## SF2 appended → `2026_28`

- **SF2 — id 46**: England v Argentina · Atlanta · Wed Jul 15 19:00 UTC (3:00 PM ET).
  Cards `ENG.png` / `ARG.png` (both already present + registered in `TEAM_CARDS`).
  Key players Jude Bellingham / Lionel Messi. FIFA feed confirms the fixture directly.
- **Frontend** — appended id 46 to `WEEK5_MATCHES`; build clean (`index-_TisVtAW.js`).
- **D1** — `INSERT OR IGNORE match-46` (`upcoming`, `is_active=1`, `week_id=2026_28`).
  Verified predictable on both APIs: `GET /api/matches/match-46` → England v Argentina.
- **Sheet** — appended `Matches!A47:M47` via SA (USER_ENTERED, so `Weekstart`
  coerces to a date serial). Confirmed live in gviz — landing groups it into the
  same `2026-07-10` week as the QFs and SF1.

**QF results** (ids 41–44) intentionally **not** written to D1 — `2026_28` scores at
its own close-out, not now.

**Next:** 3rd-place play-off (Jul 18) + Final (Jul 19) append once both SFs finish
(Jul 14–15), same `2026_28` week.
