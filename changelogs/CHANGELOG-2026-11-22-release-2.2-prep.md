# 22 Nov 2026: two card bugs, release 2.2 preparation

## Bug: an untouched card did not count (owner left 0:0, got "You did not pick this one")
- Cause: the card saved a pick only after the arrows were tapped. 0:0 on screen was never sent.
- Not only the owner: in week 47 several players have gaps (e.g. Bournemouth v Forest and Wales v Portugal missing for MikeKlimov, PrettyPirat, Illyria30_ad, bettyscores).
- Fix (`frontend/src/components/ChallengeCard.tsx`): an open exact-score card saves 0:0 as soon as the player sees it; the arrows change it. Hint then reads "Draw" instead of "Tap arrows to set score".
- Tested in a local build: opening the app sent `POST /api/challenges/<id>/predict {"answer":"0:0"}`.
- Week 47 had no open card left when this was ready (Liverpool v Man Utd kicked off 16:30 UTC), so it applies from week 48. Past weeks are not changed.

## Bug: Man Utd crest pushed to the left
- Cause: `EPL_MAN.png` (older picture, not from the v5 set) kept a grey drop shadow on the right and bottom; the shadow counted as part of the crest, so the shield sat left of centre.
- Fix: cut along the white sticker edge (shadow removed), re-centred, same size as the other crests. Both branches.

## Commits
- release-2.1 3f67358, main 593e7a9. NOT deployed yet.

## Release 2.2 check (nothing deployed)
- main has everything live has (crests, card layout, full-time box) plus 2.2. Only difference: 6 old launch-week .jpg stickers that nothing uses.
- Migrations 0009 + 0010 already applied to the shared database.
- Master League join link: t.me/bettyscores_bot/app?startapp=league_master (live bot app link checked: opens "Betty Scores").
- Master League members now: only the test account "bettyscores" (joined 15 Nov): remove before the season starts (needs owner OK, database change).
- Release steps: PROD_BRANCH=main in scripts/betty-admin.sh, then deploy-worker + deploy-frontend from C:/Users/mihel/betty-predictor (main).

## Open question: how players get into the Master League
- Built in 2.2: a join link. Arvin posts it in his channels; one tap opens Betty and joins. One league per player. No password, no manual list.
- Missing: a way to see and remove members (for cheaters or test accounts). Proposed: `betty-admin.sh league-members` and `league-remove <name>`; the league table in the app already shows Arvin everyone who joined.

## Owner decisions (22 Nov evening)
- Master League entry: invite link only, no limit, no barriers. Rules (limit, prize, inactive players) decided later.
- Test account "bettyscores" REMOVED from the Master League (owner OK). Th7Arvin ADDED (owner asked), joined 2026-11-22 17:37 UTC. Members: 1.
- Release 2.2 stays on Mon 30 Nov.
- Week 49 plan approved as in the sheet (rows 62-71, 10 EPL matches, 2-6 Dec). Matches 9 and 10 (Newcastle v Sunderland, Tottenham v Arsenal) checked at ESPN: times match.
- Week 48 (rows 52-61) publishes Mon 23 Nov by the cron.

