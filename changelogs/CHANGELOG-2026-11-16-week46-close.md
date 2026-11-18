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
The old v1 prompts were removed from here (too childish). **Use only the v4 prompts at the bottom of this file** (section "All crest prompts v4"), or `design/prompts/club-crests.md`.

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

### All crest prompts v5 (final), to generate
Golden balance: catchy, aggressive, not scary. Every creature in motion with sharp eyes under angry brows and a confident roar or smirk (the Brentford hornet formula); every object armed or in action (fire, sparks, blades). Only these prompts are current.
Done, do not regenerate: Man Utd devil (`EPL_MAN.png`, wired), Brentford hornet (`EPL_BRE.png`, approved).
Save each as `betty-release-2.1/frontend/public/teams/Cards/<CODE>.png`. Order: week 48 clubs first (top 10), then the rest.

#### Galatasaray - `UCL_GAL.png`

```
A powerful lion in three-quarter view, lunging forward: sharp focused eyes under angry brows, a confident roar, a mane like flames, one paw raised with claws out. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a shield split diagonally in deep red and gold, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Borussia Dortmund - `UCL_BVB.png`

```
A sleek stylised wasp in three-quarter view, flying forward with determination: sharp focused eyes under angry brows, a confident smirk, a streamlined black and yellow body with a few clean armour lines, wings swept back for speed, stinger pointed forward. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The wasp is large and fills most of the shield. Placed on a bright yellow shield with a thick black trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Napoli - `UCL_NAP.png`

```
An erupting volcano in three-quarter view, a powerful blast of fire and lava from the crater, bright lava streams down its sides, clean sharp smoke shapes, a calm bay at its foot. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The volcano is large and fills most of the shield. Placed on a sky-blue shield with a white trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Club Brugge - `UCL_BRU.png`

```
A powerful black lion in three-quarter view, rearing up on its hind legs: sharp focused eyes under angry brows, a confident roar, one paw raised with claws out, a touch of gold in the mane. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a shield of blue and black vertical stripes with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Sporting CP - `UCL_SCP.png`

```
A powerful golden lion in three-quarter view, rearing up and lunging forward: sharp focused eyes under angry brows, a confident roar, flowing mane, one paw raised with claws out. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a green shield with a white band and a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Heart of Midlothian - `SCO_HEA.png`

```
A bold maroon heart in three-quarter view, burning with sharp flames rising from the top, a broken iron chain snapping apart around it, a clean shine on its surface. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The heart is large and fills most of the shield. Placed on a white shield with a maroon trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Celtic - `SCO_CEL.png`

```
A four-leaf clover in polished green with sharp blade-edged leaves and clean Celtic knotwork lines, tilted at a dynamic angle with a burst of light behind it. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The clover is large and fills most of the shield. Placed on a shield of green and white horizontal hoops, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Arsenal - `EPL_ARS.png`

```
Explosive action shot: a bronze cannon firing straight towards the viewer at a sharp diagonal angle, a big burst of orange flame and white smoke blasting from the muzzle, sparks and motion lines flying, the cannonball shooting out of the blast. The cannon and its blast are large and fill most of the shield, breaking slightly over the shield edge. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. Placed on a deep red shield with a white and navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Liverpool - `EPL_LIV.png`

```
A fierce mythical sea bird like a cormorant in three-quarter view, wings raised and spread: sharp focused eyes under angry brows, a confident long hooked beak holding a sprig of seaweed, golden feathers. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The bird is large and fills most of the shield. Placed on a deep red shield with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Manchester City - `EPL_MNC.png`

```
A golden war galleon in three-quarter view, cutting bow-first through a curling wave, full sails taut in the wind, cannon ports open, three diagonal stripes behind it. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The ship is large and fills most of the shield. Placed on a sky-blue shield with a navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Aston Villa - `EPL_AVL.png`

```
A powerful golden lion in three-quarter view, rearing up and lunging forward: sharp focused eyes under angry brows, a confident roar, flowing mane, one paw raised with claws out. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a claret shield with a sky-blue trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### AFC Bournemouth - `EPL_BOU.png`

```
Two glossy dark-red cherries turned into cherry bombs, their stalks as lit fuses throwing sparks, one sharp green leaf, tilted at a dynamic angle with speed lines behind them. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The pair of cherries is large and fills most of the shield. Placed on a shield of red and black vertical stripes with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Brighton & Hove Albion - `EPL_BHA.png`

