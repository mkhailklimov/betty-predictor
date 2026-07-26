# Betty Scores v2.0 — release plan

**Status: PLANNED.** Development starts the week of **2026-07-27**. Nothing in
this document has been built yet. Written 2026-07-23, after the WC2026
close-out.

---

## 1. Why v2.0

v1 was built for exactly one thing: a single fixed-length tournament. That
shipped and finished — 48/48 matches scored, champion crowned
(`docs/TOURNAMENT-CLOSEOUT.md`, `CHANGELOG-2026-07-20.md`). What's left is an
app with no fixtures to serve and three structural limits baked in:

- **Fixtures are hardcoded in the frontend.** `frontend/src/data/matches.ts`
  carries five `WEEK*_MATCHES` arrays and a static `WEEKS` table with
  hand-written rollover timestamps. A new week means a code change and a deploy.
- **The app is Telegram-only.** `OutsideTelegramScreen` blocks every browser
  visit to `app.bettyscores.com` — our one canonical link — with "Betty Scores
  lives in Telegram". Anyone arriving from outside Telegram cannot play.
- **Prizes are GRAM/TON**, tied to a payout path nobody ever used: zero of 15
  users ever connected a wallet.

v2.0 makes Betty a **perpetual weekly game**: 10 curated top football events
every Mon–Sun, a two-reel score input, a real web presence open to YouTube and
TikTok traffic, and Telegram Stars prizes.

---

## 2. What changes

### 2.1 Weekly cadence (was: one World Cup)

10 matches per week drawn from the top football events — English Premier League
and other European leagues, MLS, Champions League, national teams, women's
football. The week runs **Monday 00:00 UTC → Sunday 23:59 UTC**, and the next
week's fixtures publish **Monday at 00:00**.

`week_id` keeps the existing `YYYY_WW` format (`2026_31`), so WC2026 history
stays continuous with v2 weeks.

### 2.2 Two-reel score input (was: 1/X/2 buttons + a score grid)

The prediction UI becomes **two spinning reels, 0–12**. The two reel values are
the whole bet; the outcome is *derived* (`h > a → 1`, `h == a → X`, `h < a → 2`).

**A match counts as predicted only once a reel is moved.** An untouched 0:0 is
not a bet — nobody is silently entered at 0:0. This matters beyond the UI: a
`users` row already means "opened the app once", so auto-entering untouched
matches would destroy the one engagement signal that distinguishes a real player
from a bounce.

### 2.3 One link (was: two sites plus a Telegram wall)

**`app.bettyscores.com` is the only link.** Matches, Leaderboard, Champions and
About all live there as real, linkable URLs. `bettyscores.com` redirects to it.

### 2.4 Open to web traffic (was: Telegram-only)

Viewers arriving from YouTube and TikTok can play without leaving the browser —
Telegram Login Widget for a real account, guest play for everyone else.

### 2.5 Stars prizes (was: GRAM/TON)

**100★ for 1st place and 50★ for 2nd, every week.** GRAM and TON come out of all
player-facing copy.

---

## 3. Locked decisions

Agreed with the product owner on 2026-07-23, after reading the v1 code.

| # | Decision |
|---|---|
| 1 | **Fixtures:** feeds → `bronze_*` in D1 → sheet `Candidates` (auto sink) → **a human picks 10** in sheet `Fixtures` → Monday 00:00 cron → D1 `matches` → `/api/matches`. The sheet **curates**; D1 **serves**. |
| 2 | **Reels only.** Outcome derived from the two values. Touch-to-bet; untouched 0:0 is not a prediction. |
| 3 | **One link**, `app.bettyscores.com`, with real routes per page. |
| 4 | **Telegram Login Widget + guest fallback**, guest merging into a real account on later login. |
| 5 | **100★/50★ weekly**, computed and displayed as `owed`/`paid`, **delivered manually**. |

### 3.1 Why the sheet curates but does not serve

The natural-looking flow is `feeds → database → Betty_Master_Data → app`. We
deliberately do **not** do that, because it puts Google Sheets on the read path
of every app load:

- **Quota.** Each load would need an OAuth token exchange plus a Sheets read,
  against a ~60-reads/min/project ceiling — precisely the wrong ceiling for a
  TikTok traffic spike.
