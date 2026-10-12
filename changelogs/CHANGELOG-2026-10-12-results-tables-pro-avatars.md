# CHANGELOG 2026-10-12 — Result tables fixed, Hall of Fame top 10, PRO avatars

All changes are deployed to production (worker and app.bettyscores.com).
Commits are on `fix/task1-kickoff-lock`; `main` is not updated yet.

## Champions tab

- **Columns:** Results and Scores (always 0 for challenge weeks) removed. The
  table is now `# | Player | Pts | ⭐` (`b80c960`).
- **Wrong week:** the tab showed the newest week in `gold_champions`, which was
  unplayed week 42 (one early pick, Th7Tezar, 0 pts). `/api/champions` now
  defaults to the latest week whose challenges are **all resolved** (`2dfbfc5`).
  Week 41 shows until week 42 is resolved; the switch is automatic every week.
- **Wrong Stars:** ⭐ was filled in by rank (1st = 100, 2nd = 50) even when
  nothing was awarded. It now reads the prizes actually in `weekly_prizes`, so
  a week shows 0 ⭐ between resolving and the Monday 00:00 UTC close.

Week 41 as shown now: 1 Mishanna45 6 pts 100 ⭐, 2 "........" 6 pts 50 ⭐
(tie on points, earlier last pick wins), 3 urbanflik 5, 4 Goone12345 5,
5 Anonymmmx 0.

## Hall of Fame

- **Weeks column** showed `weeks_won`, so players who never won a week showed 0
  next to their points. It now shows `weeks_played` (`b80c960`). Guest and
  internal accounts, which have no weekly champion rows, count the distinct
  weeks in which they made a challenge pick.
- **Top 10 + you + Show all** (`5e66d45`): the top 10 by default; if the viewer
  ranks lower, a `···` gap and their own highlighted row follow; a
  "Show all (N)" button expands the list in place.
- **Live PRO and avatar:** `/api/leaderboard` reads `is_premium` and `fav_team`
  from `users`, so a new avatar shows at once instead of after the 03:00 mart
  rebuild (`687b9ea`).

## PRO avatars (`687b9ea`, `cf2934a`)

Check before the change: `premium_purchases` is empty — **no one has bought PRO
through the app yet**. MikeKlimov and islavutin were set PRO by hand.

- **Catalog** `frontend/src/data/avatars.json` (231 entries), used by the picker
  and imported by the worker for `/api/user/fav-team` validation, so the two
  cannot drift:
  - **211 FIFA nations.** The 43 with illustrated cards use 160px JPEG
    thumbnails (`public/avatars/cards/`, ~13 KB each; the 2 MB originals in
    `public/teams/Cards/` are unchanged for match screens). The rest use
    flag-icons 7.2.3 1x1 SVGs (MIT, licence in `public/avatars/flags/`).
    Existing codes kept (JAP, MOR, SAF, SWZ = Switzerland, …); Eswatini is
    `ESW` to avoid the SWZ clash.
  - **20 Premier League clubs**, codes `EPL_XXX`: own shield badges in club
    colours, no text and no club crests (trademark risk when sold).
- **Picker:** Nations / Premier League tabs, country search, names under tiles,
  lazy-loaded images. Before, it downloaded ~60 MB of full-size cards.
- **Payment race:** after a successful payment the app polls `/api/user/me` for
  up to ~10 s until `is_premium` is set by the webhook, then opens the picker.
- **Texts:** hint line above the buy button removed; button reads
  "Get fave team avatar for 50 ⭐". Telegram invoice description now describes
  the avatar.
- **Test:** islavutin (already PRO) given Cyprus (`CYP`) by a direct D1 update;
  shows in the Hall of Fame immediately.

## Tooling

- `bash scripts/betty-admin.sh rebuild` — rebuilds silver + gold marts via
  `/api/admin/rebuild`.

## Challenge type: match winner (`11bacc8`)

Type inference labelled any question with "will " or "win" as `will_score`
(a player to score), so "Will Manchester City beat Ipswich Town?" carried the
scorer label and a ⚽ icon. New type `will_win` for "Will X beat/win …"
questions, 🏆 icon, Yes/No options, 1 pt. Relabelled in D1 (3 rows):
Chelsea–Bournemouth (2026_41), City–Ipswich (2026_42), United–Bournemouth
(2026_43). Scoring and existing picks unchanged.

## Week 42 review

- All six kickoffs match the ESPN fixtures (17–18 Oct; last Forest vs Arsenal,
  Sun 15:30 UTC).
- M23 derby (exact score): Brighton home, Crystal Palace away — enter the
  answer as Brighton:Palace (the sticker shows home left).
- Challenges are not linked to fixture rows (`match_id` empty): results are
  entered by hand with `betty-admin.sh resolve`, as in week 41. No effect on
  players.
- 2 picks per challenge so far; a YouTube reel will go out closer to the games.

## Rule: weekly close and event selection

`closeWeek` (Mon 00:00 UTC) awards prizes from the points present at that
moment and marks the week closed; it does not check that every challenge is
resolved. Example on today's data: unresolved at the close, everyone has 0 pts
and the tie-break would give Th7Tezar 100 ⭐. **Rule (decided 12 Oct): never
pick challenge events that finish after Sunday midnight UTC, and resolve on
Sunday evening.** No code guard added.

## Times: stored vs shown

- **Stored in UTC** (`kickoff_utc`, e.g. `2026-10-17T11:30:00Z`). Pick locking
  and the weekly close run on the server in UTC — the same moment for everyone.
- **Shown in each player's device time zone and language** (`toLocaleString`
  in `ChallengeCard.tsx`): Everton vs Chelsea is 12:30 in London (BST until
  25 Oct), 14:30 in Moscow, 18:30 in Bangkok. The card shows no zone label;
  adding one ("12:30 BST") is a one-line change if wanted.

## Git and repo

- `main` fast-forwarded to `fix/task1-kickoff-lock` and both pushed to GitHub
  at `11bacc8`. The `Bash(git push:*)` rule is in
  `betty-predictor/.claude/settings.local.json`; a push works when run as a
  single command.
- `frontend/public/stickers/videoplayback.mp4` (60 MB, 2 min 1080p, unused) was
  deleted by the owner; frontend deploys no longer need a workaround.

## Open items

1. **Prizes:** week 41 (Mishanna45 100 ⭐, "........" 50 ⭐) and the manual bonuses
   (Mishanna 200 ⭐, Denis 300 ⭐) are owed. Payment planned for next weekend
   (rules: within a month); then mark paid via
   `POST /api/admin/prizes/<week>/paid?rank=N`.
2. **Test purchase:** the Stars payment path has never run in production. Do one
   50 ⭐ purchase from a non-PRO account (e.g. @bettyscores); refund afterwards.
3. ~~Merge into `main`~~ — done, pushed.
4. ~~60 MB video blocking deploys~~ — deleted.
5. Week 42: resolve on **Sun 18 Oct evening** (after Forest vs Arsenal) with
   `betty-admin.sh resolve 2026_42 …`, before the Mon 00:00 UTC close.
6. New sticker `Наклейка_ футболист «Лидс» в ударе.png` is in
   `frontend/public/stickers/` but not committed or used yet.
