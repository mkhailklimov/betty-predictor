# Changelog — April 5, 2026 — TG Mini App (Dev)

## Environment: DEV
- **URL:** https://betty-tg-app.surge.sh
- **Backend:** https://betty-api.mihel-klimm.workers.dev
- **Status:** Deployed, not yet promoted to prod

---

## Changes

### Kickoff Deadline Lockout
- Added exact kickoff timestamps (UTC) to all 10 Week 1 matches
- When current time >= kickoff: match card is locked
- Locked state shows:
  - Red badge: "Match started — betting closed"
  - Outcome buttons greyed out and disabled
  - Score grid hidden
  - Saved prediction shown in grey (not editable)
- Players who miss a match can still predict later matches
- Already-saved predictions are preserved and locked at kickoff
- Debug mode: set `DEBUG_TIME` in `frontend/src/data/matches.ts` to simulate any date/time
- Tested with simulated time `2026-06-13T09:00:00Z` — first 3 matches locked, rest open

### Match Times in Eastern Time
- All match cards now display kickoff time in ET (Eastern Time)
- Format: `Thu, June 11 · 9:00 PM ET`
- Internal storage remains UTC for correct lockout comparison

| # | Match | Date & Time (ET) | Kickoff (UTC) |
|---|-------|-----------------|---------------|
| 1 | Mexico vs South Africa | Thu, June 11 · 9:00 PM | 2026-06-12T01:00:00Z |
| 2 | Canada vs Bosnia & Herzegovina | Fri, June 12 · 6:00 PM | 2026-06-12T22:00:00Z |
| 3 | USA vs Paraguay | Fri, June 12 · 9:00 PM | 2026-06-13T01:00:00Z |
| 4 | Brazil vs Morocco | Sat, June 13 · 6:00 PM | 2026-06-13T22:00:00Z |
| 5 | Germany vs Curacao | Sun, June 14 · 3:00 PM | 2026-06-14T19:00:00Z |
| 6 | Netherlands vs Japan | Sun, June 14 · 6:00 PM | 2026-06-14T22:00:00Z |
| 7 | Spain vs Cape Verde | Mon, June 15 · 6:00 PM | 2026-06-15T22:00:00Z |
| 8 | France vs Senegal | Tue, June 16 · 6:00 PM | 2026-06-16T22:00:00Z |
| 9 | England vs Croatia | Wed, June 17 · 3:00 PM | 2026-06-17T19:00:00Z |
| 10 | Argentina vs Algeria | Wed, June 17 · 6:00 PM | 2026-06-17T22:00:00Z |

### Tab Restructure
- Removed "Start Game" landing screen — app opens directly to Matches
- Removed About tab
- New 3-tab layout:
  - **Champions** — last round results (player / results / scores / total)
  - **Matches** — prediction cards (default, opens first)
  - **Leaderboard** — TON distribution history (player / rounds / TON won)

### Completion Message
- After all 10 predictions: yellow toast popup "Bets placed!" + auto-scroll to message
- Message text: "You can change your predictions until each match begins."
- Toast auto-dismisses after 4 seconds

### Cape Verde Card Fix
- Match code changed from `CPV` to `CVE` to match image filename `CVE.png`
- Card now displays correctly for Spain vs Cape Verde

### Team Cards — All 20 Complete
- Added 8 new cards: FRA, ALG, ARG, SEN, ENG, CRO, ESP, CVE
- All downloaded from Google Drive folder `1sjPxdO9gP3wGili0BCBycmsxr9zGYlUt`
- Registered in `TEAM_CARDS` object in `matches.ts`

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/data/matches.ts` | Added `kickoff` field (UTC), `isMatchLocked()`, `DEBUG_TIME`, ET display times, CVE code fix |
| `frontend/src/components/MatchCard.tsx` | Lockout logic: checks `isMatchLocked()`, disables inputs, shows locked badge |
| `frontend/src/styles/MatchCard.css` | Locked state styles: red badge, greyed out buttons, dimmed card |
| `frontend/src/App.tsx` | 3-tab layout, opens to Matches, removed LandingPage/AboutPage |
| `frontend/src/components/Navigation.tsx` | Champions / Matches / Leaderboard tabs |
| `frontend/src/pages/MainPage.tsx` | Toast notification, auto-scroll on completion |
| `frontend/src/styles/MainPage.css` | Toast animation styles |
| `frontend/src/pages/ChampionsPage.tsx` | New: last round results table |
| `frontend/src/pages/LeaderboardPage.tsx` | Rewritten: TON distribution (player / rounds / TON won) |
| `frontend/src/styles/ChampionsPage.css` | New: champions page styles |
| `frontend/src/styles/LeaderboardPage.css` | Rewritten: consistent with champions styles |
| `frontend/public/teams/Cards/*.png` | Added: FRA, ALG, ARG, SEN, ENG, CRO, ESP, CVE |

---

## Commits

```
9c1c20a Add kickoff lockout + ET times on match cards (debug time disabled)
324655b Add toast notification and auto-scroll when all bets placed
5f69d1e Update completion message: Bets placed, change until kickoff
fa3cc20 Fix Cape Verde card: match code CPV → CVE to match image filename
8d3c6dc Restructure tabs: Champions (last round), Matches (default), Leaderboard (TON history)
c8af487 Add completion message after all 10 predictions are made
48cd512 Enable card images for FRA, ALG, ARG, SEN, ENG, CRO, ESP, CVE
502d582 Add team card images: FRA, ALG, ARG, SEN, ENG, CRO, ESP, CVE
```

---

## Testing Checklist (before promoting to prod)

- [x] All 20 team card images display correctly
- [x] Prediction cards: outcome + score selection works
- [x] Auto-advance to next card after prediction
- [x] Completion toast appears after 10th prediction
- [x] Lockout simulation: locked matches show red badge, disabled inputs
- [x] Unlocked matches remain fully interactive
- [x] Times display in ET format
- [ ] Test in Telegram WebView (not just browser)
- [ ] Verify BotFather menu button points to correct URL
- [ ] Test on multiple devices (iOS + Android)

---

## How to Test Lockout

Set `DEBUG_TIME` in `frontend/src/data/matches.ts`:

```typescript
// Simulate June 13, 9 AM UTC — first 3 matches locked
export const DEBUG_TIME: string | null = '2026-06-13T09:00:00Z'

// Simulate all matches locked
export const DEBUG_TIME: string | null = '2026-06-18T00:00:00Z'

// Real time (production)
export const DEBUG_TIME: string | null = null
```

Then rebuild and deploy:
```bash
cd frontend
VITE_API_URL=https://betty-api.mihel-klimm.workers.dev npm run build
cd dist && cp index.html 200.html
npx surge . betty-tg-app.surge.sh
```

---

## Rule

**Dev first, prod second.** No changes go to production without testing on the dev instance first.
