# Changelog — 2026-07-12 (Activation: dead-zone landing + partial-prediction save)

Five registered users had **zero predictions** (`daria_kllim`, `User_6034210172`,
`Meeeshanya`, `User_8562574292`, `Srabonzone`). Registration is automatic on app open,
so a Users row means "opened the Mini App once" — these are **bounces**, not stalled
signups. Two concrete barriers found in the code, both fixed here.

---

## 1. Dead-zone landing — the current week could be a wall of locked cards

`443f93b` (Jul 5) made the carousel open on the nearest still-predictable match, but it
only ever searched **within the current week**. Between a week's last kickoff and the
next week becoming current, *every* match of the current week has started — so a
newcomer landed on a locked card with nothing to predict. In the group stage that
window was **5 days** (Jun 28 02:00Z → Jul 3 06:00Z). `User_8562574292` opened the app
on **Jul 1** — squarely inside it.

**Fix** (`MainPage.tsx`): if every match of the current week is locked and a Next week
is already open, land on **Next**.

Verified by rendering the real `MainPage` at each visitor's exact arrival instant:

| arrival | before | after |
|---|---|---|
| Jul 1 09:29 (`User_8562574292`) | Current → **Uruguay v Spain, LOCKED — dead end** | **Next → Australia v Egypt, predictable** |
| Jun 15 08:53 (`Meeeshanya`) | Current → Spain v Cape Verde, predictable | unchanged |
| Jul 4 09:34 (`Srabonzone`) | Current → Canada v Morocco, predictable | unchanged |
| Jul 12 (today) | Current → France v Spain, predictable | unchanged |

(The Jun 15 / Jul 4 cases read as fine *today* only because `443f93b` already fixed
them — at the time those two actually visited, both landed on a locked card.)

## 2. An outcome-only bet was silently discarded

`onPredict` only fired from `handleScore`, and only `if (selectedOutcome)`. Tapping
"WIN 2" and stopping persisted **nothing** — not to localStorage, not to D1. Picking an
outcome then reveals a grid of ~50 exact scores; anyone who didn't also pick one left no
trace, indistinguishable from a user who never touched the app.

**Fix** (`MatchCard.tsx`): the outcome tap saves immediately; the exact score upgrades
the bet. Re-tapping the score drops back to outcome-only. Re-tapping the *outcome* is
now a no-op — there's no delete endpoint, so clearing it locally would strand a ghost
bet on the backend.

**No backend change needed** — `predictions.predicted_score` is already nullable and the
canonical `scoreBet()` already handles it:

| bet | points |
|---|---|
| outcome only, outcome correct | **1** |
| outcome only, outcome wrong | 0 |
| outcome + exact score correct | 3 |

Supporting frontend changes:
- `syncPendingPredictions()` used to `continue` on any score-less prediction — it now
  replays outcome-only bets too.
- `parseScore()` maps `''` → `null` (previously `''.split(':')` produced `NaN` scores).
- `predicted_score` type widened to `| null` (`services/api.ts`).
- Progress/all-done now mean **outcome + score**, so an outcome-only bet keeps the card
  stack open (with the score bonus still on the table) instead of jumping to the
  "bets saved" screen. New `dot--partial` (ring, not filled) marks it in the dots.

## Verified

- **Live API round-trip** (dev worker, throwaway tg_id, open `match-46`; rows deleted
  after): outcome-only POST → `predicted_score: null`, 201; upgrade to `{1,2}`; downgrade
  back to `null` — all one upserted row.
- **`scoreBet()`** exercised directly with a null score → 1 / 0 / 3 as tabled above.
- **Click-test** of the real `MatchCard` in jsdom, recording every `onPredict`:
  - before — tap outcome only → `[]` (**nothing saved**)
  - after — tap outcome only → `[{outcome:'2', score:''}]`; then `1:2` → upgrade; re-tap → downgrade
- Typecheck: no new errors (the 4 `App.tsx` + 1 `api.ts` errors are pre-existing). Build clean.

## Not fixed here

Two users (`daria_kllim` May 27, `User_6034210172` Jun 7) opened the app **before the
tournament started**, when matches were predictable but kickoff was weeks away — and
never returned. Nothing pulls a lapsed visitor back: there is no bot notification when a
week opens or a match nears kickoff. That's a re-engagement gap, not a code bug.
