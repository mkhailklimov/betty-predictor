# Changelog — 2026-07-31

## Landing Page Redesign

### Tab Reorganization
- **6 tabs** replacing the old layout: **Play**, **Rules**, **Champions**, **Leaderboard**, **Privacy**, **My Stats**
- Play is the default tab, opens directly into the match prediction interface
- Active tab gets bold white highlight
- Auto-creates guest session on mount — no auth wall for browser visitors

### Grass Palette (from benchmark image)
Replaced all brown/gold (#2a2508, #ffc20d) with a grass-inspired palette:
- **Forest** `#31572C` — field stripes, dark backgrounds
- **Grass** `#40916C` — accents (not used for stripes, too bright)
- **Moss** `#90A955` — borders, secondary elements
- **Leaf** `#ECF39E` — primary text/accent (replaces gold)
- **White** `#FAF9F6` — body text
- Field stripes: `#31572C` / `#264722` (both Forest-range)
- SVG noise textures toned down (opacity 0.12/0.08) to not wash out colors
- Global background: black `#0d0d0d`
- All tab content wrapped in dark green rounded container (`rgba(30,60,28,0.85)`)

### Score Spinners Redesign
- Replaced scroll-window reels with clean spinbutton: ▲ (increase), single number, ▼ (decrease)
- Range 0–12, no more confusing scroll behavior
- Wider spacing between home/away spinners (gap 2.5rem)
- Team logos spaced out (gap 2rem) to sit on stripe borders

### Telegram CTA
- Below match cards: "Want to get Stars for smart predictions? Play in Telegram!"
- Dark green background with "Open in Telegram" button → t.me/bettyscores_bot/app

### Other UI
- Site title/description: "Betty - Top Football Predictions"
- Center circle with Betty logo restored as field watermark (::after pseudo-element, opacity 0.12)

## Champions & Leaderboard

### Stars System
- **Champions page**: Stars as separate last column (1st place = 100⭐, 2nd = 50⭐)
- **Leaderboard page**: Stars as last column, computed from `weekly_prizes` table
- Star emoji (⭐) in table headers, bold values
- Results and Scores columns widened (55px → 70px) to prevent overlap

### Database
- Applied migration `0006_v2_prizes` — created `weekly_prizes` table
- Inserted manual prizes: Denis (ippolitovdenis) = 300 stars, Mishanna (Mishanna45) = 200 stars
- Worker leaderboard API now joins `weekly_prizes` for `stars_earned`
- Worker champions API includes `stars_earned` per rank from prize config

## Backend / Worker

### New Admin Endpoints
- `POST /api/admin/write-fixtures` — write curated picks directly to Fixtures sheet tab
- `POST /api/admin/delete-tabs` — delete sheet tabs by name

### Google Sheet Cleanup
- Deleted tabs: Quiz, Adjustments, Candidates
- Kept: Fixtures (used by Monday cron for auto-publish)
- Synced Users (18), Bets (218), Champions, Leaderboard, Prizes to sheet

### Cloudflare Setup
- `CLOUDFLARE_API_TOKEN` configured and saved to `~/.bashrc`
- `ADMIN_TOKEN` rotated (new 64-char hex)
- Worker deployed to both prod and dev

## Match Planning — Weeks 34 & 35

### Week 34 (Aug 17–23) — 10 matches, status: draft
| League | Home | Away | Kickoff UTC |
|--------|------|------|-------------|
| esp.1 | Atlético Madrid | Málaga | Aug 19 19:00 |
| usa.1 | Philadelphia Union | Inter Miami CF | Aug 19 23:30 |
| fra.1 | Marseille | Strasbourg | Aug 21 18:45 |
| eng.1 | Arsenal | Coventry City | Aug 21 19:00 |
| esp.1 | Real Betis | Real Sociedad | Aug 21 19:00 |
| eng.1 | Hull City | Manchester United | Aug 22 11:30 |
| esp.1 | Athletic Club | Sevilla | Aug 22 15:00 |
| ita.1 | Internazionale | Monza | Aug 22 16:30 |
| ita.1 | Frosinone | Juventus | Aug 23 16:30 |
| ita.1 | Atalanta | Sassuolo | Aug 23 18:45 |

### Week 35 (Aug 24–30) — 10 matches, status: draft
| League | Home | Away | Kickoff UTC |
|--------|------|------|-------------|
| ita.1 | AS Roma | Fiorentina | Aug 24 18:45 |
| esp.1 | Real Madrid | Real Sociedad | Aug 26 19:00 |
| esp.1 | Barcelona | Athletic Club | Aug 27 19:00 |
| ger.1 | Bayern Munich | VfB Stuttgart | Aug 28 18:30 |
| fra.1 | Lille | Paris Saint-Germain | Aug 28 18:45 |
| ita.1 | AC Milan | Venezia | Aug 28 18:45 |
| eng.1 | Crystal Palace | Manchester City | Aug 28 19:00 |
| eng.1 | Liverpool | Nottingham Forest | Aug 29 11:30 |
| ger.1 | Borussia Dortmund | Hamburg SV | Aug 29 16:30 |
| usa.1 | Inter Miami CF | CF Montréal | Aug 29 23:30 |

Both weeks inserted into D1 and written to Google Sheet Fixtures tab. Monday cron will auto-publish when the week starts.

## Okkam (dendrogramit)
- Attempted deploy to okkam-dev — blocked by permission on `/root/projects/islavutin/dendrogramit-staging/` (owned by root, misha can only restart via sudo). Awaiting Iliya's response.
