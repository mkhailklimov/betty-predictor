# 16 Nov 2026: week 46 closed

Resolved late (Mon 16 Nov, owner asked): resolve is manual and was missed on the 15 Nov to-do list. Week 46 ended with Spain vs England on Sun 15 Nov.

ESPN finals: England 2:1 Croatia, Scotland 2:1 North Macedonia, Norway 3:1 Wales, Austria 1:0 Republic of Ireland, Northern Ireland 1:0 Ukraine, Spain 2:3 England. 6 cards, 53 picks.

Awarded by close (tie on 6 pts, earlier last pick wins):
- 1st Th7Tezar (tg 8775431442), 100 Stars.
- 2nd Underdogs United (guest nickname, tg guest:a20ea8ce-...), 50 Stars. Close first gave it to "Mihail Klimov", which the owner confirmed is their own guest account; prize row moved by hand (note on the row). No Telegram yet: paid after they claim by opening Betty in Telegram (merge moves the prize).
- TODO: add the owner's guest account to the internal list so it is never ranked again (worker change, needs deploy).

Others: bettyscores 6 and MikeKlimov 6 (internal), cannoneer 5, Mishanna45 4, PrettyPirat 2, Th7Arvin 1, Shoon Katwesige 0 (1 pick). New this week: Underdogs United, cannoneer, PrettyPirat, Shoon Katwesige.

Not marked paid yet. After sending: `bash scripts/betty-admin.sh paid 2026_46 1` and `paid 2026_46 2`.

Reminder: resolve each week on Monday morning (ESPN finals), before the new week starts.

