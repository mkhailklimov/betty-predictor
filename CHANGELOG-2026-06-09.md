# Changelog — June 9, 2026

## Summary

Verification-only day. Re-checked the Week 3 (`2026_26`) match data across the code, the source Google Sheet, and the card assets on disk — confirmed everything is in sync and complete. No code changes. Prod (`main`) untouched; dev/preview continues to serve Week 3.

---

## Week 3 sync verification

Cross-checked three sources for the final group-stage round:

- **Code** — `frontend/src/data/matches.ts` `WEEK3_MATCHES` holds 10 matches, IDs **21–30**.
- **Sheet** — Matches tab of `1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus`, week_id `2026_26`, contains exactly the same 10 rows (IDs 21–30). The original 21–44 pool was trimmed to the 10 selected; no leftover pool remains to add from.
- **Card PNGs** — every team code used in Week 3 (CZE, MEX, SAF, KOR, JAP, SWE, TUR, USA, PAR, AUS, NOR, FRA, URU, ESP, NZL, BEL, PAN, ENG, COL, POR) has a matching file in `frontend/public/teams/Cards/`.

All three agree 1:1:

| ID | Match | Group | Kickoff (UTC) |
| :- | :---- | :---: | :------------ |
| 21 | Czechia v Mexico | A | 2026-06-25 01:00 |
| 22 | South Africa v South Korea | A | 2026-06-25 01:00 |
| 23 | Japan v Sweden | F | 2026-06-25 23:00 |
| 24 | Türkiye v USA | D | 2026-06-26 02:00 |
| 25 | Paraguay v Australia | D | 2026-06-26 02:00 |
| 26 | Norway v France | I | 2026-06-26 19:00 |
| 27 | Uruguay v Spain | H | 2026-06-27 00:00 |
| 28 | New Zealand v Belgium | G | 2026-06-27 03:00 |
| 29 | Panama v England | L | 2026-06-27 21:00 |
| 30 | Colombia v Portugal | K | 2026-06-27 23:30 |

**Result: nothing missing.** No match cards and no image assets outstanding.

---

## Open items / next session

1. **Dev → prod sync** (still pending, hold until ~2026-06-11 / user go-ahead): cherry-pick `dev` → `main` (do NOT merge — TON manifest is branch-specific) to flip prod `ACTIVE_MATCHES` from Week 1 to Week 3.
2. Card PNGs are 1254² ~2.5 MB — downscale to ~1024² / run through `pngquant`/`oxipng` before promoting to prod.
