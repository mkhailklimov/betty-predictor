# CHANGELOG 2026-10-09 — Week 42 live, stickers, week 43 drafted, admin helper

## Context

Follow-up to `CHANGELOG-2026-10-08-week42-prep.md`. Week 42 (12–18 Oct) had to
be published before Monday, its stickers added, week 43 (19–25 Oct) prepared,
and the routine production steps made runnable by Claude Code.

## Changes — live in production

- **Week 42 published** (19:08 UTC). Six challenges in D1 with ESPN kickoffs,
  team names and Source IDs; `weeks` row `2026_42` = `published`. The app
  switches to week 42 on Monday 12 Oct 00:00 UTC; each card freezes at its own
  kickoff from Sat 17 Oct 11:30 UTC.
- **Week 42 stickers deployed** to app.bettyscores.com (all six load):
  `PICKFORD`, `BRE_LIV`, `MCI_IPS`, `BHA_CRY`, `LEE_MUN`, `NFO_ARS`.
  - Cleaned before use: `LEE_MUN` and `NFO_ARS` had a checkerboard painted
    into an opaque image (removed, white die-cut edge rebuilt); the other four
    had a faint grey haze (alpha snapped). All scaled to 1024 px wide
    (~1 MB each, was ~2.5 MB). Originals kept outside the repo in
    `C:\Users\mihel\betty-stickers-originals\`.
  - Stickers from week 42 on are mapped by the challenge's ESPN `source_id`
    (`FIXTURE_STICKERS` in `ChallengeCard.tsx`), so a sticker can never land on
    another fixture. File names noted in the sheet's `Picture_name` column.

## Repo

- `scripts/betty-admin.sh`: one entry point for routine production steps
  (`ingest`, `publish <week> [--dry|--force]`, `deploy-worker`,
  `deploy-frontend`); reads the token from `cf-worker/.admin-token`, never
  prints it. Allowed in Claude Code with `"Bash(bash scripts/betty-admin.sh:*)"`
  in `.claude/settings.local.json` (added; effective after restart).
- `docs/WEEKLY-RUNBOOK.md`: Release 2.1 weekly challenge flow.
- `.gitattributes`: shell scripts keep LF line endings.

## Week 43 (19–25 Oct) — drafted, not published

Written to Betty_Master_Data → Release2.1, rows 14–19. Production dry run: ok,
0 errors, 0 warnings.

| # | Kickoff (UTC) | Fixture | Challenge | Pts | Source ID |
|---|---|---|---|---|---|
| 1 | Wed 21 Oct 19:00 | Bayern Munich vs Arsenal (UCL) | Bayern vs Arsenal — predict the exact score! | 3 | 401915312 |
| 2 | Sat 24 Oct 11:30 | Aston Villa vs Manchester City | Will Haaland score at Villa Park? | 1 | 401879256 |
| 3 | Sat 24 Oct 14:00 | Arsenal vs Everton | Will Pickford keep a clean sheet against Arsenal? | 1 | 401878768 |
| 4 | Sat 24 Oct 16:30 | Chelsea vs Tottenham Hotspur | London derby — who scores first? | 3 | 401878767 |
| 5 | Sun 25 Oct 14:00 | Liverpool vs Brighton & Hove Albion | Liverpool vs Brighton — over or under 2.5 goals? | 1 | 401878765 |
| 6 | Sun 25 Oct 14:00 | Manchester United vs AFC Bournemouth | Will Manchester United beat Bournemouth? | 1 | 401879252 |

Plan: re-check form on Tue 13 Oct, then publish
(`bash scripts/betty-admin.sh publish 2026_43`) — must be before
Mon 19 Oct 00:00 UTC.

## Week 43 sticker prompts

Save as PNG in `frontend/public/stickers/` with the file names below. Any size
and background is fine — they get cleaned (transparency, white edge, 1024 px)
before wiring. Same style as week 42: comic pop-art, halftone dots, energy
bursts, white die-cut sticker border, landscape (~3:2).

| File | Card | Prompt |
|---|---|---|
| `BAY_ARS.png` | Bayern vs Arsenal — exact score | Comic pop-art sticker, white die-cut border, transparent background, landscape: Bayern Munich (red and white, Munich skyline / Allianz Arena glow) versus Arsenal (red and white, golden cannon) under Champions League night lights with a starball pattern; a flip scoreboard in the middle showing "? : ?", halftone dots, red and gold energy bursts. |
| `HAALAND_AVL.png` | Will Haaland score at Villa Park? | Comic pop-art sticker, white die-cut border, transparent background, landscape: a tall blond striker in a sky-blue Manchester City kit striking the ball mid-air, Villa Park claret-and-blue stands behind, big "GOAL?" speech burst, halftone dots, sky-blue and claret lightning. |
| `PICKFORD_ARS.png` | Pickford clean sheet vs Arsenal | Comic pop-art sticker, white die-cut border, transparent background, landscape: Everton goalkeeper number 1 in a bright keeper kit catching the ball cleanly to his chest, a golden Arsenal cannon firing a ball at him from the side, "CLEAN SHEET?" burst, halftone dots, royal blue and red energy bursts. |
| `CHE_TOT.png` | London derby — who scores first? | Comic pop-art sticker, white die-cut border, transparent background, landscape: Chelsea (royal blue, lion) versus Tottenham Hotspur (white and navy, cockerel) — a lion and a cockerel squaring up over a ball, London skyline and "LONDON DERBY" banner, "WHO SCORES FIRST?" burst, halftone, speed lines. |
| `LIV_BHA.png` | Liverpool vs Brighton — over/under 2.5 | Comic pop-art sticker, white die-cut border, transparent background, landscape: Liverpool (red, Liver bird) versus Brighton (blue and white stripes, seagull) — a Liver bird and a seagull on either side of a scoreboard badge showing "2.5" with a green up-arrow and red down-arrow, halftone dots, red and blue bursts. |
| `MUN_BOU.png` | Will Man Utd beat Bournemouth? | Comic pop-art sticker, white die-cut border, transparent background, landscape: Manchester United (red, devil with trident) versus AFC Bournemouth (red and black stripes, cherries) — the devil reaching for a pair of cherries, "WIN?" burst, Old Trafford arch behind, halftone dots, red and black energy bursts. |

## Open — next session

1. Test the helper with `bash scripts/betty-admin.sh publish 2026_43 --dry`.
2. Tue 13 Oct: re-check form, adjust week 43 if needed, publish.
3. Week 43 stickers (user, next two days) → clean, map by Source ID, deploy.
4. Pages GitHub integration still doesn't build on push (deploy via
   `bash scripts/betty-admin.sh deploy-frontend`).
5. Week 42 results: resolve challenges after 17–18 Oct matches.
