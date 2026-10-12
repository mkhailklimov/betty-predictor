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

## Open items

1. **Prizes:** week 41 (Mishanna45 100 ⭐, "........" 50 ⭐) and the manual bonuses
   (Mishanna 200 ⭐, Denis 300 ⭐) are owed. Payment planned for next weekend
   (rules: within a month); then mark paid via
   `POST /api/admin/prizes/<week>/paid?rank=N`.
2. **Test purchase:** the Stars payment path has never run in production. Do one
   50 ⭐ purchase from a non-PRO account (e.g. @bettyscores); refund afterwards.
3. **Merge** `fix/task1-kickoff-lock` into `main`.
4. **`frontend/public/stickers/videoplayback.mp4` (60 MB, untracked)** exceeds the
   25 MiB Pages file limit and breaks `deploy-frontend`. It was moved aside for
   each deploy today; compress it or move it out of `public/`.
5. Week 42: resolve after 17–18 Oct with `betty-admin.sh resolve 2026_42 …`.
