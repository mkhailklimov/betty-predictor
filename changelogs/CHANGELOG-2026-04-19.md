# Changelog — April 19, 2026

## Summary

Round-2 match slate finalized to 10 games (user-tested ceiling). Identified Users-sheet drift (real bettors present in D1/Bets but missing from Sheets). Designed and partially coded a weekly D1→Sheets users sync in the Cloudflare Worker. **Not deployed** — waiting for a Betty-dedicated Google Service Account and user-owned `wrangler login`.

---

## Matches Sheet — Round 2 cleanup

- Testing with friends: **10 games per round is the UX ceiling**. Round 1 already set to 10.
- User selected the 10 Round 2 games (week_id `2026_25`, weekstart `2026-06-19`) by setting column K `Is active = 0` on those rows.
- Deleted 16 rows for week `2026-06-19` where K was empty (never-played matches).
- Remaining Round 2: match IDs **11, 12, 13, 14, 15, 16, 18, 19, 29, 31** — SAF–CZE, SWZ–BIH, CAN–QAT, MEX–KOR, USA–AUS, SCO–MOR, PAR–TUR, NED–SWE, NOR–SEN, POR–UZB. IDs are non-sequential by design (user asked to keep original numbering).

---

## Users Sheet — found drift

- Users tab has only `TestUser` (seeded at setup).
- Bets tab shows **3 distinct user_ids**, 21 bets:
  - `e457e786…` = TestUser (1 bet)
  - `f1ede1a9…` (10 bets) — missing from Users
  - `fcb9075b…` (10 bets) — missing from Users
- Root cause: no automatic D1→Sheet sync for `users`. Only `bets` was pre-populated (once, manually, 2026-04-10).

---

## Weekly Users Sync — design + partial implementation

**Decision:** keep the sync inside the Cloudflare Worker (cheapest + most reliable: free tier, Cloudflare cron SLA, zero external services).

**Schedule:** Fridays **06:00 UTC**, weekly.

### Code changes (local only, not deployed)

- `cf-worker/wrangler.toml`
  - Cron triggers extended to `["0 * * * *", "0 6 * * 5"]`.
  - Added `[env.dev]` block so we can deploy to `betty-api-dev` separately — honors the dev-first rule.
- `cf-worker/src/worker.js`
  - `scheduled()` now branches on `event.cron`; the `0 6 * * 5` branch calls `syncUsersToSheet(env)`.
  - New admin endpoint `POST /api/admin/sync-users` (bearer-token guarded) for manual triggers.
  - Added `syncUsersToSheet`: reads `users` from D1, clears `Users!A:Z`, writes full snapshot with the canonical 13-column header.
  - Added `getGoogleAccessToken` (Web-Crypto RS256 JWT signer → Google OAuth2 token endpoint) and `sheetsFetch` helpers. No npm deps.

### Secrets the Worker will need (per env)

| Secret | Source |
|---|---|
| `GOOGLE_SA_JSON` | Service-account JSON contents (Betty-specific SA — see blocker below) |
| `SHEETS_SPREADSHEET_ID` | `1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus` |
| `ADMIN_TOKEN` | Random 32-char string for manual-sync auth |

---

## Blocked — not deployed yet

1. **Need a Betty-dedicated Service Account.** First attempt reused the Pijamas SA for convenience; user rejected (correctly). Per the new [project-isolation rule](../.claude/projects/-home-misha/memory/feedback_project_isolation.md), Betty must get its own GCP project + SA.
2. **`wrangler login` must run on user's machine** — I can't authenticate to Cloudflare remotely.
3. A one-shot deploy script was drafted and **deleted** after review (it referenced the Pijamas SA path).

---

## Memory / policy changes

- Added `feedback_project_isolation.md`: never reuse SAs, keys, or GCP projects across unrelated projects (Pijamas ≠ Betty ≠ future). Applies to every script, config, and secret path.

## Folder isolation — confirmed

Each project lives in its own top-level folder under `/home/misha/`:

| Project | Folder |
|---|---|
| Pijamas / dendrogram | `/home/misha/dendrogram-bi/` |
| Betty | `/home/misha/Ilya/` |

Sanity scans (both directions) showed no cross-references after `deploy-sync.sh` was deleted. Only remaining hit was a coincidental substring inside an npm integrity hash in `frontend/package-lock.json` — not a real reference. Folder boundary holds.

---

## Next session

- Second-week dashboard work happens **on the dev instance** (`betty-api-dev`), not prod.
- Walk through each changelog / `.md` file together, recheck every field + dependency for staleness.
- Create Betty-specific GCP project + SA.
- Run the deploy path: `wrangler login` → dev secrets → `wrangler deploy --env dev` → manual `/api/admin/sync-users` test → promote to prod.

---

## Commits

_None yet — all edits are uncommitted on disk:_
- `cf-worker/wrangler.toml` (modified)
- `cf-worker/src/worker.js` (modified)