## Later on 16 Nov
- Owner: the "Mihail Klimov" guest account is theirs. It stays in the tables (its picks fill the roster) but never gets Stars: at each weekly resolve, a prize it wins moves to the next player. The internal-list change (0361ca4 / ba248cb) was reverted (105353f / b1f52f0), never deployed.
- Week 46 Champions table: 2nd and 3rd swapped by hand in `gold_champions` (Underdogs United 2nd). The next table rebuild recomputes ranks and may put "Mihail Klimov" back to 2nd; the prize itself stays with Underdogs United.
- Screenshot of the week 46 table for the channel (owner's computer cannot take one): saved on the Desktop as `betty_week46_results.png`.
- **Pirate flag avatar** `PIR` (Jolly Roger, `frontend/public/avatars/special/PIR.svg`, group `special`): given by hand only, not in the picker; the server refuses it as a choice (worker change, takes effect at the next worker deploy; the live worker does not know `PIR` at all, so it is refused there too). Granted with PRO to Underdogs United as a test. Frontend deployed live from release-2.1 `105353f`.

## Hungary card (live 16 Nov)
- `HUN.png` (owner generated), avatar thumbnail `avatars/cards/HUN.jpg`, `TEAM_CARDS` + `CARD_ASSETS_VERSION` 8. release-2.1 `d9eb5b0` deployed live (checked on app.bettyscores.com: both pictures + bolt), main `63e3e4a`.
- Before: Hungary vs Northern Ireland showed the slot-machine icon (a card needs pictures for both teams).

## Club crests (next: owner generates in the evening session)
Owner is not happy with the plain colour shields: wants crest-like stickers with each club's symbol (cannon for Arsenal, ship for City...). Our own emblems in the club colours, not copies of the official crests (trademarks), no names or letters. Owner generates the pictures; I then swap them into the cards (`clubBadge`) and the avatar picker (avatars.json `src` -> `.png`, thumbnails), test, deploy on "deploy".
Order: week 48 clubs first (Galatasaray, Dortmund, Napoli, Brugge, Sporting, Hearts, Celtic, Arsenal...), then the rest.
Prompts also in `design/prompts/club-crests.md` (`8476cd6`).

Save each picture as `frontend/public/avatars/clubs/<CODE>.png` (square, at least 512 px).

### Arsenal - `EPL_ARS.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a big golden-brass cannon pointing to the right on a red field, with a white border strip.
```

### Aston Villa - `EPL_AVL.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a gold rampant lion standing on its hind legs on a claret field, with a sky-blue rim.
```

### AFC Bournemouth - `EPL_BOU.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a pair of shiny red cherries on green stalks on a field split in red and black vertical stripes.
```

### Brentford - `EPL_BRE.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a friendly bold bee in flight on a field of red and white vertical stripes, black rim.
```

### Brighton & Hove Albion - `EPL_BHA.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a white seagull with spread wings over blue and white vertical stripes.
```

### Chelsea - `EPL_CHE.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a regal blue lion standing and holding a staff, on a white circle inside a royal blue field, gold details.
```

### Coventry City - `EPL_COV.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a sky-blue elephant carrying a small castle tower on its back, on a white field with a sky-blue rim.
```

### Crystal Palace - `EPL_CRY.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: an eagle with spread wings perched above a small glass palace, on red and blue vertical halves.
```

### Everton - `EPL_EVE.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: an old round stone tower with a pointed roof, white tower on a royal blue field, gold laurel at the bottom.
```

### Fulham - `EPL_FUL.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a cosy brick cottage with a pitched roof on a white field, black rim and a thin red line.
```

### Hull City - `EPL_HUL.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a fierce tiger head facing forward, orange with black stripes, on a black field with an amber rim.
```

### Ipswich Town - `EPL_IPS.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a strong white working horse rearing up on a royal blue field, with a red rim.
```

### Leeds United - `EPL_LEE.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a large white Yorkshire rose on a field split in blue and yellow, white rim.
```

### Liverpool - `EPL_LIV.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a mythical cormorant-like bird with a sprig of seaweed in its beak, gold bird on a deep red field.
```

### Manchester City - `EPL_MNC.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a golden sailing ship with full sails above three diagonal stripes, on a sky-blue field with a navy rim.
```

### Manchester United - `EPL_MAN.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a small grinning red devil holding a trident, on a gold field with a red and black rim.
```

### Newcastle United - `EPL_NEW.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: two seahorses facing each other below a small castle, black and white vertical stripes behind them.
```

### Nottingham Forest - `EPL_NFO.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a big stylised oak tree with a round crown above wavy river lines, white tree on a deep red field.
```

### Sunderland - `EPL_SUN.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a sleek black cat sitting proudly above red and white vertical stripes, gold rim.
```

### Tottenham Hotspur - `EPL_TOT.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a navy cockerel standing on an old-style football, on a white field with a navy rim.
```

### Galatasaray - `UCL_GAL.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a roaring lion head with a full mane, on a field split diagonally in deep red and yellow-gold.
```

### Borussia Dortmund - `UCL_BVB.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a bold striped bee in yellow and black, on a bright yellow field with a thick black rim.
```

### Napoli - `UCL_NAP.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a cheerful little donkey trotting, white on a sky-blue field, a small volcano silhouette on the horizon.
```

### Club Brugge - `UCL_BRU.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a black rampant lion standing on its hind legs, on blue and black vertical stripes, gold rim.
```

### Sporting CP - `UCL_SCP.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a rampant lion standing on its hind legs, gold lion on a green field with one white horizontal band.
```

### Heart of Midlothian - `SCO_HEA.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a large heart made of small mosaic tiles, maroon heart on a white field, maroon rim.
```

### Celtic - `SCO_CEL.png`

```
Football club emblem in sticker style, square image. A shield-shaped badge with a thick white die-cut sticker border, a slight 3D bevel, soft drop shadow and a glossy highlight at the top left. Bold clean outlines, bright flat colours, comic-book finish. Centred on a plain light grey background with space around the sticker. No text, no letters, no numbers, no real club crest, no logos. Inside the shield: a big four-leaf clover, green on a white field, green and white horizontal hoops behind it.
```

## Evening 16 Nov
- **Prizes week 46 paid:** 1st Th7Tezar 100 Stars (marked paid). 2nd Underdogs United: the owner's friend, paid outside Telegram with a bonus equal to 100 Stars (marked paid, note on the row).
- **Proposal (waiting for owner's OK):** nickname (non-Telegram) players keep playing and stay in the tables, but only Telegram players get Stars; a nickname winner's prize moves to the next Telegram player. Needs a server change (`isPrizeEligible`) + the NicknameBar text ("Winners collect them in Telegram"), both branches, then deploy. Until then: check winners by hand at each Monday resolve.
- **Congrats to Arvin** drafted (assumed Th7Tezar is Arvin's account, owner to confirm).
- **Club crests, first 8 in** (owner generated): Arsenal, Aston Villa, Bournemouth, Brentford, Brighton, Chelsea, Coventry, Crystal Palace. Grey background cut out, trimmed, 512 px PNG in `frontend/public/avatars/clubs/EPL_*.png`, `avatars.json` points to them. release-2.1 `dcfa9b6`, main `28a3ead`. Tested in a local build on week 47 cards. **NOT deployed yet** (needs owner's "deploy").
- Workflow for the rest: owner saves raw pictures in `betty-release-2.1/frontend/public/teams/Cards/<CODE>.png`; I move originals to `C:\Users\mihel\betty-crests` (outside the repo, so they don't ship), cut + wire on both branches, test, deploy on "deploy".
- Still to generate: 12 EPL (EVE FUL HUL IPS LEE LIV MNC MAN NEW NFO SUN TOT) + 7 others for week 48 (GAL BVB NAP BRU SCP HEA CEL; on release-2.1 these come from `src/data/shields.ts`, swap the `.svg` paths there too).

## Next session
1. Deploy the 8 crests (and any new ones) on "deploy".
2. Decide the nickname-prize rule.
3. Recheck week 49 dry run (`publish 2026_49 --dry`) before 23 Nov.
4. Mon 23 Nov morning: resolve week 47 first (ESPN finals), check winners are Telegram players.
5. Before 30 Nov: remove owner's test Master League membership; release 2.2 on Mon 30 Nov.

## 17 Nov: crest prompts v2
Owner: the v1 stickers look like kindergarten (Man Utd devil in a nappy). Rewritten all 27 prompts in a mature esports / NFL team-logo style (fierce mascots, sharp shapes, rim lighting, no chibi or baby proportions), still die-cut stickers on a grey background. Napoli: erupting volcano instead of the donkey. Full prompts in `design/prompts/club-crests.md` (v1 replaced). The 8 v1 crests already wired (not deployed) can be regenerated in v2 for a consistent set.

## 17 Nov: crest style chosen, prompts v3
- Owner chose the aggressive esports-mascot style after the Man Utd red devil test. Devil cut out and wired as `EPL_MAN.png` (release-2.1 `298e808`, main `dbd1efe`, not deployed). Original in `C:\Users\mihel\betty-crests`.
- Lesson: generators weight the start of the prompt, so the subject goes first; busts avoid childish bodies; "subject large, inside the shield" keeps it readable at avatar size.
- Background cutter improved (`C:\Users\mihel\betty-crests\cut.py`): matches the sampled background colour (keeps dark armour), keeps only the main sticker shape.
- All other 26 prompts rewritten in this style (`design/prompts/club-crests.md` v3). Owner regenerates all, including the 8 earlier ones.

## 17 Nov: crest tone settled, prompts v4
- v3 (esports, realistic and menacing) gave a kindergarten bee first, then a scary ugly hornet. Middle ground approved on the Brentford hornet: modern NBA / NHL mascot logo, three-quarter view in motion, sharp eyes under angry brows, confident smirk, simplified bold shapes, two-tone shading. No words like cute/cartoon in prompts (they pull towards cute).
- All remaining 25 prompts rewritten in this tone (`design/prompts/club-crests.md` v4). Done so far: Man Utd devil (wired), Brentford hornet (approved, to save as `EPL_BRE.png`).

### All crest prompts v4 (final tone), to generate
Save each as `betty-release-2.1/frontend/public/teams/Cards/<CODE>.png`. Week 48 clubs first: GAL BVB NAP BRU SCP HEA CEL, then ARS LIV MNC.

#### Manchester United - `EPL_MAN.png` (DONE, wired)

```
Head-and-shoulders bust of a menacing adult devil warrior: sharp angular face, strong jaw, narrow glowing yellow eyes, a cold confident smirk, long curved black horns, red skin, black spiked armour on broad shoulders, the tip of a trident rising behind one shoulder. Drawn as a premium esports team mascot logo: bold thick outlines, sharp angular shapes, dramatic rim lighting, metallic shading. Placed on a gold shield with a red and black trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. Serious and intimidating, adult proportions, not a cartoon, not cute, no full body, no ball. No text, no letters, no numbers.
```

#### Brentford - `EPL_BRE.png` (approved tone; picture generated, save it)

```
A sleek stylised hornet in three-quarter view, flying forward with determination: sharp focused eyes under angry brows, a confident smirk, a streamlined black and yellow body with a few clean armour lines, wings swept back for speed, stinger pointed forward. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The hornet is large and fills most of the shield. Placed on a shield of red and white vertical stripes with a black trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Arsenal - `EPL_ARS.png`

```
A sleek bronze cannon in three-quarter view, firing forward with a burst of flame and a puff of smoke, clean polished barrel, sturdy wheel. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The cannon is large and fills most of the shield. Placed on a deep red shield with a white and navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Aston Villa - `EPL_AVL.png`

```
A proud golden lion in three-quarter view, rearing up on its hind legs: sharp focused eyes under angry brows, a confident roar, flowing mane, one paw raised with claws out. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a claret shield with a sky-blue trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### AFC Bournemouth - `EPL_BOU.png`

```
Two glossy dark-red cherries on a curved stalk with one sharp green leaf, tilted at a dynamic angle with a speed streak behind them. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The pair of cherries is large and fills most of the shield. Placed on a shield of red and black vertical stripes with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Brighton & Hove Albion - `EPL_BHA.png`

```
A sleek seagull in three-quarter view, diving forward with determination: sharp focused eyes under angry brows, a confident open beak, wings swept back for speed. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The seagull is large and fills most of the shield. Placed on a shield of blue and white vertical stripes with a navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Chelsea - `EPL_CHE.png`

```
A regal royal-blue lion in three-quarter view, standing upright and looking back over its shoulder: sharp focused eyes under stern brows, a confident smirk, flowing mane, a golden staff held in one paw. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a royal blue shield with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Coventry City - `EPL_COV.png`

```
A powerful sky-blue elephant in three-quarter view, charging forward: sharp focused eyes under angry brows, a confident look, tusks forward, trunk raised, a small stone tower strapped on its back. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The elephant is large and fills most of the shield. Placed on a sky-blue shield with a white and navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Crystal Palace - `EPL_CRY.png`

```
A fierce eagle in three-quarter view, swooping forward with wings spread: sharp focused eyes under angry brows, a confident hooked beak, talons out. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The eagle is large and fills most of the shield. Placed on a shield split in red and blue with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Everton - `EPL_EVE.png`

```
A round stone tower in three-quarter view with a bright beacon fire at the top, clean stone blocks, a few rays of light around the flame. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The tower is large and fills most of the shield. Placed on a royal blue shield with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Fulham - `EPL_FUL.png`

```
A sturdy riverside cottage in three-quarter view with warm glowing windows, a flag on the roof and a curl of river water in front. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The house is large and fills most of the shield. Placed on a black shield with a white and red trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Hull City - `EPL_HUL.png`

```
A strong tiger in three-quarter view, leaping forward: sharp focused eyes under angry brows, a confident snarl, bold black stripes on orange fur. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The tiger is large and fills most of the shield. Placed on a black shield with an amber trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Ipswich Town - `EPL_IPS.png`

```
A powerful white horse in three-quarter view, rearing up: sharp focused eyes under determined brows, a confident look, mane flowing in the wind. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The horse is large and fills most of the shield. Placed on a royal blue shield with a red trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Leeds United - `EPL_LEE.png`

```
A crisp white rose in three-quarter view with sharp clean petals, a strong green stem with a few thorns, a spark of light on the petals. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The rose is large and fills most of the shield. Placed on a royal blue shield with a yellow trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Liverpool - `EPL_LIV.png`

```
A proud mythical sea bird in three-quarter view, wings raised: sharp focused eyes under determined brows, a confident long beak holding a sprig of seaweed, golden feathers. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The bird is large and fills most of the shield. Placed on a deep red shield with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Manchester City - `EPL_MNC.png`

```
A golden sailing ship in three-quarter view, sailing forward on a curling wave, full sails catching the wind, three diagonal stripes behind it. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The ship is large and fills most of the shield. Placed on a sky-blue shield with a navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Newcastle United - `EPL_NEW.png`

```
A strong seahorse in three-quarter view, rising out of a wave: sharp focused eyes under determined brows, a confident look, fins like a flowing mane, a small castle tower behind it. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The seahorse is large and fills most of the shield. Placed on a shield of black and white vertical stripes, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Nottingham Forest - `EPL_NFO.png`

```
A strong oak tree with a full round crown and roots curling into three wavy river lines, clean simple leaves. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The tree is large and fills most of the shield. Placed on a deep red shield with a white trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Sunderland - `EPL_SUN.png`

```
A sleek black cat in three-quarter view, crouched ready to pounce: sharp green eyes under angry brows, a confident smirk, tail curled. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The cat is large and fills most of the shield. Placed on a shield of red and white vertical stripes with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Tottenham Hotspur - `EPL_TOT.png`

```
A proud cockerel in three-quarter view, standing on a football: sharp focused eyes under angry brows, a confident beak, chest puffed out, tall crest. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The cockerel is large and fills most of the shield. Placed on a white shield with a navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Galatasaray - `UCL_GAL.png`

```
A proud lion in three-quarter view, head turned to the viewer: sharp focused eyes under angry brows, a confident roar, a mane like flames. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a shield split diagonally in deep red and gold, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Borussia Dortmund - `UCL_BVB.png`

```
A sleek stylised wasp in three-quarter view, flying forward with determination: sharp focused eyes under angry brows, a confident smirk, a streamlined black and yellow body with a few clean armour lines, wings swept back for speed. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The wasp is large and fills most of the shield. Placed on a bright yellow shield with a thick black trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Napoli - `UCL_NAP.png`

```
A volcano in three-quarter view with a bright eruption at the top, clean lava streams down its sides, a calm bay at its foot. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The volcano is large and fills most of the shield. Placed on a sky-blue shield with a white trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Club Brugge - `UCL_BRU.png`

```
A proud black lion in three-quarter view, rearing up on its hind legs: sharp focused eyes under angry brows, a confident roar, one paw raised with claws out, a touch of gold in the mane. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a shield of blue and black vertical stripes with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Sporting CP - `UCL_SCP.png`

```
A proud golden lion in three-quarter view, rearing up: sharp focused eyes under angry brows, a confident roar, flowing mane. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a green shield with a white band and a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Heart of Midlothian - `SCO_HEA.png`

```
A bold maroon heart in three-quarter view with a few flames rising from the top and a clean shine on its surface. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The heart is large and fills most of the shield. Placed on a white shield with a maroon trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Celtic - `SCO_CEL.png`

```
A four-leaf clover in polished green with simple Celtic knotwork lines, tilted at a dynamic angle with a spark of light. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and stylish. The clover is large and fills most of the shield. Placed on a shield of green and white horizontal hoops, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```
