# Changelog — 2026-06-20 (Week 3 — real FIFA group-stage finals)

Built **Week 3** (week_id `2026_26`, Weekstart 2026-06-26) on dev, replacing a
broken hand-curated cut with the real group-stage final round verified against
the FIFA WC2026 calendar, added/reframed team cards to the house style, and
scheduled the prod deploy for Mon 2026-06-22 00:00 UTC.

## Added

- **Week 3 = 10 real group-stage finals** (`frontend/src/data/matches.ts`
  `WEEK3_MATCHES`, IDs 21-30): Groups H, G, L, K (Jun 27) + Group J (Jun 28
  02:00 UTC). Added Week 3 to the `WEEKS` rotation
  (`becomesCurrent 2026-06-26T06:00:00Z` / `opensAsNext 2026-06-22T00:00:00Z`).
- **7 team cards** pulled from the Drive folder into
  `frontend/public/teams/Cards/` + registered in `TEAM_CARDS`: EGY, KSA, IRN,
  GHA, COD, AUT, JOR.
- Synced the real fixtures to the **sheet** (`Matches!A22:P31`) and **D1**
  (`match-21..30`, week_id 2026_26).

## Changed

- **Schedule corrected against FIFA** (api.fifa.com competition 17 / season
  285023). The previous Week-3 rows 25-30 were *already-played* group games
  stamped with fake Jun 28-Jul 2 dates (e.g. USA–Australia really Jun 19,
  Uzbekistan–Colombia Jun 18, Belgium–Egypt Jun 15). Group stage ends Jun 28;
  everything after is the Round of 32 (placeholder teams, not predictable).
  Egypt's real fixture is **Egypt–Iran**, not the old Belgium–Egypt.
- **Card style unified.** The 5 new sticker-style cards (IRN, GHA, COD, AUT, JOR)
  arrived 1024² with a white margin / rounded corners; reframed to full-bleed
  1254² (content-crop + cover-scale) to match the canonical cards (EGY/KSA et al.).
  Bumped `CARD_ASSETS_VERSION` 5 → 6 to bust WebView caches.
- **Activated all 10** (sheet `Is active=1`, D1 `is_active=1`) once every card
  was in place. (Briefly went live with the 4 fully card-ready fixtures —
  21/23/25/27 — before the remaining 6 cards landed.)

## Decisions

- **FIFA is the schedule source of truth, not the hand-curated sheet** — validate
  fixtures/dates against the FIFA calendar before trusting sheet rows.
- **Prod deploy is scheduled, not promote-now** (user choice). Cadence reveals
  Week 3 at `opensAsNext` regardless of deploy time, so the deploy only needs to
  land before the reveal.
- **Prod artifact is built from dev source, not git `main`** — `main` is stale;
  prod has always been deployed via `wrangler` direct-upload. Only the
  branch-specific `tonconnect-manifest.json` is swapped to the prod URL; the API
  base resolves at runtime by hostname.

## Validation

- Prod artifact (`/home/misha/betty-week3-prod-dist`) verified: **no `DEBUG_TIME`
  clock**, prod TON manifest baked in, all Week 3 fixtures + cards present.
- All 6 new cards serve `200` on dev via the versioned URL.
- Round-robin cross-check: matches 21-24 matched FIFA exactly; 25-30 were the
  already-played phantoms (now replaced).

## Deploy

- **Dev**: live on `https://dev.betty-scores-app.pages.dev` (DEBUG_TIME reverted
  to null; real cadence). Committed + pushed to `dev` (`5a45a2c`, `0cf…` revert).
- **Prod**: SCHEDULED via cron `0 2 22 6 *` (02:00 Europe/Berlin = **00:00 UTC**,
  Mon 2026-06-22) → `/home/misha/deploy-betty-week3-prod.sh` →
  `wrangler pages deploy /home/misha/betty-week3-prod-dist --project-name
  betty-scores-app --branch main`. 3 retries; logs to
  `/home/misha/betty-week3-prod-deploy.log`; self-removes the cron entry on
  success. Sheet + D1 already final (shared dev+prod).
