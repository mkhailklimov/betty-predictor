# Changelog — 2026-06-29 (Week 4 prod deploy fired; landing-site new-week fix)

The scheduled **Week 4 (`2026_27`) prod deploy fired successfully**, and we fixed
a separate bug on the marketing landing **www.bettyscores.com** where the new
weeks weren't appearing in the Current/Next toggle.

## Week 4 (`2026_27`) — prod deploy fired ✅

- The one-time system cron `0 2 29 6 *` ran **Mon 2026-06-29 00:00:15Z**,
  wrangler exit code **0**, and **self-removed** the cron entry on success
  (only the comment line remains). Log: `betty-week4-prod-deploy.log`.
- Prod D1 confirmed serving `2026_27` with the 2 R32 ties, `is_active=1`:
  - `match-31` **Australia v Egypt** — Jul 3 18:00 UTC (Dallas)
  - `match-32` **Argentina v Cape Verde** — Jul 3 22:00 UTC (Miami)
- App cadence (unchanged): opened as **Next** today 00:00Z; becomes **Current**
  Jul 3 06:00Z.

## Landing site (`www.bettyscores.com`) — new week wasn't showing

**Symptom:** the public landing still showed old weeks; Week 3 and Week 4 never
appeared in the Current/Next toggle.

**Root cause:** the landing (`deploy/index.html`, CF Pages `landing` project) is
static HTML that reads matches **live** from the Google Sheet **gviz CSV**
endpoint and groups weeks by the **`Weekstart`** column. Two data problems in
that column:

1. **Week 3 (`2026_26`) Weekstart cells were plain TEXT** (`'2026-06-26'`), while
   the rest of the column is **date-typed**. gviz infers a single type per
   column, so it **silently nulled the text cells** → Week 3 vanished from the
   site.
2. **Week 4 (`2026_27`) Weekstart was `2026-06-29`** (a Monday) — wrong for the
   cadence. The landing's `resolveCadence` expects the **Friday** anchor
   (`becomesCurrent = Weekstart 06:00 UTC`, `opensAsNext = Weekstart − 4d`).
   `2026-06-29` would have pushed Week 4 straight to **Current** and dropped
   Week 3, instead of Week 3 = Current / Week 4 = Next (what the app does).

**Fix (sheet data only, no redeploy):** via SA `betty-sheets-sync@betty-games`
(`cf-worker/.betty-sa.json`, gspread in `backend/venv`):
- Rewrote `Matches!A22:A31` (Week 3) with `value_input_option="USER_ENTERED"` so
  the values coerce from text → **date-typed** `2026-06-26` (gviz-visible).
- Corrected `Matches!A32:A33` (Week 4) → **`2026-07-03`** (the Friday anchor).

**Verified:**
- gviz now exports all four weeks with `Weekstart` populated
  (`2026-06-12`/`2026-06-19`/`2026-06-26`/`2026-07-03`).
- Cadence (now = Jun 29) resolves to **Current = Week 3** (`2026-06-26`, group
  finals) and **Next = Week 4** (`2026-07-03`, R32) — mirrors the app.
- Landing fetches gviz on every page load, so the fix is live with **no
  redeploy** (allow a couple of minutes for Google's gviz CDN to refresh).

## Notes / gotchas captured

- **Two separate surfaces read week data differently:** the **app**
  (`app.bettyscores.com`) reads **D1** via the worker; the **landing**
  (`www.bettyscores.com`) reads the **sheet gviz CSV** directly. A week can be
  correct on one and broken on the other — check both.
- **gviz column-type trap:** always write `Weekstart` as a real date
  (USER_ENTERED), never RAW/pasted text, or gviz nulls the odd cells out and the
  week disappears from the landing.
- `Weekstart` must be the **Friday** of the week, even for knockout weeks whose
  matches fall later (R32 week `2026_27` = `2026-07-03`, not the match date).

## Still ahead (unchanged)

- Append the 8 Round-of-16 ties (IDs 33-40) to Week 4 (~Jul 3-4), then redeploy
  app + ensure their sheet `Weekstart` is date-typed `2026-07-03`.
- Pay 1 GRAM to each winner (Mishanna45, ippolitovdenis) once they connect a
  wallet — still not connected.
