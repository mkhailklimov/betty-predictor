# 2026-07-20 — Tournament close-out: World Cup 2026 is finished

The last close-out. All **48/48 matches** are scored and closed across all five
weeks; the overall champion is crowned. Executed **manually** via the admin
endpoints — the weekly cron next fires Fri 2026-07-24, four days too late.

---

## 1. Final results

Both remaining matches sourced from ESPN and recorded under the **90-minute rule**
(`docs/WEEKLY-RUNBOOK.md` → *Knockout matches*).

| # | Fixture | ESPN final | **Recorded (90')** | Result |
|---|---|---|---|---|
| 47 | France v England (3rd place) | 4-6 | **4-6** | `2` |
| 48 | Spain v Argentina (**Final**) | 1-0 **AET** | **0-0** | `X` |

**Match 47** was a genuine 10-goal match, not a shootout artefact — the scoreline
looked wrong enough to warrant checking the timeline, and every goal lands inside
90'+stoppage (last two at 90+6' and 90+8', both of which count). Recorded as played.

**Match 48 is the case the runbook warned about.** Spain's only goal came at
**106'** — extra time. Ferran Torres (on 62') finished a headed assist from Nico
Williams (on 75'). Spain are world champions; **for scoring purposes the Final is
a 0-0 draw.** Consistent with match-40 (Switzerland v Colombia, `X` 0-0 despite
advancing on penalties) and with QF3/QF4 on 07-17.

> Six of the seven players who predicted match 48 picked Argentina; nobody among
> real players took the draw. The announcement carries an explicit reminder of the
> 90-minute rule to pre-empt "but Spain won?" replies.

## 2. ⚠️ The runbook's standings table was stale — and nearly misled the close-out

`docs/TOURNAMENT-CLOSEOUT.md` §6 asserted that **only Victor** had forecast
matches 47/48 (2 picks, 0 points), and concluded the top 3 was therefore
mathematically locked.

**That was wrong at execution time.** A re-query found **12 predictions** — 5 on
match 47, 7 on match 48 — from six users. They arrived as late entries *after* the
07-17 snapshot was written into the runbook.

The conclusion survived, but **by luck, not by the reasoning**: no real player
scored on either match (only `MikeKlimov`'s `X` on the Final hit, and he is
excluded as internal). Had one of those seven taken the draw, the runbook would
have told us not to bother checking.

**Lesson, now written into the runbook:** a standings table in a document is a
snapshot with a timestamp, not a fact. Re-query predictions at execution time —
open matches keep accepting entries right up to kickoff.

Counterfactual, for the record: under the AET score (`1`, Spain 1-0), Victor and
Mishanna45 would each have gained a point (Mishanna45 → 23). Still second. **The
champion is unchanged under either scoring interpretation.**

## 3. Pipeline run

```
rebuild        ok  champions=17  leaderboard=9  scored_bets=218   (was 206)
sync-users     ok  synced=18                                      (was 15)
sync-bets      ok  synced=218                                     (was 208)
export-marts   ok  champions=17  leaderboard=9
```

Sheet `Matches` rows 48/49 (= Match IDs 47/48) written with `Result`, `Score_1`,
`Score_2`, `Is active = 3`, `value_input_option='USER_ENTERED'`. The fill script
asserts the `Match ID` cell matches the expected match **before** writing each row
— sheet row ≠ match number (off by one from the header), and a silent
off-by-one here would corrupt a result rather than fail loudly.

### Two operational gotchas worth remembering

- **`ADMIN_TOKEN` was rotated again** (write-only CF secret; the 07-17 value is
  unrecoverable by design). After `wrangler secret put`, the new token **401s for
  roughly 30 seconds** while it propagates. That is propagation lag, not a bad
  token — wait and retry before debugging.
- **`POST /api/admin/rebuild` answered without an `Authorization` header**, while
  `sync-users` / `sync-bets` / `export-marts` correctly rejected. This asymmetry
  is almost certainly unintended. Not fixed here — flagged as open below.

## 4. Verification

```bash
# THE check — finished-but-unscored matches
SELECT id,home_team,away_team,status FROM matches
WHERE status='finished' AND home_score IS NULL
→ 0 rows
```

Per-week completeness, all five weeks:

| Week | Matches | Scored | Closed |
|---|---|---|---|
| 2026_24 | 10 | 10 | 10 |
| 2026_25 | 10 | 10 | 10 |
| 2026_26 | 10 | 10 | 10 |
| 2026_27 | 10 | 10 | 10 |
| **2026_28** | **8** | **8** | **8** |

Week **2026_28** is the deliberately extended endgame week: QF (41-44), SF (45-46),
3rd place (47) and the Final (48) all live in one week rather than spawning new
weeks as the bracket resolved.

## 5. Final standings

**Overall champion: `ippolitovdenis` — 26 points.**

| # | User | Points | Outcomes | Exact | Weeks |
|---|---|---|---|---|---|
| 1 | **ippolitovdenis** | **26** | 20 | 3 | 5 |
| 2 | Mishanna45 | 22 | 20 | 1 | 5 |
| 3 | islavutin | 2 | 2 | 0 | 1 |
| — | RATUL0024, daria_kllim, Victor, Olga454545, pkhlunev, Ilia Vasilev | 0 | 0 | 0 | 1 |

Internal accounts excluded from eligibility: `MikeKlimov`, `bettyscores`,
`bet_monitoring`, `TestUser`. `islavutin` is a real player and counts.

## 6. Prizes — none shipped, as intended

Per policy (user, 2026-07-04) we make payout **possible**; we do not distribute
funds. No payout step was run and none is outstanding. Unconnected wallets are the
expected state, not a loose end. See `docs/TOURNAMENT-CLOSEOUT.md` §7.

---

## Open after this change

- **`/api/admin/rebuild` has no auth check** while its three siblings do (§3).
  Low severity — it is idempotent and writes no user data — but it is an
  inconsistency in the admin surface, not a deliberate exemption as far as anyone
  has documented.
- **Both crons are now pointless.** No fixtures remain: the hourly
  `0 * * * *` scans nothing forever, and the weekly `0 6 * * FRI` mirrors a static
  snapshot. Harmless, but they should be turned down. **Not done here** — it is a
  prod config change and was deliberately left for an explicit decision.
- **Engagement retro not written.** Forecasts per week: **57 → 47 → 36 → 46 → 22**.
  Of 18 users, 9 ever scored a point; a `users` row means "opened the app once",
  so zero-prediction users are **bounces**. Re-engagement (bot notifications) was
  never built and is likely the single biggest lever. Betty is trial #1 of the
  studio — this is the data that should shape Avocado and Gramdroid.
- **Results ingestion remains manual.** `ingestFifaResults` / `reconcileResults`
  are reachable only from `POST /api/admin/results` and sit in **no cron**. Every
  week's scores were entered by hand, all season.
