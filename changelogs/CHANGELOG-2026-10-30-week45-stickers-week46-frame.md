# 30 Oct 2026 — Week 45 stickers live, week 46 frame

## Week 45 stickers (European week, 2 – 8 Nov)
- Owner generated all 10. Raw copies kept in `C:\Users\mihel\betty-stickers-originals\`; cleaned with the usual cleaner (1024 px wide, white die-cut edge) into `frontend/public/stickers/`.
- Mapped by Source ID in `FIXTURE_STICKERS` (ChallengeCard.tsx): BAR_AVL, MUN_ROM, FEN_LIV, RBL_MCI, SLA_ARS, CRY_HOF, SPA_BOU, CEL_BES, SUN_DIN, GET_BHA.
- Frontend deployed (Pages b13409c8), stickers return 200 on app.bettyscores.com.
- Week 45 was published by the Monday cron: 10 cards in D1.
- These stickers are busier than the minimalist style (bursts, skylines); fine for this week.

## Git
- GitHub token "betty-server" had expired on 28 Oct; owner renewed it, push works again.

## Week 46 frame (9 – 15 Nov) — international break
- The feed has only UEFA Nations League games (34, Thu 12 – Sun 15 Nov); no club football.
- Proposed 8 cards (British teams + big ties), all exact score: England–Croatia, Italy–France, Serbia–Germany, Scotland–North Macedonia, Norway–Wales, Portugal–Denmark, Austria–Ireland, Spain–England.
- Sheet rows (tab-separated, ready to paste) and 7 minimalist sticker prompts: `docs/sticker-prompts-wk46.md`. ENG_CRO.png from September is reused.
- Next: owner pastes rows into Release2.1 → `betty-admin.sh publish 2026_46 --dry` → the Monday 2 Nov cron publishes it (or publish by hand before Mon 9 Nov 00:00 UTC).
