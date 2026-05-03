# Betty Scores — Disaster Recovery Runbook

Written 2026-05-03. Use this if Cloudflare account is lost, deleted, or compromised and you need to rebuild Betty Scores from scratch on a new account/platform.

## What this directory contains

- `snapshot-YYYY-MM-DD.sql` — periodic full export of D1 `betty-db` (data only; schema is in `cf-worker/migrations/`).
- `RUNBOOK.md` — this file. Step-by-step recovery.
- `secrets-inventory.md` — names of all secrets and where to re-issue them. **No secret values are stored in git.**

## What survives a Cloudflare loss

- ✅ Source code — GitHub `MihelKlimm/betty-predictor`
- ✅ Schema + migrations — `cf-worker/migrations/`
- ✅ D1 data snapshot — this folder, refreshed periodically
- ✅ Bot tokens — Google Drive folder `1p79VMb1MQZLacXH6mY-8c4a0AXFyiqQl` (`BotfatherAPI.txt`, `BotfatherAPI_prod.txt`)
- ✅ Service account key — recoverable from GCP project `betty-games` (assuming GCP is alive)
- ❌ Worker secrets stored in Cloudflare — must be re-set
- ❌ Custom Domain bindings — must be re-attached
- ❌ DNS records — recoverable from registrar (Cloudflare-as-registrar adds risk; consider transferring zone away if CF account is the disaster)
- ❌ Cron triggers — re-deployed via wrangler.toml

## Recovery sequence (Cloudflare account total loss)

### 1. Recover the codebase

```bash
git clone https://github.com/MihelKlimm/betty-predictor.git Ilya
cd Ilya
```

### 2. Create new Cloudflare account + login

```bash
cd cf-worker
npx wrangler login
```

### 3. Re-create D1 database

```bash
npx wrangler d1 create betty-db
# Copy the new database_id printed → paste into wrangler.toml replacing the old id
```

### 4. Apply schema

```bash
# Foundation schema lives in cf-worker/schema.sql or migrations/0000_initial.sql
# (verify which is canonical at recovery time)
npx wrangler d1 execute betty-db --remote --file=schema.sql

# Then apply each migration in order
npx wrangler d1 execute betty-db --remote --file=migrations/0001_premium_purchases.sql
npx wrangler d1 execute betty-db --remote --file=migrations/0002_users_fav_team.sql
# ... add any newer migrations
```

### 5. Restore data from snapshot

```bash
# Use the most recent snapshot in dr/
npx wrangler d1 execute betty-db --remote --file=../dr/snapshot-2026-05-03.sql
```

Note: the snapshot's `CREATE TABLE` statements will conflict with step 4. If wrangler refuses, edit the snapshot to strip `CREATE TABLE` lines (keep only `INSERT` rows), or apply with a fresh empty D1 and skip step 4.

### 6. Re-set worker secrets

See `secrets-inventory.md` for the list and re-issue procedure for each.

```bash
# Get new bot tokens from BotFather, new SA key from GCP, generate new WEBHOOK_SECRET
echo "<value>" | npx wrangler secret put BOT_TOKEN
echo "<value>" | npx wrangler secret put WEBHOOK_SECRET
echo "<value>" | npx wrangler secret put ADMIN_TOKEN
echo "<value>" | npx wrangler secret put GOOGLE_SA_JSON
echo "<value>" | npx wrangler secret put SHEETS_SPREADSHEET_ID

# Same for dev env:
echo "<value>" | npx wrangler secret put BOT_TOKEN --env dev
# ...etc
```

### 7. Deploy worker

```bash
npx wrangler deploy --env dev
npx wrangler deploy
```

### 8. Re-attach custom domains

In CF dashboard for each worker:
- `betty-api` → Settings → Domains & Routes → `+ Add` → Custom Domain → `api.bettyscores.com`
- DNS: only proceed if old CNAME for `api` was already removed; otherwise delete first.

### 9. Re-deploy frontend (Cloudflare Pages)

```bash
cd ../frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name=betty-scores-app
# Then in CF dashboard: connect `app.bettyscores.com` to the project
```

### 10. Re-register Telegram webhooks

```bash
# Prod
curl -X POST "https://api.telegram.org/bot<PROD_BOT_TOKEN>/setWebhook" \
  -d "url=https://api.bettyscores.com/tg/webhook" \
  -d "secret_token=<NEW_WEBHOOK_SECRET>" \
  -d "allowed_updates=[\"message\",\"pre_checkout_query\"]"

# Dev
curl -X POST "https://api.telegram.org/bot<DEV_BOT_TOKEN>/setWebhook" \
  -d "url=https://betty-api-dev.mihel-klimm.workers.dev/tg/webhook" \
  -d "secret_token=<NEW_DEV_WEBHOOK_SECRET>" \
  -d "allowed_updates=[\"message\",\"pre_checkout_query\"]"
```

### 11. Smoke test

- `curl https://api.bettyscores.com/api/matches/active` → 200
- Open `@bettyscores_bot` → Mini App → Leaderboard loads → Premium button visible
- Force `is_premium=1` for an admin tg_id and verify flag picker works without paying real Stars

## How to refresh the snapshot

Manual (recommended weekly, e.g., before each Friday cron runs):

```bash
cd cf-worker
npx wrangler d1 export betty-db --remote --output=../dr/snapshot-$(date +%Y-%m-%d).sql
cd ..
git add dr/snapshot-*.sql
git commit -m "DR: refresh D1 snapshot $(date +%Y-%m-%d)"
git push
```

Keep the most recent 4–8 snapshots; delete older ones to keep the repo lean. Snapshots are small (~24KB at WC pre-launch; will grow during the tournament).

## What this runbook does NOT cover

- **TON wallet / TON Connect setup** — the TON-side of payouts. The wallet itself lives outside Cloudflare and survives this disaster scenario; just point the new worker at the same wallet addresses.
- **Stars balance recovery** — Telegram Stars accumulated by `@bettyscores_bot` are tied to the bot, not Cloudflare. They survive a CF wipe. They do NOT survive losing the bot itself, which would mean losing access to the BotFather account on Telegram.
- **Domain registrar level disaster** — if `bettyscores.com` is lost at the registrar, recovery requires registering a new domain and updating all references in code (worker URL fallbacks, frontend `resolveApiBase`, etc.). Search for `bettyscores.com` in the codebase before changing.
