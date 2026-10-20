# CHANGELOG 2026-10-20 — Back to the classical format: weeks 44 and 45

## Decision (owner)

- **Classical format:** every card is "predict the exact score". Exact score =
  **3 points**, right result (home win / draw / away win) = **1 point**.
- **Week 44** (26 Oct – 1 Nov): **6** British matches. No UEFA games that week.
- **Week 45** (2 – 8 Nov): **10** European matches with British teams (UCL/UEL/UECL matchday 4).
- Prizes unchanged: 100 ⭐ for 1st, 50 ⭐ for 2nd.

## How it is built

The match screen of Release 1 is gone since Release 2.1, so the classical format
runs on challenge cards of type `exact_score` (score picker, kickoff lock,
stickers by Source ID, early week switch, Champions/Hall of Fame unchanged).
Worker 367d0681 + frontend deployed:
- **Scoring:** on `exact_score` cards a wrong score with the right result now earns
  1 point (resolve-challenges); the card says "✅ Right result! +1 pt · Score: …".
- **Up to 10 cards a week** (`MAX_CHALLENGES`, was 6).
- **League Cup** (`eng.league_cup`) added to the daily ESPN fixture ingest.

## Week 44 — published 20 Oct (6 cards, 0 warnings)

| # | Kickoff (UTC) | Match | Source ID |
|---|---|---|---|
| 1 | Wed 28 Oct 20:00 | Liverpool vs Chelsea (League Cup, **score after 90 minutes**) | 401921842 |
| 2 | Sat 31 Oct 12:30 | Chelsea vs Man Utd | 401879248 |
| 3 | Sat 31 Oct 15:00 | Man City vs Brighton | 401879245 |
| 4 | Sat 31 Oct 15:00 | Hull City vs Ipswich Town (owner swapped out Spurs–Palace for an underdog game) | 401878763 |
| 5 | Sat 31 Oct 20:00 | Aston Villa vs Fulham | 401879250 |
| 6 | Sun 1 Nov 16:30 | Liverpool vs Arsenal | 401879246 |

## Week 45 — in the sheet, dry run ok (10 cards); the Monday 26 Oct cron publishes it

| # | Kickoff (UTC) | Match | Competition | Source ID |
|---|---|---|---|---|
| 1 | Tue 3 Nov 20:00 | Barcelona vs Aston Villa | UCL | 401915387 |
| 2 | Tue 3 Nov 20:00 | Man Utd vs Roma | UCL | 401915308 |
| 3 | Wed 4 Nov 17:45 | Fenerbahçe vs Liverpool | UCL | 401915382 |
| 4 | Wed 4 Nov 20:00 | RB Leipzig vs Man City | UCL | 401915306 |
| 5 | Wed 4 Nov 20:00 | Slavia Prague vs Arsenal | UCL | 401915381 |
| 6 | Thu 5 Nov 17:45 | Crystal Palace vs Hoffenheim | UEL | 401915526 |
| 7 | Thu 5 Nov 17:45 | Sparta Prague vs Bournemouth | UEL | 401915528 |
| 8 | Thu 5 Nov 20:00 | Celtic vs Beşiktaş | UEL | 401915522 |
| 9 | Thu 5 Nov 20:00 | Sunderland vs Dinamo Zagreb | UEL | 401915523 |
| 10 | Thu 5 Nov 20:00 | Getafe vs Brighton | UECL | 401915821 |

Sheet: Release2.1 rows 20–25 (week 44) and 26–35 (week 45), Picture_name empty.

## Open

- **Stickers** for weeks 44 and 45 (none yet; cards show without a picture until added).
- Mon 26 Oct: check the cron published week 45 (`weeks` 2026_45 = published, 10 cards).
- Sun 25 Oct evening: close week 43 together (template in the 19 Oct changelog).
- Resolving exact-score cards: answer `home:away` (e.g. `2:1`); the result point is automatic.

## Sticker prompts (weeks 44 and 45)

