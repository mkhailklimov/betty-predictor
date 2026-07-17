# 2026-07-17 — Weekly close-out repair: dead cron, orphaned Bets tab, unscored knockouts

Triggered by a simple question: *"why hasn't Betty_Master_data updated?"*
Answer: **the weekly cron had never fired. Not once, since crons were introduced.**

**Two genuine bugs** (§1 dead cron, §2 orphaned Bets tab) — both of which kept
`betty_master_data` stale, which was the actual question. Plus **§3, routine
weekly results entry** that was simply due today and is *not* fallout from either
(an earlier draft wrongly claimed it was — see §3).

---

## 1. The weekly cron branch was unreachable (root cause)

`cf-worker/wrangler.toml:22` declares:

```toml
crons = ["0 * * * *", "0 6 * * FRI"]
```

`cf-worker/src/worker.js` dispatched on:

```js
if (event.cron === '0 6 * * 5') {   // never true
```

**Cloudflare echoes `event.cron` back verbatim, exactly as declared in
`wrangler.toml`.** It does not normalise `FRI` → `5`. So the weekly branch was
dead code from the day the crons were added.

**Why it was worse than a no-op.** The weekly branch is guarded by an early
`return`. With the guard never matching, every Friday 06:00 run **fell through to
the default hourly match-status handler**, which advances `is_active`/`status`
purely on wall-clock (`kickoff + 3h`) and **never writes scores**:

```js
if (now >= endEstimate) newStatus = 3;   // 'finished' — but home_score stays NULL
```

So each Friday the system silently did the *wrong* job and reported success.

**Fix:** accept both day-of-week forms, so a `wrangler.toml` edit in either
direction cannot silently misroute again.

```js
const WEEKLY = new Set(['0 6 * * 5', '0 6 * * FRI']);
if (WEEKLY.has(event.cron)) {
```

The weekly branch now mirrors **Users + Bets + Marts**, each wrapped in its own
`try/catch` — previously an all-or-nothing chain where one failure starved the rest.

## 2. The `Bets` tab had no sync code at all

`grep "Bets" src/worker.js` → **nothing**. The tab was populated once (~2026-06-18,
77 rows) and orphaned. D1 had **208** predictions. It looked alive, so it never
got questioned.

The only sheet ranges the worker had ever written: `Users!A:Z`,
`Adjustments!A` (read), and Champions/Leaderboard via `exportMartsToSheet`.

**Fix:** added `syncBetsToSheet()`, mirroring `syncUsersToSheet`'s full-replace
shape and using the tab's **pre-existing 12-column header contract**
(`id, user_id, tg_id, username, match_id, home_team, away_team, match_time,
prediction_type, predicted_score, created_at, updated_at`) — a join of
predictions × users × matches. Plus `POST /api/admin/sync-bets` for on-demand runs.

> Full-replace is deliberate: consistent with Users, and 208 rows is trivial.
> Predictions only grow — revisit if a weekly clear+rewrite ever gets slow.

## 3. Six knockout matches were `finished` with NULL scores

**NOT caused by #1 — this is the normal manual step, and it was simply due today.**

An earlier draft of this changelog claimed this was a "direct consequence" of the
dead cron. **That was wrong.** Corrected after checking: results ingestion
(`ingestFifaResults` / `reconcileResults`) is referenced **only** from the
`/api/admin/results` endpoint handler — it is in **no cron**, weekly or hourly.
The weekly branch only does adjustments → rebuild → mirror-out. **Even if the cron
had fired every Friday for a month, these scores would still be NULL.**

Scores enter `matches` **only** via the admin results endpoint or direct SQL —
there is no sheet→matches score sync. So QF1–4 + SF1–2 were unscored because the
week's manual results entry (runbook step 6) hadn't been run yet — and 2026-07-17
*is* that week's Friday. This was routine work, not fallout.

What the hourly fallthrough *does* explain is the **cosmetic** inconsistency that
made it look worse: the hourly handler marks matches `finished` on wall-clock
without scores, so they advertised as done while empty, and the sheet still read
`Is active = 1` because nothing mirrored out. **`finished` ≠ scored.**

> **Also worth correcting:** the hourly branch *does* call `rebuildMarts()`, so
> marts have been rebuilding hourly all along. The leaderboard was never stale
> relative to the data it had — there were simply no results to score.

