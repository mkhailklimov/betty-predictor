# 14 - 15 Nov 2026: 2.1 archived, release 2.2 built and on dev, weeks 48 - 49, new shields live

## Release plan

- **2.1 archived:** branch `release-2.1` and tag `v2.1-final` (both at `6237580`, plus the shields below). Everything players use until 30 Nov comes from this branch, built in a separate checkout at `C:\Users\mihel\betty-release-2.1`.
- **2.2 is developed on `main`,** tested on the dev bot, and released on **Mon 30 Nov** together with the Master League season (week 49).
- **Safety lock** in `scripts/betty-admin.sh`: `deploy-worker` and `deploy-frontend` refuse to run unless the checked-out branch is `PROD_BRANCH` (`release-2.1` now; set it to `main` on release day).
- **New admin commands:** `deploy-dev-worker`, `deploy-dev-frontend` (to `dev.betty-scores-app.pages.dev`), `migrate <file.sql>` (passes a full path to wrangler; the first try failed on a relative path and changed nothing).

## Dev setup

- Dev bot **@betty_worldcup2026_bot**. Its Mini App "Betty" (`t.me/betty_worldcup2026_bot/Betty`) now opens `https://dev.betty-scores-app.pages.dev` (owner changed it in BotFather on 15 Nov; it pointed at an old Netlify address).
- Dev server `betty-api-dev` has its own bot token and its own admin token (not the live one).
- **The dev server uses the live database `betty-db`.** Anything done in the dev bot (picks, nickname, avatar, league) changes the real account.
- Master League test link: `t.me/betty_worldcup2026_bot/Betty?startapp=league_master`.

## Database (applied 14 Nov, owner's OK, additive only)

- `0009_leagues.sql`: `leagues`, `league_members`, row `master` = "Master League", season from `2026_49`. 0 members after the migration.
- `0010_challenge_live.sql`: `challenge_live` (display only: the 90-minute score per card).

## Release 2.2 (on `main`, on dev, NOT live)

1. **Master League** (built 13 Nov, see `CHANGELOG-2026-11-13-master-league.md`): League tab, join link `startapp=league_master` or `?league=master`, season table, league tag in the main tables. Owner tested it on the dev bot: "looks great".
2. **Full-time box** (`73cdc22`): 120 minutes after kickoff each exact-score card shows the 90-minute score from ESPN, the player's pick and points (+3 exact, +1 right result, 0), with "Counts in the tables when the week is scored" until the admin resolve. Official points and prizes still come only from `resolve`.
   - ESPN `soccer/all/summary?event=<source_id>`; 90 minutes = the first two halves, so extra time and penalties are left out (Liverpool vs Chelsea, League Cup: 1:1, not the shoot-out).
   - Refreshed by the hourly timer and in the background when cards are opened (dev has no timers); one try per card per 5 minutes; stops 4 days after kickoff.
   - `pointsFor()` is now the one scoring rule for resolve and the live view.
   - On dev it already showed England 2:1 Croatia and Scotland 2:1 North Macedonia.
3. **Nicknames for Telegram players** (`2c9a83c`): Hall of Fame, "Your player", Change name. 3 - 20 Latin letters, digits, spaces and `_ . - #`, at least one letter; duplicates refused; look-alike letters refused (a Cyrillic "a" in "Mishanna45" is rejected). Telegram names stay until the player changes them.
4. **Free avatars:** no Premium check; "Change avatar" replaces the paid button. The two players who paid keep the PRO badge.
5. **European clubs as avatars:** picker tab "Europe" with the 7 new shields.
6. Champions and Hall of Fame show each player's current name and avatar.

## New shields (live 15 Nov from `release-2.1` `12c18d9`, also on `main`)

- 7 shields for clubs outside the Premier League: Galatasaray, Borussia Dortmund, Napoli, Club Brugge, Sporting CP, Heart of Midlothian, Celtic (`frontend/public/avatars/clubs/UCL_*.svg`, `SCO_*.svg`; names in `frontend/src/data/shields.ts`, ESPN spelling). Simple colour shields, not the clubs' crests.
- All shields look like stickers: white die-cut edge, light and shadow, tilted towards each other.
- A glowing yellow lightning bolt replaces "vs" between the two pictures (shields and national team cards).
- Earlier on 14 Nov the Premier League shields test went live (`release-2.1` at `6237580`) for week 47.

## Weeks in the sheet

- **Week 48 (23 - 29 Nov), rows 52 - 61, normal 2.1 week:** Galatasaray vs Aston Villa, Arsenal vs Dortmund, Man City vs Napoli, Club Brugge vs Liverpool, Sporting vs Man Utd (Champions League); Forest vs Chelsea, Everton vs Liverpool, Brighton vs Newcastle, Hearts vs Celtic (owner swapped PSG vs Roma out), Arsenal vs Man City. Dry run OK. Published by the Monday timer on 16 Nov.
- **Week 49 (30 Nov - 6 Dec), rows 62 - 71, 2.2 launch and Master League week 1:** Chelsea vs Palace, Liverpool vs Sunderland, Man City vs Leeds, Newcastle vs Man Utd, Brentford vs Arsenal, Tottenham vs Fulham, Chelsea vs Liverpool, Man Utd vs Coventry, Newcastle vs Sunderland, Tottenham vs Arsenal. The last two (6 Dec) were not yet in the fixture download; recheck the dry run before 23 Nov.
- The sheet takes at most 12 rows per `sheet-add`.

## Still to do before 30 Nov

- Owner tests 2.2 on the dev bot (full-time box, league, nickname, avatars).
- Remove the owner's test membership from the Master League, so it starts empty.
- Recheck week 49 dry run.
- Arvin shares `t.me/bettyscores_bot/app?startapp=league_master` from 26 - 29 Nov.
- **Release morning, Mon 30 Nov:** set `PROD_BRANCH="main"`, `deploy-worker`, then `deploy-frontend` (tables are already in the database); owner sends Arvin 500 Stars.

## Notes

- Changelog-only pushes to GitHub are sometimes blocked by the permission check; code pushes go through and carry earlier changelog commits with them.
