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
