# CHANGELOG 2026-09-27 — Hall of Fame nickname visibility

## Change

The Hall of Fame scorecard now hides entries without a player-chosen name:
blank usernames, the generic `Guest` label, and generated `User_<number>`
placeholders. Remaining players are renumbered so displayed ranks and medal
positions reflect only visible entries. When no named players are available,
the page shows a corresponding empty state.

## Validation and deployment

- Frontend production build passed.
- Nickname-filter checks passed for guest labels, generated placeholders, blank
  names, and ordinary nicknames.
- Deployed to Cloudflare Pages Production for `app.bettyscores.com` on
  2026-09-27 (deployment `d07d1a0a-b2ee-49f1-b705-66da60566787`).
- Verified the live Hall of Fame displays named players and renumbered ranks.
- No Worker or D1 changes were part of this deployment.