```
A sleek seagull in three-quarter view, diving forward like a fighter jet: sharp focused eyes under angry brows, a confident smirk on its hooked yellow beak, wings swept back for speed. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The seagull is large and fills most of the shield. Placed on a shield of blue and white vertical stripes with a navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Chelsea - `EPL_CHE.png`

```
A regal royal-blue lion in three-quarter view, standing upright and stepping forward: sharp focused eyes under angry brows, a confident smirk, flowing mane, a golden staff gripped in one paw like a weapon. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The lion is large and fills most of the shield. Placed on a royal blue shield with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Coventry City - `EPL_COV.png`

```
A powerful sky-blue elephant in three-quarter view, charging forward: sharp focused eyes under angry brows, a confident look, ears flared, tusks forward, trunk raised, a small stone tower strapped on its back. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The elephant is large and fills most of the shield. Placed on a sky-blue shield with a white and navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Crystal Palace - `EPL_CRY.png`

```
A fierce eagle in three-quarter view, swooping forward with wings spread: sharp focused eyes under angry brows, a confident open hooked beak, talons out. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The eagle is large and fills most of the shield. Placed on a shield split in red and blue with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Everton - `EPL_EVE.png`

```
A round stone tower seen slightly from below, a blazing beacon fire at the top throwing sharp rays of light, clean stone blocks, a dark storm sky behind it. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The tower is large and fills most of the shield. Placed on a royal blue shield with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Fulham - `EPL_FUL.png`

```
A fortified riverside stone gatehouse in three-quarter view with a sharp pointed roof, two burning torches at the gate and a curl of fast river water in front. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The gatehouse is large and fills most of the shield. Placed on a black shield with a white and red trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Hull City - `EPL_HUL.png`

```
A strong tiger in three-quarter view, leaping forward with claws out: sharp focused eyes under angry brows, a confident snarl showing its fangs, bold black stripes on orange fur. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The tiger is large and fills most of the shield. Placed on a black shield with an amber trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Ipswich Town - `EPL_IPS.png`

```
A powerful white horse in three-quarter view, rearing up and charging: sharp focused eyes under angry brows, a confident look, flared nostrils, mane flowing like fire in the wind. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The horse is large and fills most of the shield. Placed on a royal blue shield with a red trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Leeds United - `EPL_LEE.png`

```
A sharp white rose in three-quarter view with crisp blade-like petals, its thorny stem wrapped around an upright sword, a spark of light on the petals. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The rose is large and fills most of the shield. Placed on a royal blue shield with a yellow trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Newcastle United - `EPL_NEW.png`

```
A strong athletic seahorse in three-quarter view, rising out of a crashing wave: sharp focused eyes under angry brows, a confident smirk, fins like a flowing mane, a small castle tower behind it. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The seahorse is large and fills most of the shield. Placed on a shield of black and white vertical stripes, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Nottingham Forest - `EPL_NFO.png`

```
A strong oak tree with a full round crown and roots curling into three wavy river lines, a longbow and an arrow crossed in front of its trunk, clean sharp leaves. Drawn as a modern professional sports team logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Bold, dynamic and aggressive, full of energy and motion, catchy rather than threatening. The tree is large and fills most of the shield. Placed on a deep red shield with a white trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Sunderland - `EPL_SUN.png`

```
A sleek black panther-like cat in three-quarter view, crouched ready to pounce: sharp green eyes under angry brows, a confident smirk, claws out, tail curled. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The cat is large and fills most of the shield. Placed on a shield of red and white vertical stripes with a gold trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

#### Tottenham Hotspur - `EPL_TOT.png`

```
A fighting cockerel in three-quarter view, standing on a football with wings half-spread: sharp focused eyes under angry brows, a confident open beak, chest puffed out, tall red crest, spurs on its legs. Drawn as a modern professional sports team mascot logo, like NBA or NHL team logos: simplified bold shapes, clean thick outlines, two-tone shading with a little shine. Cool, confident and athletic, heroic rather than monstrous. The cockerel is large and fills most of the shield. Placed on a white shield with a navy trim, shown as a die-cut sticker with a thick white border and soft drop shadow, centred on a plain light grey background, square image. No text, no letters, no numbers.
```

