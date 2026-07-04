# Changelog — 2026-07-03 (Capture Telegram first_name at register)

New users with **no @username** were registering as `User_<tg_id>` stubs (e.g.
`User_6034210172`, `User_8562574292`) — most Telegram accounts have no public
@handle. Now the register flow also captures `first_name`/`last_name` from the
Telegram `initDataUnsafe.user`, so the display name falls back to the person's
name before the `User_<tg_id>` stub.

## Change — fallback chain `@username → first[ last] → User_<tg_id>`

- **Worker** (`cf-worker/src/worker.js`, `POST /api/user/register`) — now reads
  `first_name` + `last_name` from the body; `displayName = username || fullName
  || \`User_${tg_id}\`` where `fullName` = trimmed `"first last"`.
- **Frontend** (`frontend/src/App.tsx`) — the register call now sends
  `first_name: tgUser?.first_name`, `last_name: tgUser?.last_name` (already had
  `username`). Type widened in `frontend/src/services/api.ts`.

Backward-compatible: fields are optional; an old client that sends only
`username` behaves exactly as before.

## Verified (dev + prod)

`POST /api/user/register` with throwaway tg_ids (rows deleted after):

| Body | Resulting username |
|------|--------------------|
| `first_name=Marco, last_name=Rossi` (no username) | `Marco Rossi` |
| `username=cool_handle, first_name=Marco` | `cool_handle` |
| `tg_id` only | `User_99990003` (stub) |

Confirmed on both `betty-api-dev` and prod `api.bettyscores.com`.

## Deployed (dev-first)

- **Worker** — `wrangler deploy --env dev` then `wrangler deploy` (prod).
- **Frontend** — `npm run build` (clean) → dev `--branch dev`; prod artifact
  `/home/misha/betty-firstname-prod-dist` (prod tonconnect-manifest swapped in)
  → `--branch main`. `app.bettyscores.com` serving new bundle.

## Note — forward-only

Register short-circuits for existing users, so the 2 current `User_<tg_id>`
rows keep their stub names (both made 0 predictions anyway). Only **new**
registrations get the name. No backfill.
