# Changelog — April 6, 2026

## Summary

Completed prod-readiness work: backend prediction sync, kickoff lockout, database schema expansion, and prod Telegram deployment. Betty Scores is now live as a separate prod environment.

---

## Prod Deployment

### Telegram
- Created prod Telegram account: **@bettyscores**
- Created prod bot: **@bettyscores_bot** (token stored securely)
- Created Mini App: **bettyscores** (short name)
- App link: **t.me/bettyscores_bot/bettyscores**
- Menu button: "Play" → https://bettyscores.surge.sh

### Prod TG App
- Deployed to: **https://bettyscores.surge.sh**
- Same codebase as dev, separate deployment
- Connected to shared backend: betty-api.mihel-klimm.workers.dev

### Environment Map

| | Dev | Prod |
|--|-----|------|
| Landing | betty-predictor.surge.sh | Same (shared for now) |
| TG App | betty-tg-app.surge.sh | bettyscores.surge.sh |
| Bot | @betty_worldcup2026_bot | @bettyscores_bot |
| TG Account | @betty | @bettyscores |
| Backend | betty-api.mihel-klimm.workers.dev | Same (shared) |
| Database | D1 betty-db | Same (shared) |
| Mini App link | t.me/betty_worldcup2026_bot | t.me/bettyscores_bot/bettyscores |

Future: buy `bettyscores.com` domain → move landing + app there.

---

## Backend Changes

### Kickoff Lockout (Critical)
- Backend now rejects predictions after match kickoff with `403 "Betting closed — match has started"`
- Compares current UTC time against match `time` field in D1
- Enforced server-side — cannot be bypassed by client

### Prediction Upsert
- `POST /api/predictions` now supports upsert — users can change predictions before kickoff
- Previously returned `400 "already predicted"` — now updates the existing prediction
- User registration endpoint also returns existing user instead of 400

### User Registration
- Frontend auto-registers user on app startup via Telegram initData
- Stores tg_id as Bearer token for all API requests
- Backend creates user in D1 or returns existing

---

## Database Schema Updates

### Users table — new columns
| Column | Type | Purpose |
|--------|------|---------|
| tours_played | INTEGER | Weeks participated |
| ton_wallet | TEXT | TON wallet address for payouts |
| ton_consent | INTEGER | User agreed to receive TON (0/1) |
| ton_earned | REAL | Total TON earned |
| ton_distributed | REAL | Total TON sent to wallet |

### Matches table — new columns
| Column | Type | Purpose |
|--------|------|---------|
| grp | TEXT | Tournament group (A-L) |
| venue | TEXT | Stadium/city |
| card_home | TEXT | Home team card image filename |
| card_away | TEXT | Away team card image filename |
| is_active | INTEGER | Visibility/betting status (0-3) |

### D1 Match Data
- All 10 Week 1 matches updated with group, venue, and card image data
- Matches aligned with Google Sheet format

---

## Frontend Changes

### Predictions → Backend Sync
- Predictions now save to both localStorage (instant) and D1 (durable)
- If backend rejects (match started), red toast shown and localStorage reverted
- If backend unreachable, prediction kept locally (graceful degradation)
- Match ID mapping: frontend `id: 1` → backend `match-1`

---

## Data Management

### Google Sheet Restructured
- Sheet ID: `1h51r7hnqrzKrLdarypIyrTWS4zRkFL-UGQSrSUwMGus`
- **Matches** sheet: 10 Week 1 matches with all fields (Weekstart, UTC time, ET time, League, Group, Home/Away, Venue, Cards, Is Active)
- **Users** sheet: mirrors D1 users table for admin visibility
- Column descriptions in separate Masterdata sheet: `1YNbdBiJs30ftSI-KHApp3DpJSlKRpsDNltKAbazkPRI`

### MASTERDATA.md
- Full wiki-style data dictionary pushed to GitHub
- Documents all 4 tables: users, matches, predictions, rewards
- Includes scoring rules, TON distribution flow, Is Active status codes

---

## Process

### Dev-First Rule
All changes tested on dev before prod. Workflow:
1. Make changes in code
2. Deploy to dev (betty-tg-app.surge.sh)
3. Test with @betty_worldcup2026_bot
4. Deploy to prod (bettyscores.surge.sh)
5. Verify with @bettyscores_bot

### Match Sync Process
1. Admin fills matches in Google Sheet
2. Tell Claude "sync matches"
3. Claude reads sheet → upserts to D1 → updates frontend
4. Deploy to dev → test → deploy to prod

---

## Commits

```
40bee69 Wire predictions to backend API, add kickoff lockout, upsert support
af01454 Add masterdata reference: full data dictionary for matches, users, predictions, rewards
a1b29ce Add group, venue, card images, is_active to matches table
51b2eee Add ton_earned and ton_distributed to users table
ae66177 Add tours_played, ton_wallet, ton_consent to users table
902e45f Update changelog: add ET match times table and latest commits
8fdda77 Update landing site match times to ET format
e3df9ae Add TG Mini App dev changelog for April 5
9c1c20a Add kickoff lockout + ET times on match cards (debug time disabled)
324655b Add toast notification and auto-scroll when all bets placed
5f69d1e Update completion message: Bets placed, change until kickoff
fa3cc20 Fix Cape Verde card: match code CPV → CVE to match image filename
779af1c Add changelog for April 5 session, update slogan with emojis
```
