# Secrets Inventory

**No secret values live in this file or anywhere in git.** This is a directory of *what secrets exist* and *how to re-issue each one*. Pair with `RUNBOOK.md` during disaster recovery.

Last updated: 2026-05-03

## Worker secrets — `betty-api` (prod) + `betty-api-dev` (dev)

Set via `npx wrangler secret put <NAME>` (no `--env` for prod, `--env dev` for dev).

| Secret name | Purpose | Re-issue source | Sensitivity |
|---|---|---|---|
| `BOT_TOKEN` | Telegram Bot API auth — calls `createInvoiceLink`, `answerPreCheckoutQuery`, etc. | BotFather → `/mybots` → bot → API Token (regenerate if lost = old token revoked) | High — full bot control |
| `WEBHOOK_SECRET` | Validates incoming `/tg/webhook` requests via `X-Telegram-Bot-Api-Secret-Token` header | Self-generated: `openssl rand -hex 32`. After rotation, MUST re-call Telegram `setWebhook` with new value. | Medium — wrong value = webhook 403s |
| `ADMIN_TOKEN` | Bearer auth for `/api/admin/*` endpoints (manual sheet sync, etc.) | Self-generated: `openssl rand -hex 32`. Save somewhere you can find — there's no recovery path other than rotation. | Medium |
| `GOOGLE_SA_JSON` | Service-account credentials for Google Sheets writes (D1 → Master Data sync) | GCP Console → project `betty-games` → IAM → Service Accounts → `betty-sheets-sync@betty-games.iam.gserviceaccount.com` → Keys → Add Key (JSON). Old key should be deleted. | High — read/write access to all SA-shared Sheets |
| `SHEETS_SPREADSHEET_ID` | Target spreadsheet for the weekly D1 → Sheets sync | Open the Master Data sheet in browser, copy the id from the URL: `docs.google.com/spreadsheets/d/<THIS_PART>/edit`. Current id: `1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus`. | Low — public reference, not really a secret, but stored as one for consistency |

## Telegram bots

Bot tokens themselves are stored in user's Drive folder (the off-CF, off-GitHub backup):

| Bot username | Role | Token file in Drive |
|---|---|---|
| `@bettyscores_bot` | **PROD** (despite name) | `BotfatherAPI_prod.txt` |
| `@betty_worldcup2026_bot` | **DEV** (despite name) | `BotfatherAPI.txt` |

Drive folder: https://drive.google.com/drive/folders/1p79VMb1MQZLacXH6mY-8c4a0AXFyiqQl

Both bots are owned by the user's Telegram account, so total recovery requires the Telegram account itself to survive. If the Telegram account is lost, the bots are lost permanently — Stars balances, payment history, webhook configuration all gone. There is no backup for that scenario.

## Service account

`betty-sheets-sync@betty-games.iam.gserviceaccount.com` (GCP project `betty-games`).

- Used for: writing to Google Sheets (Master Data sync), reading from Drive folder (pulling bot tokens, mascot images, design docs).
- Permissions on Drive folder: **Viewer** (folder shared with the SA's email).
- Local key file (gitignored): `cf-worker/.betty-sa.json`.
- DR: re-issue a new key in GCP Console, share Drive folder with the (same) SA email, set `GOOGLE_SA_JSON` worker secret to the JSON of the new key.

## Cloudflare account

Account ID `aa87cd3c89231449d59081e1b27e5e88`. Email tied to user's primary login. Cloudflare itself does not support automated DR — recovery means a fresh account + redoing all bindings. See RUNBOOK.

## TON wallet (payout side)

Per `project_betty_ton.md` memory. Wallet survives Cloudflare disaster. Document the receiving address(es) here in the future once payouts begin so they can be re-pointed quickly.

## Rotation policy

Recommended:
- `BOT_TOKEN` — rotate only on suspected compromise (rotation breaks live webhook until updated).
- `WEBHOOK_SECRET` — rotate annually or on suspicion. Easy: generate, `wrangler secret put`, `setWebhook`.
- `ADMIN_TOKEN` — rotate annually or on suspicion.
- `GOOGLE_SA_JSON` — rotate every 90 days (industry standard for SA keys), or on suspicion. Old keys must be deleted in GCP Console after rotation.
- `SHEETS_SPREADSHEET_ID` — never rotates unless target sheet changes.
