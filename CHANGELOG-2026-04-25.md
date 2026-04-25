# Changelog — 2026-04-25

Session pushed Betty toward Telegram-catalog readiness: refreshed prod card visuals, published full prize/Privacy rules on the landing site, dropped Telegram name collection, and worked through whether/where to integrate TON. Touched both branches; isolation preserved.

## Card visuals refresh (dev → prod)

User reported all team cards on `app.bettyscores.com` were stale. Sourced canonical PNGs from the Drive folder `1sjPxdO9gP3wGili0BCBycmsxr9zGYlUt` via the `betty-sheets-sync@betty-games.iam.gserviceaccount.com` SA (script at `/tmp/betty_cards_sync.py`).

- **Dev (`e51514f`)**: 11 PNGs differed from local (ALG, ENG, ARG, CRO, CVE, FRA, JAP, GER, ESP, CUR, BRA), 20 already matched. Synced + bumped `CARD_ASSETS_VERSION` `'4'` → `'5'`.
- **Prod (`c4a6b75`)**: 20 PNGs differed, 11 were entirely new. Synced all 31. Also added the cache-bust mechanism (`CARD_ASSETS_VERSION = '1'` query string in `getCardImage`) — without it, replacing the PNGs alone wouldn't have flushed TG WebView caches. User confirmed Week 1 cards look correct.

Standing TODO: pngquant/oxipng compression pass before next deploy (some PNGs >2.5 MB).

## Prize rules + Privacy on landing site

User pivoted from "@tApps_bot catalog" to defining the prize program first. Final structure: free-to-enter, skill-based, 1 TON per matchweek to single top predictor, deterministic tiebreaks (last-submission timestamp → lowest TG user ID).

Iterated through several drafts of the About section in `deploy/index.html`:

- **`8d771c3`**: First publish — full Terms with one-account-per-player, disputes clause, "matchday" terminology.
- **`e30e986`**: User feedback corrections — "matchday" → "matchweek", removed one-account rule (multi-accounts now allowed; user explicitly does not want to police), removed disputes clause (free entry → no formal dispute process).
- **`6626451`**: Standalone `#privacy` Privacy Policy section + footer link.
- **`5b75709`**: Hash-routing fix — `showSection()` only fired on nav clicks, so `bettyscores.com/#privacy` (and any deep link) just showed Home. Added `DOMContentLoaded` + `hashchange` listeners that read `location.hash` and activate the matching section.
- **`1b056fc`**: User decided not to need a separate Privacy page — folded it back into About as a single paragraph; dropped footer link.
- **`90c4593`** (final): Renamed the About sub-block "Privacy" → "Privacy Policy"; explicitly removed first/last-name collection from the privacy text *and* from the codebase (frontend `App.tsx`, `services/api.ts`, `types/index.ts`, worker `register` handler). DB schema only ever stored `username` so no migration required. `LeaderboardEntry.first_name` field was already legacy/unused — renamed to `username` to match what the worker actually returns.

All five mirrored to `main`. Privacy Policy URL for BotFather is now `https://bettyscores.com/#about`.

## "world football" positioning (partial)

User wants to keep Betty evergreen — after WC 2026, continue with top world football matches. BotFather copy drafted in `world football` framing (About text 95 chars, Description 437 chars, slash-command list). Landing site's `<title>`, meta description, hero copy still say "World Cup 2026" — explicit user decision to keep until WC ends, then sweep.

## TON / catalog strategy

- **`@tApps_bot` rejected**: Telegram Apps Center requires TON Blockchain integration + TON Connect SDK + TG Mini Apps Analytics SDK. Betty has none and integrating real-money TON rewards opens a regulatory layer (gambling/sweepstakes classification) that's premature for a 2-subscriber stage.
- **Free-to-enter model adopted**: removes "consideration" element from gambling test → not gambling in most jurisdictions. 1 TON (~$5) per matchweek, deterministic skill-based winner.
- **Jurisdictions discussed**: Montenegro = realistic Balkan license route if ever needed; Albania banned online gambling 2019; Serbia heavy capital requirements; Curaçao cheaper alternative outside Balkans. **Conclusion**: with free-entry + de-minimis prize, no license needed in most jurisdictions. Decision: ship free-to-enter, no entity yet.
- **Risk noted**: TON payout + recipient address becomes public on-chain (called out in Privacy Policy).
- **Discovery**: non-TON Mini App catalog landscape is thin; `@MiniAppsCatalogBot` (which I suggested earlier) is not confirmed to exist. Best path: BotFather metadata polish for in-TG search + storebot.me + tgstat + paid posts in football-adjacent channels. User is the one who decides when to do that.

