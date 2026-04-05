# Changelog — April 5, 2026

## Summary

Full infrastructure migration and TG Mini App improvements. Backend moved to Cloudflare Workers + D1. Frontend moved from Netlify to Surge. Added remaining team card images, restructured app navigation, and added completion flow.

---

## Infrastructure Migration

### Backend: Cloudflare Workers + D1
- Ported FastAPI (Python) backend to vanilla JS Cloudflare Worker
- Created D1 database `betty-db` with 4 tables: users, matches, predictions, rewards
- All 17 API endpoints deployed and working
- Deployed via Cloudflare REST API (wrangler CLI blocked by token permissions)
- Live at: `https://betty-api.mihel-klimm.workers.dev`

### Frontend: Netlify → Surge
- Netlify free tier bandwidth exceeded — migrated both sites to Surge
- Landing site: `https://betty-predictor.surge.sh`
- TG Mini App: `https://betty-tg-app.surge.sh`

### Decommissioned
- `legendary-jelly-66624f.netlify.app` (bandwidth exceeded)
- `betty-tg-app.netlify.app` (bandwidth exceeded)
- `betty-predictor-1.onrender.com` (trial expired)

---

## TG Mini App Changes

### Tab Restructure
- Removed Start Game landing screen — app opens directly to Matches
- Removed About tab from bottom navigation
- New 3-tab layout:
  - **Champions** — last round results (player / results / scores / total)
  - **Matches** — prediction cards (default tab)
  - **Leaderboard** — TON distribution history (player / rounds / TON won)

### Completion Message
- After all 10 predictions are made, shows:
  - "All bets are in!"
  - "Results will be available on June 18 — the day after the last Week 1 match."
  - "You can still review and change your predictions until kickoff."

### Team Card Images — 8 New
- Downloaded from Google Drive folder `1sjPxdO9gP3wGili0BCBycmsxr9zGYlUt`
- Added to `frontend/public/teams/Cards/` and registered in `TEAM_CARDS`
- New cards: FRA, ALG, ARG, SEN, ENG, CRO, ESP, CVE
- All 20 Week 1 teams now have card images

---

## Landing Site

### Full Rebuild
- Replaced simple landing page with 5-section single-page site
- Sticky navigation: Home | Champions | Matches | Leaderboard | About
- Betty branding: yellow `#ffd90f` on dark `#1f1c09`
- Champions and Leaderboard sections fetch data from Cloudflare API
- Matches section shows 10 Week 1 games with date, time, teams, venue, group
- About section: scoring rules, TON rewards, deadlines, fair play

### Slogan Update
- Added dog face emoji and crystal emoji to slogan
- Now reads: 🐶 Sniff the score — get TONn of emotions! 💎

---

## Process

### Dev-First Rule Established
- All changes must be tested in dev instance before production
- No direct production changes, even for small updates

---

## Commits

```
5ba6a47 Complete deployment log for April 3: full context, architecture, restore instructions, TODO
8d3c6dc Restructure tabs: Champions (last round), Matches (default), Leaderboard (TON history)
c8af487 Add completion message after all 10 predictions are made
48cd512 Enable card images for FRA, ALG, ARG, SEN, ENG, CRO, ESP, CVE
502d582 Add team card images: FRA, ALG, ARG, SEN, ENG, CRO, ESP, CVE
3de1036 Finalize v0.2.0-dev: deployment doc with full restore instructions
88b19cc Rebuild landing page with 5-section navigation: Home, Champions, Matches, Leaderboard, About
4992a7c Deploy backend to Cloudflare Workers + D1 database
efc168b Add Cloudflare Workers deployment plan for Apr 3
e6ef603 Add Render build config for Python backend
```

---

## Deployments

| Site | URL | Platform |
|------|-----|----------|
| Landing | https://betty-predictor.surge.sh | Surge |
| TG App | https://betty-tg-app.surge.sh | Surge |
| Backend | https://betty-api.mihel-klimm.workers.dev | Cloudflare Workers |
| Database | D1 `betty-db` | Cloudflare D1 |
| Bot | @betty_worldcup2026_bot | Telegram |
