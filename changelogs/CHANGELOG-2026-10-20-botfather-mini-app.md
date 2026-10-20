# 2026-10-20 — BotFather Mini App setup (step 1 of the app-center listing)

## Final settings (@BotFather → Bot Settings → Configure Mini App)

| Setting | Value |
| --- | --- |
| Mini App URL | `https://app.bettyscores.com/` (was `https://betty-scores-app.pages.dev/`) |
| Mode | Fullsize |
| Splash icon | Custom: `deploy/betty-splash-simple.svg` |
| Background color | `#1a3a18` (the app's dark forest green, `App.css`) |
| Header color | `#ffd90f` (Betty yellow, set by `useTelegram.ts`) |

## Why the URL change mattered

`frontend/src/services/api.ts` picks the API by host: `app.bettyscores.com` →
`api.bettyscores.com` (prod), any `*.pages.dev` → `betty-api-dev` (dev worker).
The profile's **Open App** button used the pages.dev URL, so players opening Betty
from the bot profile got the **dev** database. The bot's own "Open Betty Scores"
button already used app.bettyscores.com. Worker CORS is `*`, so no change needed there.

Direct links (BotFather → Mini Apps → Direct Links), both now → `https://app.bettyscores.com/`:
- `t.me/bettyscores_bot/app` — the current one, used by the app's share/invite links and posts.
  Was already correct.
- `t.me/bettyscores_bot/bettyscores` — the old April link, kept so old messages and bookmarks
  still work. It pointed at `https://bettyscores.surge.sh/` (old TON-era copy, slogan
  "Sniff the score - get TONn of emotions"); fixed. This was the stale link from the
  12 Jul changelog.

Still optional: cover `deploy/betty-link-cover.png` (640×360, current logo) for both
links, and the description "Predict football scores, catch Telegram Stars ⭐!".

## Splash icon — what BotFather accepts

- Detailed traced SVG (18 KB, Q curves, fill-rule): "Unable to extract the contents".
- Same in sample format (7 KB, 17 rings, `deploy/betty-splash.svg`): rejected.
- 512×512 transparent WEBP (`deploy/betty-splash.webp`): "too complex" for an outline.
- **Accepted:** one outer silhouette, one ring, 2.5 KB (`deploy/betty-splash-simple.svg`).

Telegram draws the icon small (~70 px) as a faint shade of the background colour,
on any colour; boldness can't be controlled. Background must match the page players
see (green), not the colour in `setBackgroundColor` (yellow), or the splash jumps
colour when the app appears. A yellow background was tried first and corrected.

## Next for the listing

1. BotFather: Description (≤512 chars), About (≤120), preview media (screenshots / clip).
2. Do the 50 ⭐ PRO test purchase in production.
3. Submit to tApps Center via @app_moderation_bot (verify the bot still exists).
