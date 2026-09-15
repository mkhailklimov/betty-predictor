# CHANGELOG 2026-09-14 — Release 2.1 Final UI Checkpoint

## Release state

- Consolidated the completed Release 2.1 frontend work on the `release-2.1`
  branch.
- Production frontend deployment completed successfully.
- Production API and D1 data were not modified during the final frontend
  deployment.

## Challenge experience

- The active game is a six-question challenge carousel.
- Each card presents the fixture on the upper line, the sticker below it, the
  challenge question below the artwork, and the answer controls last.
- The six launch challenges match the authoritative `Release2.1` worksheet:

  1. England vs Croatia — exact score — 3 points
  2. Arsenal vs Leeds — Raya clean sheet — 1 point
  3. Manchester United vs Tottenham — first scorer — 3 points
  4. Liverpool vs Manchester City — Haaland to score — 1 point
  5. Chelsea vs Brentford — Chelsea to win — 1 point
  6. Arsenal vs Leeds — exact score — 3 points

- Visible answer labels use player-friendly wording such as `Red Devils`,
  `Spurs`, and `Nobody`, while backend answer values remain compatible.
- Players see `Your pick` after each answer is saved.
- After all six predictions are selected, the carousel shows:
  `All predictions saved!`

## Sticker assets

- Bundled local assets remove the dependency on Google Drive delivery:
  `ENG_CRO.png`, `RAYA.png`, `MUN_TOT.png`, `HAALAND.png`, `CHE_BRE.png`, and
  `ARS_LEE.png`.
- Checkerboard source backgrounds were removed from the launch artwork.
- The replacement Haaland artwork was converted so the outer white background
  is transparent and the Betty card background fills the surrounding space.

## Dev verification

- Dev Worker continues to serve the reserved `2026_41` preview week:
  `https://betty-api-dev.mihel-klimm.workers.dev/api/challenges/current`.
- Dev Pages deployment:
  `https://dev.betty-scores-app.pages.dev/`.
- Verified all six cards, the Haaland artwork, answer controls, saved-pick
  indicators, and the final completion confirmation in the browser.
- Frontend TypeScript checking and Vite production build passed.

## Production status

- Production frontend:
  `https://app.bettyscores.com/`.
- Production API health endpoint is healthy:
  `https://betty-api.mihel-klimm.workers.dev/health`.
- Production is configured to serve the validated `2026_41` challenge preview
  for the public Release 2.1 demo.
- The production Worker still has no cron triggers changed by this demo
  configuration.
- The six preview rows remain explicitly scoped to the reserved `preview-*`
  records and must be replaced by verified fixture/source records before the
  October launch.

## Next release action

- Verify the real October fixture source IDs and kickoff times.
- Replace the public demo preview configuration with the verified production
  challenge publish configuration.
