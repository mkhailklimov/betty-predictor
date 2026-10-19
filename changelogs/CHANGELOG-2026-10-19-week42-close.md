# CHANGELOG 2026-10-19 — Week 42 resolved, Champions and Hall of Fame renewed

## What happened

- Week 42 (12–18 Oct) was **not resolved on Sunday**. The Monday 00:00 UTC cron
  closed it anyway (as warned in the 12 Oct changelog: `closeWeek` does not
  check that challenges are resolved) and, with everyone on 0 points, its
  tie-break awarded 1st place (100 ⭐) to Th7Tezar.
- 19 Oct: resolved with the real ESPN results, then marts rebuilt. Th7Tezar is
  the real winner, so the prize stands; no re-close was needed.

## Week 42 results (`betty-admin.sh resolve 2026_42 …` → resolved 6, scored 6)

| Challenge | Result | Answer |
|---|---|---|
| Will Pickford keep a clean sheet against Chelsea? | Everton 0–2 Chelsea | No |
| Brentford vs Liverpool — over or under 2.5? | 1–2 | Over |
| Will Manchester City beat Ipswich Town? | 3–2 | Yes |
| M23 derby — exact score | Brighton 5–0 Palace | 5:0 |
| Leeds vs Man Utd — who scores first? | Man Utd 35' (1–1) | Away |
| Forest vs Arsenal — exact score | 0–1 | 0:1 |

## Week 42 champions

| Rank | Player | Points | Stars |
|---|---|---|---|
| 1 | Th7Tezar (8775431442) | 5 (No ✓1, Yes ✓1, Away ✓3) | 100 ⭐ (owed) |

Other players: two guests and the team account MikeKlimov (excluded). No 2nd place.

## Hall of Fame after the rebuild (top 5)

Mishanna45 29 pts / 3 weeks won / 300 ⭐; ippolitovdenis 26 / 3 / 300; Th7Tezar 5 / 1 / 100;
KiernanOades 1 / 1 / 100; "........" 6 / 0 / 50.

## Debts (D1, 19 Oct)

| Prize | Player | Stars | Status |
|---|---|---|---|
| 2026_34/1 | KiernanOades | 100 | paid |
| 2026_41/1 + bonus_2 | Mishanna45 | 300 | 100 sent 17 Oct; 200 to confirm |
| bonus_1 | ippolitovdenis | 300 | 100 sent 17 Oct; 200 to confirm |
| 2026_41/2 | "........" | 50 | waiting for them to write to @bettyscores |
| **2026_42/1** | **Th7Tezar** | **100** | **new, owed** |

## Proposed

- Guard in `closeWeek`: if any challenge of the week is unresolved, skip the
  close (and retry on the next run) instead of awarding prizes on 0 points.

## Update (19 Oct, later)

- Owner confirmed the remaining Stars to Mishanna45 and ippolitovdenis were sent:
  `paid 2026_41 1`, `paid bonus_2 1`, `paid bonus_1 1` (each changed 1 row).
- Still owed: **2026_41/2 "........" 50 ⭐** (no activity since 9 Oct; bot message of
  17 Oct unanswered as far as we know) and **2026_42/1 Th7Tezar 100 ⭐** (message text
  given to the owner).
- Owner sent Th7Tezar 100 ⭐ (congrats message with a share link, t.me/bettyscores_bot/app): `paid 2026_42 1`.
  Only **2026_41/2 "........" 50 ⭐** remains owed.

## Results in → Stars counted at once (owner's rule, deployed 19 Oct)

Worker version 2658071e (`betty-admin.sh deploy-worker`):
- **`resolve` closes the week itself:** once every card of the week has its answer
  and the last match is over (kickoff + 2 h), the resolve call runs `closeWeek`
  immediately: prizes awarded, Champions and Hall of Fame rebuilt. The reply
  shows it in `close` (e.g. `{"ok":true,"awarded":[...]}`, or `waiting` with how
  many answers are missing).
- **Guard in `closeWeek`:** a challenge week with any unresolved card is not
  closed (`{"ok":false,"waiting":true,"unresolved":n}`); the Monday 00:00 cron
  therefore waits instead of paying on 0 points. Weeks without challenges close
  as before.
