# Tournament Close-Out — Monday 2026-07-20

Final whistle of World Cup 2026. This is the **last** close-out: it finalises the
tournament, crowns the overall champion, and settles outstanding prizes.

> **Why Monday, not Friday.** The weekly cron next fires **Fri 2026-07-24** — four
> days *after* we want this done. So Monday's run is **manual**, via the admin
> endpoints. Do **not** wait for the cron.

---

## The last two matches

| # | Fixture | Kickoff (UTC) | Group | Forecasts |
|---|---|---|---|---|
| 47 | France v England | 2026-07-18 19:00 | 3rd place | 1 (Victor, `1` 2-1) |
| 48 | Spain v Argentina | 2026-07-19 19:00 | **Final** | 1 (Victor, `1` 2-1) |

Both are `is_active = 1` / `scheduled` as of 2026-07-17 and lock at kickoff.

⚠️ **The hourly cron will flip both to `finished` on wall-clock (kickoff + 3h)
with NULL scores** — that's by design, and it is *not* the results landing. It is
the same mechanism that hid the QF/SF gap for a month. **`finished` ≠ scored.**
Always verify `home_score IS NOT NULL`.

---

## Steps

### 1. Get the results (both matches)

Source from ESPN, and **apply the 90-minute rule** — a Final that goes to extra
time or penalties is recorded as a **draw (`X`)** at its 90' score. See
`docs/WEEKLY-RUNBOOK.md` → *Knockout matches*. A World Cup final going to ET is
entirely plausible; **do not** record the AET score, and **do not** copy the
bracket comments from `frontend/src/data/matches.ts` (they carry AET scores).

```bash
# fixtures + status
curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260718-20260719" \
| python3 -c "
import sys,json
for e in json.load(sys.stdin).get('events',[]):
    c=e['competitions'][0]
    print(e['id'], e['date'], e['name'],
          [(x['team']['abbreviation'], x.get('score')) for x in c['competitors']],
          c['status']['type']['name'])"
```

**If status is `STATUS_FINAL_AET` or a shootout, you MUST get the 90' score** from
the goal timeline (anything after 90'+stoppage does not count):

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=<EVENT_ID>" \
| python3 -c "
import sys,json
for k in json.load(sys.stdin).get('keyEvents',[]):
    if k.get('scoringPlay') or 'Goal' in str(k.get('type',{}).get('text')):
        print(k.get('clock',{}).get('displayValue'), '|', k.get('text','')[:70])"
```

### 2. Write results to the sheet (`Matches` tab)

Set `Result` (1/X/2), `Score_1`, `Score_2`, and `Is active = 3` for rows `47`, `48`.
Use `value_input_option='USER_ENTERED'` (never RAW — see the gviz gotcha in
`reference_google_sheets`). Script pattern: see the 2026-07-17 fill in
`CHANGELOG-2026-07-17.md`; SA key `/home/misha/Ilya/cf-worker/.betty-sa.json`,
gspread venv `/home/misha/Ilya/backend/venv`. Scopes needed: **spreadsheets +
drive** (`open_by_key` reads Drive metadata; spreadsheets-only 403s).

### 3. Write results to D1

```bash
cd /home/misha/betty-predictor/cf-worker
npx wrangler d1 execute betty-db --remote --command "
UPDATE matches SET home_score=<H>, away_score=<A>, status='finished', is_active=3 WHERE id='match-47';
UPDATE matches SET home_score=<H>, away_score=<A>, status='finished', is_active=3 WHERE id='match-48';"
```

### 4. Rebuild + mirror the full picture

```bash
T=<ADMIN_TOKEN>   # write-only secret; rotate if unknown (see runbook)
for e in rebuild sync-users sync-bets export-marts; do
  echo "== $e"; curl -s -X POST "https://api.bettyscores.com/api/admin/$e" -H "Authorization: Bearer $T"; echo
done
```

### 5. Verify (do not skip)

```bash
# no finished-but-unscored matches should remain — this is THE check
npx wrangler d1 execute betty-db --remote --command \
  "SELECT id,home_team,away_team,status,home_score,away_score FROM matches
   WHERE status='finished' AND home_score IS NULL"
```

Expect **zero rows**. Then confirm the sheet: `Bets` = D1 prediction count
(208 + any late entries), `Leaderboard` populated, `Matches` rows 47/48 showing
`Is active = 3` with results.

### 6. Crown the overall champion

```bash
npx wrangler d1 execute betty-db --remote --command \
  "SELECT username,total_points,correct_outcomes,correct_scores,weeks_played
   FROM gold_leaderboard ORDER BY total_points DESC"
```

**Eligibility — exclude internal accounts:** `MikeKlimov` (owner), `bettyscores`
(bot), `bet_monitoring`, `TestUser`. `islavutin` is a **real** player and counts.
**Tiebreak:** earlier *Last Bet At* ranks higher (whoever entered first).

Standings going into the final two matches (real players only):

| # | User | Points |
|---|---|---|
| 1 | ippolitovdenis | 26 |
| 2 | Mishanna45 | 22 |
| 3 | islavutin | 2 |

⚠️ **Only Victor has forecast 47/48** (2 picks, both `1` 2-1) — and Victor has 0
points. So matches 47/48 **cannot change the top 3**. Barring an Adjustment,
**ippolitovdenis is the overall champion.** Confirm against the rebuilt
leaderboard rather than assuming.

### 7. Prizes — ✅ nothing to do

> **POLICY (user, 2026-07-04): we do NOT actually ship prizes.** The goal is to
> make payout *possible* — the mechanic/infra exists and works — **not** to
> distribute funds. **Unconnected wallets and unpaid winners are NOT a loose end.
> Leave them.** Do not chase winners for wallets or send TON unless explicitly
> asked. The payout flow is a demonstrable *capability* (it matters for the
> game-studio thesis), not an ops obligation.

So: **no payout step on Monday.** Record the champion, don't pay them.

For the record only — owed-on-paper, requiring no action: ippolitovdenis W2+W3+W4
(3 GRAM), Mishanna45 W1 (1 GRAM), plus the overall title. Verified 2026-07-17:
**zero** of 15 users have ever connected a `ton_wallet` — consistent with every
prior check (07-03, 07-11) and **expected under the policy above**, not a
regression. Do not read it as a bug to chase.

```bash
# informational only — expect zero rows; that is fine
npx wrangler d1 execute betty-db --remote --command \
  "SELECT username, ton_wallet FROM users WHERE ton_wallet IS NOT NULL AND ton_wallet != ''"
```

The flow itself is built and live (`LeaderboardPage.tsx` → `POST /api/user/wallet`
→ `users.ton_wallet`); the capability is the deliverable. See [[betty-payouts]].

### 8. Announce

Single canonical link in **all** comms: **https://app.bettyscores.com** — never
`t.me` deep links, `pages.dev`, netlify, or deployment-hash URLs (they go stale).
Player-facing copy in **English**.

---

## Post-tournament

- **Turn the hourly cron down or off** — no fixtures remain; it will keep
  scanning every hour forever.
- **Decide the weekly cron's fate** — with no matches, the Friday close-out
  mirrors a static snapshot indefinitely. Harmless but pointless.
- **Retro the engagement numbers** (57 → 47 → 36 → 46 → 22; only 5 of 15 users
  ever scored). Betty is trial #1 of the studio — this is the data that should
  shape Avocado/Gramdroid. Bounce rate is the headline: a Users row means "opened
  the app once", so 0-prediction users are **bounces**, and 10 of 15 never scored.
- **Re-engagement (bot notifications) was never built** — likely the single
  biggest lever, and the most transferable lesson to the next game.
