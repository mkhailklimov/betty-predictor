# Changelog — June 18, 2026

## Fix: match cards now lock live at kickoff in already-open sessions

**Bug.** A user could still edit predictions *during* a match if the Mini App
had been opened *before* kickoff; the card only locked on a fresh reload (next
morning). Reported from PROD during Week 1.

**Root cause.** Purely client-side, not a time/data bug. `MatchCard.tsx` computed
`const locked = isMatchLocked(match)` once at render, and nothing forced a
re-render when the clock crossed `kickoff` (no timer anywhere in the app). So a
session opened pre-kickoff kept stale `locked = false` for the whole match.

Verified *not* at fault:
- Frontend `kickoff` values in `matches.ts` — correct (ET+4 = UTC), same on `main`.
- D1 `time` column — correct ISO UTC for every match.
- Server lock (`worker.js:184`) — correctly 403s any POST once `now >= kickoff`.
- The 403 is already surfaced in the UI (`MainPage.tsx`, toast + revert).

So the server was the safety net and held; this was a UX/correctness gap on the client.

**Fix** (`frontend/src/components/MatchCard.tsx`): a `useEffect` schedules a
one-shot timer for `kickoff - now` and re-checks on tab refocus
(`visibilitychange`), forcing a re-render at kickoff so `isMatchLocked()`
re-evaluates and the buttons disable themselves live — no reload needed.

## Deploy

- **dev** — commit `9a7b59c`, pushed to `dev`. Live at dev.betty-scores-app.pages.dev.
- **prod** — cherry-picked (NOT merged) onto `main` as `b4e6b8d`, pushed.
  Only `MatchCard.tsx` changed; prod still serves Week 1, TON manifest untouched.

**Caveat:** clients with the app already open from before the deploy won't get the
fix until they reload (it's a client bundle). New opens get it immediately.

## Feature: optional "This week / Next week" toggle (date-driven cadence)

Late-week arrivals used to land on a near-empty, fully-locked week. Now they can
switch to next week and predict ahead.

- `matches.ts` — replaced the static host-based week pin with a `WEEKS` registry +
  `resolveWeeks(now)` → `{ current, next }`. Cadence (UTC): **Fri 06:00** a week
  becomes current (previous week collected); **Mon 00:00** the following week opens
  as the optional "Next week" tab. So Mon→Fri both are selectable; Fri→Mon only one.
  Boundary logic unit-checked at 8 dates.
- `MainPage.tsx` — This week / Next week toggle; progress, "bets saved" screen and
  dot-nav now scoped to the **selected** week (previously counted all weeks). When
  the current week is fully locked, the app opens straight on next week, and the
  confirmation screen offers "Predict next week →".
- `MainPage.css` — `.week-tabs` styling.
- Per-match kickoff lock unchanged, so opening a week early carries no risk.

**Week 2 synced to D1.** `match-11..20` (week_id `2026_25`, June 18–23) were defined
in the frontend but never in D1; inserted the 10 rows so Week 2 predictions persist.
D1 now holds 30 matches across 2026_24 / 2026_25 / 2026_26 (10 each).

**Leaderboard:** left as overall/cumulative by decision — weekly scores and the
1-gram prize are calculated/awarded **manually** each week, not via a per-week endpoint.

**Dev preview:** `DEBUG_TIME` temporarily set to `2026-06-25T12:00:00Z` (Thu Jun 25)
so dev shows Week 2 (locked) + Week 3 (playable). **Revert to `null` before prod.**

Commits on `dev`: `2bab824` (toggle), `c776449` (DEBUG_TIME preview).

## Still pending (unchanged from 2026-06-09)

- Week 3 dev→prod promotion (cherry-pick `dev`→`main`) — flips prod `ACTIVE_MATCHES`
  from Week 1 to Week 3. The ~2026-06-11 hold date has passed; awaiting go-ahead.
- Card PNGs 1254² ~2.5 MB — downscale to ~1024² before promoting to prod.
