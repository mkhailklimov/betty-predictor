# CHANGELOG 2026-10-16 — Week 43: Coventry card in the sheet, six stickers live

## Context

Follow-up to `CHANGELOG-2026-10-15-week43-coventry.md`: swap the week 43 Pickford
card for Coventry vs Fulham, and wire the week 43 stickers the owner made.

## Sheet (Betty_Master_Data → Release2.1)

- Row 16: `Arsenal vs Everton` / "Will Pickford keep a clean sheet against Arsenal?"
  / 401878768 → **`Coventry City vs Fulham` / "Will Coventry beat Fulham?" / 401879255**.
  Kickoff (Sat 24 Oct 14:00 UTC) and points (1) unchanged.
- `Picture_name` filled for rows 14–19: BAY_ARS, HAALAND_AVL, COV_FUL, CHE_TOT,
  LIV_BHA, MUN_BOU.
- Dry run `publish 2026_43 --dry`: ok, 0 warnings; Coventry vs Fulham parses as
  `will_win`, 1 pt.

## Production

- **Week 43 re-publish: PENDING.** `bash scripts/betty-admin.sh publish 2026_43 --force`
  was refused by Claude Code's safety check (production deploy). D1 still holds
  the Pickford card. 0 picks on week 43 (checked 16 Oct), so the re-publish
  affects no player. Must run before the app opens week 43 (early switch after
  Sun 18 Oct 15:30 UTC, at the latest Mon 19 Oct 00:00 UTC).
- **Frontend deployed** (`betty-admin.sh deploy-frontend`): the six week-43
  stickers load on app.bettyscores.com (all 200, image/png).

## Stickers (week 43)

| File | Card | Source ID |
|---|---|---|
| `BAY_ARS.png` | Bayern vs Arsenal — exact score | 401915312 |
| `HAALAND_AVL.png` | Will Haaland score at Villa Park? | 401879256 |
| `COV_FUL.png` | Will Coventry beat Fulham? | 401879255 |
| `CHE_TOT.png` | London derby — who scores first? | 401878767 |
| `LIV_BHA.png` | Liverpool vs Brighton — over/under 2.5 | 401878765 |
| `MUN_BOU.png` | Will Man Utd beat Bournemouth? | 401879252 |

- Mapped by Source ID in `FIXTURE_STICKERS` (`frontend/src/components/ChallengeCard.tsx`).
- Cleaned: BAY_ARS, CHE_TOT, LIV_BHA and MAN_BOU had the transparency checkerboard
  painted into an opaque image (removed, white die-cut edge rebuilt ~15 px);
  HAALAND_AVL and COV_FUL were transparent (alpha snapped). All cropped and scaled
  to 1024 px wide (~1.1–1.5 MB, were 2.6–3.3 MB). `MAN_BOU.png` renamed
  `MUN_BOU.png` (team code as in `LEE_MUN`).
- Originals kept outside the repo in `C:\Users\mihel\betty-stickers-originals\`.
- Note for the owner: the stickers show real club crests and a shirt sponsor;
  a possible trademark question for a public app (owner's call).

## Next

1. Run the week 43 re-publish (above), then check D1 shows "Will Coventry beat
   Fulham?" with type `will_win`.
2. Sun 18 Oct evening: resolve week 42 with `betty-admin.sh resolve 2026_42 …`
   (last match Forest vs Arsenal, 15:30 UTC).
3. Weekend: pay owed Stars (2026_41 rank 1 and 2, bonus_1, bonus_2, 2026_34 rank 1),
   then mark them paid.

## Next session: start with paying the debts

Owed Stars (D1 `weekly_prizes`, status `owed`, checked 16 Oct): **750 ⭐ in all.**

| Week | Rank | Player | Telegram ID | Stars | Note |
|---|---|---|---|---|---|
| 2026_34 | 1 | KiernanOades | 7707147409 | 100 | oldest (late August), past the "within a month" rule |
| 2026_41 | 1 | Mishanna45 | 1017885628 | 100 | |
| 2026_41 | 2 | "........" | 8237993213 | 50 | |
| bonus_1 | 1 | ippolitovdenis | 1045430016 | 300 | manual bonus |
| bonus_2 | 1 | Mishanna45 | 1017885628 | 200 | manual bonus (Mishanna gets 300 in all) |

Order of work:
1. The owner sends each gift by hand in Telegram.
2. After each one is confirmed sent, mark it paid:
   `POST /api/admin/prizes/<week>/paid?rank=N` (e.g. `2026_41` rank 1 and 2, `bonus_1`, `bonus_2`, `2026_34`).
   Never mark paid before the owner confirms.
3. Then: the week 43 re-publish (if not done yet), and resolve week 42 on Sunday evening.
