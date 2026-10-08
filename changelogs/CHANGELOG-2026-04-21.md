# Changelog — April 21, 2026

## Summary

Unblocked and shipped the weekly Users sync. Created Betty-dedicated GCP project + Service Account (honors project-isolation rule), deployed Cloudflare Worker to **dev and prod**, and verified end-to-end. Friday 06:00 UTC auto-sync is now armed on prod.

---

## Betty GCP project + Service Account

- New GCP project: `betty-games` (separate from Pijamas — no credential reuse).
- Enabled **Google Sheets API** on the project.
- Service account: `betty-sheets-sync@betty-games.iam.gserviceaccount.com`.
- JSON key generated on Windows and transferred to the Linux box via **scp** (intentionally bypassed the chat transcript — key never entered Anthropic storage).
- Key stored at `/home/misha/Ilya/cf-worker/.betty-sa.json` (git-ignored).
- Betty spreadsheet shared with the SA as **Editor**.

## Cloudflare setup

- Created a Cloudflare API token (`cfut_…758700e5`) with Workers + **D1 Read/Edit** scopes for remote deploys from this box.
- Token exported in `~/.bashrc` for future sessions.

## Worker deploy

### Config fix — dev cron isolation
Initial `wrangler deploy --env dev` inherited the top-level `[triggers]` block, which would have caused **double-firing** of the Friday sync. Fixed by adding:

```toml
[env.dev.triggers]
crons = []
```

Redeployed — dev now has zero crons; prod keeps `["0 * * * *", "0 6 * * 5"]`.

### Deployments

| Env | URL | Crons |
|---|---|---|
| dev | https://betty-api-dev.mihel-klimm.workers.dev | none |
| prod | https://betty-api.mihel-klimm.workers.dev | hourly match-status + Fri 06:00 UTC user sync |

### Secrets (set on both envs)

| Secret | Value |
|---|---|
| `GOOGLE_SA_JSON` | full `.betty-sa.json` contents |
| `SHEETS_SPREADSHEET_ID` | `1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus` |
| `ADMIN_TOKEN` | 32-char hex (stored locally in `cf-worker/.admin-token`, git-ignored) |

### Smoke tests

```
POST /api/admin/sync-users  (dev)  → {"ok":true,"synced":4,…}
POST /api/admin/sync-users  (prod) → {"ok":true,"synced":4,…}
```

Users tab on the sheet now holds 4 rows — TestUser, bettyscores, MikeKlimov, islavutin — matching D1. Drift resolved.

---

## Also today

- **One-shot Users sync (pre-Worker)**: ran `cf-worker/one-shot-sync.py` (git-ignored) using gspread + the SA to backfill the 3 missing users. Kept the file around for reference; Worker is now the canonical path.
- **GitHub PAT rotation**: regenerated the expiring classic PAT `betty` (repo + workflow scopes), updated Windows git credentials.
- **`.gitignore`**: added `cf-worker/.betty-sa.json`, `cf-worker/.admin-token`, `cf-worker/one-shot-sync.py`.

---

## Security hygiene — to do before next session

1. **Rotate `cfut_…758700e5`** — raw token appeared in chat during pasting. Functional but should be replaced.
2. Consider moving `.admin-token` out of the repo tree entirely (currently OK since it's git-ignored).

---

## Next session

- Walk through every changelog + `.md` file together, recheck every field + dependency for staleness (deferred from 2026-04-19).
- Second-week dashboard work on **dev instance** (`betty-api-dev`).
- Decide whether to point dev to its own D1 database (currently dev and prod share `betty-db`).

---

## Commits

_None yet — uncommitted changes on disk:_
- `cf-worker/wrangler.toml` (dev-triggers fix)
- `cf-worker/src/worker.js` (weekly sync from 2026-04-19, now deployed)
- `.gitignore` (secret-file ignores)
- `CHANGELOG-2026-04-19.md`, `CHANGELOG-2026-04-21.md` (new)
