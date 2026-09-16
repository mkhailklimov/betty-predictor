# CHANGELOG 2026-09-16 — Release 2.1 Setup Freeze

## Frozen setup

Release 2.1 is frozen at the current implementation state. No further product,
layout, data, domain, or deployment changes should be made until explicitly
requested.

- Production branch: `main`
- Release branch: `release-2.1`
- Frozen production merge: `a540841`
- Frozen card-layout repair: `a5c249e`
- Release branch is pushed to `origin/release-2.1`.
- Production branch is pushed to `origin/main`.

## Approved quiz format

The approved card format is the one shown in `Quiz_format.png`:

1. Fixture name on the upper line.
2. One centered transparent sticker.
3. Challenge question below the sticker.
4. Answer controls below the question.
5. Previous/next navigation below the card.

The legacy team-crest/header format shown in `broken_format.png` is not part of
Release 2.1 and must not be restored.

The six-card carousel remains:

1. England vs Croatia — exact score
2. Arsenal vs Leeds — Raya clean sheet
3. Manchester United vs Tottenham — first scorer
4. Liverpool vs Manchester City — Haaland to score
5. Chelsea vs Brentford — Chelsea to win
6. Arsenal vs Leeds — exact score

## Frontend implementation

- Card component: `frontend/src/components/ChallengeCard.tsx`
- Card styles: `frontend/src/styles/ChallengeCard.css`
- Carousel page: `frontend/src/pages/MainPage.tsx`
- Local transparent sticker assets are bundled under
  `frontend/public/stickers/`.
- The final compact sticker sizing is `width: 88%` and
  `max-height: 150px`, keeping the fixture, question, answer controls, and
  navigation visible together in the approved mobile layout.
- The frontend build passed with `npm run build`.

## Data and backend state

- Production and dev continue serving the reserved `2026_41` preview week.
- The six preview records remain temporary and must not be treated as the final
  October production fixtures.
- Hall of Fame ordering remains Stars first, then points, then username.
- No new API, D1, or cron changes are included in this freeze.

## Domains and deployment

- Benchmark app: `https://app.bettyscores.com/`
- Apex domain redirects to the benchmark:
  `https://bettyscores.com/` -> `https://app.bettyscores.com/`
- `https://www.bettyscores.com/` redirects to the benchmark as well.
- Dev app: `https://dev.betty-scores-app.pages.dev/`
- Production Pages is connected to the GitHub `main` branch.
- The source changes are committed and pushed. Direct Wrangler deployment was
  unavailable in the working environment because `CLOUDFLARE_API_TOKEN` was not
  configured; Cloudflare Pages should deploy the pushed `main` commit through
  its connected build.

## Hold instruction

This is a pause checkpoint. Do not alter the frozen setup, replace preview
data, change domain routing, modify card styling, or deploy additional
versions unless the owner explicitly asks to resume work.
