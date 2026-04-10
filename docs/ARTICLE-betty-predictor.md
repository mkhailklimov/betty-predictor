# How I Built a World Cup 2026 Prediction Game as a Telegram Mini App — With AI as My Co-Pilot

## TL;DR

I built **Betty Predictor** — a Telegram Mini App where users predict World Cup 2026 match scores and compete for TON cryptocurrency rewards. The entire stack runs serverless on Cloudflare (Pages + Workers + D1), with a React frontend, illustrated team cards, and a Google Sheets-based admin panel. Oh, and my co-developer? Claude AI.

---

## The Idea

World Cup 2026 is the biggest one yet — 48 teams, 104 matches, hosted across USA, Canada, and Mexico. I wanted to build something fun for my friends: predict scores, compete on leaderboards, and win real crypto.

The concept is simple:
- **Pick the winner** (Win 1 / Draw / Win 2) for each match
- **Predict the exact score** (from 0:0 to 9:0)
- **Earn points** — correct outcome = 1 point, exact score = 3 points, max 4 per match
- **Win TON** — top scorer each week takes home 1 TON

The twist? If two players tie on points, the one who placed their bets **earlier** wins. First come, first served. No procrastinating.

Meet **Betty** — our mascot, a Miniature Schnauzer with a football. Because every good project needs a good dog.

---

## Architecture: Serverless Everything

No servers were harmed in the making of this app. The entire stack runs on free-tier cloud services:

```
                    +-------------------+
                    |   Telegram Bot    |
                    | @bettyscores_bot  |
                    +--------+----------+
                             |
                    +--------v----------+
                    |  Cloudflare Pages |
                    |  React Mini App   |
                    | app.bettyscores.com|
                    +--------+----------+
                             |
                    +--------v----------+
                    | Cloudflare Workers|
                    |    REST API       |
                    | api.bettyscores.com|
                    +--------+----------+
                             |
                    +--------v----------+
                    |   Cloudflare D1   |
                    |    SQLite DB      |
                    |  5 tables, <1MB   |
                    +--------+----------+
                             |
                    +--------v----------+
                    |   Google Sheets   |
                    |  Admin + Monitor  |
                    +-------------------+
```

### Why This Stack?

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | React + Vite | Fast builds, Telegram WebApp SDK integration |
| Hosting | Cloudflare Pages | Free, auto-deploy from GitHub, custom domain |
| Backend | Cloudflare Workers | Serverless, zero cold starts, free tier |
| Database | Cloudflare D1 | SQLite at the edge, 5GB free, SQL familiar |
| Admin | Google Sheets | Non-technical admin can edit match schedules |
| Domain | bettyscores.com | $9/year on Namecheap, DNS on Cloudflare |
| Rewards | TON blockchain | Crypto-native, Telegram ecosystem fit |

**Total monthly cost: $0.76** (just the domain, prorated).

---

## Data Flow: From Google Sheet to TON Wallet

The data flows through 5 tables, from match scheduling to prize distribution:

### 1. Matches (Google Sheet → D1)

Admin fills in the match schedule in Google Sheets — teams, kickoff times, groups, venues. A sync command pushes this to D1. Each match has a lifecycle:

```
Hidden → Open (betting allowed) → Locked (kickoff) → Ended (results in)
```

### 2. Bets (D1, from Telegram App)

When a user opens the bot and taps "Play", they see match cards one at a time. Each card shows:
- Illustrated player cards with national flags
- Three outcome buttons: WIN 1 / DRAW / WIN 2
- Score grid: all valid scores where total goals ≤ 9

Selecting outcome + score auto-saves the bet. Users can change predictions until the exact kickoff moment — the backend checks UTC time and rejects late bets with a 403.

### 3. Champions (D1, computed)

After the last match of the week ends, we compute weekly standings:

```sql
SELECT user_id, 
       SUM(points_earned) as total_points,
       MAX(updated_at) as last_bet_at
FROM bets 
WHERE week_id = '2026_24'
GROUP BY user_id
ORDER BY total_points DESC, last_bet_at ASC
```

Rank 1 gets 1 TON. Simple.

### 4. Leaderboard (D1, aggregated)

All-time rankings across all weeks. Who's the ultimate predictor?

### 5. Users (D1, auto-registered)

Created automatically when someone opens the Mini App. Telegram provides the user ID, username, and profile — zero friction registration.

---

## The Telegram Mini App Experience

### Start Screen
The app opens with Betty (our schnauzer mascot), the tagline "Sniff the score — get TONn of emotions!", and a big **Start Game** button. Clean, no clutter.

