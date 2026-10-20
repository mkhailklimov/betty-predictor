# CHANGELOG 2026-10-20 — Back to the classical format: weeks 44 and 45

## Decision (owner)

- **Classical format:** every card is "predict the exact score". Exact score =
  **3 points**, right result (home win / draw / away win) = **1 point**.
- **Week 44** (26 Oct – 1 Nov): **6** British matches. No UEFA games that week.
- **Week 45** (2 – 8 Nov): **10** European matches with British teams (UCL/UEL/UECL matchday 4).
- Prizes unchanged: 100 ⭐ for 1st, 50 ⭐ for 2nd.

## How it is built

The match screen of Release 1 is gone since Release 2.1, so the classical format
runs on challenge cards of type `exact_score` (score picker, kickoff lock,
stickers by Source ID, early week switch, Champions/Hall of Fame unchanged).
Worker 367d0681 + frontend deployed:
- **Scoring:** on `exact_score` cards a wrong score with the right result now earns
  1 point (resolve-challenges); the card says "✅ Right result! +1 pt · Score: …".
- **Up to 10 cards a week** (`MAX_CHALLENGES`, was 6).
- **League Cup** (`eng.league_cup`) added to the daily ESPN fixture ingest.

## Week 44 — published 20 Oct (6 cards, 0 warnings)

| # | Kickoff (UTC) | Match | Source ID |
|---|---|---|---|
| 1 | Wed 28 Oct 20:00 | Liverpool vs Chelsea (League Cup, **score after 90 minutes**) | 401921842 |
| 2 | Sat 31 Oct 12:30 | Chelsea vs Man Utd | 401879248 |
| 3 | Sat 31 Oct 15:00 | Man City vs Brighton | 401879245 |
| 4 | Sat 31 Oct 15:00 | Hull City vs Ipswich Town (owner swapped out Spurs–Palace for an underdog game) | 401878763 |
| 5 | Sat 31 Oct 20:00 | Aston Villa vs Fulham | 401879250 |
| 6 | Sun 1 Nov 16:30 | Liverpool vs Arsenal | 401879246 |

## Week 45 — in the sheet, dry run ok (10 cards); the Monday 26 Oct cron publishes it

| # | Kickoff (UTC) | Match | Competition | Source ID |
|---|---|---|---|---|
| 1 | Tue 3 Nov 20:00 | Barcelona vs Aston Villa | UCL | 401915387 |
| 2 | Tue 3 Nov 20:00 | Man Utd vs Roma | UCL | 401915308 |
| 3 | Wed 4 Nov 17:45 | Fenerbahçe vs Liverpool | UCL | 401915382 |
| 4 | Wed 4 Nov 20:00 | RB Leipzig vs Man City | UCL | 401915306 |
| 5 | Wed 4 Nov 20:00 | Slavia Prague vs Arsenal | UCL | 401915381 |
| 6 | Thu 5 Nov 17:45 | Crystal Palace vs Hoffenheim | UEL | 401915526 |
| 7 | Thu 5 Nov 17:45 | Sparta Prague vs Bournemouth | UEL | 401915528 |
| 8 | Thu 5 Nov 20:00 | Celtic vs Beşiktaş | UEL | 401915522 |
| 9 | Thu 5 Nov 20:00 | Sunderland vs Dinamo Zagreb | UEL | 401915523 |
| 10 | Thu 5 Nov 20:00 | Getafe vs Brighton | UECL | 401915821 |

Sheet: Release2.1 rows 20–25 (week 44) and 26–35 (week 45), Picture_name empty.

## Open

- **Stickers** for weeks 44 and 45 (none yet; cards show without a picture until added).
- Mon 26 Oct: check the cron published week 45 (`weeks` 2026_45 = published, 10 cards).
- Sun 25 Oct evening: close week 43 together (template in the 19 Oct changelog).
- Resolving exact-score cards: answer `home:away` (e.g. `2:1`); the result point is automatic.
