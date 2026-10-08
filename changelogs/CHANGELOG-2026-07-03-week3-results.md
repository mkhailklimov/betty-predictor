# Changelog — 2026-07-03 (Week 3 results finalized — sheet mirror closed out)

Closed out **Week 3 (`2026_26`)** per the Friday runbook. The D1/app side was
already current — all 10 matches `finished` with scores, and `gold_champions`
for `2026_26` had been rebuilt (`computed_at 2026-07-03 14:00`), so
`api.bettyscores.com/api/champions` was already serving the Week-3 result live.
The gap was the **sheet**: the Matches tab still showed Week 3 as open with no
results, and the Champions/Leaderboard tabs stopped at Week 2. Mirrored D1 → sheet.

## What was stale vs. fixed

- **Matches tab** (`Matches!K22:P31`, IDs 21–30) — was `Is active = 1` (open),
  `Result`/`Score_1`/`Score_2` empty. Wrote `Is active = 3` (ended) + result +
  score for all 10, taken straight from D1 `matches` (`USER_ENTERED`, scores
  numeric). 40 cells updated.
- **Champions tab** — was 2 weeks (W1+W2). Re-mirrored from `gold_champions`:
  now 7 rows across `2026_24 / 2026_25 / 2026_26`.
- **Leaderboard tab** — was `computed_at 2026-07-02`, `weeks_played 2`.
  Re-mirrored from `gold_leaderboard`: now 3 weeks played.

Mirror replicated `exportMartsToSheet` exactly (clear + RAW write, same
`CHAMP_HEADER`/`LB_HEADER`) but ran via the `betty-sheets-sync` SA directly —
no `ADMIN_TOKEN` rotation needed.

## Week 3 final standings (`2026_26`)

| Rank | Player | Points | Correct | Exact | Predicted |
|------|--------|--------|---------|-------|-----------|
| 🥇 1 | **ippolitovdenis** | 8 | 4 | 2 | 6 |
| 🥈 2 | Mishanna45 | 5 | 5 | 0 | 10 |

Overall leaderboard after Week 3: **ippolitovdenis 16 pts (2 weeks won)**,
Mishanna45 14 (1), islavutin 2 (0).

## Week 3 results written (from D1)

| ID | Match | Score | Result |
|----|-------|-------|--------|
| 21 | Uruguay v Spain        | 0–1 | 2 |
| 22 | Cape Verde v Saudi Arabia | 0–0 | X |
| 23 | New Zealand v Belgium  | 1–5 | 2 |
| 24 | Egypt v Iran           | 1–1 | X |
| 25 | Panama v England       | 0–2 | 2 |
| 26 | Croatia v Ghana        | 2–1 | 1 |
| 27 | Colombia v Portugal    | 0–0 | X |
| 28 | Congo DR v Uzbekistan  | 3–1 | 1 |
| 29 | Algeria v Austria      | 3–3 | X |
| 30 | Jordan v Argentina     | 1–3 | 2 |

## Prize

Week-3 champion **ippolitovdenis** — his **2nd** weekly win (also Week 2).
1 GRAM owed, but **still no wallet connected** (`users.ton_wallet` null for both
ippolitovdenis and Mishanna45), so nothing to send. He is now owed **2 GRAM**
cumulatively (W2 + W3); Mishanna45 owed 1 (W1). Same blocked state as 06-27 —
the wallet watcher covers the connect event; no new payout action possible.

## Verified

- Sheet Matches `Is active`=3 + results for all 10 Week-3 rows (post-write read-back).
- Champions/Leaderboard tabs now span all 3 weeks.
- `api.bettyscores.com/api/champions` returns `2026_26` (ippolitovdenis #1) — was
  already live pre-mirror; the app never lagged.

## Not touched

- No frontend/worker code change, no redeploy — this was pure data-ops (sheet
  bookkeeping; D1 was the source of truth and already correct).
- Week 4 R16 work is tracked separately in `CHANGELOG-2026-07-03.md`.