### Prediction Cards
Each match is a full-screen card showing:
- **Illustrated team cards** — custom artwork with players in national jerseys on flag backgrounds
- **WIN 1 / DRAW / WIN 2** — tap to select outcome
- **Score grid** — filtered to show only scores matching your outcome pick
- **Auto-advance** — after confirming, the next card slides in

We designed the cards to feel like a card game, not a spreadsheet. Swipe through 10 matches, make your calls, done in 2 minutes.

### Kickoff Lockout
The moment a match kicks off, the card shows a red "Betting closed" badge. No grace period — if the kickoff is at 9:00 PM ET, your 9:00:01 PM bet gets rejected. We enforce this server-side, not just in the UI.

---

## Team Card Art

Every team gets a custom illustrated card — a key player in the national jersey, with the country flag as background. The art style is consistent across all 20 teams: bold, energetic, like they're celebrating a goal.

Currently we have cards for: Mexico, South Africa, Canada, Bosnia & Herzegovina, USA, Paraguay, Brazil, Morocco, Germany, and Curaçao. More coming as the tournament approaches.

The cards are stored as PNGs in the repo and served via Cloudflare's CDN. Teams without custom art fall back to emoji flags.

---

## The Fun Part: Week 1 Predictions

Week 1 kicks off June 11 with 10 matches:

| Match | Group | Venue | The Story |
|-------|-------|-------|-----------|
| Mexico vs South Africa | A | Mexico City | Opening match! 80,000 fans at Azteca |
| Canada vs Bosnia | B | Toronto | Davies vs Dzeko — speed vs experience |
| USA vs Paraguay | D | Los Angeles | Host nation pressure is real |
| Brazil vs Morocco | C | New Jersey | 2022 semifinalist Morocco wants more |
| Germany vs Curaçao | E | Houston | Curaçao's World Cup debut! |
| Netherlands vs Japan | F | Dallas | Gakpo vs Kubo — flair vs precision |
| Spain vs Cape Verde | H | Atlanta | Yamal, 18, vs Cape Verde's tournament debut |
| France vs Senegal | I | New Jersey | Mbappé chasing his second star |
| England vs Croatia | L | Dallas | Bellingham vs Modrić — generational clash |
| Argentina vs Algeria | J | Kansas City | Can Messi do it one more time? |

The beauty of predictions is that everyone becomes an expert. "Obviously Germany beats Curaçao 4-0" — but what if? That's the fun.

---

## Scoring: Simple but Strategic

| What you got right | Points |
|--------------------|--------|
| Nothing | 0 |
| Correct outcome (1/X/2) | +1 |
| Correct exact score | +3 |
| Both (outcome implied by score) | +4 |

Maximum per week: **40 points** (4 × 10 matches).

The tiebreaker rule adds strategy: if you're confident in your picks, submit early. Waiting until the last minute is risky — someone with the same score who bet earlier takes the TON.

---

## Tech Learnings

### What Worked
- **Cloudflare's free tier is absurdly generous** — Pages, Workers, D1, DNS, SSL, CDN — all free for our scale
- **Google Sheets as admin panel** — non-technical team members can edit match schedules without touching code
- **Telegram Mini Apps** — zero install, zero sign-up, the bot IS the app
- **AI pair programming** — Claude handled infrastructure, deployments, API design, and even wrote this article

### What Was Tricky
- **Telegram caches aggressively** — users see old versions unless they clear Mini App cache
- **Cloudflare Pages + same repo, two projects** — needed careful build config (root dir, build commands)
- **Timezone handling** — UTC for logic, ET for display, stored separately

### What's Next
- Remaining 10 team card illustrations
- Week 2 schedule (24 matches!)
- TON wallet integration for automated payouts
- Champions page with weekly results
- Invite system with referral bonuses

---

## Stack Summary

| Layer | Tech | Cost |
|-------|------|------|
| Domain | bettyscores.com (Namecheap) | $9/year |
| DNS + CDN | Cloudflare | Free |
| Frontend | React + Vite on Cloudflare Pages | Free |
| Backend | Cloudflare Workers | Free |
| Database | Cloudflare D1 (SQLite) | Free |
| Admin | Google Sheets | Free |
| Bot | Telegram Bot API | Free |
| Rewards | TON blockchain | 1 TON/week |
| AI Dev | Claude (Anthropic) | Priceless |
| Mascot | Betty the Schnauzer | 1 belly rub/day |

---

## Try It

- **Website:** [bettyscores.com](https://bettyscores.com)
- **Telegram:** [@bettyscores_bot](https://t.me/bettyscores_bot/bettyscores)
- **GitHub:** [MihelKlimm/betty-predictor](https://github.com/MihelKlimm/betty-predictor)

World Cup 2026 starts June 11. Place your bets, sniff the score, get TONn of emotions.

*Built with love, serverless magic, and an AI that never sleeps.*