## 17 Nov afternoon: all crests in (v5)
- Owner generated all 25 remaining crests from the v5 prompts. Backgrounds cut (`C:\Users\mihel\betty-crests\cut.py`) into `frontend/public/avatars/clubs/<CODE>.png` (512 px). Originals moved to `C:\Users\mihel\betty-crests\v5`. A duplicate folder `teams/Cards/Cards` (copies only) and `EPL_MUN.jpg` (same devil as EPL_MAN) moved to `C:\Users\mihel\betty-crests\dup-nested-Cards` so they don't ship.
- Wired: `avatars.json` (all EPL; plus UCL/SCO on main) and `shields.ts` (UCL/SCO -> .png) on both branches. Checked in a local build on the week 47 cards (screenshot on the Desktop: `betty_crests_week47_cards.png`).
- **NOT deployed yet**: needs the owner's "deploy" (release-2.1 `deploy-frontend`).
- **DEPLOYED LIVE 17 Nov** (release-2.1 `0e9eae2`, pages deploy 583f7a5c); checked on the live site, all 7 EPL week 47 cards show the new crests.
- **DEPLOYED DEV 17 Nov** (main `106d372`, `deploy-dev-frontend`, https://dev.betty-scores-app.pages.dev). Checked: all crest PNGs served, the app code points to `.png` (UCL/SCO included).

### Crests: where everything is (summary)
- Prompts: `design/prompts/club-crests.md` (v5, the only current set; also above in this file).
- Generated originals: `C:\Users\mihel\betty-crests\v5` (outside the repo). Duplicates removed from the app folder: `C:\Users\mihel\betty-crests\dup-nested-Cards`.
- Cutter: `C:\Users\mihel\betty-crests\cut.py` (`python cut.py <src_dir> <out_dir> files...`).
- App files: `frontend/public/avatars/clubs/<CODE>.png` (27: 20 EPL + GAL BVB NAP BRU SCP HEA CEL), referenced in `frontend/src/data/avatars.json` and `frontend/src/data/shields.ts`.
- Commits: release-2.1 `0e9eae2` (LIVE), main `2fd2580` (DEV).
- Screenshots on the Desktop: `betty_crests_week47_cards.png` (local test), `betty_crests_LIVE.png` (live).
- Telegram may cache old pictures: close and reopen the app.
- Next new club: write a v5-style prompt (subject and action first), owner saves to `teams/Cards/<CODE>.png`, cut, wire on both branches, test, deploy on "deploy".

## 18 Nov: card layout (owner's comments)
- Club names were shown three times. Now: top line = the competition (ESPN league name: "English Premier League", "UEFA Champions League", "Scottish Premiership", "UEFA Nations League"; worker field `competition`, looked up by `source_id`, cached a day; extra `_c=1` in the URL so the live-score fetch never gets a cached copy). Names removed from the crest boxes; crests enlarged (62% -> 86% of the box). Bottom line unchanged ("Man City vs Fulham — predict the exact score!").
- Full-time box brought forward from 2.2 into live 2.1: 120 minutes after kickoff the card shows the 90-minute score from ESPN, the player's pick and points (3 exact / 1 result / 0), "Counts in the tables when the week is scored". Worker: hourly cron + on request, table `challenge_live` (migration 0010, already applied). Scoring now uses the same `pointsFor`.
- Tested: worker functions against ESPN (Switzerland 4:0 Scotland, Wales 2:3 Portugal, Hungary 1:1 Northern Ireland; points 3/1/0), card in a local build (screenshot on the Desktop: `betty_cards_new_layout.png`).
- Commits: release-2.1 d2b2002, main 94fae2f. DEPLOYED 18 Nov: LIVE worker (version 72884690) + LIVE frontend from release-2.1; DEV worker + dev frontend from main. Checked on api.bettyscores.com: top line "UEFA Nations League" / "English Premier League", full-time box 4:0, 2:3, 1:1 for the three Nations League matches. The first request after a deploy may show no top line (name lookup), the next one has it.
- Files changed: `cf-worker/src/worker.js` (release-2.1: `espnCompetition`, `competition` + `result` on each card in `/api/challenges/current`, hourly `refreshLiveResults`, `pointsFor` in scoring; main: `espnCompetition` + `competition` only), `frontend/src/components/ChallengeCard.tsx` (top line = competition, no name under the crest, full-time box), `frontend/src/styles/ChallengeCard.css` (crest 86%, `cc__ft` styles), `frontend/src/types/index.ts` (`competition`, `result`).
- Deploy details: live frontend https://90c816d9.betty-scores-app.pages.dev; dev worker version 2ad73f0c, dev frontend https://2ca06e59.betty-scores-app.pages.dev (alias dev.betty-scores-app.pages.dev).
- Rollback if needed: on release-2.1 `git revert d2b2002`, then `deploy-worker` + `deploy-frontend` from C:/Users/mihel/betty-release-2.1. The `challenge_live` rows can stay (dev writes them too).
- Database: no player points are changed by this. The live worker now only writes the 90-minute scores into `challenge_live`; points still come only from the Monday resolve.
- Next: the owner checks the cards in Telegram. Mon 23 Nov: resolve week 47 first (the full-time box then shows "official"). 30 Nov: release 2.2 already has all of this.