Results sourced from ESPN and cross-checked against the bracket comments in
`frontend/src/data/matches.ts` — all four QFs matched exactly.

### ⚠️ The 90-minute rule bit hard here

**QF3 and QF4 both went to extra time from 1-1.** Per the KO rule (score at 90',
not AET), both are recorded as **draws** — matching the `match-40` precedent
(Switzerland v Colombia recorded `X` 0-0 despite advancing on penalties).

| # | Fixture | AET / final | **At 90' (recorded)** | Result |
|---|---|---|---|---|
| 41 | France v Morocco | 2-0 | 2-0 | `1` |
| 42 | Spain v Belgium | 2-1 | 2-1 | `1` |
| 43 | Norway v England | 1-2 **AET** (93') | **1-1** | `X` |
| 44 | Argentina v Switzerland | 3-1 **AET** (112', 120+1') | **1-1** | `X` |
| 45 | France v Spain (SF1) | 0-2 | 0-2 | `2` |
| 46 | England v Argentina (SF2) | 1-2 | 1-2 | `2` |

The bracket comments in `matches.ts` ("Norway 1-2 England", "Argentina 3-1
Switzerland") are **correct for progression but wrong for scoring**. Everyone who
took Norway or Argentina got the bracket right and the 90' result wrong.

---

## Also corrected: the runbook's scoring rule was wrong

`docs/WEEKLY-RUNBOOK.md` claimed *"+3 bonus for an exact score (so an exact score
= 4 total)"*. The code (`scoreBet`, the single canonical definition) says **3 points
TOTAL, not 1+3**. Live leaderboard confirms the code:

| User | Actual | code (exact=3) | runbook (exact=4) |
|---|---|---|---|
| ippolitovdenis | 26 | **26** ✅ | 29 ✗ |
| Mishanna45 | 22 | **22** ✅ | 23 ✗ |

Runbook corrected to match the code.

---

## Verification

Exercised the **real** scheduled dispatch path on dev (not a simulation) —
`wrangler dev --env dev --remote --test-scheduled`, then
`curl "localhost:8799/__scheduled?cron=0+6+*+*+FRI"`:

```
Users sync: {"ok":true,"synced":15}
Bets  sync: {"ok":true,"synced":208}
Marts sync: {"ok":true,"champions":13,"leaderboard":5}
```

Sheet confirmed current afterwards: **Bets 208** (was 77, frozen 06-18),
Users 15, Leaderboard 5, Champions 13.

> ⚠️ **Footgun:** the dev worker shares **prod D1 and the same spreadsheet**, so
> the dev test wrote to the live sheet. Harmless here (idempotent full-replace of
> the intended snapshot) — but do not assume dev is isolated.

## State after this change

- Marts rebuilt over **206 scored bets**; leaderboard populates.
- Both prod triggers registered: `0 * * * *`, `0 6 * * FRI`.
- `dev` and `main` identical at `f59adc8`.
- `ADMIN_TOKEN` **rotated** (write-only CF secret, old value unrecoverable).

### Leaderboard (post-rebuild)

| User | Points | Outcomes | Exact | Weeks |
|---|---|---|---|---|
| ippolitovdenis | 26 | 20 | 3 | 5 |
| Mishanna45 | 22 | 20 | 1 | 5 |
| islavutin | 2 | 2 | 0 | 1 |
| RATUL0024 | 0 | 0 | 0 | 1 |
| daria_kllim | 0 | 0 | 0 | 1 |

## Not fixed here (open)

- **Engagement.** Forecasts per week: 57 → 47 → 36 → 46 → 22. Only **5 of 15**
  users have ever scored a point; 2 of the 7 active this week are internal
  accounts. A product problem, not a pipeline one.
- **Match results are still manual.** The cron mirrors data *out*; it does not
  ingest results *in*. ESPN/FIFA ingestion exists (`/api/admin/results`) but is
  not part of the weekly branch.
- **Unpaid prizes are NOT open** — per policy (user, 2026-07-04) we do not ship
  prizes; making payout *possible* is the goal. Unconnected wallets are expected,
  not a loose end. See `docs/TOURNAMENT-CLOSEOUT.md` §7.
