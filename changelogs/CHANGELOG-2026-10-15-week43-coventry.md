# CHANGELOG 2026-10-15 — Week 43: Pickford card → Coventry vs Fulham

## Context

Week 43 (19–25 Oct) is published in D1 since the 10-09 draft
(`CHANGELOG-2026-10-09-week42-live-week43-draft.md`). Week 42 (current week,
12–18 Oct) already asks "Will Pickford keep a clean sheet against Chelsea?", so
week 43's Pickford vs Arsenal card would repeat the question. Owner's decision:
replace it with Coventry City vs Fulham — Coventry are new in the EPL and the
owner plans a promo clip about them.

No changes in production yet. Nothing committed.

## Live state checked (read-only, 15 Oct)

- Week 43: 6 challenges in D1, none resolved, **0 picks** — the swap affects
  no players.
- Week 42: 6 challenges, 0 resolved; kickoffs Sat 17 Oct 11:30 → Sun 18 Oct
  15:30 UTC.
- Prizes owed: 2026_41 rank 1 (100 ⭐) + rank 2 (50 ⭐), bonus_1 (300 ⭐),
  bonus_2 (200 ⭐), and 2026_34 rank 1 (100 ⭐) still `owed`.

## Week 43 — decided change

| # | Kickoff (UTC) | Fixture | Challenge | Type | Pts | Source ID |
|---|---|---|---|---|---|---|
| 3 (old) | Sat 24 Oct 14:00 | Arsenal vs Everton | ~~Will Pickford keep a clean sheet against Arsenal?~~ | clean_sheet | 1 | 401878768 |
| 3 (new) | Sat 24 Oct 14:00 | Coventry City vs Fulham | **Will Coventry beat Fulham?** | will_win | 1 | 401879255 |

- Same kickoff slot, ends well before Sunday midnight UTC (close rule ok).
- Options considered: A will_win (chosen — clearest hook for the clip),
  B Coventry clean sheet, C over/under 2.5 (duplicates the Liverpool card).
  With A, week 43 has two will_win cards (also Man Utd vs Bournemouth) and no
  clean_sheet card.
- Table check (ESPN, 15 Oct) for the clip: Coventry 14th — P6 W2 D0 L4,
  GD −6, 6 pts; Fulham 20th — P6 W0 D2 L4, 2 pts, no win yet. The table does
  not show a "very good debut"; "newcomers vs winless bottom side" fits the
  numbers better.

Week 43 after the change:

| # | Kickoff (UTC) | Challenge | Source ID | Sticker |
|---|---|---|---|---|
| 1 | Wed 21 Oct 19:00 | Bayern vs Arsenal — predict the exact score! | 401915312 | `BAY_ARS.png` ✅ in folder (untracked, not cleaned) |
| 2 | Sat 24 Oct 11:30 | Will Haaland score at Villa Park? | 401879256 | `HAALAND_AVL.png` ❌ |
| 3 | Sat 24 Oct 14:00 | Will Coventry beat Fulham? | 401879255 | `COV_FUL.png` ❌ |
| 4 | Sat 24 Oct 16:30 | London derby — who scores first? | 401878767 | `CHE_TOT.png` ❌ |
| 5 | Sun 25 Oct 14:00 | Liverpool vs Brighton — over or under 2.5 goals? | 401878765 | `LIV_BHA.png` ❌ |
| 6 | Sun 25 Oct 14:00 | Will Manchester United beat Bournemouth? | 401879252 | `MUN_BOU.png` ❌ |

Prompts for 1, 2, 4, 5, 6 are in the 10-09 changelog (`PICKFORD_ARS.png` there
is dropped).

## Sticker prompt — `COV_FUL.png`

Save in `frontend/public/stickers/`. Any size and background.

> Comic pop-art sticker, white die-cut border, transparent background,
> landscape (~3:2): Coventry City (sky-blue kit, elephant mascot) versus Fulham
> (white shirt with black trim, Craven Cottage riverside cottage behind) — a
> charging sky-blue elephant kicking a football toward a startled figure in
> white and black, a big "WIN?" speech burst, "SKY BLUES" banner, halftone
> dots, speed lines, sky-blue and black energy bursts.

## Next — Fri 16 Oct (owner returns with stickers)

1. Sheet Betty_Master_Data → Release2.1, row 16: question "Will Coventry beat
   Fulham?", Source ID 401879255, Picture_name `COV_FUL.png`.
2. `bash scripts/betty-admin.sh publish 2026_43 --dry`, then re-publish
   (`--force` if needed) — confirm with owner before the production command.
   Check D1 afterwards: the Pickford row is gone/replaced, type = will_win.
3. Clean the stickers (transparency, white die-cut edge, 1024 px wide), add
   the six week-43 entries to `FIXTURE_STICKERS` in `ChallengeCard.tsx` by
   Source ID, `bash scripts/betty-admin.sh deploy-frontend`.
4. All of this before Mon 19 Oct 00:00 UTC (earlier if week 42's last kickoff,
   Sun 18 Oct 15:30 UTC, triggers the early switch).
5. Sun 18 Oct evening: resolve week 42 with `betty-admin.sh resolve 2026_42 …`.
6. Weekend: owner pays owed Stars; then mark paid via
   `POST /api/admin/prizes/<week>/paid?rank=N`.