- **No joins.** The kickoff lockout in `POST /api/predictions`
  (`cf-worker/src/worker.js:~230`) validates each bet against `matches`
  transactionally. Fixtures in a sheet would mean a network hop to Google per
  bet.
- **Sheets is not a datamart.** No indexes, no atomicity, no types.
- **Hand-editable production dependency.** A stray sort mid-week becomes an
  outage instead of a recoverable bad load.

The codebase already takes this position: the Champions and Leaderboard tabs are
documented sinks — *"These tabs are SINKS — never read back as a source"*
(`worker.js:1071`) — and the only tab read as a source is `Adjustments`
(`worker.js:685`), a small human-input tab. v2 follows the same rule.

The sheet stays in the loop for the part that genuinely needs a human and where
a spreadsheet is the best available tool: **"top 10 events" is an editorial
judgement no API ranks for you.**

```
   ESPN / FIFA / league feeds
             │  cron, automatic
             ▼
      bronze_* in D1                 all candidate fixtures for Mon–Sun
             │  cron writes
             ▼
   Betty_Master_Data
     ├─ "Candidates"  (sink, auto)
     └─ "Fixtures"    (source, human picks the 10)
             │  Monday 00:00 cron reads
             ▼
       D1 `matches`                   system of record
             │  /api/matches
             ▼
     app.bettyscores.com
```

---

## 4. Rollback strategy

Designed first, not last. Three independently reversible layers, plus one hard
constraint that makes the whole thing work.

### 4.1 The constraint: all D1 migrations are ADDITIVE ONLY

New tables and new **nullable** columns. No drops, no renames, no type changes,
no backfill that rewrites existing values.

This is what lets a rolled-back v1 Worker keep running against a v2 database —
v1 simply ignores columns it doesn't know about. Violating it turns a one-command
rollback into a restore-from-backup. Everything else in this section depends on
it holding.

### 4.2 The layers

| Layer | Roll forward | Roll back |
|---|---|---|
| Frontend (`betty-scores-app` Pages, git-built from `main`) | merge to `main`, push | CF Pages → "Rollback to this deployment" on the v1 deployment below, or `git revert` the merge |
| Worker (`betty-api`) | `wrangler deploy` | `wrangler rollback 26f32105-20c0-41d8-ace3-e45c3b2bdc1a` |
| D1 | additive migrations | nothing to undo — v1 code ignores the new objects |
| Crons | new schedules in `wrangler.toml` | reverted with the Worker rollback; crons are part of the deploy |

### 4.3 Recorded v1 anchors (captured 2026-07-23)

- **Git tag:** `prod-v1-final` → `499bd00` (`main` and `dev` were identical)
- **Worker `betty-api` version:** `26f32105-20c0-41d8-ace3-e45c3b2bdc1a` (2026-07-20T17:48Z)
- **Pages `betty-scores-app` production deployment:** `a79f87cd-c808-49ac-85f8-05ee0c5d89eb` (source `499bd00`)

### 4.4 Preparation before any v2 code ships

1. Tag and push `prod-v1-final` — **done as part of this document's commit.**
2. Record the Worker version and Pages deployment IDs — **done, §4.3.**
3. **Separate dev and prod at the UI layer only — the backend stays shared.**
   **Decided 2026-07-26, superseding this document's original call for a
   `betty-db-dev` D1.** Betty has a single source of truth (the curation sheet)
   and no large data volumes, so a second database buys isolation the project
   does not otherwise need.

   The split already exists and needs no work:

   | Layer | dev | prod |
   |---|---|---|
   | Frontend | `dev.betty-scores-app.pages.dev` (auto-built from `dev`) | `app.bettyscores.com` (built from `main`) |
   | Worker | `betty-api-dev.mihel-klimm.workers.dev` | `api.bettyscores.com` |
   | D1 | `betty-db` | `betty-db` — **same database** |

   Routing is by hostname in `frontend/src/services/api.ts` (`*.pages.dev` →
   dev Worker), so a `dev` push reaches the dev API with no env var.

   **The cost of this choice, and the guardrail.** v1 tolerated a shared DB
   because dev was read-only probes. v2 dev testing *writes* — fixtures, guest
   users, prize rows — into the tables serving live users. Isolation therefore
   has to come from **disposable keys instead of a separate database**:

   - **Fixtures.** Publish dev test weeks under a reserved `week_id` (e.g.
     `2026_99` and up), never a real one. The §8 "break it four ways" tests are
     safe only if the week being broken is a throwaway.
   - **Week rollover.** The `DEBUG_TIME` drill writes `owed` prize rows. Run it
     against a reserved week so the rows can be deleted without touching real
     prize history.
   - **Identity.** Guest and merge tests create `users` rows and `merged_into`
     tombstones. Use reserved test identities, not live ones.
   - **Clean-up is manual.** Nothing garbage-collects a reserved week; delete it
     when the test is done.

   Anything that cannot be scoped to a disposable key does not get tested on
   dev — it gets tested on a local `wrangler dev --local` SQLite instead.
