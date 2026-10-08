# Changelog — April 23, 2026

## Summary

Follow-up day on Week 2 (2026_25) dev instance. Closed the three loose ends from the 04-22 test pass: missing flags for 5 cardless teams, then the actual card PNGs once the user uploaded them to Drive, then a TG WebView caching issue that made the new assets appear stale. Prod (`main`) untouched throughout.

---

## Dev ↔ Prod isolation (unchanged, reconfirmed)

All work committed on branch `dev`. `main` not touched. Runtime host-switch in `matches.ts` and `api.ts` continues to route `app.bettyscores.com` to Week 1 + prod Worker, everything else to Week 2 + dev Worker. D1 still shared; match IDs 11–20 keep dev predictions separate from prod's 1–10.

---

## Fix 1 — Local SVG flag fallback (`fa5a993`)

User reported CZE, SWZ, QAT, AUS, POR still had no flag at all in the dev preview. The Twemoji jsdelivr CDN fallback added on 04-22 was evidently being blocked (likely TG WebView network policy) — so the 5 cardless teams fell through both the card lookup and the CDN lookup.

**Fix:** downloaded the 5 SVGs from Twemoji 14.0.2 locally, committed to `frontend/public/teams/Flags/`, added `getLocalFlag(code)` lookup in `matches.ts`, and wired `MatchCard.tsx` to prefer local SVG over the CDN URL. Same-origin assets always load.

Files:
- `frontend/public/teams/Flags/{CZE,SWZ,QAT,AUS,POR}.svg` — new
- `frontend/src/data/matches.ts` — `LOCAL_FLAGS` map + `getLocalFlag()`
- `frontend/src/components/MatchCard.tsx` — use `getLocalFlag() || flagToTwemojiUrl()`

---

## Fix 2 — Sync 5 missing cards from Drive (`ad60d8c`)

User then pointed out: the Matches sheet (columns I "Card Name Home" / J "Card Name Away") asks for CZE.png, SWZ.png, QAT.png, AUS.png, POR.png — flags are not the intended asset. Verified against the Drive folder `1sjPxdO9gP3wGili0BCBycmsxr9zGYlUt`: only 26 cards there, those 5 names genuinely missing. User uploaded the 5 PNGs to Drive; I re-ran the SA-based sync script (`drive.readonly` scope), pulled them into `frontend/public/teams/Cards/`, and registered the codes in `TEAM_CARDS`.

`TEAM_CARDS` now covers 31 codes (all Week-1 + all Week-2 teams):
ALG ARG AUS BIH BRA CAN CRO CUR CVE CZE ENG ESP FRA GER JAP KOR MEX MOR NED NOR PAR POR QAT SAF SCO SEN SWE SWZ TUR USA UZB.

The local SVG flag fallback from Fix 1 stays in code as defense-in-depth for any future team that arrives before its card does.

---

## Fix 3 — Cache-bust card PNGs (`e1d49c7`)

After Fix 2 deployed, user reported CZE/SWZ/QAT/POR still showed flags and MOR showed an old card. Verified via `curl -I` against the new CF Pages preview: correct fresh bytes were being served (new etags). The stale images were TG WebView / browser cache holding onto the previous responses for same-filename public assets (Vite fingerprints JS/CSS but not `public/` files).

**Fix:** added `CARD_ASSETS_VERSION = '3'` constant in `matches.ts`, appended as `?v=3` query string to every card URL. Any future card refresh just bumps the constant to invalidate caches at deploy time.

---

## Commits on `dev`

```
fa5a993 Bundle local SVG flags for cardless teams
ad60d8c Sync remaining 5 team cards from Drive (CZE, SWZ, QAT, AUS, POR)
e1d49c7 Cache-bust card PNGs via version query string
```

All pushed to `origin/dev`. `main` untouched.

Latest CF Pages preview for dev tip:
- Stable alias: https://dev.betty-scores-app.pages.dev
- Per-commit: https://<first-8-of-deployment-id>.betty-scores-app.pages.dev

---

## Open items / next session

1. Final verification pass in TG dev bot after full WebApp cache reset — all 20 Week-2 cards + betting flow + end-screen.
2. Point dev bot `@betty_worldcup2026_bot` menu URL at the stable `dev.betty-scores-app.pages.dev` alias (still ad-hoc preview hashes).
3. Run `pngquant`/`oxipng` on all card PNGs (~2 MB each) before Week-1 → Week-2 switchover to cut bandwidth.
4. Consider dev-only D1 database to eliminate the shared-DB constraint (carried forward).
5. Changelog / `.md` staleness sweep (still deferred from 04-19 / 04-21 / 04-22).
6. Rotate Cloudflare API token `cfut_…758700e5` (carried from 04-21).
