# 2 Nov 2026 — Week 44 closed

## Results (ESPN)
| Card | Match | Result |
|---|---|---|
| fd577b93 | Liverpool vs Chelsea (League Cup, after 90 min) | **1:1** (both goals in the 1st half; Chelsea won on penalties, not counted) |
| c13bc11a | Chelsea vs Man Utd | **2:0** |
| a6515cf0 | Man City vs Brighton | **0:1** |
| 75e235d6 | Hull vs Ipswich | **2:2** |
| e70558ec | Aston Villa vs Fulham | **1:1** |
| 8150e3b8 | Liverpool vs Arsenal | **0:1** |

`resolve 2026_44 …` → resolved 6, scored 14, week closed at once.

## Standings (8 players)
| Pts | Player | Note |
|---|---|---|
| 7 | Th7Tezar | **1st, 100 Stars** (exact: Villa–Fulham 1:1, Liverpool–Arsenal 0:1) |
| 5 | harrypohhher (tg 1420592166) | **2nd, 50 Stars**. New Telegram player, joined 28 Oct 18:10 UTC (cup night), ref_source empty |
| 3 | Mishanna45 | |
| 3 | Th7Arvin | |
| 3 | Illyria30_ad | internal, not eligible |
| 1 | bettyscores, MikeKlimov, bet_monitoring | internal |

Prizes in `weekly_prizes` (2026_44 rank 1 and 2), **not paid yet**. Mark paid only after the owner sends them:
`bash scripts/betty-admin.sh paid 2026_44 1` / `… paid 2026_44 2`.

## Also checked
- Week 46 published by the Monday 2 Nov cron (6 cards); week 45 running (10 cards).
- Players per week: wk41 20 → wk42 4 → wk43 5 → wk44 8.

## Channel post (week 44 results + week 45)
Text given to the owner, who posts it with a screenshot of the week 45 cards (not sent by Claude):

> Week 44 results are in! Th7Tezar takes first place with 7 points, nailing Aston Villa 1:1 Fulham and Liverpool 0:1 Arsenal. Newcomer harrypohhher finishes second with 5 points in his very first week. Congratulations to both, Stars will be delivered soon.
>
> This week goes European: ten matches from the Champions League, Europa League and Conference League, starting with Barcelona vs Aston Villa on Tuesday. Make your picks before kick-off: t.me/bettyscores_bot/app

## YouTube / Facebook video (owner, 2-3 Nov)
- No login needed: viewers open the site, pick a nickname, play. Winners claim Stars via Telegram (same browser, 14 days).
- Links: `app.bettyscores.com/?ref=youtube`, `app.bettyscores.com/?ref=facebook` (stored in `users.ref_source`).
- Suggested description: "Predict the exact score of Barcelona vs Aston Villa and nine more European matches this week. Free to play, top two win Telegram Stars. Play here: app.bettyscores.com/?ref=youtube"
- After the video: check new players per `ref_source`.

## Decision: Google / Facebook login, skipped for now
- Google: ~1 day (Cloud client ID, Sign-in button, ID token check in the Worker, link to nickname). Blocked in YouTube/Facebook/Instagram in-app browsers (`disallowed_useragent`), exactly where our viewers arrive.
- Facebook: Meta developer app in Live mode, privacy policy + data-deletion URLs; works in Facebook's in-app browser. More paperwork than code.
- Gain: same account across devices. Cost: extra step vs 10-second nickname start. Stars still need Telegram anyway.
- Revisit if nickname players ask to keep their account on another device; then add Google first, nickname stays as an option.

## Prizes paid (2 Nov)
Owner sent 100 Stars to Th7Tezar and 50 Stars to harrypohhher with personal messages (both invited to try a
PRO team avatar for 50 Stars in the Hall of Fame tab; harrypohhher also got the channel link).
Marked: `paid 2026_44 1` and `paid 2026_44 2` → changed 1 each.

## Telegram usernames
Checked 2 Nov: t.me/betty_game and t.me/betty_app show no public account; Fragment lists both as
"Unavailable" (not for sale), so they look free to claim directly in the app. Taken: @bettygame (user
"Dandy"), @bettyapp (channel, 3 subscribers). Plan: hold them as public channels owned by the owner.
