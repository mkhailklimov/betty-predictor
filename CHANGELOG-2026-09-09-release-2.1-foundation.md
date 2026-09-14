# CHANGELOG 2026-09-09 — Release 2.1 Foundation

## Release direction

- Postponed the relaunch target from September to the week of October 5–11, 2026 (`2026_41`).
- The active weekly game is now the challenge carousel only.
- Legacy 2.0 match-prediction cards remain in the repository for rollback compatibility, but are no longer rendered in the active game.

## Frontend

- `MainPage` now loads and displays only `/api/challenges/current`.
- Removed legacy match-card rendering and local legacy prediction synchronization from the active page.
- Preserved challenge progress, dot navigation, optimistic answer state, kickoff lockout, and resolution states.
- Empty challenge weeks now show the empty-state message after loading instead of an indefinite spinner.
- Challenge cards now use one consistent sticker-first layout: sticker, question, then answer controls.
- Added the authoritative `ENG_CRO`, `RAYA`, `MUN_TOT`, `HAALAND`, `CHE_BRE`, and
  `ARS_LEE` sticker assets for the launch challenge carousel.
- Added the fixture name as a separate line above each sticker and kept the
  challenge question below the artwork.
- Converted the launch artwork to transparent PNG stickers so the source
  checkers background is not displayed in the game card.
- Removed legacy crest, team-header, and match-card visuals from the active challenge card.
- Bundled six standalone launch illustrations in `frontend/public/stickers/` so card images
  do not depend on Google Drive delivery.
- Updated the displayed launch questions to match the authoritative worksheet:
  England vs Croatia exact score, Raya clean sheet against Leeds, first scorer in
  Manchester United vs Tottenham, Haaland to score against Manchester City,
  Chelsea to beat Brentford, and Arsenal vs Leeds exact score.
- Updated visible answer labels to `Red Devils`, `Spurs`, and `Nobody` while
  preserving the existing backend answer values.

## Leaderboard

- Added resolved `challenge_predictions.points_earned` to the existing `gold_leaderboard` aggregation.
- Existing leaderboard and prize infrastructure remains the shared system; no parallel prize system was introduced.

## Google Sheets integration

- Confirmed the shared `Betty_Master_Data` spreadsheet contains the `Release2.1` worksheet.
- The current worksheet format is:

  `Week_start | # | Fixture | Challenge | Points`

- Added a backward-compatible adapter that reads this five-column format.
- Dates such as `2026-10-05` are converted to ISO week `2026_41`.
- Challenge type and answer options are inferred from the question text.
- Fixtures are resolved by normalized home/away team names and week.
- Missing fixture matches are reported as publishing errors rather than silently creating unlinked challenges.
- The weekly publisher accepts a maximum of six challenges and validates the 1/3 scoring model.
- Added append-only weekly audit exports:
  - `Challenge Predictions`
  - `Challenge Results`
- Existing monitoring history is preserved; reporting syncs no longer clear and rewrite `Users`, `Bets`, `Champions`, `Leaderboard`, or `Prizes`.

## Weekly operations

- Monday publishing now explicitly targets the next ISO week.
- Monday runs both fixture publishing and `Release2.1` challenge publishing.
- Friday remains the single weekly monitoring synchronization window.
- Existing ESPN fixture ingestion remains responsible for schedule and result data.

## October launch content

The `Release2.1` worksheet currently contains six proposed launch challenges:

| # | Fixture | Challenge | Points |
|---:|---|---|---:|
| 1 | England vs Croatia | Predict the exact score | 3 |
| 2 | Arsenal vs Leeds | Will Raya keep a clean sheet? | 1 |
| 3 | Manchester United vs Tottenham | Who scores first: Red Devils, Spurs, or nobody? | 3 |
| 4 | Liverpool vs Manchester City | Will Haaland score a goal? | 1 |
| 5 | Chelsea vs Brentford | Will Chelsea beat Brentford? | 1 |
| 6 | Arsenal vs Leeds | Predict the exact score | 3 |

Final fixture/source-ID verification is still required before the October weekly publish.

## Deployment

- Production Worker deployed as `betty-api`.
- Production Worker version: `584441a4-dd1a-4f20-8d24-61761accb47d`.
- Worker health verified at `https://betty-api.mihel-klimm.workers.dev/health`.
- Frontend production build passed TypeScript checking and Vite build.
- Frontend deployed to Cloudflare Pages project `betty-scores-app`.
- Deployment preview: `https://18e49313.betty-scores-app.pages.dev`.
- Latest dev illustration deployment: `https://dev.betty-scores-app.pages.dev/`.
- Production app verified at `https://app.bettyscores.com/`.

## Verification

- Frontend production build passed.
- Cloudflare Worker syntax check passed.
- Production Worker health endpoint returned `{"status":"healthy"}`.
- Production frontend returned the Betty application title.
- `Raya.jpg` is now mapped to the Arsenal clean-sheet challenge on dev/Pages hosts.
- `MUN_TOT.jpg` is now mapped to the Manchester United–Tottenham challenge on dev/Pages hosts.
- Dev Worker is temporarily configured with `DEV_PREVIEW_WEEK=2026_41`, so the dev API
  requests the October 5–11 launch week without changing production.
- Verified October fixture rows are not yet available from the scheduled ESPN ingestion.
- For immediate UI validation, six clearly marked `preview-*` fixture/challenge records
  were seeded for `2026_41`; these are temporary preview records, not verified ESPN source data.
- Dev API verification returns all six challenges, and the dev carousel shows `1 of 6`
  with the England–Croatia exact-score card.

## Next checkpoint

- Verify October fixture source IDs and kickoff times.
- Replace the temporary `preview-*` records with verified schedule records before launch.
- Test `Release2.1` publishing with a dry run before the Monday cron.
- Verify production D1 challenge schema and end-to-end challenge submission.
- Verify challenge points in weekly rankings and prize eligibility.
- Test the Telegram Mini App flow on a real device.
