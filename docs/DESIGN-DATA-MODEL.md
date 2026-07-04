# Betty Predictor — Data Model (Kimball + Medallion)

Status: **Phase 0–5 LIVE ON PROD** (2026-06-19). Supersedes the data-flow
sections of `MASTERDATA.md` (which described a `champions`/`bets` model the
worker never actually built).

## Why

We had four things each implicitly claiming to be the source of truth — ESPN
results, user forecasts, the Google Sheet, and the dashboard — with no clear
flow. The Champions/Leaderboard pages were either live-computed with a buggy
scoring rule **or** hand-maintained in the Sheet, so no number was reproducible.

The fix: **one owner per fact, unidirectional flow, derived data is computed —
never authored.** Layered as medallion (bronze → silver → gold); the silver and
gold layers are a Kimball star schema.

```
        BRONZE (raw, owned externally/by app)     SILVER (Kimball star)         GOLD (marts → API)
 FIFA/admin ─► matches (schedule + result)  ─┐                              ┌─► gold_champions  (user × week)
 TG app ─────► predictions (forecasts)  ─────┤   rebuildMarts()             │      = Σ fact_score + adj, ranked
 TG app ─────► users  ───────────────────────┼─► silver_dim_user            ├─► gold_leaderboard (user)
 Sheet ──────► bronze_adjustments (manual) ──┘   silver_dim_week                   = Σ gold_champions
                                                 silver_dim_team
                                                 silver_fact_bet     ─┐
                                                 silver_fact_result  ─┼─► silver_fact_score
                                                                              (bet ⨝ result, canonical scoring)
 API reads GOLD only.  Sheet (later) becomes a read-only mirror of GOLD.
```

## Ownership (single source of truth)

| Entity | Owner / SoR | Notes |
|---|---|---|
| Match schedule | Admin via Sheet → `matches` | master data |
| Match result/score | ESPN (future) / admin now → `matches` | a **fact**, not master data |
| User forecasts | TG app → `predictions` | app is the only writer |
| Users | TG app → `users` | |
| Manual score adjustments | Admin → `bronze_adjustments` | manual scoring as an **input**, not an edit of output |
| Champions / Leaderboard | **computed** (`gold_*`) | never authored; rebuildable any time |

## 🥉 Bronze

Raw landing. For app-owned data the existing operational tables **are** bronze
(the app writes them directly); we only add a table for the manual-scoring input.

- `matches` — schedule + result/score (existing)
- `predictions` — forecasts (existing; `predicted_score` is JSON `{home,away}`)
- `users` — players (existing)
- `bronze_adjustments` — manual per-week point deltas (new). SoR for manual scoring.

```sql
CREATE TABLE IF NOT EXISTS bronze_adjustments (
  id           TEXT PRIMARY KEY,
  week_id      TEXT NOT NULL,
  user_id      TEXT NOT NULL,
  points_delta INTEGER NOT NULL,
  reason       TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);
```

## 🥈 Silver — Kimball star

Conformed dimensions + facts. Rebuilt wholesale by `rebuildMarts()`.

- `silver_dim_user` — `is_internal` flags test/admin accounts excluded from marts
  (tg_ids: `test_123`, `8513208258` bettyscores, `1056798742` MikeKlimov,
  `7653593987` bet_monitoring). SCD type 1 (overwrite).
- `silver_dim_week` — one row per `week_id` (`YYYY_WW`).
- `silver_dim_team` — one row per team.
- `silver_fact_bet` — grain **user × match**: predicted outcome + score.
- `silver_fact_result` — grain **match**: actual outcome + score, `is_final`.
- `silver_fact_score` — grain **user × match**, derived = `fact_bet ⨝ fact_result`
  through the **one** canonical scoring function.

### Canonical scoring (single definition)

```
correct_outcome = pred_outcome == result_outcome            → +1
correct_score   = correct_outcome AND exact goals match      → 3 (total, NOT +1+3)
otherwise                                                     → 0
```

This replaces the old worker bug (`+1` then `+3` = 4 for an exact score).

## 🥇 Gold — marts

- `gold_champions` (grain user × week) = Σ `fact_score` + adjustments, ranked by
  `total_points DESC, last_bet_at ASC` (earliest bettor wins ties). Internal
  users excluded.
- `gold_leaderboard` (grain user) = Σ `gold_champions`; `weeks_won` = #weeks ranked 1.

The dashboard API (`/api/champions`, `/api/leaderboard`) reads **only** these.

## Transform: `rebuildMarts(env)`

Idempotent, deterministic, full rebuild from bronze on every run (data volume is
tiny; "drop & rebuild" is also the recovery path). Triggered by:
- hourly cron (after match-status update), and
- `POST /api/admin/rebuild` (Bearer `ADMIN_TOKEN`).

## The Sheet's role

- **In** (sources): schedule tab → `matches`; `Adjustments` tab → `bronze_adjustments`.
- **Out** (sinks): read-only mirrors of `gold_*` + `users` for monitoring.
- No tab is ever both a source and a sink.

## Phasing

- [x] 0 — canonical scoring fn + `silver_dim_week`
- [x] 1 — bronze (`bronze_adjustments`) + treat operational tables as bronze
- [x] 2 — silver star + `rebuildMarts`
- [x] 3 — gold marts + API reads gold
- [x] 4 — `Adjustments` tab wired to `bronze_adjustments`
- [x] 5 — Sheet demoted to one-way mirror; ESPN results ingestion (preview mode)

### Phase 5 — sheet mirror + ESPN

**Sheet roles now fully one-way.** IN (sources): schedule tab → `matches`,
`Adjustments` → `bronze_adjustments`. OUT (sinks, overwritten from gold):
`Users`, `Champions`, `Leaderboard`. `exportMartsToSheet()` mirrors gold →
Champions/Leaderboard; runs in the weekly Friday cron + `POST /api/admin/export-marts`.

**FIFA results ingestion** (`bronze_match_results`, source-agnostic): `POST
/api/admin/results` [`?apply=1`] (`/api/admin/espn` kept as a back-compat alias).
Ingests the official FIFA World Cup calendar
(`api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023`;
`MatchStatus 0` = finished), lands raw to bronze, then `reconcileResults()` matches
games to `matches` by normalized team identity + ±1.5d date window. **DRY by
default** — returns proposed result changes; `apply=1` writes them to `matches` and
rebuilds marts. NOT in any cron — applying is an explicit admin action so a
name-mapping error can never silently overwrite prod results. Validated 2026-06-19:
10/10 week-24 games matched FIFA, 0 discrepancies. `normTeam()` strips
accents/punctuation + aliases (Cabo Verde→Cape Verde, Korea Republic→South Korea,
United States→USA, Bosnia and Herzegovina→Bosnia & Herzegovina). To switch source
later, swap `ingestFifaResults()` — reconcile/bronze are source-agnostic.

### Phase 4 — manual adjustments

Sheet tab **Adjustments** (`Week ID | Username | Points Delta | Reason`) is the SoR
for manual scoring. Admin edits it; username is resolved to `users.id`
(case-insensitive, unknown names skipped). Loaded to `bronze_adjustments` by
`syncAdjustmentsFromSheet()` (full replace) and applied in the gold rollup.
Triggers: hourly cron (sync → rebuild) + `POST /api/admin/sync-adjustments`
(`?dry=1` to preview parse without writing).
```

