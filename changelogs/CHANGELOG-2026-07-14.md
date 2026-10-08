# Changelog — 2026-07-14 (t.me outage recovery + initData auth security fix)

Triggered by a user report that "Betty does not work": `app.bettyscores.com`
opened in a browser dead-ended on `ERR_NAME_NOT_RESOLVED`. Root cause was **not**
Betty — `t.me` lost all its NS records and went unresolvable worldwide (dead on
8.8.8.8 and 1.1.1.1, from RU/CA/DE alike; `telegram.org` unaffected). But our own
code was amplifying Telegram's outage into a dead end on our one canonical link,
and chasing it surfaced a serious auth hole. Four fixes below.

Betty's infra was healthy throughout (app, API, D1, CORS, fixtures all green) and
**in-Telegram users were never affected** — `initData` is present there and the
app never touches `t.me`. Tonight's SF1 France v Spain (19:00 UTC) stayed open and
predictable the whole time.

## 1. Removed the forced `t.me` redirect from the outside-Telegram card

`OutsideTelegramScreen.tsx` did `window.location.href = https://t.me/<bot>` after
2s for any visitor without Telegram `initData` (i.e. any browser open of
`app.bettyscores.com`, the single link in every communication). With `t.me` dead
that replaced the page with a browser error and stranded the visitor — and the
redirect wiped the very fallback card (bot link + "search for @bettyscores_bot"
hint) that could have rescued them.

- Deleted the auto-redirect; the card now stays on screen.
- The pre-existing contrast bug this exposed is fix #3.

## 2. First attempt kept a dead `t.me` button → replaced with `tg://` + Telegram Web

Removing the redirect left the card's only button pointed at `t.me`, so the blue
"Open @bettyscores_bot" button still led to `ERR_NAME_NOT_RESOLVED` (reproduced by
the user on phone + a friend in Canada — confirming a global `t.me` outage, not a
Russia DNS block). Dropped `t.me` from the screen entirely:

- **Primary button** → `tg://resolve?domain=bettyscores_bot` — OS-handled scheme,
  does **no DNS lookup**, opens the installed Telegram app even with `t.me` down.
- **Fallback link** → `https://web.telegram.org/k/#@bettyscores_bot` — separate
  domain from `t.me`, resolves fine (149.154.167.99), works in any browser.
- Plain-text `@bettyscores_bot` handle retained as last resort.
- Button copy later changed to **"Play with Betty"** (invitation, not instruction).

Also de-linked the `t.me` contact in the **landing privacy policy**
(`deploy/index.html`) — it was the stated data-deletion route, so a dead link
there was a compliance gap, not cosmetics. Now plain-text handle.

## 3. Fixed black-on-black text on the card

The card hard-coded its text to `#1f1c09` while `--color-bg` is *also* `#1f1c09`,
so title, body and hint all rendered at a **1.00:1 contrast ratio** — invisible.
The yellow fallback in `background:var(--color-bg,#ffd90f)` never applied because
`--color-bg` is always defined. Nobody had ever seen it: the old 2s redirect fired
before the card was readable. Moved the whole card onto the app's dark-theme
tokens; verified WCAG contrast on prod:

| element | ratio | |
|---------|-------|--|
| title (Betty yellow) | 9.49:1 | pass |
| body text | 11.64:1 | pass |
| hint text (nudged to `#a3a3a3`) | 6.09:1 | pass |
| hint link (underlined yellow) | 9.49:1 | pass |

Verified both paths headlessly (puppeteer) against live prod: **inside Telegram**
(real launch params in URL hash) → real app renders France v Spain, no card, no JS
errors; **outside Telegram** → readable card, no `t.me`.

## 4. SECURITY: user auth via signed Telegram initData (was raw, unsigned tg_id)

The headless check surfaced this: the API took user identity from
`Authorization: Bearer <tg_id>` — an **unsigned number supplied by the client**.
Anyone could act as any user by sending their id. Verified on prod by fetching a
user's full record with nothing but their numeric id.

