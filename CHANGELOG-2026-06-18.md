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

## Still pending (unchanged from 2026-06-09)

- Week 3 dev→prod promotion (cherry-pick `dev`→`main`) — flips prod `ACTIVE_MATCHES`
  from Week 1 to Week 3. The ~2026-06-11 hold date has passed; awaiting go-ahead.
- Card PNGs 1254² ~2.5 MB — downscale to ~1024² before promoting to prod.
