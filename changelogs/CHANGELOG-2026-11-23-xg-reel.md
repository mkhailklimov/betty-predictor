# 23 Nov 2026: xG reel (Galatasaray v Aston Villa), rejected

## What was built
- Owner's storyboard: top 3 players per side with xG each, both elevens on the pitch adding up (keeper's effect goes to the other side), expected goals with a rounded forecast (1:2), win/draw/win (34 / 24 / 42 from bookmaker odds).
- Code: `scripts/reels/xg_data.py` (ESPN squad stats + odds -> numbers), `make_xg_reel.py` (renders 1080x1920 30 fps), `xg_reel.html` + `xg_reel.js` (scenes). Match file `scripts/reels/matches/GAL_AVL.json`. Commits up to main 7571ae3.
- v1: dark navy, lists. v2: Betty green-black-yellow, elevens on a pitch in 4-2-3-1 (last league line-ups from ESPN), avatars. v3: owner's six cartoon avatars (`scripts/reels/players/`), celebration motion (jump, sway, glow, confetti).

## Owner's verdict
"Looks like a kindergarten muppet show." Cartoon avatars + bouncing + confetti = rejected. Keep the data pipeline, drop the cartoon/celebration style.

## TASK for tomorrow morning (24 Nov): give ideas for the reel
Bring several scenarios to choose from, each with a one-line pitch and a sample frame or two. Starting points:
1. **Broadcast analyst** (UEFA / Sky Sports graphics): dark stadium background, clean side-by-side stat bars (form last 5, goals for/against, shots, xG), sharp wipes, no cartoons, no bounce. Ends on the forecast and "predict in Betty".
2. **Key duel**: one match-up as a "tale of the tape" (e.g. Osimhen v Villa's centre-backs, or Osimhen v Suzuki): photo-free name plates, 4-5 numbers each, a verdict.
3. **Three questions**: kinetic typography only. Three sharp questions with one stat each ("Can Villa stop Osimhen? 9 goals in 8 games"), then "Your exact score?". Fast, text-led, very cheap to make every week.
4. **Betty players vs the bookies**: our own data. What Betty players picked for the match (share of home/draw/away and the most picked score) against the bookmaker odds. Unique to Betty, can't be copied. Needs some picks first (post a few hours before kickoff).
5. **Tactics board**: chalkboard pitch with both formations, 2-3 arrows for how each side scores, then the forecast. Serious, coach-style look.
Questions to settle: length (15 s / 30 s), music or silent, real line-ups (post ~1 h before kickoff) or likely XI (post the day before), one reel per match or one weekly reel for all 10.
Before building: ask for a reference reel the owner likes (memory: "ask what professional looks like").
