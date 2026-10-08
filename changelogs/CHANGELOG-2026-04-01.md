# Changelog — April 1, 2026

## Summary

Major development sprint: built the landing site navigation, Telegram Mini App with match prediction cards, and integrated team card artwork for Week 1 of the World Cup 2026.

---

## Landing Site (legendary-jelly-66624f.netlify.app)

### Navigation Menu
- Added sticky top navigation with 5 sections: **Home, Champions, Matches, Leaderboard, About**
- Home: hero with Betty logo, slogan, "Open in Telegram" CTA
- Matches: pulls Week 1 schedule live from Google Sheet
- Leaderboard: placeholder table with Points & TON columns
- About: competition rules (scoring, weekly rankings, TON rewards, fair play)

### Branding
- Applied Betty color scheme: yellow `#ffc20d` on dark `#1f1c09`
- Added Betty logo (`betty-logo.png`)
- Renamed `landing.html` to `index.html` so it serves at root URL

### Google Sheet Integration
- Sheet ID: `1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus`
- Fetches match schedule (Date, Matchup, Group, Venue) on page load
- Matches section displays the list with no prediction inputs (predictions are in the TG app)

---

## Telegram Mini App (betty-tg-app.netlify.app)

### New Deployment
- Created separate Netlify site for the TG app (`betty-tg-app.netlify.app`)
- Updated Telegram bot menu button to point to the new URL
- Updated `backend/.env` TWA_APP_URL

### Start Game Screen
- App opens with a branded entry screen: Betty logo, title, slogan
- Big "Start Game" button transitions to the prediction cards
- No "Open in Telegram" button inside the TG app (that's only on the website)

### Match Prediction Cards
- **10 consecutive cards** shown one at a time (not scrollable list)
- Each card displays:
  - Team card images (illustrated player with flag background) or emoji flag fallback
  - Team names
  - Group, date, venue info
- **3 outcome buttons:** WIN 1 / DRAW / WIN 2 (single select, tap again to deselect)
- **Score grid:** all scores from 9:0 to 0:9 where total goals <= 9
  - Non-matching scores dimmed based on selected outcome
  - Single select — tap to pick, tap again to change
- **Auto-save:** prediction saves to localStorage when both outcome + score are selected
- **Navigation:** Prev/Next buttons + dot indicators to move between cards
- **Auto-advance:** after confirming a prediction, auto-moves to next card after 600ms
- Progress bar shows how many of 10 matches are predicted

### Bottom Navigation
- 3 tabs: **Matches, Leaderboard, About**
- Champions tab removed (not needed for now)

### Theme
- Yellow/black Betty branding throughout (`#ffc20d` / `#1f1c09`)
- All components styled consistently: cards, buttons, nav, score grid

---

## Team Card Images

Illustrated player cards with national flag backgrounds, stored in `frontend/public/teams/Cards/`.

| Code | Team | Status |
|------|------|--------|
| MEX | Mexico | Done |
| SAF | South Africa | Done |
| CAN | Canada | Done |
| BIH | Bosnia & Herzegovina | Done |
| USA | USA | Done |
| PAR | Paraguay | Done |
| BRA | Brazil | Done |
| MOR | Morocco | Done |
| GER | Germany | Done |
| CUR | Curacao | Done |
| NED | Netherlands | Pending |
| JPN | Japan | Pending |
| ESP | Spain | Pending |
| CPV | Cape Verde | Pending |
| FRA | France | Pending |
| SEN | Senegal | Pending |
| ENG | England | Pending |
| CRO | Croatia | Pending |
| ARG | Argentina | Pending |
| ALG | Algeria | Pending |

Source: Google Drive folder `1sjPxdO9gP3wGili0BCBycmsxr9zGYlUt`

---

## Bug Fixes

- Fixed missing `0:1` score in the score grid (away wins loop started at 2 instead of 1)

---

## Week 1 Match Schedule

| # | Date | Match | Group | Venue |
|---|------|-------|-------|-------|
| 1 | Thu, June 11 | Mexico vs. South Africa | A | Mexico City |
| 2 | Fri, June 12 | Canada vs. Bosnia & Herzegovina | B | Toronto |
| 3 | Fri, June 12 | USA vs. Paraguay | D | Los Angeles |
| 4 | Sat, June 13 | Brazil vs. Morocco | C | New Jersey |
| 5 | Sun, June 14 | Germany vs. Curacao | E | Houston |
| 6 | Sun, June 14 | Netherlands vs. Japan | F | Dallas |
| 7 | Mon, June 15 | Spain vs. Cape Verde | H | Atlanta |
| 8 | Tue, June 16 | France vs. Senegal | I | New Jersey |
| 9 | Wed, June 17 | England vs. Croatia | L | Dallas |
| 10 | Wed, June 17 | Argentina vs. Algeria | J | Kansas City |

---

## Deployments

| Site | URL | Purpose |
|------|-----|---------|
| Landing | https://legendary-jelly-66624f.netlify.app | Public website with match info |
| TG App | https://betty-tg-app.netlify.app | Telegram Mini App for predictions |
| Telegram Bot | @betty_worldcup2026_bot | Bot with "Play" menu button |

## Commits

```
4564bc8 Add navigation menu with 5 sections and update branding
78d2603 Rename landing.html to index.html so it serves at root URL
8c7cfeb Restore Betty branding: yellow/black colors and logo
3ee5549 Add match prediction system linked to Google Sheet
561a230 Build Telegram Mini App with prediction cards & simplify landing
ea4e2ba Add Start Game screen, remove Open in Telegram button
db3d2c9 Show prediction cards one at a time with prev/next navigation
29e1272 Redesign match cards with team images and full score grid
d2c0461 Limit score combinations to max 9 total goals
15f5ef5 Add USA and Paraguay team card images
820d753 Remove Champions tab from Telegram app
17927a4 Add Brazil and Morocco team card images
3b7e686 Fix missing 0:1 score in score grid
464be19 Add Germany and Curacao team card images
```
