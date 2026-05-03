# 2026-05-03 — Betty Scores prod live; @tApps_bot resubmitted

Resolved every item from the "BLOCKED — picked up next session" list in `CHANGELOG-2026-05-01.md`. Stars Premium tier is now live end-to-end on prod, real 50⭐ purchase verified by user, resubmission to `@tApps_bot` filed.

## Prod custom domain `api.bettyscores.com` restored

**Diagnosis:** the existing DNS row was a plain proxied `CNAME api → betty-api.mihel-klimm.workers.dev`. That alone does **not** route a hostname to a Cloudflare Worker — it requires a proper *Custom Domain* binding in the worker's "Domains & Routes" settings. The CNAME was leftover from an earlier attempt; the binding was missing. CF edge proxied the request, then had no worker target → 522.

**Fix:**
1. CF dashboard → `bettyscores.com` zone → DNS → Records → deleted the stale `api` CNAME row.
2. Worker `betty-api` → Settings → Domains & Routes → `+ Add` → **Custom Domain** → `api.bettyscores.com`.
3. CF auto-provisioned cert + correct DNS within ~30s.

**Verification:** `curl https://api.bettyscores.com/api/matches/active` → HTTP 200 with JSON.

## Prod bot wired to `@bettyscores_bot`

User dropped the prod bot token into Drive folder `1p79VMb1MQZLacXH6mY-8c4a0AXFyiqQl` as `BotfatherAPI_prod.txt`. Pulled via `betty-sheets-sync@betty-games.iam.gserviceaccount.com` SA, saved to `/tmp/botfather_api_prod.txt`. Verified via `getMe`: bot id `8766179198`, username `bettyscores_bot`, name "Betty Scores".

Worker secrets set on `betty-api` (no `--env` flag, defaults to prod):
- `BOT_TOKEN` — prod bot API token.
- `WEBHOOK_SECRET` — fresh 32-byte hex via `openssl rand -hex 32`, saved to `/tmp/webhook_secret_prod.txt`.

Webhook registered:
```
POST https://api.telegram.org/bot<TOKEN>/setWebhook
  url=https://api.bettyscores.com/tg/webhook
  secret_token=<WEBHOOK_SECRET>
  allowed_updates=["message","pre_checkout_query"]
```
Confirmed via `getWebhookInfo`. Auth validated: `POST /tg/webhook` returns 403 without correct `X-Telegram-Bot-Api-Secret-Token` header.

## Stars purchase smoke-tested live

User completed a real 50⭐ purchase end-to-end on prod. Confirmed: invoice popup → payment → PRO badge → flag picker auto-opens → flag thumbnail renders next to username on Leaderboard. **First user-facing Stars revenue earned by Betty Scores.**

## Cron expression hardened: `5` → `FRI`

User noticed the CF dashboard humanized the weekly Sheets-sync cron `0 6 * * 5` as **"Thursday"** with next run Thu 7 May 2026 06:00 UTC. May 7 2026 is genuinely a Thursday. Either CF's parser uses a non-standard day-of-week numbering or the dashboard's humanization is buggy — either way, the named form is unambiguous across all parsers.

Changed in this commit:
- `cf-worker/wrangler.toml`: `crons = ["0 * * * *", "0 6 * * FRI"]`
- `cf-worker/src/worker.js`: dispatch matcher updated to `event.cron === '0 6 * * FRI'` (string-exact match — without this update the weekly sync would silently stop firing).

Deployed dev → prod. Wrangler confirms prod schedule reads `0 6 * * FRI`.

## `@tApps_bot` resubmitted

Drafted resubmission message explicitly addressing moderator's May 1 feedback: new 50⭐ Telegram Stars Premium (user-facing inflow) + existing 1 TON weekly prize (TON ecosystem alignment). User submitted with screenshots of the Stars invoice flow + PRO/flag-picker post-payment. Awaiting moderator response — no further action until they reply.

## Open items / future ideas (NOT to start without explicit user go-ahead)

- Audit share surfaces — make sure every public link routes through `t.me/bettyscores_bot`, not raw `app.bettyscores.com` (OutsideTelegramScreen catches it but better to never need it).
- Remove forced `is_premium=1` on test users `islavutin` (500886298) and `MikeKlimov` (1056798742) before public launch — left as-is for now (admin/test accounts).
- WC 2026 launch readiness audit — tournament starts 2026-06-11 (~5.5 weeks). Things to verify: match schedule sync currency, score ingestion source, TON payout mechanism for the weekly 1-TON prize.
- Premium ideas parked: custom display_name with profanity filter, Telegram avatar in rows for everyone, favorite footballer avatar.

User then asked to switch focus to Avocado Farm — see that repo's changelog for next moves.
