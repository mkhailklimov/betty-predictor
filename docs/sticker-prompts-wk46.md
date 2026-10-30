# Week 46 (9 – 15 Nov 2026) — Nations League week

International break: no club football in the feed, only UEFA Nations League.
Classical format: every card is "predict the exact score", 3 points exact / 1 point right result.

## Cards (in the sheet: Release2.1 rows 36–41, test publish ok)

| # | Kickoff (UTC) | Match | Source ID |
|---|---|---|---|
| 1 | Thu 12 Nov 19:45 | England vs Croatia | 401861150 |
| 2 | Fri 13 Nov 19:45 | Scotland vs North Macedonia | 401861161 |
| 3 | Sat 14 Nov 17:00 | Norway vs Wales | 401861165 |
| 4 | Sat 14 Nov 19:45 | Austria vs Republic of Ireland | 401861170 |
| 5 | Sat 14 Nov 19:45 | Northern Ireland vs Ukraine | 401861169 |
| 6 | Sun 15 Nov 19:45 | Spain vs England | 401861175 |

## Pictures: World Cup team cards

No match stickers this week. A national-team card with no sticker shows the two World Cup
team cards side by side (`frontend/public/teams/Cards/<CODE>.png`, list in `TEAM_CARDS`,
`frontend/src/data/matches.ts`). A card shows the pair only when **both** teams have a card;
otherwise it falls back to the icon.

Have: ENG, CRO, SCO, NOR, AUT, ESP.
**Missing (5): MKD North Macedonia, WAL Wales, IRL Republic of Ireland, NIR Northern Ireland, UKR Ukraine.**
Without them, only England–Croatia and Spain–England show pictures.

To add one: save a square PNG (1024×1024) as `frontend/public/teams/Cards/<CODE>.png`, add
`<CODE>: true` to `TEAM_CARDS`, bump `CARD_ASSETS_VERSION`, deploy the frontend.

### Prompts in the World Cup card style (square, a player in the national kit before the flag)

#### `MKD.png` — North Macedonia

```
Square comic-style football card illustration, bold clean outlines, bright saturated colours. A footballer in North Macedonia's red kit with yellow details runs towards the viewer, fists clenched in celebration, number 10 on the shirt. Behind him fills the whole background: a large waving North Macedonian flag, a golden-yellow sun with eight broadening rays on red. No text, no logos, no real person's likeness.
```

#### `WAL.png` — Wales

```
Square comic-style football card illustration, bold clean outlines, bright saturated colours. A footballer in Wales's red kit runs towards the viewer, arms wide in celebration, number 11 on the shirt. Behind him fills the whole background: a large waving Welsh flag, a red dragon on white and green halves. No text, no logos, no real person's likeness.
```

#### `IRL.png` — Republic of Ireland

```
Square comic-style football card illustration, bold clean outlines, bright saturated colours. A footballer in Ireland's green kit with white shorts runs towards the viewer, fist raised in celebration, number 9 on the shirt. Behind him fills the whole background: a large waving Irish tricolour, vertical green, white and orange stripes. No text, no logos, no real person's likeness.
```

#### `NIR.png` — Northern Ireland

```
Square comic-style football card illustration, bold clean outlines, bright saturated colours. A footballer in Northern Ireland's green kit with white trim runs towards the viewer, pointing to the sky in celebration, number 7 on the shirt. Behind him fills the whole background: a waving green and white stadium banner with a white shamrock pattern. No text, no logos, no flags, no real person's likeness.
```

#### `UKR.png` — Ukraine

```
Square comic-style football card illustration, bold clean outlines, bright saturated colours. A footballer in Ukraine's yellow kit with blue details runs towards the viewer, both arms up in celebration, number 10 on the shirt. Behind him fills the whole background: a large waving Ukrainian flag, blue over yellow. No text, no logos, no real person's likeness.
```