**Impact:** `POST /api/user/wallet` sets `ton_wallet`, the address prize payouts
are sent to — an attacker could repoint a winner's payout to their own wallet and
steal the 1 TON. Predictions could be forged as any user, corrupting the
leaderboard that decides the prize. `GET /api/user/me`, `/api/predictions/me` and
`/api/rewards/claim` additionally fell back to `SELECT * FROM users LIMIT 1`,
leaking an arbitrary real user's record (wallet included) to any anonymous caller.

**Fix** (`cf-worker/src/worker.js`):

- Identity now comes from Telegram's signed `initData`, sent as
  `Authorization: tma <initData>` and verified via `verifyInitData` /
  `resolveTgId`: HMAC-SHA256 against `BOT_TOKEN` per Telegram's spec
  (`secret = HMAC("WebAppData", BOT_TOKEN)`), constant-time compare, 24h
  `auth_date` freshness window, tolerant of the newer `signature` field being in
  or out of the data-check-string. `BOT_TOKEN` is a CF secret, so `initData`
  cannot be forged client-side.
- All 7 user routes moved to `resolveTgId`; admin routes still use `getToken` vs
  `ADMIN_TOKEN` (a real secret — never the hole).
- `/api/user/register` no longer trusts a body-supplied `tg_id`.
- Removed the 3 `SELECT * FROM users LIMIT 1` anonymous fallbacks (user/me,
  predictions/me, rewards/claim) — all now require the authenticated user.
- Frontend (`services/api.ts`) sends `tma <WebApp.initData>` live from the SDK,
  not a stored id.
- 10 offline unit tests: genuine / tampered / wrong-token / stale / unsigned /
  header-handling. All pass.

**Rollout** via `ALLOW_LEGACY_AUTH` (`wrangler.toml [vars]` + `[env.dev.vars]`):

- Deployed first with `"1"` (also accept old Bearer) so live users weren't cut off
  mid-tournament while the new frontend propagated.
- Confirmed a real Telegram client saved a prediction via the `tma` path (D1
  `updated_at` bumped seconds after the tap).
- Flipped to `"0"` (signed-only) — the flip that actually closes the hole.
  Re-confirmed a real Telegram save with legacy OFF. If genuine users are ever
  hard-blocked (HMAC stricter than Telegram's), flip back to `"1"` to unblock
  instantly, then debug.

**Prod verification (legacy OFF):** forged `Bearer <tg_id>`, forged `tma` (bad
hash), and anonymous calls all → 401; public `/api/matches` + `/api/leaderboard`
→ 200.

### Incident notes (things that went wrong during the work)

- A **write-probe against the dev worker** set `ton_wallet = EQATTACKER_WALLET` on
  MikeKlimov's row — because `betty-api-dev` **shares prod D1**. Caught and
  reverted immediately (wallet → NULL, consent → 0; no other row touched). Rule
  recorded: read-only probes only against dev.
- The security commit was briefly committed onto `main` while the branch label
  read `dev`, breaking the dev-first invariant. Prod was never at risk (the tested
  dev worker was built from the fixed tree); `dev` was fast-forwarded to reconcile,
  and all subsequent deploys went dev→prod.
- Worker deploys have ~seconds of edge-propagation lag; auth probes fired
  immediately after `wrangler deploy` returned mixed old/new results. Space them.

## Deploys

- Frontend (app): git-built from `main` — final bundle `index-Cco9uRrl.js`.
- Landing: git-built from `main` — `t.me` privacy link removed.
- Worker (prod `betty-api`): `wrangler deploy`, version `bd6afb47`,
  `ALLOW_LEGACY_AUTH="0"`.
- Worker (dev `betty-api-dev`): version `3fbb49e4`.
- TON manifest confirmed prod (`app.bettyscores.com`) on every merge — no dev-URL
  leak.
