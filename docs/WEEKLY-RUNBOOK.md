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

_Anchored to **Friday 06:00 UTC** — same clock as the worker cron `"0 6 * * FRI"`.
Must run after the finishing week's last match has ended._

**What the cron does automatically** (steps 7–8 below are now largely covered):
pulls Adjustments in, rebuilds marts, then mirrors the full picture **out** to
`betty_master_data` — **Users + Bets + Marts (Champions/Leaderboard)**, each tab
isolated so one failure can't starve the others.

**What is still manual:** entering match **results** into the sheet (step 6). The
cron mirrors data *out*; it does **not** ingest results *in*. Results must be in
the sheet **and** D1 before the cron runs, or the week scores as zeros.

> **History — read before trusting the automation.** This cron **never fired once**
> between its introduction and 2026-07-17: `wrangler.toml` declared `0 6 * * FRI`
> while the handler matched `0 6 * * 5`, and Cloudflare echoes `event.cron` back
> **verbatim**. The unmatched event fell through to the *hourly* handler, which
> marks matches `finished` on wall-clock **without writing scores** — so it failed
> loudly in effect and silently in logs. See `CHANGELOG-2026-07-17.md`.
> **If a tab looks stale, check `event.cron` dispatch first.**

**On-demand admin endpoints** (all `POST`, `Authorization: Bearer $ADMIN_TOKEN`,
base `https://api.bettyscores.com`) — use these to close out off-cadence:

| Endpoint | Does |
| --- | --- |
| `/api/admin/rebuild` | rebuild silver + gold marts from bronze |
| `/api/admin/sync-users` | D1 → `Users` tab |
| `/api/admin/sync-bets` | D1 → `Bets` tab (full replace) |
| `/api/admin/export-marts` | gold → `Champions` + `Leaderboard` tabs |
| `/api/admin/results?apply=1` | ingest FIFA/ESPN results → reconcile → rebuild |

`ADMIN_TOKEN` is a **write-only** CF secret — it cannot be read back. Rotate it
rather than hunt for it: `printf '%s' "$(openssl rand -hex 24)" | npx wrangler
secret put ADMIN_TOKEN`.

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
column is unused — do not fill it). `scoreBet()` in `cf-worker/src/worker.js` is
the **one canonical definition** — trust it over any prose, including this file:

- **1 point** for a correct outcome (1 / X / 2)
- **3 points TOTAL** for an exact score — **not 1+3 = 4**
- only matches with `status = 'finished'` count

> **Corrected 2026-07-17.** This section previously said "+3 bonus … exact = 4
> total". That was wrong and never matched the code. Live leaderboard confirms
> 3-total: ippolitovdenis 26 pts = 17 outcomes×1 + 3 exact×3 (4-total would give 29).

### Knockout matches: the 90-minute rule

**Score at 90 minutes, never the AET or shootout result.** A tie that goes to
extra time or penalties is recorded as a **draw (`X`)** at its 90' score.

Precedent: `match-40` Switzerland v Colombia → `X` 0-0 (advanced on penalties);
`match-43` Norway v England → `X` 1-1 (England scored at 93'); `match-44`
Argentina v Switzerland → `X` 1-1 (goals at 112', 120+1').

> ⚠️ The bracket comments in `frontend/src/data/matches.ts` carry **AET** scores —
> correct for progression, **wrong for scoring**. Never copy them into the sheet.

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
