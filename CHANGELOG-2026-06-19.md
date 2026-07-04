# Changelog — 2026-06-19

Docs / process day (no app code changes). Formalized the weekly operations
cadence and committed it to the repo.

## Added

- **`docs/WEEKLY-RUNBOOK.md`** — canonical weekly data-ops runbook (all times UTC).
  - **Monday** = the single cadence / visibility transition: promote the lead-in
    week to **Current** and open the week after as **Next** (sheet → `WEEKS`
    registry → D1 → deploy dev→prod).
  - **Friday 06:00 UTC** = close-out the finishing week (data/admin only, no
    visibility change): finalize results → **one** sheet→D1 sync → calculate
    leaders + Gram winner (manual) → send the 1-Gram prize (manual).
  - **Rolling** = fill match results in the **sheet** as they finish — this is
    **bookkeeping only** (spreads our manual entry across the week). Players do
    **not** see results until the weekly Friday D1 sync; the sheet is not
    player-facing, D1 is. Exactly **one** D1 results sync per week.

## Decisions

- **Both cadence transitions moved to Monday** (was Friday-promote in code). A
  week must be **Current before its first match kicks off**, so it becomes Current
  on the Monday leading into its matches and opened as Next the Monday before.
- **Friday 06:00 UTC** pinned as the official sync/close-out clock (aligns with the
  existing worker cron `"0 6 * * 5"`).
- **Weekly-only results visibility** chosen over a daily D1 push, for simplicity.

## Pending (live test today, Fri 2026-06-19)

- Run the first **Week 1 sheet→D1 sync** at 06:00 UTC (step 7), review standings,
  then manually distribute the first Gram prize + post the player message.
- **Code gap:** prod cadence still uses Friday `becomesCurrent` anchors. Week 2 is
  already live (moot); **Week 3 onward must use Monday anchors** when added.
- Select + fill **Week 3** (Weekstart 2026-06-26) — currently only 4 matches
  (IDs 21–24); needs ~6 more to reach a full 10-match slate.
