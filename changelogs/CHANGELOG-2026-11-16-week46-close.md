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
