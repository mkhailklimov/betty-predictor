# Changelog — 2026-08-09

## Release 2.0: European Football Season

### Visual Redesign
- **Forest background**: Removed football field stripes and white pitch markings from both the main app and landing page. Replaced with a live animated forest gradient (dappled light layers with subtle CSS animation).
- **Goal nets and tribune patterns removed** from landing page.
- **Ad banner placeholders removed** from desktop tribunes.

### Navigation Overhaul
- **Landing page**: Replaced middle tab bar with fixed bottom navigation (icons + labels). 4 tabs: Play, Champions, Hall of Fame, Rules & Privacy.
- **In-app (Telegram)**: Reordered tabs — Play first. Added Rules tab. 4 tabs: Play, Champions, Hall of Fame, Rules.
- **Leaderboard renamed to Hall of Fame** across all surfaces.

### Branding Updates
- **Diamond icon replaced with Star** on Leaderboard/Hall of Fame (empty state + nav icon).
- **Slogan updated**: "Sniff the Score, Catch a Star!"
- **"European Football Predictions" subtitle removed** along with league badges (EPL, La Liga, etc.) from landing hero.
- **Contact updated** to @bettyscores everywhere (was @bettyscores_bot).

### Leaderboard Table
- Metric columns (Weeks, Points, Stars) widened for readability.
- All metric fonts set to regular weight (was bold).
- All columns center-aligned (Points was right-aligned).

### Rules & Privacy
- **Privacy section** added to the bottom of the Rules page (AboutPage).
- Landing page: Rules and Privacy merged into a single "Rules & Privacy" tab.
- In-app: Privacy lives as a section at the bottom of the Rules tab.
- **Prize disclaimer added**: "Participation is free and voluntary. The organisers are not obligated to distribute Star prizes; however, we commit to making every effort to deliver prizes within one month after results are calculated."

### Guest Prediction Merge
- **Guest predictions now transfer to Telegram**: When a guest user on the landing page clicks "Open in Telegram", the link includes `?startapp=gt_GUEST_TOKEN`. The Mini App reads this on launch, calls `/api/user/merge`, and all guest predictions are moved to the real Telegram account.
- Predictions are never lost when transitioning from web to Telegram.

### Data: Weeks 34 & 35
- **Week 34** (Aug 17-23): 10 matches published — EPL, La Liga, Serie A, Ligue 1, MLS.
- **Week 35** (Aug 24-30): 10 matches published — EPL, La Liga, Serie A, Bundesliga, Ligue 1, MLS.
- Both weeks set to `published` status in D1.

### Bot Configuration
- **Mini App registered** in BotFather with short name `app`, URL `https://app.bettyscores.com`.
- Deep link `t.me/bettyscores_bot/app` now works.
- Menu Button URL updated from dev to prod.

---

# Changelog — 2026-08-10

## UX: Default 0:0 Predictions & Match Navigation

### Default 0:0 for All Open Matches
- Every open (unlocked) match is auto-saved as **0:0 (Draw)** when the week loads.
- If a user opens the app and leaves without touching anything, all open matches are recorded as 0:0.
- If a user predicts some matches and leaves, the rest stay as 0:0.
- Locked matches (already kicked off) are excluded from auto-save.

### Match Navigation
- **Removed auto-advance**: Score reels no longer jump to the next match automatically. User must press the **Next** button.
- **Removed "All Done" takeover screen**: Card stack is always visible. No more modal blocking the view after all predictions are in.
- **Progress bar** now tracks current position (match N of 10) instead of prediction count.

### Guest-to-Telegram Prediction Merge Fix
- After Telegram registration, **all backend predictions are hydrated into localStorage**. This fixes the bug where predictions made on `app.bettyscores.com` as a guest disappeared after clicking "Open in Telegram".
- Hydration runs on every TG launch (not just merge), so predictions from other devices also sync.

### Dev Site Isolation
- **"Open in Telegram" CTA hidden** on dev/pages.dev URLs. Only shown on `app.bettyscores.com`. Prevents dev site from linking to the prod bot with incompatible guest tokens.

### Hall of Fame & Champions Table Fixes
- **Hall of Fame**: Player names left-aligned (was centered).
- **Champions**: Metric columns (Results, Scores, Total, Stars) made more compact (54px/40px) to give more space to the nickname column. Player names left-aligned.
- **Champions**: Removed bold from all metric columns (Total, Stars were bold).

### Commit
| Commit | Description |
|--------|-------------|
| `31b32be` | Default 0:0 predictions, hydrate on merge, UI table fixes |

---

## Commits (dev branch, 2026-08-09)

| Commit | Description |
|--------|-------------|
| `265d09d` | Replace football field stripes with live forest background |
| `040bd4d` | Leaderboard: replace diamond with star, widen metric columns |
| `1ee4187` | Landing page: remove stripes/markings, bottom nav with icons, add Privacy |
| `2742256` | 4-tab nav, Hall of Fame rename, guest merge via startapp, Privacy in Rules |
| `3b5f6a2` | Landing: merge Rules & Privacy into one tab |
| `ee49208` | Fix slogan spacing, update contact to @bettyscores |
| `ca3ac7b` | Rules: add prize distribution disclaimer |

## Files Changed

- `frontend/src/styles/App.css` — Forest background, removed stripes/markings
- `frontend/src/styles/index.css` — Updated CSS variables (field colors)
- `frontend/src/styles/OutsideTelegramScreen.css` — Removed stripes, markings, goal nets, banners; added bottom nav
- `frontend/src/styles/LeaderboardPage.css` — Wider columns, regular weight, centered
- `frontend/src/components/OutsideTelegramScreen.tsx` — Bottom nav, removed league badges/subtitle, guest token in TG link
- `frontend/src/components/Navigation.tsx` — 4 tabs, Play first, Hall of Fame, star icon, Rules tab
- `frontend/src/App.tsx` — Rules page routing, guest merge via startapp
- `frontend/src/pages/LeaderboardPage.tsx` — Hall of Fame title, star emoji
- `frontend/src/pages/AboutPage.tsx` — Privacy section, prize disclaimer, @bettyscores contact

## Deployment

- **Dev**: `dev.betty-scores-app.pages.dev` — deployed via `wrangler pages deploy --branch=dev`
- **Prod**: `app.bettyscores.com` — deployed via `wrangler pages deploy --branch=main`
- **D1**: Weeks 34 & 35 published directly to `betty-db`
