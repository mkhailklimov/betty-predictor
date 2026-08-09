# Betty Scores 2.0 — European Football Season

## What's New

Betty Scores transitions from the FIFA World Cup to European club football. The app now features weekly picks from the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and MLS.

### For Players

- **New look** — clean forest-themed background replaces the old football pitch stripes.
- **Hall of Fame** — the all-time leaderboard gets a new name and a star icon to match the Telegram Stars prizes.
- **Rules & Privacy in one place** — find how scoring works, prize info, and privacy policy all in one tab.
- **Play from the web** — visit `app.bettyscores.com`, make predictions as a guest, then open in Telegram and your predictions carry over automatically.
- **4-tab navigation** — Play, Champions, Hall of Fame, Rules. Play is always the first tab.

### For the Season

- **10 matches per week** from top European leagues, curated every Monday.
- **100 Stars for 1st place**, 50 Stars for 2nd — every week.
- **Free to play** — no entry fee, no purchase required.

## Customer Journey

1. User discovers Betty via social media or a shared link.
2. Lands on `app.bettyscores.com` — sees matches, can predict as a guest.
3. Clicks "Open in Telegram" — opens `t.me/bettyscores_bot/app`.
4. Mini App loads with full Telegram auth — guest predictions merge automatically.
5. Plays weekly: swipe through 10 match cards, set score predictions before kickoff.
6. Results calculated after all matches end — Champions tab shows weekly winners.
7. Hall of Fame tracks all-time rankings and total Stars earned.

## Technical Summary

| Component | Stack |
|-----------|-------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Cloudflare Worker (JS) |
| Database | Cloudflare D1 (SQLite) |
| Hosting | Cloudflare Pages |
| Auth | Telegram WebApp SDK + guest tokens |
| Payments | Telegram Stars (premium features) |

## URLs

| Surface | URL |
|---------|-----|
| Prod app | `https://app.bettyscores.com` |
| Dev app | `https://dev.betty-scores-app.pages.dev` |
| Telegram | `https://t.me/bettyscores_bot/app` |
| API | `https://api.bettyscores.com` |

## What's Next

- Week 34 goes live Aug 17 (first week of the European season).
- Week 35 already loaded (Aug 24-30).
- Notifications for new rounds and results (planned).
- My Stats tab (planned).
- Share/invite flow (planned).
