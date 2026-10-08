# Changelog — April 9, 2026

## Summary

Migrated production infrastructure from Netlify/Surge to Cloudflare Pages with custom domain `bettyscores.com`. Set up DNS, SSL, and auto-deploy from GitHub.

---

## Domain Setup: bettyscores.com

### DNS & Hosting
- Purchased `bettyscores.com` via Namecheap
- Added domain to Cloudflare (nameservers: alexa.ns.cloudflare.com, kellen.ns.cloudflare.com)
- Zone ID: `0b3b886c2b94e68c406bf9ed0abf1946`

### Cloudflare Pages Projects
Created two Pages projects connected to GitHub repo `MihelKlimm/betty-predictor` with auto-deploy on push:

| Project | Build | Output | Custom Domain |
|---------|-------|--------|---------------|
| betty-scores | *(none — static)* | `deploy/` | bettyscores.com, www.bettyscores.com |
| betty-scores-app | `npm run build` (root: `frontend/`) | `dist/` | app.bettyscores.com |

### DNS Records
| Type | Name | Target |
|------|------|--------|
| CNAME | @ | betty-scores.pages.dev |
| CNAME | www | betty-scores.pages.dev |
| CNAME | app | betty-scores-app.pages.dev |
| CNAME | api | betty-api.mihel-klimm.workers.dev |

### Environment Map (Updated)

| | Dev | Prod |
|--|-----|------|
| Landing | betty-scores.pages.dev | **bettyscores.com** |
| TG App | betty-scores-app.pages.dev | **app.bettyscores.com** |
| API | betty-api.mihel-klimm.workers.dev | **api.bettyscores.com** |
| Bot | @betty_worldcup2026_bot | **@bettyscores_bot** |
| Mini App link | t.me/betty_worldcup2026_bot | **t.me/bettyscores_bot/bettyscores** |

---

## Telegram Bot Updates

- Dev bot (`@betty_worldcup2026_bot`) menu button → `https://app.bettyscores.com/`
- Prod bot (`@bettyscores_bot`) menu button → `https://app.bettyscores.com/`

---

## Landing Site Changes

- Slogan updated: added dog emoji and blue crystal — "🐕 Sniff the score — get TONn of emotions! 💎"
- CTA button now links to prod bot: `t.me/bettyscores_bot/bettyscores`
- Background changed from brown `#1f1c09` to coal black `#0d0d0d`

---

## Commits

```
ba67f07 Add emojis to slogan, update CTA to prod bot link
bfa144c Change background to coal black (#0d0d0d)
```
