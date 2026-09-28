# CHANGELOG 2026-09-28 — Chelsea vs Bournemouth quiz sticker

## Changes

- Updated challenge 5 to display Chelsea vs Bournemouth and use the
  `CHE_BOR` sticker instead of the outdated Chelsea vs Brentford artwork.
- Removed the checkerboard background from the sticker and saved it with
  transparency.
- Switched to a new sticker URL so browsers and the CDN do not keep serving a
  previously cached image.
- Kept the display compatible with the older Brentford-labeled challenge data;
  it is presented as Chelsea vs Bournemouth without rewriting saved predictions.

## Validation and deployment

- Frontend production build passed.
- Verified the deployed app references the new transparent sticker asset.
- Deployed to Cloudflare Pages Production for `app.bettyscores.com` on
  2026-09-28.
- No Worker, database, or saved prediction changes were made.
