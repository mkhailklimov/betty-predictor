# Changelog — 2026-07-30: Homepage Redesign

## Summary

Complete redesign of the landing page (OutsideTelegramScreen) with a realistic
football pitch theme and restructured navigation.

## Visual Design

- **Football pitch background**: 8 alternating dark-green mown stripes with
  3-layer SVG noise texture (individual grass blades, medium clumps, worn
  patches) for a realistic grass look.
- **Full pitch markings**: horizontal SVG field with boundary lines, centre
  line, penalty areas, goal areas, penalty spots, penalty arcs, corner arcs.
  Stretched edge-to-edge to match stripe width.
- **Centre circle**: Betty logo inscribed exactly within a round circle,
  positioned at the true 50%/50% centre of the viewport (aligned with penalty
  spots).
- **Tagline**: "Predict the score and win stars (3D star emoji)!" above the
  centre circle with text shadow.

## Navigation

- Removed dark top navigation bar.
- 6 nav labels placed directly inside the grass stripes near the top:
  - Stripe 1: empty
  - Stripe 2: Home
  - Stripe 3: About
  - Stripe 4: Champions
  - Stripe 5: Leaderboard
  - Stripe 6: Matches
  - Stripe 7: Privacy Policy
  - Stripe 8: empty
- Each section (About, Champions, Leaderboard, Matches, Privacy Policy)
  renders its content within stripes 3-6 (25%-75% viewport width).

## Play Flow

- Two play buttons below the centre circle:
  - **Play in Telegram** (blue) — links to t.me/bettyscores_bot/app
  - **Play on site** (translucent) — creates a guest account and opens Matches
- Hint text: guests can play and predictions are saved, but Telegram Stars
  prizes require playing in Telegram.

## Infrastructure

- Generated SSH key for GitHub push access (ed25519).
- Switched remote from HTTPS to SSH (git@github.com:MihelKlimm/betty-predictor).
- Linked Telegram Login Widget domain to app.bettyscores.com via BotFather.
- All commits pushed to both `dev` and `main` branches.

## Commits

1. 4fb02aa - Redesign homepage: football pitch background with green stripes and white markings
2. 06d1bf4 - Realistic horizontal pitch with full markings (penalty areas, arcs, spots, corners)
3. 132068a - Darker grass with texture, wider pitch edge-to-edge
4. 4905197 - 8 wide dark stripes, grass texture with fine grain + patches, full-width field
5. d1e0dba - Stretch pitch markings full width to match stripes
6. 049f1b9 - Logo in centre circle, tagline with star above, play button below
7. de61755 - Round circle with logo filling it, 3D star emoji, simplified tagline
8. ac30dd2 - Top nav bar, fix tagline text, centre circle aligned with pitch centre
9. 32f0d57 - Fix tagline text
10. e9da8f4 - Nav labels inside grass stripes 3-6, no dark top bar
11. 3223095 - Fix circle vertical centering (absolute 50%/50%), darker grass with 3-layer texture
12. 57e380b - 6 nav labels in stripes 2-7
13. cb92290 - Page content spans stripes 3-6
14. beaea4f - Much darker grass with sharp blade texture, page content in stripes 3-6, two play buttons