Full prompts, one per sticker, ready to copy. Save each picture in `frontend/public/stickers/` under its file name.

### Week 44 (26 Oct – 1 Nov) — due Sun 25 Oct

#### `LIV_CHE.png` — Liverpool vs Chelsea (League Cup)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A red Liver bird and a royal-blue lion clash over a silver cup with big handles, Anfield floodlights, "CUP NIGHT" banner, red and blue bursts.
```

#### `CHE_MUN.png` — Chelsea vs Man Utd

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A royal-blue lion faces a red devil with a trident, Stamford Bridge behind, blue and red lightning, "BIG GAME" burst.
```

#### `MCI_BHA.png` — Man City vs Brighton

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A sky-blue eagle and a blue-and-white striped seagull duel in the air over a ball, a modern stadium ring behind, sky-blue bursts.
```

#### `HUL_IPS.png` — Hull vs Ipswich

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. An amber-and-black striped tiger and a blue-and-white tractor face off on a muddy pitch, "UNDERDOGS" banner, amber and blue bursts.
```

#### `AVL_FUL.png` — Aston Villa vs Fulham

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A claret-and-blue lion rampant against a white-and-black Thames riverside cottage, red-brick stadium arches behind, claret bursts.
```

#### `LIV_ARS.png` — Liverpool vs Arsenal

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A red Liver bird against a golden cannon firing a ball, a roaring red stand of fans behind, "THE BIG ONE" burst, red and gold lightning.
```

### Week 45 (2 – 8 Nov) — due Sun 1 Nov

#### `BAR_AVL.png` — Barcelona vs Aston Villa (Champions League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. Blue-and-claret Barcelona stripes and a Catalan bat against a claret-and-blue lion, Champions League starball pattern, a huge stadium bowl at night.
```

#### `MUN_ROM.png` — Man Utd vs Roma (Champions League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A red devil with a trident against the Roman she-wolf, the Colosseum behind, Champions League starball pattern, red and burnt-orange bursts.
```

#### `FEN_LIV.png` — Fenerbahçe vs Liverpool (Champions League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A yellow-and-navy canary against a red Liver bird, Istanbul skyline with domes and minarets, Champions League starball pattern, yellow flares.
```

#### `RBL_MCI.png` — RB Leipzig vs Man City (Champions League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. Two red charging bulls against a sky-blue eagle, a modern glass arena behind, Champions League starball pattern, red and sky-blue lightning.
```

#### `SLA_ARS.png` — Slavia Prague vs Arsenal (Champions League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A red-and-white star against a golden cannon firing a ball, Prague Castle and Charles Bridge behind, Champions League starball pattern.
```

#### `CRY_HOF.png` — Crystal Palace vs Hoffenheim (Europa League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A red-and-blue eagle against a blue-and-white German village crest, a packed London stand, an orange Europa League ball, "EUROPA NIGHT" banner.
```

#### `SPA_BOU.png` — Sparta Prague vs Bournemouth (Europa League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A dark-red lion before Prague's spires against a pair of red-and-black cherries, an orange Europa League ball, dark-red and black bursts.
```

#### `CEL_BES.png` — Celtic vs Beşiktaş (Europa League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A green-and-white hooped shamrock against a black eagle, a roaring green-and-white crowd behind, an orange Europa League ball.
```

#### `SUN_DIN.png` — Sunderland vs Dinamo Zagreb (Europa League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A red-and-white black cat against a blue dragon, a glowing stadium of light behind, an orange Europa League ball, red and blue bursts.
```

#### `GET_BHA.png` — Getafe vs Brighton (Conference League)

```
Comic-style sticker for a Telegram football prediction game (shown on a phone card): pop-art, white die-cut border, plain white background, landscape (~3:2), bold readable shapes, halftone dots, energy bursts, speed lines, a flip scoreboard showing "? : ?" in the middle. A blazing blue Spanish sun against a blue-and-white striped seagull, a sunny Spanish stadium, a green Conference League ball.
```

(Same text in `docs/sticker-prompts-wk44-45.md`.)