## Bot username mapping (memory write)

User corrected a longstanding mistake: `@bettyscores_bot` is **prod** (Week 1, `app.bettyscores.com`), `@betty_worldcup2026_bot` is **dev** (Week 2, `dev.betty-scores-app.pages.dev`). Saved as memory `project_betty_bots.md`. The landing's "Open in Telegram" CTA in `deploy/index.html:471` already correctly links to `@bettyscores_bot/bettyscores`.

## Operational slip: `.wrangler/` cache committed

`git add -A` in `218601e` accidentally tracked `.wrangler/cache/pages.json` and `wrangler-account.json`. Files contain only the CF account ID `aa87cd3c89231449d59081e1b27e5e88` and account email — not credentials, but PII that shouldn't be in a public repo. Cleaned up:

- **`13edb43`** / **`a22cb84`** (dev / prod): `git rm --cached`, added `.wrangler/` to `.gitignore`. The repo-root entry was missing; only `cf-worker/.wrangler/` was previously ignored.
- **History still contains the values** in `218601e` / `9beb9a6`. Force-push scrub deferred — low severity, user not asked.

## Worker not yet deployed

Worker change (drop `first_name`/`last_name` from `/api/user/register`) is on `main` (`90c4593`) but **not on the live Worker**. CF Pages auto-deploys static (`deploy/`, `frontend/`); Workers need `cd cf-worker && npx wrangler deploy`. Until then, the live API will still accept those fields (DB-side already only stored `username`, so behavior is unchanged for users — but the Worker source-of-truth is now the dev-pushed branch).

## Commits

```
dev:
  e51514f  Refresh 11 team cards from Drive, bump cache-bust to v=5
  a088888  About page (Mini App): prize rules + Terms (later reverted)
  8d771c3  Landing About: publish full prize rules and winner determination
  e30e986  Landing About: matchweek, drop one-account rule + disputes
  6626451  Landing: add Privacy Policy section + footer link
  5b75709  Landing: honor URL hash on page load (#privacy, #about, ...)
  1b056fc  Landing: fold Privacy into About as a paragraph, drop standalone
  218601e  Stop collecting first/last name; rename Privacy block → Privacy Policy
  13edb43  Stop tracking .wrangler/ cache (PII leaked into prior commit)

main (mirror via cherry-pick chain):
  c4a6b75  Refresh all team cards from Drive, add cache-bust v=1
  31e07e0  Landing About: publish full prize rules and winner determination
  1a51ec0  Landing About: matchweek terminology, drop one-account/disputes
  12fa693  Landing: add Privacy Policy section + footer link
  ab84858  Landing: honor URL hash on page load
  0986f04  Landing: fold Privacy into About as a paragraph
  a22cb84  Stop tracking .wrangler/ cache
  90c4593  Stop collecting first/last name; rename Privacy block → Privacy Policy
```

## Open items

**Carried into next session:**
1. **Run `wrangler deploy`** from `cf-worker/` to push the first/last-name removal to the live API.
2. **BotFather config for `@bettyscores_bot`**: set About text, Description, slash commands, privacy URL (`https://bettyscores.com/#about`), upload botpic. Copy drafted but not yet pasted.
3. **Submit Mini App** to a non-TON directory (storebot.me / tgstat / direct channel outreach) once #2 is done.
4. **Pre-flight checks before submission**:
   - Confirm `@bettyscores_bot` menu URL = `https://app.bettyscores.com/`.
   - Verify prod cards load fresh in a clean TG WebView.
   - Take 3 phone screenshots inside TG (match list / prediction modal / leaderboard).
5. **Landing site "World Cup" → "world football" sweep**: deferred until after WC 2026.

**Older deferred (still open):**
- Compress card PNGs with pngquant/oxipng.
- Point dev bot menu URL at the stable `dev.betty-scores-app.pages.dev` alias.
- Consider dev-only D1 database (currently shared, namespaced via match IDs).
- Rotate Cloudflare API token `cfut_…758700e5`.
- Decision on whether to scrub `218601e` / `9beb9a6` from history (low severity).
