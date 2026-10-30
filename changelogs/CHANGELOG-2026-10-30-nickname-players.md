# 30 Oct 2026 — Nickname players (YouTube / Facebook)

## Why
Almost no new players this week. Owner wants to promote Betty on YouTube and Facebook, where people
have no reason to install Telegram first. Facts: 304 browser guests, only 17 ever made a pick; none
came through a tracking link yet.

## Decision (owner): win with a nickname, claim via Telegram
- A browser guest picks a **nickname** (3–20 letters, digits, spaces, `_ . -`; unique, case-insensitive,
  can't copy an existing player or "Guest"/"Betty"/"admin").
- With a nickname the guest is **ranked for the weekly Stars** like a Telegram player.
- Stars can only go to a Telegram account, so a browser winner **collects them by opening Betty in
  Telegram from the same browser** ("Open in Telegram" button → `startapp=gt_<token>` → merge) within
  **14 days**. One prize per person per week (rules page).

## What changed
- Worker (a16bb973):
  - `isPrizeEligible(u)`: not internal, and either a Telegram user or a guest with a nickname. Used in
    `rebuildMarts` (weekly champion rows) and the leaderboard guest-points loop; `closeWeek` no longer
    filters `guest:%` itself.
  - `POST /api/user/nickname` (guest auth only).
  - **Bug fixed in merge:** `/api/user/merge` moved only old match `predictions`; it now also moves
    Release 2.1 `challenge_predictions` (Telegram account's pick wins a conflict) and `weekly_prizes`
    (= the claim), then rebuilds the marts. Before this, a guest who opened Telegram lost their card picks.
- Frontend (Pages 4ba1df13):
  - `NicknameBar` above the cards for browser guests without a nickname; after saving: "You are in the
    race for Stars as …".
  - Rules (AboutPage) and the landing call-to-action updated.
- Tested on production with a throwaway guest (too short → 400, "Th7Arvin" → taken, "guest" → taken,
  valid → ok, no auth → 401), marts rebuild ok; the test guest was deleted. All 304 existing guests are
  named "Guest", so past rankings don't change. The merge path needs a real Telegram login to test.

## Paying a nickname winner
- After `resolve` closes the week, check the winner's `tg_id`. If it starts with `guest:`, don't pay yet:
  the prize row moves to the Telegram account when they open Betty in Telegram. Then pay and mark `paid`
  as usual. If nobody claims in 14 days, the owner decides (e.g. pass it to the next Telegram player).

## Tracking links for promotion
- YouTube: `https://app.bettyscores.com/?ref=youtube`
- Facebook: `https://app.bettyscores.com/?ref=facebook`
  (stored as `users.ref_source`, so we can count players per platform).