- Tested by re-entering week 42's answers: `close: {"ok":true,"already":true}`.
- Runbook step 5 added (`docs/WEEKLY-RUNBOOK.md`).
- Not changed: re-resolving a week that is already closed does not recompute
  its prizes (correct mistakes by hand if one ever happens).

## Plan: close week 43 together, Sun 25 Oct evening (before 00:00 UTC)

Last kickoffs Sun 25 Oct 14:00 UTC. Fill the answers from ESPN, then one call
resolves, closes and awards the Stars:

```
bash scripts/betty-admin.sh resolve 2026_43 \
  9d0d2df3-6bad-4399-befd-ff57faec360e=H:A \   # Bayern vs Arsenal, exact score (Bayern home)
  ba6e65e5-05a9-4316-ab17-8cd5812555f5=Yes|No \ # Haaland scores at Villa Park?
  2779b191-2bcf-4c01-9291-a0c7f22e57aa=Yes|No \ # Coventry beat Fulham? (draw = No)
  495005c0-8eba-4e67-ae8e-7db7a77e3d0a=Home|Away|Nobody \ # Chelsea vs Spurs, first scorer (Chelsea home)
  dcdbf7a1-200e-4e84-8736-f46f80776707=Over|Under \ # Liverpool vs Brighton, 2.5 goals
  e9d74fae-265d-40dd-ac58-b7a7ff4dfbd9=Yes|No     # Man Utd beat Bournemouth? (draw = No)
```
Then send the Stars and mark them with `paid 2026_43 <rank>`.

## Content for week 43 (Bayern vs Arsenal, Wed 21 Oct 19:00 UTC / 21:00 CEST)

Facts checked: Arsenal 3–1 Bayern at the Emirates, Champions League league phase,
26 Nov 2025 ("last November"); 2024 quarter-final Bayern won (2–2 London, 1–0
Munich). Player names left out on purpose (check line-ups if added).

### Video subtitles (owner's Bayern–Arsenal video)

Long (~30 s): Last November, the Gunners blew Bayern away. / Arsenal 3, Bayern 1 at
the Emirates. 💥 / But Munich is a different story… / In 2024, Bayern knocked
Arsenal out right here. / Allianz Arena. Champions League night. 🏟️ / Can the
Gooners do it again on Bayern's turf? / Or will Bayern take their revenge? 🔴 /
Wednesday, 21 October. 21:00 CET. / Predict the exact score in Betty Scores. /
Get it right and take 3 points! 🎯 / 👉 t.me/bettyscores_bot/app

Short (~15 s): 3–1. The Gooners smashed Bayern last November. / Now it's Bayern's
turn, at home. / Allianz Arena. Wednesday. ⚔️ / Who wins this time? / Call the
exact score, win 3 points. / Betty Scores 👉 t.me/bettyscores_bot/app

Extra lines: "The cannon fires in Munich 💣" · "Fortress Allianz… or Arsenal's
playground?" · "Red vs Red. Only one survives. 🔴⚪" · "Last time: 3–1 Arsenal.
This time: ? : ?"

### Channel post: week 43 is open

🔥 WEEK 43 IS OPEN! 🔥 Six matches, six questions, real Stars ⭐ — Bayern vs Arsenal
(exact score, 3 pts), Haaland at Villa Park, Coventry vs Fulham ("the Sky Blues
against the only winless team" — check the table first), Chelsea vs Spurs first
scorer (3 pts), Liverpool vs Brighton over/under 2.5, Man Utd vs Bournemouth.
Week 42 champion Th7Tezar, 100 ⭐ paid. "Every prize so far has been paid" (or,
precisely: "to every winner who claimed them" — "........" has not yet).
Link t.me/bettyscores_bot/app.

### Channel teaser: "Arsenal won big last November. Will Bayern take revenge?"

1. ⚔️ Arsenal won big last November: 3–1 at the Emirates. Will Bayern take their
   revenge at the Allianz? 🔴 · Wednesday, 21:00 CET · exact score = 3 points · link
2. 💥 3–1 to Arsenal last November. 🏟️ Now Bayern are at home. Revenge, or another
   Gunners night? 🤔 Call the exact score 👉 link
3. 🔴 Bayern or ⚪🔴 Arsenal? … 👇 Your score in the comments, then lock it in
   Betty for 3 points! (only if channel comments are on)

Best image: the `BAY_ARS` sticker or the owner's video.
