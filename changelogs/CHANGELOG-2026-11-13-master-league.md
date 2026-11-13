# 13 Nov 2026: Master League built (not live), dev test plan

Arvin agreed to the league and named it **Master League**. Deal (from 11 Nov): 500 Stars for December, paid up front by the owner; review in January; prizes stay the common 100 / 50 Stars; league uses the current Betty matches.

## Built and pushed, NOT deployed anywhere yet

Commits `2657dd9` (league) and `680176c` (dev test helpers).

- **Database** `cf-worker/migrations/0009_leagues.sql` (additive only): `leagues` (id, name, season_start_week) and `league_members` (user_id primary key = one league per player). Seeds `master` = "Master League", season from week `2026_49` (Mon 30 Nov 2026).
- **Server** (`cf-worker/src/worker.js`):
  - `POST /api/league/join {"league":"master"}`: joins; 409 if already in another league.
  - `GET /api/league/me`: the player's league and season table, summed from `gold_champions` for weeks from the season start (weeks played, correct results, exact scores, points). Ties: more exact scores, then more correct results, then who joined first. Members with no scored week show zeros. Internal accounts (MikeKlimov etc.) are not in `gold_champions`, so they show zeros.
  - Champions and Hall of Fame return `league_name`, shown as a small tag next to the player.
  - Guest to Telegram merge moves the league membership.
  - Admin notify takes an optional `app_url` (pages.dev or bettyscores.com only), so a bot button can open a test copy of the app.
- **App** (`frontend/src`):
  - Join link `t.me/bettyscores_bot/app?startapp=league_master` (or `?league=master` in the address): joins after register and opens the League tab. Also stored as the player's source `league_master` on first register.
  - New 5th tab **League** (`pages/LeaguePage.tsx`, `styles/LeaguePage.css`): name, players, "Season starts Mon 30 Nov", note before the start, table top 20 + own row (# / Player / Wk / Res / Exact / Pts), legend, "Invite friends" (Telegram share of the league link). Players without a league see a short explanation.
- **Tested locally:** the table SQL on an in-memory database with known answers (only weeks from 2026_49 count, non-members and merged guests left out, tie-breaks right, new members at zero); the page with 23 sample players and the join link in a headless browser with a fake Telegram user (join called, tab opened, top 20 + own row, invite button).

## Next: test on dev, then live

Dev setup (from the April / May changelogs): dev bot **@betty_worldcup2026_bot**, menu button to `https://dev.betty-scores-app.pages.dev`, webhook and initData on the dev server `betty-api-dev` (its own BOT_TOKEN). **The dev server uses the same D1 database `betty-db` as live.**

Dev test, waiting for the owner's OK:
1. Apply `0009_leagues.sql` to `betty-db` (remote). Only adds two empty tables and the Master League row; the live server and app do not read them yet.
2. `npx wrangler deploy --env dev` (dev server only).
3. `npx wrangler pages deploy dist --project-name betty-scores-app --branch dev` (the address the dev bot opens).
4. Owner tests in @betty_worldcup2026_bot: `t.me/betty_worldcup2026_bot/app?startapp=league_master` (if the dev bot has no "app" short name, send a dev-bot message with an app button to `https://dev.betty-scores-app.pages.dev/?league=master` via admin notify `app_url` on the dev server). Check League tab, invite, Champions, Hall of Fame.
5. Afterwards remove the owner's test membership: `DELETE FROM league_members WHERE user_id = <MikeKlimov id>` (tg 1056798742), so the league starts empty.

Live, after the dev test (order matters):
1. The migration (already done in the dev test, same database).
2. `deploy-worker`: the server joins the league tables in Champions and Hall of Fame, so it must not go live before the migration.
3. `deploy-frontend`: League tab live. This also makes the week 47 club shields test live (`3a9957c`), which week 47 needs from Mon 16 Nov.

Then send Arvin the link `t.me/bettyscores_bot/app?startapp=league_master` to share from 26 - 29 Nov.

## Still to build before 30 Nov
- Nicknames for Telegram players (allow `#`, Latin letters only; existing Telegram names unchanged).
- Free avatars for everyone (today Premium only).
- Simple colour shields for the Champions League clubs not in the EPL list (about 15).

## Also today
- Illyria playtest notes were done here by mistake and saved in the Illyria repo (`0c8dbe0`, version 31 not published).
