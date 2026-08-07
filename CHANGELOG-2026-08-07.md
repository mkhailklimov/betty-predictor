# Changelog — 2026-08-07

The 07-31/08-02 redesign work promoted to production, two things found on the way
that were worth fixing before it went — and then, on checking what a visitor
actually gets, **a production database that could not create a user.** That last
one had nothing to do with today's deploy and everything to do with what
"deployed" was taken to mean.

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

## Migration `0005` had never been applied, so nobody could sign up

Found by asking a question the morning's checks had not: *what happens when a
stranger opens this?*

`0005_v2_identity.sql` — the four identity columns on `users` — was written when
the identity code shipped and never run against `betty-db`. `0004` (fixtures) and
`0006` (prizes) were both applied; `0005` was skipped. So every statement that
**creates** a user threw:

```
D1_ERROR: table users has no column named auth_source
```

| Path | Before | After |
|---|---|---|
| `POST /api/user/guest` — "Play as guest" | **500** | 201, token issued, `?ref=` captured |
| `GET /api/user/me` with that guest token | — | 200 |
| `POST /api/user/register` — a **new** Telegram user | **500** | insert succeeds (see caveat) |
| An **existing** Telegram user | 200 | 200 — register returns early for known accounts |

Both Workers were affected, not just production: dev and prod bind the same
`betty-db` by design (§4.4 of RELEASE-2.0), so there was no environment in which
signing up worked.

Applied with `wrangler d1 execute betty-db --remote --file`. Additive-only as the
release plan requires — four nullable columns plus the partial unique index on
`guest_token` — so a rolled-back v1 Worker still runs on the schema. Row counts
before and after: **18 users, 218 predictions**, unchanged.

**Caveat on the register row of that table.** It was not exercised end to end.
Register needs initData signed with the prod `BOT_TOKEN`, which is a Worker secret
that cannot be read back, and `ALLOW_LEGACY_AUTH` is correctly `"0"`. So instead
the failing statement itself — `worker.js:189`, verbatim, same columns and table —
was run against prod and now succeeds. That proves the defect is gone; it does not
test the HMAC check in front of it, which was never broken. A true end-to-end
needs either the bot token on the box or a person with a Telegram account that has
never opened Betty.

Five probe rows were created while testing and all five deleted; the baseline
above is the verified after-state, with zero rows carrying an `auth_source`.

### Why this survived a "verified" deploy

This morning's promotion was checked by fetching the served bundle and confirming
`/api/weeks/*`, `/api/champions` and `/api/leaderboard` all returned 200. Every one
of those is a **read**. The site was genuinely serving the new build against a
healthy API — and was simultaneously unable to take a single new player.

> Read paths returning 200 is not evidence the product works. The first
> **write** a stranger performs is the check that matters, and for this app that
> is creating a user.

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
