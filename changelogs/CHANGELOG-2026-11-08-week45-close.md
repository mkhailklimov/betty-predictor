# 8 Nov 2026: week 45 closed, week 46 card fix, week 47 planned

## Week 45 (2026_45) closed

Resolved with ESPN finals: 10 cards, 28 picks scored.

| Match | Result |
|---|---|
| Barcelona vs Aston Villa | 3:0 |
| Man Utd vs Roma | 3:2 |
| Fenerbahce vs Liverpool | 3:2 |
| Leipzig vs Man City | 2:3 |
| Slavia Prague vs Arsenal | 1:2 |
| Crystal Palace vs Hoffenheim | 1:1 |
| Sparta Prague vs Bournemouth | 1:3 |
| Celtic vs Besiktas | 3:2 |
| Sunderland vs Dinamo Zagreb | 0:2 |
| Getafe vs Brighton | 0:1 |

Prizes (NOT yet marked paid, wait for the owner to confirm sending):
- 1st Mishanna45 (tg 1017885628), 8 pts, 100 Stars. Tie on 8 pts won by earlier last pick (2 Nov 10:25).
- 2nd Th7Tezar (tg 8775431442), 8 pts, 50 Stars. Among the winners 4 weeks running.

8 players. Others: MikeKlimov 6 (internal), "Mihail Klimov" guest nickname 4 (likely the owner's, prize-eligible under current rules), Th7Arvin 4, TheYafiro 2 (new), Guest 0, bettyscores 0 (internal).

After sending: `bash scripts/betty-admin.sh paid 2026_45 1` and `paid 2026_45 2`.

### Promotion check
- Arvin's post 1 in @FootNiga (4 Nov) brought TheYafiro (13:37, likely Arvin's own account, name matches @yafiro) and pollllman (13:39, no picks). Both arrived before ref tracking went live.
- No `ref_source` arvin, youtube or facebook signups since 2 Nov.

## Bug fix: week 46 cards showed the slot-machine icon (545ff86, deployed)

Sheet-made cards have no linked feed match (`match_id` null), so the card never got team codes. The card now maps exact country names to codes through `nationCode()` in `frontend/src/data/avatars.ts`. Exact names only, so clubs never match a nation. Deployed 8 Nov (25bd9745).

## Club shields test (3a9957c, NOT deployed yet)

Club cards with no sticker now show both club shields, each in its own box, tilted towards the middle, lit from the top left with a shadow (`clubBadge()` + `.cc__shields` CSS). The shields are our own simple colour shields from `/avatars/clubs/`, not official crests. Week 47 tests whether players like shields instead of stickers. Needs `deploy-frontend` before week 47 shows.

## Week 47 (16 - 22 Nov) in the sheet, rows 42-51

No Champions League this week (next round 24-25 Nov). Focus on the British and Irish federations plus the EPL. Kosovo excluded on purpose (part of the audience may be from Serbia), so Ireland vs Kosovo was replaced by Bournemouth vs Forest. England and Ireland have no match this week.

| # | Kickoff (UTC) | Match | ESPN id |
|---|---|---|---|
| 1 | Mon 16 Nov 19:45 | Switzerland vs Scotland | 401861186 |
| 2 | Tue 17 Nov 19:45 | Wales vs Portugal | 401861189 |
| 3 | Tue 17 Nov 19:45 | Hungary vs Northern Ireland | 401861191 |
| 4 | Sat 21 Nov 12:30 | Man City vs Fulham | 401879233 |
| 5 | Sat 21 Nov 15:00 | Bournemouth vs Nottingham Forest | 401879238 |
| 6 | Sat 21 Nov 15:00 | Aston Villa vs Sunderland | 401878756 |
| 7 | Sat 21 Nov 15:00 | Chelsea vs Leeds | 401879236 |
| 8 | Sat 21 Nov 15:00 | Tottenham vs Ipswich | 401878754 |
| 9 | Sat 21 Nov 17:30 | Newcastle vs Arsenal | 401879232 |
| 10 | Sun 22 Nov 16:30 | Liverpool vs Man Utd | 401878755 |

All exact score, 3 pts exact / 1 pt result. Dry-run publish OK.

Missing: Hungary card. Save as `frontend/public/teams/Cards/HUN.png`, add `HUN: true` to `TEAM_CARDS`, bump `CARD_ASSETS_VERSION`, add the avatar thumbnail, deploy.

```
Square comic-style football card illustration, bold clean outlines, bright saturated colours. A footballer in Hungary's red kit with white shorts and green socks runs towards the viewer, fist pumping in celebration, number 10 on the shirt. Behind him fills the whole background: a large waving Hungarian flag, horizontal red, white and green stripes. No text, no logos, no real person's likeness.
```

## Arvin post 2 (@FootNiga, Mon 9 Nov, already paid)

Meme: England huddle seen from behind (KANE 9, BELLINGHAM 10, GORDON 18), everyone looking at the nervous keeper. Bubble: "Hey lads, who hasn't scored against them yet?" (added with PIL, file kept outside the repo).

Text under the meme:
```
How many will England score?
Pick the score - grab Stars.
t.me/bettyscores_bot/app?startapp=ref_arvin
```

Next: assess Arvin's results from Tue 10 Nov, then decide on @yafiro.

## Outreach: Kenya, Nigeria, South Africa (target channels around 1,000 subs)

Web search finds few small channels. Leads: @southafricangroupschannels (about 990 subs, SA directory), @KenyaTelegramLinks (Kenyan directory), SOCCER LIVE group (about 1,360 members), @ORLANDOPIRATESTG (fan channel, last posts 2021, check if alive). Too big: Naija Sports Hub (about 1.3M), Nigeria Football Hub (about 2.3M). Skip betting-tips channels.

Better source: TGStat search, Sport category, 500 - 3,000 subscribers, keywords Super Eagles / NPFL / Gor Mahia / Harambee Stars / Kaizer Chiefs / Sundowns / PSL / Bafana, plus club fan groups (Arsenal Kenya, FPL Naija). Check activity and views (at least 10% of subs). One tracking link per admin, e.g. `startapp=ref_ke1`.
