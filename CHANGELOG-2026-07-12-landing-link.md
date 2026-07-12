# Changelog — 2026-07-12 (One canonical link: landing CTA → app.bettyscores.com)

Visitors coming from **bettyscores.com** were landing on a **months-old Week 1 build**
(USA v Paraguay, already kicked off and locked) instead of the live game. The app was
never broken — the door was.

## Root cause

The landing's only CTA was `https://t.me/bettyscores_bot/bettyscores` — a BotFather
**direct-link Mini App**. That short name's target URL lives inside BotFather, is **not
readable or settable via the Bot API**, and had gone stale, still pointing at an old
deployment.

Ruled out along the way, all healthy:
- `app.bettyscores.com` and `betty-scores-app.pages.dev` both served the current bundle.
- `index.html` is `cache-control: must-revalidate`; no service worker (`/sw.js` is just
  the SPA fallback HTML).
- The bot's **menu button** ("Play") already pointed at `https://app.bettyscores.com/`.

Frozen URLs that still answer and will strand anyone who holds them:
`betty-tg-app.netlify.app`, `legendary-jelly-66624f.netlify.app`, and any
`<hash>.betty-scores-app.pages.dev` deployment URL (e.g. `cf7a61af.…` still serves the
pre-SF2 `index-CzBJGYpz.js`).

## Fix

**`deploy/index.html`** — CTA now points at **`https://app.bettyscores.com`**, the one
canonical link (user rule: this URL, and only this URL, in every communication).

The path can't go stale again, because every hop resolves back to the same URL:

```
bettyscores.com → app.bettyscores.com
                     ├─ inside Telegram → the live game
                     └─ outside Telegram → OutsideTelegramScreen
                          → t.me/bettyscores_bot (bot chat)
                          → "Play" menu button → app.bettyscores.com
```

No hop depends on BotFather's direct-link config. `OutsideTelegramScreen` already existed
and already guards browser visitors (no Telegram context = no auth = bets can't save), so
no app change was needed.

## Verified

Traced the whole click-path on dev before promoting, then on prod:
- `bettyscores.com` + `www.bettyscores.com` CTA → `https://app.bettyscores.com`
- that URL serves `index-DGE-xK3g.js`, which **contains SF2** (`2026-07-15T19:00:00Z`,
  England v Argentina) — i.e. demonstrably the live game, not the stale build
- bot menu button → `https://app.bettyscores.com/`
- TON manifest still `app.bettyscores.com` (guarded across the dev→main merge)

dev `2a4dea0` → main; landing git-built from `main`.

## Still open — YOUR action, not code

The BotFather direct-link URL is **still stale**. It no longer affects anyone arriving via
the landing, but it does affect anyone holding the old `t.me/bettyscores_bot/bettyscores`
link (old messages, TG catalog listing, bookmarks). Fix in BotFather:

`/mybots` → **@bettyscores_bot** → **Bot Settings** → **Configure Mini App** →
set URL to `https://app.bettyscores.com`

## Re-engagement nudge (user sends manually)

Copy approved for the six zero-prediction users:

> **The World Cup won't win itself! ⚽**
> **We're waiting for your prediction — app.bettyscores.com**

Reachable by handle: `@daria_kllim`, `@Meeeshanya`, `@Srabonzone`, `@modertma`.
**Not reachable manually:** tg_ids `6034210172` and `8562574292` have no Telegram
@username (the `User_<tg_id>` names are app-generated placeholders) — they'd need a bot
send, which only works if they ever pressed Start.
