# Changelog — 2026-07-11 (Week 4 results scored + SF1 appended)

Two operations today: close out **Week 4 (`2026_27`)** results in D1 and refresh
the marts, and append the first **semi-final** into the existing `2026_28` week
(no new week — SFs live in the same `2026-07-10` week as the QFs, per the append
model).

---

## 1. Week 4 (`2026_27`) results → D1 + marts

The hourly cron had already flipped ids 31–40 to `finished`, but scores were never
filled (the Friday close-out set status only), so none of Week 4 scored. Pulled the
authoritative results from the FIFA feed (comp 17 / season 285023) and wrote
`home_score`/`away_score`/`result` for the ten Week-4 ties. **90-minute results**
(pens ignored for scoring, per the KO rule).

| id | tie | score | result |
|----|-----|-------|--------|
| 31 | Australia v Egypt (R32) | 1–1 | X |
| 32 | Argentina v Cape Verde (R32) | 3–2 | 1 |
| 33 | Canada v Morocco | 0–3 | 2 |
| 34 | Paraguay v France | 0–1 | 2 |
| 35 | Brazil v Norway | 1–2 | 2 |
| 36 | Mexico v England | 2–3 | 2 |
| 37 | Portugal v Spain | 0–1 | 2 |
| 38 | USA v Belgium | 1–4 | 2 |
| 39 | Argentina v Egypt | 3–2 | 1 |
| 40 | Switzerland v Colombia | 0–0 (adv. pens 4–3) | X |

**`2026_28` (QF week) intentionally left untouched** — its results sync at its own
close-out, not now.

Rebuilt marts via `POST /api/admin/rebuild` (`ok:true`, 186 scored bets).
- **Week 4 champion: `ippolitovdenis`** — 8 pts (6 correct outcomes, 1 exact, 10 predicted); runner-up `Mishanna45` 4 pts.
- **Overall leaderboard:** ippolitovdenis 24 · Mishanna45 18 · islavutin 2.

## 2. SF1 appended → `2026_28`

Semi-finals live in the **same `2026_28` week** (Weekstart `2026-07-10`). SF1's
feeders both resolved (QF1 France 2–0 Morocco, QF2 Spain 2–1 Belgium), so per the
append model SF1 is paired now. FIFA feed confirms the fixture directly.

- **SF1 — id 45**: France v Spain · Dallas · Tue Jul 14 19:00 UTC (3:00 PM ET).
  Cards `FRA.png` / `ESP.png`. Key players Kylian Mbappé / Nico Williams.
- **Frontend** — appended id 45 to `WEEK5_MATCHES`; build clean (`index-CzBJGYpz.js`).
- **D1** — `INSERT OR IGNORE match-45` (`upcoming`, `is_active=1`, `week_id=2026_28`).
  Verified predictable: `GET /api/matches/match-45` → France v Spain.
- **Sheet** — appended `Matches!A46:P46` via SA (USER_ENTERED; `Weekstart`
  coerces to a date serial). Live in gviz.

**SF2** (W QF3 Norway/England v W QF4 Argentina/Switzerland) appended once those
QFs finish (Jul 11–12).
