# 2026-04-28 — Betty Games studio site live + @tApps_bot status check

## @tApps_bot status
- Submission from 2026-04-26 is in moderator queue. Today = 1 business day in.
- Reported a duplicate screenshot to App Center support; got two canned replies ("we'll notice that" + a generic "attach submission details" boilerplate). Confirmed the second message is template, not a real follow-up ask.
- Plan: don't ping again before **Mon 2026-05-04** (one full business week). If still no decision then, send one short message with bot link + analytics ID + duplicate-screenshot note.
- Re-verified live submission resources: bot link 200, manifest serves correct JSON, prod bundle contains `betty_scores`, `tganalytics.xyz`, `tonconnect-manifest`, `ton-connect-zone`. All match what was submitted.

## Betty Games studio (new direction)
User confirmed Betty Scores is trial #1 of a planned **Betty Games** studio. Pipeline:
- **Betty Scores** — live (WC 2026 predictor).
- **TON Miner** — pixel mining sandbox, target Q3 2026 prod.
- **Avocado Farm** — turn-based farming strategy, target Q4 2026 prod.
- Unifying mechanic: weekly 1-TON prize via TON Connect. Same payout rails Betty Scores is shipping = reusable substrate across all titles.

Saved as memory: `project_betty_games_vision.md`.

### Strategy roadmap (verbal alignment)
- Stage 0: prove Betty Scores during WC 2026 (gate: WAU/retention/payouts on time).
- Stage 1: extract reusable platform module (TON Connect + weekly settle + leaderboard + sheets export) — parallel with late Stage 0.
- Stage 2: form studio entity, grab `bettygames.com` + `@bettygames_bot`.
- Stage 3: ship game #2. Counter-intuitive call: build **Avocado Farm before TON Miner** because turn-based is the same shape as Scores; TON Miner's real-time + economy design is 5–10× the effort.
- Stage 4: cross-game identity (one wallet, one profile, "Betty Pass").
- Stage 5: TON Miner.
- Stage 6: scale (first hire, partner devs on the rails).

## bettygames-site shipped
User: "don't wait July, start now. One roof, several pillars."

- New repo at `/home/misha/bettygames-site/` (sibling to `Ilya/`, fresh git tree).
- Single-file static site `index.html` + `betty-logo.png` + `README.md` + `.gitignore`.
- Cobalt-black + orange-gold to match Betty Scores brand. Will rebrand the studio later when 2+ games live.
- Hero with `betty-logo.png` (flagship mark across all games), tagline "A Telegram-native game studio.", slogan "Play. Compete. Win TON."
- Three pillar cards:
  - Betty Scores (`live` modifier, gold gradient hero, ⚽ emoji, Live badge, CTA → `t.me/bettyscores_bot`).
  - TON Miner (`wip` modifier, grayscale + diagonal-stripe overlay, ⛏️ emoji, "In dev · Q3 2026" badge, "Under construction" disabled CTA).
  - Avocado Farm (`wip`, 🥑 emoji, "In dev · Q4 2026" badge).
- About section: 3 short paragraphs, no fluff (no "leading studio" claims).
- Footer: `hello@bettygames.com` (placeholder mailto).
- Image generation caveat: I can't render rasters from here — used emoji + CSS-art hero blocks as placeholders. Swap in real artwork later.

## Deploy
- `wrangler pages project create bettygames --production-branch=main` → created.
- `wrangler pages deploy . --project-name=bettygames --branch=main` → live at **https://bettygames.pages.dev/** (HTTP 200).
- Preview alias `ffaab26e.bettygames.pages.dev` was 000 from this box; main alias is the real URL anyway.
- User confirmed "exactly!" on the design — accepted as-is.

## GitHub
- Created `MihelKlimm/bettygames` (private). Initial commit `a5ae59f` "Initial Betty Games studio site". Pushed to `origin/main`.

## Decisions parked
- **Domain** `bettygames.com` not registered yet — user will buy "when ready for prod". Until then `bettygames.pages.dev` is the canonical URL.
- **Studio jurisdiction** — open. Matters for legal TON payouts at scale; Estonia/UAE/Cyprus mentioned in the strategy chat as common picks. No decision made.
- **Funding model for prizes** (self-funded vs sponsors vs ads) — open.
- **`@bettygames_bot`** — recommended grabbing now while free; not done yet.

## Open caveats
- Pillar art is emoji over CSS gradients, not real game art. Visually fine for a coming-soon studio page; will look thin once games are real. Replace before any external launch.
- No analytics on bettygames-site yet (no Cloudflare Web Analytics, no Plausible). Fine for now — page has near-zero traffic. Wire up before any external promotion.
- Footer email `hello@bettygames.com` is a placeholder mailto with no inbox behind it. Need to set up forwarding once domain is registered.
