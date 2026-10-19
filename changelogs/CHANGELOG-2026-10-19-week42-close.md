# CHANGELOG 2026-10-19 — Week 42 resolved, Champions and Hall of Fame renewed

## What happened

- Week 42 (12–18 Oct) was **not resolved on Sunday**. The Monday 00:00 UTC cron
  closed it anyway (as warned in the 12 Oct changelog: `closeWeek` does not
  check that challenges are resolved) and, with everyone on 0 points, its
  tie-break awarded 1st place (100 ⭐) to Th7Tezar.
- 19 Oct: resolved with the real ESPN results, then marts rebuilt. Th7Tezar is
  the real winner, so the prize stands; no re-close was needed.

## Week 42 results (`betty-admin.sh resolve 2026_42 …` → resolved 6, scored 6)

| Challenge | Result | Answer |
|---|---|---|
| Will Pickford keep a clean sheet against Chelsea? | Everton 0–2 Chelsea | No |
| Brentford vs Liverpool — over or under 2.5? | 1–2 | Over |
| Will Manchester City beat Ipswich Town? | 3–2 | Yes |
| M23 derby — exact score | Brighton 5–0 Palace | 5:0 |
| Leeds vs Man Utd — who scores first? | Man Utd 35' (1–1) | Away |
| Forest vs Arsenal — exact score | 0–1 | 0:1 |

## Week 42 champions

| Rank | Player | Points | Stars |
|---|---|---|---|
| 1 | Th7Tezar (8775431442) | 5 (No ✓1, Yes ✓1, Away ✓3) | 100 ⭐ (owed) |

Other players: two guests and the team account MikeKlimov (excluded). No 2nd place.

## Hall of Fame after the rebuild (top 5)

Mishanna45 29 pts / 3 weeks won / 300 ⭐; ippolitovdenis 26 / 3 / 300; Th7Tezar 5 / 1 / 100;
KiernanOades 1 / 1 / 100; "........" 6 / 0 / 50.

## Debts (D1, 19 Oct)

| Prize | Player | Stars | Status |
|---|---|---|---|
| 2026_34/1 | KiernanOades | 100 | paid |
| 2026_41/1 + bonus_2 | Mishanna45 | 300 | 100 sent 17 Oct; 200 to confirm |
| bonus_1 | ippolitovdenis | 300 | 100 sent 17 Oct; 200 to confirm |
| 2026_41/2 | "........" | 50 | waiting for them to write to @bettyscores |
| **2026_42/1** | **Th7Tezar** | **100** | **new, owed** |

## Proposed

- Guard in `closeWeek`: if any challenge of the week is unresolved, skip the
  close (and retry on the next run) instead of awarding prizes on 0 points.

## Update (19 Oct, later)

- Owner confirmed the remaining Stars to Mishanna45 and ippolitovdenis were sent:
  `paid 2026_41 1`, `paid bonus_2 1`, `paid bonus_1 1` (each changed 1 row).
- Still owed: **2026_41/2 "........" 50 ⭐** (no activity since 9 Oct; bot message of
  17 Oct unanswered as far as we know) and **2026_42/1 Th7Tezar 100 ⭐** (message text
  given to the owner).
- Owner sent Th7Tezar 100 ⭐ (congrats message with a share link, t.me/bettyscores_bot/app): `paid 2026_42 1`.
  Only **2026_41/2 "........" 50 ⭐** remains owed.

## Results in → Stars counted at once (owner's rule, deployed 19 Oct)

Worker version 2658071e (`betty-admin.sh deploy-worker`):
- **`resolve` closes the week itself:** once every card of the week has its answer
  and the last match is over (kickoff + 2 h), the resolve call runs `closeWeek`
  immediately: prizes awarded, Champions and Hall of Fame rebuilt. The reply
  shows it in `close` (e.g. `{"ok":true,"awarded":[...]}`, or `waiting` with how
  many answers are missing).
- **Guard in `closeWeek`:** a challenge week with any unresolved card is not
  closed (`{"ok":false,"waiting":true,"unresolved":n}`); the Monday 00:00 cron
  therefore waits instead of paying on 0 points. Weeks without challenges close
  as before.
- Tested by re-entering week 42's answers: `close: {"ok":true,"already":true}`.
- Runbook step 5 added (`docs/WEEKLY-RUNBOOK.md`).
- Not changed: re-resolving a week that is already closed does not recompute
  its prizes (correct mistakes by hand if one ever happens).
