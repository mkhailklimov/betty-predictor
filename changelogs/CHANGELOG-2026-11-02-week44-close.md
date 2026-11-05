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
Owner took both: @betty_game and @betty_app are now public channels on the owner's account.
News (t.me/thelab/1179, 2 Nov, not launched yet): Telegram plans bot usernames ending in `_app`, `_ai`,
`_game`, for owners with Premium, one extra username per bot. When it ships: free @betty_app (or @betty_game)
from its channel and add it to @bettyscores_bot as an extra username, keeping @bettyscores_bot, its players
and links. No new bot needed.

## Barcelona vs Aston Villa reel (owner, 2 Nov)
- On-screen text (checked: Villa 6-0 Fenerbahce, UCL 14 Oct 2026, ESPN 401915409):
  "Villa crushed Fenerbahce 6-0. Can they stay strong in Barcelona? Pick the score, grab Stars!"
- Facebook description: Villa 6-0 hook, "Predict the exact score and win Telegram Stars. Free to play, no
  sign-up", scoring line, `app.bettyscores.com/?ref=facebook`, hashtags #Barcelona #AstonVilla
  #ChampionsLeague #UCL #FootballPredictions. Also post the link as the first comment (reel captions
  often aren't clickable).
- Kick-off Tue 3 Nov 20:00 UTC. After it: count new players by `ref_source`.

## Winner messages (sent by owner with the Stars)
- Th7Tezar: week 44 win, 7 pts, third week running among winners; PRO team avatar tip (50 Stars, Hall of
  Fame tab); European week invite.
- harrypohhher: 2nd in first week; team avatar tip; channel link t.me/bettyscores_channel.

## Short bot names (checked 2 Nov)
Free: @bettygamebot, @betty_game_bot, @betty_app_bot. Taken: @bettybot, @betty_bot, @bettyappbot.
Decision: no move to a new bot (would lose the players we can message, the catalog listings and links,
and need new token/webhook/payments setup). Optional: register @bettygamebot empty, just to protect the name.
Idea, not done: pin a post with an "Open Betty" button in @betty_game / @betty_app (bot must be admin there).

## Security
Telegram Desktop before 7.2.9 has a link vulnerability that can steal local files; owner advised to update
(this PC runs the bot/channel admin).

## Week 46 team cards live (2 Nov)
Owner generated MKD, WAL, IRL, NIR, UKR (1254x1254 PNG) into `frontend/public/teams/Cards/`. Added to
`TEAM_CARDS`, `CARD_ASSETS_VERSION` 6 → 7, plus 160px avatar thumbnails in `public/avatars/cards/`
(avatars.json now points to them instead of flags). Commit 4d57494, frontend deployed (fc1e6375).
All six week 46 cards now show both team pictures. Wales card resembles Gareth Bale (man bun, 11);
owner kept it (different eye colour).

## 4 Nov: paid posts with Arvin, Telegram link tracking
Owner declined buying his channel (ex @Yaftest, now @FootNiga, 498 subs, Persian) for 200 Stars. Deal: 100 Stars for two posts, paid in full up front.
Post 1 up 13:33 UTC (Fenerbahce vs Liverpool, screenshot, `t.me/bettyscores_bot/app?startapp=ref_arvin`); 100 Stars sent 13:56 UTC. Post 2 due Mon 9 Nov. @yafiro (5,486 subs, only 45-165 views per post) to discuss Tue 10 Nov.
`startapp=ref_NAME` now sets `ref_source` (43ac8bb), deployed 14:00 UTC (8a21ac5a). New users between 13:33 and 14:00 have no source: count them by creation time.
Facebook/YouTube automatic names delayed to release 2.2 (winter holidays).

## TODO (agreed 4 Nov)
- **Mon 9 Nov: second post in @FootNiga.** Already paid. Owner sends Arvin the text and screen before then; use the `startapp=ref_arvin` link.
- Tue 10 Nov or later: assess results (`ref_source=arvin` + new users from 13:33 to 14:00 UTC on 4 Nov, without Th7Arvin / Th7Tezar), then decide on @yafiro.
- **After Christmas (release 2.2): new entry with names from YouTube and Facebook.**

## 5 Nov: data reel generator (pilot)
Owner's idea: animated bars as weekly reels. `scripts/reels/make_reel.py <match.json>` renders a 14 s, 1080x1920, 30 fps MP4 to `reels/` (git-ignored): team cards, expected goals, win/draw/loss, most likely score with its chance, game card + link.
Input is 3 numbers (`odds` or `probs`); a Poisson fit gives goals and score so the bars agree. Needs Pillow, numpy, imageio-ffmpeg. No audio; owner adds music.
`ENG_CRO.json` holds SAMPLE numbers with a red "NOT FOR POSTING" banner. Before posting: enter real odds, remove `"sample"`, re-render. No reliable current odds found on 5 Nov.
