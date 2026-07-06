# Betty Scores — Weekly Data-Ops Runbook

_Canonical operations cadence. All times **UTC**._

**Guiding rule:** a week must already be **Current** before its first match kicks
off, so live matches never show under "Next." Match-weeks start ~Fri/Sat, so a
week becomes **Current** on the **Monday that leads into its matches**, and opens
as **Next** the **Monday before that**. Every Monday performs **both** transitions
(promote + open-next). **Friday is admin-only — no visibility change.**

---

## 🟢 Monday — the only cadence / visibility transition

1. **Promote** — the lead-in week becomes **Current**; the week after opens as **Next**.
2. **Prep sheet** (if not already) — new week's rows in `betty_master_data`:
   `Weekstart`, teams, kickoffs, `Is active = 1`.
3. **Code** — append the week to the `WEEKS` registry in
   `frontend/src/data/matches.ts` with **Monday** `becomesCurrent` + `opensAsNext`
   anchors; build its `WEEK*_MATCHES` array.
4. **Sync new week → D1** — insert `match-*` rows (`week_id`, `is_active = 1`).
   **Do this AS the week opens as Next, not at Friday results.** `POST
   /api/predictions` runs `SELECT * FROM matches WHERE id=?` and returns
   404 "Match not found" when the row is absent, so a match visible in the app
   but missing from D1 is **unpredictable**. (Bug caught 2026-07-06: QF1
   `match-41` opened as Next Jul 5 but was never D1-synced → 404 until fixed.)
   For per-match append weeks (knockouts), insert each `match-*` the same day
   you append it to `matches.ts` + the sheet. Insert:
   `wrangler d1 execute betty-db --remote --command "INSERT OR IGNORE INTO
   matches (id,home_team,away_team,date,time,round,status,grp,venue,card_home,
   card_away,is_active,week_id,match_date_utc) VALUES (...)"`.
5. **Deploy** dev → prod (file-sync, **not** a merge — the TON manifest is
   branch-specific). Verify the toggle shows **Current + Next** on prod.
   - **Landing site** (`www.bettyscores.com`) is **separate** from the app and
     needs **no redeploy** — it reads matches **live from the sheet gviz CSV**
     and groups by the **`Weekstart`** column. But the sheet data must be right:
     (a) write `Weekstart` as a real **date** via `USER_ENTERED`, **never**
     RAW/pasted text — gviz infers one type per column and **nulls text cells**,
     making the week vanish from the landing; (b) `Weekstart` is the **Friday**
     anchor even for knockout weeks whose matches fall later. Verify the live
     gviz exports the new week and the landing shows **Current + Next**.
     (See `CHANGELOG-2026-06-29.md` for the gotcha.)

## 🟡 Friday 06:00 UTC — close out the finishing week (data / admin only)

_Anchored to **Friday 06:00 UTC** — same clock as the existing worker cron
`"0 6 * * 5"`. Must run after the finishing week's last match has ended._

6. **Finalize results** in the sheet (rolling-filled during the week, see below):
   confirm `Result` (1/X/2), `Score_1`/`Score_2`, set `Is active = 3` (ended).
7. **Sync sheet → D1** — push `home_score`/`away_score` + status onto `match-*` so
   the overall leaderboard reflects the week.
8. **Calculate leaders + Gram winner** — **manual**. The leaderboard stays
   overall / cumulative; there is no per-week endpoint.
9. **Send the 1-Gram prize** to the winner — **manual, never auto-distributed**.

## 🔵 Rolling (during the week)

- Fill each match's `Result` / `Score` in the **sheet** as it finishes. This is
  **our bookkeeping only** — it spreads the manual data entry across the week so
  Friday isn't one big error-prone batch.
- **Players do not see results until the weekly D1 sync** (Friday 06:00 UTC) —
  the sheet is not player-facing, D1 is. There is exactly **one** D1 results sync
  per week. Leaders + prize follow the same Friday batch.
- The two-week toggle (**Current + Next**) is live the whole Mon→Mon span — just
  monitor.

---

## Scoring

Points are computed **live** by the worker from match results (the `points_earned`
column is unused — do not fill it):

- **+1** for a correct outcome (1 / X / 2)
- **+3 bonus** for an exact score (so an exact score = 4 total)
- only matches with `status = 'finished'` count

**Eligibility:** internal/test accounts are excluded from the weekly champion /
prize — `MikeKlimov` (owner), the `bettyscores` bot, `bet_monitoring`, `TestUser`.
`islavutin` is a **real** player and counts.

**Tiebreak (equal points):** earlier **Last Bet At** ranks higher — *whoever
entered first ranks first.* (Correct/exact counts are informational, not tiebreakers.)

## Reference

| Item | Value |
| --- | --- |
| Source of truth | `betty_master_data` Google Sheet (Matches tab) |
| DB | Cloudflare D1 `betty-db` |
| `Is active` codes | `0` hidden · `1` open · `2` locked · `3` ended |
| Locking | Per-match at kickoff (no grace period), client + server (403) |
| Week grouping | The sheet's **Weekstart** column (the "Week ID" column is stale) |
| Cadence code | `WEEKS` registry + `resolveWeeks(now)` in `frontend/src/data/matches.ts` |

> **Code note:** the cadence currently on prod uses **Friday** `becomesCurrent`
> anchors (Week 2 = `2026-06-19T06:00Z`). This runbook moves new weeks to
> **Monday-before-matches** anchors. Week 2 is already live (moot); **Week 3
> onward must use Monday anchors.**
