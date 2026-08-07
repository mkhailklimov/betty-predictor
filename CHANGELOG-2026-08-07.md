# Changelog — 2026-08-07

The 07-31/08-02 redesign work promoted to production, plus two things found on
the way that were worth fixing before it went.

Betty is **deliberately dark until the week of 17–23 August** (`2026_34`). Weeks
`2026_32` and `2026_33` sit `draft` with zero matches on purpose — that is the
plan, not a broken pipeline. Nothing here publishes a week.

---

## Promoted to prod

`dev` → `main` (merge `268bbc0`), which is what builds production. Carries the
work from 07-31 and 08-02:

- the landing redesign and grass palette,
- the score spinners (▲ / number / ▼),
- Stars columns on Champions and Leaderboard,
- **Telegram-light** — the in-app nav cut to three tabs (Champions / Play /
  Leaderboard) over a football-pitch background.

| | Bundle |
|---|---|
| dev (`dev.betty-scores-app.pages.dev`) | `index-DypotRzL.js` |
| prod (`app.bettyscores.com`) | `index-DypotRzL.js` |

Verified by fetching the served bundle and grepping it for the changed copy, not
by reading the build's status. Previous production deployment `fa091c66`
(`a6b5c30`) remains available to roll back to.

## The empty-week screen promised a Monday it cannot see

> "This week's ten matches go live on Monday. Check back then."

That sentence is only true if a week is actually being published that Monday.
Through a deliberate pause it is worse than vague — it sends the visitor back on
a specific date to find the same empty screen, spending their second visit as
well as their first. Right now it would promise the 10th, and the next real round
is the 17th.

It now reads a date off the API instead of asserting one: if there is a published
next week, it names that week's start (`Mon 17 Aug`); if there is not, it says
plainly that the next round isn't posted yet and will appear here when it is.

## Nothing was typechecking the frontend

`npm run build` was `vite build` alone. Vite transpiles without type-checking, so
the build had never once run `tsc` — and `tsc --noEmit` was in fact **failing**,
on an untyped `import.meta.env` in `services/api.ts` (no `vite-env.d.ts` in the
project).

Added the `vite/client` reference and moved `tsc --noEmit` in front of the build.
A Pages build that goes green while the code does not compile is exactly how a
release ships without its front half.

---

## Flagged, not fixed

**Inside Telegram there is no route to Rules or Privacy.** The three-tab nav is
Champions / Play / Leaderboard. Rules and Privacy exist only on
`OutsideTelegramScreen` — the six-stripe web landing — and the bot has no
`/privacy` command anywhere in the repo.

So a player who arrives through Telegram, which is most of them, cannot read how
scoring works or what we do with their data. The first is a plausible contributor
to the activation problem (players who open the app and never predict); the second
is worth a compliance look before the relaunch.

Left alone because it is a scope decision, not a defect to fix quietly. Worth
settling before 17 August.
