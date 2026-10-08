# CHANGELOG 2026-09-27 — D1 write optimization

## Context

Cloudflare reported that D1 daily `rows_written` usage was nearing the Workers
Free limit. The Worker previously refreshed marts and imported sheet
adjustments hourly, in addition to changing match status.

## Changes

- Added `worker_state` and a migration to store the source signature for the
  silver/gold marts.
- Scheduled refreshes skip the full delete-and-reinsert mart rebuild when the
  operational source data has not changed. Manual rebuilds remain available.
- The hourly cron now only locks matches after kickoff, transitioning each open
  match from `is_active = 1` to `is_active = 2` once. It no longer marks a match
  finished based on an estimated duration or refreshes marts/adjustments.
- Adjustment imports compare the normalized sheet rows to D1 and skip a
  delete-and-reinsert when the data is unchanged.
- Adjustment import and source-aware mart refresh now run with the existing
  daily 03:00 UTC ingestion/reconciliation job. Friday's existing sync remains.
- Cron expressions and other schedules are unchanged.

## Validation and rollout

- Worker JavaScript syntax check passed.
- Focused local test confirmed hourly processing only updates open, started
  matches and does not schedule background maintenance.
- Wrangler dry-run passed.
- No remote D1 migration or Worker deployment was performed.
