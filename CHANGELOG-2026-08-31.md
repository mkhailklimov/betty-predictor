# CHANGELOG 2026-08-31

## Bug fixes

### ESPN results pipeline broken for club matches
- `ingestFixtures()` never wrote scores to `bronze_match_results` — only `ingestFifaResults()` (WC-only) did
- `STATUS_FULL_TIME` (used by EPL, La Liga, Serie A, etc.) was not recognized — only `STATUS_FINAL` was mapped
- Result: all club match scores since WC ended (mid-July) were lost. Matches marked "finished" but scores null.
- Fix: added `STATUS_FULL_TIME` to status mapping + write finished ESPN matches with scores to `bronze_match_results`

### Guest accounts polluting gold_champions
- 46 guest accounts (anonymous web visitors) were included in `gold_champions` rankings
- They took rank 1-3 spots, pushing real users like KiernanOades down
- `closeWeek` filtered guests from prizes but `rebuildMarts` did not filter them from champions
- Fix: skip `guest:*` tg_ids in champAgg loop, same as internal accounts

### Hall of Fame sort order
- Was sorted by `week_id DESC, rank` (chronological)
- Changed to `stars DESC, week_id DESC, rank` (highest stars first)

## Data backfill

### Week 34 (Aug 17-23) — 10 matches scored
- Arsenal 3-0 Coventry, Hull 2-0 Man Utd, Atletico 2-0 Malaga, Betis 1-0 Sociedad
- Athletic 1-3 Sevilla, Inter 4-1 Monza, Atalanta 2-1 Sassuolo, Frosinone 0-1 Juventus
- Marseille 4-0 Strasbourg, Philadelphia 2-2 Inter Miami

### Week 35 (Aug 24-30) — 10 matches scored
- Roma 4-0 Fiorentina, Fulham 2-3 Chelsea, Real Madrid 4-1 Sociedad, Barcelona 2-0 Athletic
- Bayern 5-1 Stuttgart, Crystal Palace 1-4 Man City, Tottenham 0-2 Newcastle
- Dortmund 2-0 Hamburg, Juventus 2-0 Parma, Inter Miami 7-1 Montreal

### Leaderboard rebuilt
- 474 bets scored, 18 champion entries, 10 users on leaderboard
- KiernanOades: rank 1 week 34, awarded 100 Stars

## Week 37 challenges (Sep 7-13) — first fun format

6 challenge cards inserted into D1 (published, goes live Sep 7):

| Type | Question | Match | Points |
|------|----------|-------|--------|
| will_score | Will Haaland score against Coventry City? | Man City vs Coventry | 1 |
| exact_score | Arsenal vs Chelsea — predict the exact score! | Arsenal vs Chelsea | 3 |
| over_under | Everton vs Man Utd — over or under 2.5 goals? | Everton vs Man Utd | 1 |
| clean_sheet | Will Onana keep a clean sheet vs Everton? | Everton vs Man Utd | 1 |
| first_to_score | Nottingham Forest vs Tottenham — who scores first? | Forest vs Spurs | 3 |
| will_score | Will Isak score against Bournemouth? | Newcastle vs Bournemouth | 1 |

Scoring: 1pt for binary (Yes/No, Over/Under), 3pt for harder (exact score, first to score).

## Other
- Salah replaced with Szoboszlai in RELEASE-2.1.md sticker list (Salah no longer at Liverpool)
- Challenge card designs saved to `docs/challenges/week37-sep12-14.md`
- Moved Betty 2.1 challenge doc from Iliya's Google Drive to repo (stop polluting his Drive)