4. Branch `v2` off `dev`. Ship dev → prod, per the standing dev-first rule.

---

## 5. Workstreams

### 5.1 Fixture pipeline

**Schema** — `cf-worker/migrations/0004_v2_fixtures.sql`, additive:

- `bronze_fixtures(source, source_id, league, league_name, kickoff_utc, home_team, away_team, home_code, away_code, home_crest, away_crest, status, fetched_at)`, PK `(source, source_id)`
- `weeks(week_id PK, starts_at, ends_at, status, published_at)`
- `matches` gains nullable `league`, `source`, `source_id`, `crest_home`,
  `crest_away`, `code_home`, `code_away` — the crests and codes carry the feed's
  art through to the card, which is what makes club football renderable at all

**Ingestion** — new `ingestFixtures(env)` in `cf-worker/src/worker.js`, modelled
on the existing `ingestFifaResults` (`worker.js:990`) and landing in bronze the
same way. Pulls a `LEAGUES` const across ESPN's public soccer scoreboard
endpoints (EPL, top European leagues, UCL, MLS, national-team competitions,
women's). `FIFA_COMPETITION`/`FIFA_SEASON` are World-Cup-specific and remain only
for legacy results reconciliation.

> **Verify each league endpoint returns data before fixing the list.** These
> endpoints are public but undocumented, and women's coverage is the least
> certain.

**Sheet contract** — reusing `getGoogleAccessToken` and `sheetsFetch`:

| Tab | Direction | Columns |
|---|---|---|
| `Candidates` | **sink**, rewritten by cron | `Week ID \| Source ID \| League \| Kickoff UTC \| Home \| Away` |
| `Fixtures` | **source**, human-edited | same columns, 10 rows per week |

`publishWeekFromSheet(env, {dryRun})` mirrors `syncAdjustmentsFromSheet`
(`worker.js:685`) exactly, including its `dryRun` affordance.

**Publish guards — refuse to publish, keep the previous week live, and log
loudly if:**

- the target week has ≠ 10 rows
- any `source_id` is duplicated, or unknown to bronze
- any kickoff falls outside the Mon–Sun window
- any kickoff is already in the past

A partial week must never replace a good one. A broken sheet on Monday morning
would otherwise empty the app for every player.

**Frontend** — `frontend/src/data/matches.ts` loses `WEEK1..WEEK5_MATCHES`,
`WEEKS`, `resolveWeeks`, `ACTIVE_MATCHES` and `ALL_SCORES` (~500 lines deleted).
Keep `isMatchLocked`, `getNow`/`DEBUG_TIME`, and the card/flag helpers
(`getCardImage`, `getLocalFlag`, `flagToTwemojiUrl`). New `GET
/api/weeks/current` and `/api/weeks/next` feed `MainPage`.

`MainPage.toBackendMatchId()` (numeric `1..N` → `match-N`) disappears — match ids
now arrive from the API as strings. Bump `STORAGE_KEY` to
`betty_predictions_v3`, keyed by string id, so v1's numeric localStorage can't be
misread.

**Done 2026-07-26.** `matches.ts` went from 622 lines to 121: the five
`WEEK*_MATCHES` blocks, `WEEKS`, `resolveWeeks`, `ACTIVE_MATCHES`,
`ACTIVE_WEEK_LABEL` and `flagToTwemojiUrl` are gone; `getNow`/`DEBUG_TIME`,
`isMatchLocked`, `TEAM_CARDS` and the card/flag helpers stayed, joined by
`toMatchData`/`toWeekMatches` (API row → view model) and `formatKickoff`.

Three consequences worth knowing:

- **Team art is a three-step fallback** — our card PNG (national teams) → local
  flag SVG → the feed crest → team initials. `flagToTwemojiUrl` had no input to
  work from any more: it took a flag *emoji*, which only existed because every
  fixture was hand-written with one. Club teams have no emoji, so the crest
  replaces it.
- **Dates are localised.** v1 hardcoded US-Eastern strings ("Thu, June 11 · 9:00
  PM ET") because every World Cup match was in North America. A global weekly
  game can't, so `formatKickoff` renders in the viewer's own timezone.
- **The card's context line is now the competition**, not `Group A` / `Round of
  16` — a week spans many competitions and no longer has a bracket.

`MainPage` also grew three states it never needed while fixtures were compiled
into the bundle: loading, load-failed (with retry), and **a published week with
no fixtures** — which is normal, not an error, when Monday's publish hasn't run.
It says so plainly instead of rendering an empty card stack.

### 5.2 Two-reel input

**Done 2026-07-26.** New `frontend/src/components/ScoreReels.tsx` +
`styles/ScoreReels.css`. `MatchCard.tsx` dropped the 1/X/2 button row and the
`ALL_SCORES` grid, and the ~14 now-dead CSS rules that styled them went with it.

- Two independent reels, 0–12, 13 stops each. CSS scroll-snap for touch, plus
  ▲/▼ buttons for desktop and accessibility.
- Per-match `touched` flag — nothing is POSTed until the first reel movement.
- Outcome derived on the client, sent as `prediction_type`.

**The `POST /api/predictions` contract is deliberately unchanged**:
`{match_id, prediction_type, predicted_score:{home,away}}`. A v2 bet is therefore
readable by a rolled-back v1 Worker — this is load-bearing for §4.
`scoreBet()` (`worker.js:35`) is untouched: 1 pt outcome, 3 pts exact.

Implementation notes worth keeping:

- **`touched` is separate state, not derived from the displayed value.** The
  reels always show *some* scoreline, and `0:0` is both the resting position and
  a legitimate prediction — so "has this player bet?" cannot be read off the
  reels. It seeds from a saved bet on mount so a returning player sees their bet
  as placed, and an untouched card renders dimmed with "Spin both reels".
- **`.reel__window` needs `position: relative`.** Centring a stop uses
  `stop.offsetTop`, measured against the nearest *positioned* ancestor; without
  it every reel scrolls to the wrong place. It looks like cosmetic CSS and is not.
- Scroll-snap fires no "snapped" event, so the reel settles on a 120 ms idle
  window and reads the stop nearest the centre line. Programmatic scrolls set a
  flag first, or the smooth-scroll animation reports its intermediate stops as
  user choices.
- The ▲/▼ buttons and `role="spinbutton"` + arrow keys are not decoration:
  scroll-snap alone is unreachable by keyboard and overshoots on a trackpad.
- An **outcome-only bet is no longer reachable** from the UI — every reel move
  sends a complete scoreline. v1 bets that have one still score on the outcome
  alone, since `scoreBet()` is unchanged.

> **Open:** 0–12 reels widen the exact-score space from v1's ~30 curated
> scorelines to 169 combinations, so exact hits get materially rarer and 3 pts
> may under-reward them. Left unchanged for launch; revisit after real data.

### 5.3 Web identity

**Worker** — `resolveTgId` (`worker.js:645`) gains two branches beside `tma`:

- `tgauth <payload>` → new `verifyLoginWidget()`. The Login Widget uses a
  **different key derivation from initData**: secret is `SHA256(bot_token)`, not
  `HMAC('WebAppData', bot_token)`. Data-check-string is sorted `k=v` joined by
  `\n`; reject an `auth_date` older than 24h. Reuses the existing `hmacSha256`,
  `toHex` and `timingSafeEqual` helpers.
- `guest <token>` → resolves an opaque server-issued token.

**Schema** — `0005_v2_identity.sql`, additive: `users` gains `auth_source`
(`miniapp` | `widget` | `guest`), `guest_token` (unique), `merged_into`,
`ref_source`.

**Guest flow** — `POST /api/user/guest` mints `tg_id = 'guest:<uuid>'` plus an
opaque token held in localStorage. Guests play and appear on the leaderboard but
are **prize-ineligible until they log in** — they have no Telegram account that
can receive Stars. The UI must say so plainly, rather than letting someone win
and then discover they cannot be paid.

**Merge** — `POST /api/user/merge` moves a guest's predictions onto the real
account on first Telegram login, sets `merged_into`, and leaves the guest row as
a tombstone. Conflict rule: an existing bet on the real account wins.
`rebuildMarts` (`worker.js:811`) **must exclude `merged_into IS NOT NULL`**, or a
merged user is double-counted on the leaderboard.

**Frontend** — `OutsideTelegramScreen` stops being a wall and becomes the web
entry point: "Log in with Telegram" widget plus "Play as guest".

**Attribution** — capture `?ref=` / UTM on first load into `users.ref_source`.
Small, and it is the only way to answer "did YouTube actually work" — a question
v1 had no way to answer.

### 5.4 The site around the one link

- `Navigation.tsx` gains a fourth tab, **About**. `AboutPage.tsx` already exists
  but is unrouted and still describes TON rewards — rewrite for v2 (weekly
  cadence, reels, Stars, rules).
- **Real URLs.** `App.tsx` currently holds page state in `useState` with no URL,
  so nothing is linkable. Add History API routing for `/`, `/matches`,
  `/leaderboard`, `/champions`, `/about` — a small hook, no router dependency —
  plus a Pages SPA fallback. A TikTok bio link must be able to point at a
  specific page.
- `bettyscores.com` and `www` (the separate `betty-scores` Pages project) get a
  301 `_redirects` to `app.bettyscores.com`, so there is genuinely one link.
- OG / Twitter card meta and a preview image, so the link renders as a card
  wherever it is pasted.

### 5.5 Stars prizes

- **Schema** — `0006_v2_prizes.sql`:
  `weekly_prizes(week_id, rank, user_id, stars, status, awarded_at, paid_at, note)`,
  status `owed` | `paid` | `void`. `ton_wallet` and `POST /api/user/wallet` stay
  in place, dormant and hidden — additive-only means no drops.
- `closeWeek()` runs Monday 00:00 **before** the new week publishes: reads that
  week's `gold_champions`, writes 1st = 100★ / 2nd = 50★ as `owed`, skipping
  prize-ineligible guests.
  **Tie rule:** equal points → earlier last-bet timestamp wins (`Last Bet At` is
  already in `CHAMP_HEADER`).
- Leaderboard and Champions surface the prize and its `owed`/`paid` state.
- `POST /api/admin/prizes/:week/paid` marks delivery, guarded by `ADMIN_TOKEN`
  like the other admin routes.
- `weekly_prizes` mirrors to a `Prizes` sheet tab (sink) in the weekly export.
- Purge GRAM/TON copy from `LeaderboardPage.tsx`, `AboutPage.tsx` and
  `OutsideTelegramScreen.tsx`.

**Why delivery is manual:** the Bot API has no "send Stars to a user". A bot
*receives* Stars via invoices, and can only push value out as a Gift the
recipient converts. Automating payout would need a funded bot Stars balance,
gift prices that map cleanly onto 100/50, and a failure path when a recipient
cannot receive gifts. Out of scope for 2.0.

### 5.6 Cron reshape

This supersedes the outstanding v1 item *"turn the hourly cron down"* — the crons
get repurposed rather than switched off.

```
0 0 * * MON   closeWeek() → award prizes → publishWeekFromSheet()
0 3 * * *     ingestFixtures() + results → refresh Candidates tab
0 * * * *     match status (live/finished) + reconcileResults + rebuildMarts
0 6 * * FRI   sheet mirrors: Users / Bets / Marts / Prizes
```

> `scheduled()` (`worker.js:56`) dispatches on the literal `event.cron` string.
> Cloudflare echoes the schedule back **verbatim** as declared in
> `wrangler.toml`, and matching only one day-of-week form once silently routed
> the weekly job into the hourly branch — that shipped, and the weekly sync never
> ran. **Every new schedule must accept both the `MON` and `1` forms.**

---

## 6. Sequencing

1. ~~Rollback prep — tag, record IDs, branch `v2` (no `betty-db-dev`; §4.4.3)~~ **DONE**
2. ~~Migration 0004, fixture ingestion, `publishWeekFromSheet` (dry-run first)~~
   **DONE 2026-07-26 — shipped to dev, all §8 fixture checks pass.** Migrations
   0005 (identity) and 0006 (prizes) move to their own workstreams below.
3. ~~`/api/weeks/*`, frontend cut over to API-driven fixtures~~ **DONE 2026-07-26.**
   Preview: `v2.betty-scores-app.pages.dev` (a `.pages.dev` host, so it routes to
   `betty-api-dev` automatically).
4. ~~Reels UI~~ **DONE 2026-07-26** (built + deployed to the v2 preview; the
   in-Telegram check in §8 still needs a real client)
5. Identity — widget + guest + merge (needs `/setdomain`, §7)
6. Site — routing, About, redirects, OG cards
7. Prizes + cron reshape
8. Dev E2E → prod

---

## 7. Open items

- **BotFather `/setdomain`** for `app.bettyscores.com` — a browser action on the
  product owner's side. Blocks widget login entirely.
- ~~**ESPN league endpoint coverage**~~ — **RESOLVED 2026-07-26.** All 32 slugs
  in `LEAGUES` were probed live and return real events in an in-season window;
  a 21-day pull landed 378 fixtures with zero failures. Rejected as non-existent:
  `sau.1` (the Saudi league is `ksa.1`), `ger.w.1`, `mex.w.1`, `ukr.1`, `kor.1`.
  Women's coverage is real — NWSL, WSL, Liga F, Première Ligue, A-League Women,
  UWCL — but ESPN loads new-season women's calendars late, so an empty pull is
  usually the calendar, not the slug.
  **A bad slug returns HTTP 200 with an empty body**, so a typo degrades silently
  into "that league just has no games". `ingestFixtures` therefore reports any
  slug the feed doesn't name back in its `failed` list.
- ~~**Club crests**~~ — **RESOLVED at the data layer 2026-07-26.** The ESPN feed
  carries a logo URL per competitor; `bronze_fixtures.home_crest`/`away_crest`
  and `matches.crest_home`/`crest_away` carry it through to the served match.
  Every one of the 10 published launch-week fixtures has both crests. The
  frontend still has to *render* them instead of `TEAM_CARDS` (§5.1).
- **Off-season reality check.** The launch week (`2026_31`, Jul 27 – Aug 2) has
  99 candidate fixtures, but **none from the European top five** — they are still
  in pre-season. The week is carried by MLS, Liga MX, Brasileirão, Argentina,
  Colombia, Chile, NWSL and Sudamericana. Curation has to work with that, and the
  About copy should not promise Premier League football in July.
- **Exact-score reward** at 169 reel combinations (§5.2) — revisit after a few
  weeks of real data.
- **Stars delivery stays manual** by decision; if it later needs automating,
  Gifts are the only push mechanism.

---

## 8. Verification

**Fixtures.** `POST /api/admin/publish-week?dry=1` against a hand-filled
`Fixtures` tab. Then deliberately break it four ways — 9 rows, a past kickoff, a
duplicate `source_id`, a kickoff outside the week — and confirm each is refused
*and* that the previously published week is still served by
`/api/weeks/current`.

**Reels.** In a real Telegram client on dev: open a match, confirm no prediction
row exists before touching a reel, move one reel, confirm a row appears with the
derived outcome. Check 2:1 → `1`, 1:1 → `X`, 0:3 → `2`, and that a 12:12 extreme
saves.

**Identity.** From a desktop browser with no Telegram app: guest play →
predictions saved → log in with the widget → predictions merged, no duplicate
leaderboard row, `merged_into` set on the tombstone. Separately confirm a forged
`tgauth` payload (tampered hash, and a 48h-old `auth_date`) is rejected 401.

**Week rollover.** Point `DEBUG_TIME` at a Sunday 23:55 on dev and step past
Monday 00:00; confirm prizes are written `owed` for the closing week *before* the
new week's matches appear.

**Rollback drill — run this on dev before prod, not after an incident.** Deploy
v2, then `wrangler rollback 26f32105-20c0-41d8-ace3-e45c3b2bdc1a`, and confirm
the v1 Worker still serves `/api/leaderboard` and still accepts a prediction
against the v2 schema. That single test proves the additive-only constraint held.

**Prod.** Deploy, verify one real reel bet end-to-end from the Mini App and one
from the browser, then re-run the close-out checks (`/api/champions`,
`/api/leaderboard`) to confirm the WC2026 history is intact.
