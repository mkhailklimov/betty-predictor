# Betty Scores 2.1 — Warmup & Season Kickoff

## What's New

Release 2.1 introduces warmup weeks with single-match specials alongside the full 10-match weekly format. The first warmup features the UEFA Super Cup final.

### Warmup Weeks

- **Single-match weeks** — special occasions (cup finals, derbies) can run as standalone prediction events.
- **Week 33: UEFA Super Cup** — PSG vs Aston Villa, Aug 12 2026, Stade Louis II, Monaco.
- Same scoring rules apply: 3 points for exact score, 1 for correct outcome.
- Same prizes: 100 Stars for 1st, 50 Stars for 2nd.

### Data Pipeline

- **Automated match lifecycle** — hourly cron locks matches at kickoff, ingests results from ESPN feed.
- **Monday cron** — closes the week, awards Stars prizes, publishes next week.
- **3 weeks pre-loaded** — Week 33 (warmup), Week 34 (Aug 17-23, 10 matches), Week 35 (Aug 24-30, 10 matches).

### Leagues Covered

- Premier League, La Liga, Serie A, Ligue 1, Bundesliga, MLS
- UEFA Super Cup (new)

## Season Schedule

| Week | Dates | Matches | Highlight |
|------|-------|---------|-----------|
| 33 | Aug 10-16 | 1 | UEFA Super Cup: PSG vs Aston Villa |
| 34 | Aug 17-23 | 10 | EPL, La Liga, Serie A, Ligue 1, MLS |
| 35 | Aug 24-30 | 10 | + Bundesliga starts |

## Technical State

| Component | Stack |
|-----------|-------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Cloudflare Worker (JS) |
| Database | Cloudflare D1 (SQLite) |
| Hosting | Cloudflare Pages |
| Auth | Telegram WebApp SDK + guest tokens |
| Prizes | Telegram Stars (100/50 per week) |
| Data feed | ESPN API (automated ingestion) |

## URLs

| Surface | URL |
|---------|-----|
| Prod app | `https://app.bettyscores.com` |
| Dev app | `https://dev.betty-scores-app.pages.dev` |
| Telegram | `https://t.me/bettyscores_bot/app` |
| API | `https://api.bettyscores.com` |

## What's Next

- Notifications for new rounds and results
- My Stats tab
- Share/invite flow
- More warmup specials before regular weeks
