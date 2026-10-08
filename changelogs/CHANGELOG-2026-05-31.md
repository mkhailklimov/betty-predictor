# 2026-05-31 — Fix: new users' score predictions silently lost

Two new users (`daria_kllim` 6629065517, `bet_monitoring` 7653593987) registered
on 2026-05-27 and placed predictions, but nothing landed in the
`betty_master_data` sheet — and, more importantly, nothing in prod D1 either.

## Diagnosis

The redirect funnel (2026-05-25 fix) is working: both users **did** register in
D1. The prediction endpoint itself works (live test → `201`). The loss was in
the **frontend save path**:

1. `MainPage.handlePredict` saved each prediction to **localStorage** and fired
   the "✅ Bets placed!" toast optimistically, independent of the backend.
2. The backend `POST /api/predictions` was fire-and-forget. Any failure except
   "Betting closed" was swallowed with `console.error` and a comment that lied —
   *"saved locally, will sync later"* — but **no sync-later code existed**.
   `getMyPredictions` was defined and never called; nothing replayed
   localStorage → D1.
3. **Why new users specifically:** `App.tsx` set `isLoading=false` in a `finally`
   block, so even when `userApi.register()` threw (cold start / network blip /
   500) the app still rendered and let the user bet — against a D1 with no row
   for them → endpoint returned `401 "User not found"` → swallowed → fake
   success. The existing test accounts (MikeKlimov, islavutin) were already
   registered in earlier sessions, so they never hit this.

Also found a latent bug: the kickoff-lockout date parse did
`match.time.replace(' ','T') + 'Z'` on an already-ISO value
(`2026-06-12T01:00:00Z`), producing the invalid `…00ZZ` → `new Date` = NaN → the
lock **never triggered**, so bets after kickoff would have been wrongly accepted.

## Fix (commit `91b6c06`)

**Backend (`cf-worker/src/worker.js`, `/api/predictions`):**
- Self-heal: if the Bearer is a valid numeric tg_id but the user row is missing,
  create it (`INSERT OR IGNORE`, mirrors `/api/user/register`) before storing the
  prediction. A registration race can no longer lose a bet.
- Fixed the kickoff-lockout date parse to normalize ISO / `YYYY-MM-DD HH:MM:SS`
  to a valid UTC instant, and guard against `NaN`.

**Frontend:**
- `MainPage.tsx` — added `syncPendingPredictions()`: replays every
  localStorage prediction to the idempotent upsert endpoint. Runs on app init
  (`App.tsx`), on `MainPage` mount, and 1.5s after a failed submit. This is the
  real "sync later" the old code only pretended to do.
- `App.tsx` — registration now retries up to 3× with backoff instead of letting
  the user in with no D1 row, then flushes pending predictions.

## Verification

| Check | Env | Result |
|---|---|---|
| Frontend `npm run build` | local | ✅ compiles |
| Self-heal: POST as unregistered tg_id → user+prediction created | dev worker | ✅ 201 |
| Self-heal: same | **prod** worker | ✅ 201 (test rows cleaned up) |
| Future-match bet not wrongly locked | prod | ✅ 201 |
| New JS bundle (`"will retry"` string) live | `app.bettyscores.com` | ✅ |
| Prod cron triggers preserved (`0 6 * * FRI`) | prod worker | ✅ |

Dev-first honored: worker deployed+tested on `betty-api-dev`, frontend pushed to
`dev` (preview built) before promoting. Change cherry-picked dev↔main per the
branch-specific-manifest rule.

## Recovering the already-lost predictions

`daria_kllim` / `bet_monitoring`'s May-27 picks still live in their device
localStorage. The new sync-on-load means **when they simply reopen the Mini App
on the same device, their stored predictions auto-replay into D1** — no re-entry
needed (as long as those matches haven't kicked off; WC starts 2026-06-11). Ask
them to open `t.me/bettyscores_bot` once; then re-query D1 to confirm rows.