## 23 Nov morning: fixes live, week 47 closed
- LIVE frontend deployed from release-2.1 (b3f660a, https://9a51827e.betty-scores-app.pages.dev): 0:0 auto-pick + Man Utd crest. Worker not touched.
- Week 48 published by the Monday cron (10 cards, Galatasaray v Aston Villa first, Tue 24 Nov 17:45 UTC).
- Week 47 RESOLVED (all 10 scores checked at ESPN, Full Time): Switzerland 4:0 Scotland, Wales 2:3 Portugal, Hungary 1:1 Northern Ireland, Man City 1:1 Fulham, Bournemouth 2:0 Forest, Aston Villa 0:0 Sunderland, Chelsea 1:4 Leeds, Tottenham 2:0 Ipswich, Newcastle 2:2 Arsenal, Liverpool 4:0 Man Utd.
- No exact score by anyone. Table: harrypohhher 5, urbanflik 3, MikeKlimov 3, then nine players on 2 (12 players).
- Prizes recorded by the close: 1st harrypohhher 100 Stars, 2nd urbanflik 50 Stars (tie with MikeKlimov on 3 points, broken by the close). NOT marked paid: owner sends the Stars, then confirms.

## 23 Nov: crests too small in their boxes (owner's phone screenshots, Arsenal v Dortmund, Sporting v Man Utd)
- Owner: week 47 channel post published; Stars for harrypohhher (100) and urbanflik (50) to be sent today (not marked paid yet).
- Phone still showed the OLD Man Utd picture (with shadow): Telegram's web view keeps the file. Fix: crest links now carry `?v=2026-11-23` (`CREST_VERSION` in `frontend/src/data/avatars.ts`); raise it whenever a crest picture is replaced.
- Crest 86% -> 94% of the box; the extra 2px white CSS edge removed (pictures have their own white edge, it was doubled); tilt softened (rotateY 18 -> 10, rotateZ 7 -> 3, no rotateX).
- Before/after of all 10 week 48 cards: Desktop `betty_crests_before_after.png`.
- Arsenal: the picture itself is the problem (cannon smoke breaks out of the shield); needs a new picture.
- Commits: release-2.1 dca7f4b, main f12221f. NOT deployed (needs owner's "deploy").

## 23 Nov: crest fix LIVE, open task for next session
- LIVE frontend deployed from release-2.1 (3b1ee16, https://83e3110d.betty-scores-app.pages.dev): crests 94% of the box, no doubled white edge, softer tilt, `?v=2026-11-23` on crest links. Worker not touched. Dev NOT updated with this (main f12221f has it; run deploy-dev-frontend next time).
- Owner: Arsenal stays as it is ("I like when our stickers are a bit crazy").
- Man Utd: new prompt written (red devil in full figure with a black trident, gold shield, black and red trim, flat with NO drop shadow), placed first in `design/prompts/club-crests.md` and in the 16 Nov changelog; the old "done, do not regenerate" note replaced. Waiting for the owner's picture at `betty-release-2.1/frontend/public/teams/Cards/EPL_MAN.png`; then cut, centre, show, deploy on "deploy", raise `CREST_VERSION`.
- Owner verdict on the live crests: "a bit better, but still needed to improve".

### OPEN TASK (next session): fit every crest to its box border
Owner's words: crests are smaller than the sticker borders; adjust crests to their borders. Worst cases seen on the phone: Arsenal v Dortmund, Sporting v Man Utd.
What to do:
1. Take phone-size screenshots of all 27 crests in their boxes (script: scratchpad `shot/new48.py` pattern, live API, viewport 390 wide).
2. Per crest, trim the picture to its own outline (white sticker edge) and scale so the shield, not the whole picture with smoke/wings, fills the box evenly; same visual size for all 27. Tall shields vs wide ones (Arsenal cannon, Liverpool wings, Man City ship) may need a per-crest scale in `shields.ts`/`avatars.json` or a re-cut with fixed padding.
3. Decide with the owner: keep the tilt (now rotateY 10 / rotateZ 3) or set crests straight.
4. Show a before/after sheet of all 27 on the Desktop, get the owner's OK, deploy live + dev, raise `CREST_VERSION` in `frontend/src/data/avatars.ts`.
Files: `frontend/public/avatars/clubs/*.png` (512 px), `frontend/src/styles/ChallengeCard.css` (`.cc__shield` width 94%, tilt), originals in `C:\Users\mihel\betty-crests\v5` (Man Utd original `C:\Users\mihel\betty-crests\EPL_MAN.jpg`), cutter `C:\Users\mihel\betty-crests\cut.py`.

### Also open
- Stars for week 47 (harrypohhher 100, urbanflik 50): owner pays today, then mark paid.
- Release 2.2 on Mon 30 Nov (PROD_BRANCH=main, deploy-worker + deploy-frontend from betty-predictor). Master League: invite link only, 1 member (Th7Arvin). Week 49 approved.
- Proposed admin commands league-members / league-remove: not built (owner: start with the link only, decide later).

## Week 47 PAID
- Owner sent the Stars: harrypohhher 100 (rank 1), urbanflik 50 (rank 2). Marked paid with `betty-admin.sh paid 2026_47 1` and `2`.

## 24 Nov: crests fit their boxes, new Man Utd devil
- Owner's screenshot: Arsenal crest sticking out over the left border of its box. Cause: the 3D tilt (rotateY with perspective) brought one side of each crest closer, so it grew; wide pictures crossed the border.
- Fix: crests straight (tilt removed), 90% of the box, even margin; `CREST_VERSION` -> `2026-11-24` so phones reload.
- New Man Utd devil (red devil with black trident on a gold shield, no shadow) from the owner (`teams/Cards/MUN.png`), cut with `cut.py` into `avatars/clubs/EPL_MAN.png`. Original moved out of the app to `C:\Users\mihel\betty-crests\v6\` (`EPL_MAN.png` source, `MUN_original.png`).
- All 10 week 48 cards checked in a local build: every crest inside its box. Desktop: `betty_crests_straight.png`.
- Commits: main d24d8d9, release-2.1 c1a865b. NOT deployed (needs owner's "deploy").

## 24 Nov: crests LIVE, Master League decisions
- LIVE frontend deployed from release-2.1 (e86c0a1, https://4ec4ab41.betty-scores-app.pages.dev): straight crests at 90%, new Man Utd devil, `CREST_VERSION` 2026-11-24. Dev not updated (main has it).
- League table headers now full words: Week, Results, Exact score, Points (main c4c416f, release 2.2 only). Checked in a local 2.2 build.
- Master League crest: prompt in `design/prompts/master-league-crest.md` (gothic black M L on an emerald shield, black-and-white ball, sticker, no shadow). Waiting for the owner's picture `teams/Cards/LEAGUE_MASTER.png`; then cut, show as the league's crest (League tab header, the "Master League" tag).
- Owner decisions: joining by link OK; tags in Champions / Hall of Fame OK; members OK; Arvin's 500 Stars deal DONE (paid).
- Arvin posts the link on Mon 30 Nov, right after the release (week 49 first match Wed 2 Dec).
- Everything stays in English (no Persian translation).
- Arvin writes his own post (knows his audience; uses his 500 Stars for traffic).
- Prize plan: prizes grow with the audience. If the Master League reaches 100 players by 31 Dec: 250 / 100 / 100 Stars for the league's top 3 (owner pays). Until then the usual weekly 100 / 50 for everyone.

## 24 Nov: GAL v AVL card with player stickers, LIVE
- Owner: the two lion crests (Galatasaray, Aston Villa) looked the same. The card now shows Batrakov (83) and Jackson (11) from the reel avatars instead (`PLAYER_SHIELDS` in ChallengeCard.tsx, by ESPN event id 401915300; images in `frontend/public/avatars/players/`).
- Commits: release-2.1 e76237b, main a5abf07. LIVE frontend deployed 24 Nov 13:10 UTC (https://32efc8b2.betty-scores-app.pages.dev).
- Owner saw tilted crests: that was the DEV app (still 18 Nov build, rotateY 18deg). DEV frontend redeployed 24 Nov from main 1239b58: straight crests 90%, new Man Utd, GAL v AVL player stickers, league headers. Live already straight since 24 Nov morning.

- 24 Nov: owner: crests still tilted. Cause = the pictures are drawn as turned 3D stickers (rotating them made it worse). Owner chose option 1: frame boxes removed, crest at full width. Dev deployed (main e0ad120), release-2.1 fb06aa8 committed, NOT deployed live (waiting for "deploy").
