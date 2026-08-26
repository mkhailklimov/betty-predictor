# Betty Scores 2.0 — Backup & Rollback

**Created:** 2026-08-26
**Backup file:** `backups/betty-d1-v2.0.sql` (full D1 export, committed to git)

---

## What is backed up

| Asset | Location | Notes |
|-------|----------|-------|
| D1 database (full dump) | `backups/betty-d1-v2.0.sql` | All tables, indexes, data |
| Worker code | git tag `v2.0` | `cf-worker/src/worker.js` + migrations |
| Frontend code | git tag `v2.0` | `frontend/` directory |
| Worker version ID | `wrangler rollback` target | See rollback steps below |
| v1 anchors | `docs/RELEASE-2.0.md` section 4.3 | Tag `prod-v1-final`, Worker `26f32105-...` |

**Not backed up here:** Google Sheet (Betty_Master_Data) — that lives in Google Drive with its own version history.

---

## How the backup was created

```bash
npx wrangler d1 export betty-db --output=backups/betty-d1-v2.0.sql --remote
```

Database: `betty-db` (ID `a064b461-a310-484e-80de-66a684e71c7c`), shared by dev and prod.

---

## How to verify the backup

```bash
# 1. Restore into a local SQLite and check row counts
sqlite3 /tmp/betty-verify.db < backups/betty-d1-v2.0.sql
sqlite3 /tmp/betty-verify.db "
  SELECT 'users' AS tbl, COUNT(*) AS rows FROM users
  UNION ALL SELECT 'matches', COUNT(*) FROM matches
  UNION ALL SELECT 'predictions', COUNT(*) FROM predictions
  UNION ALL SELECT 'weekly_prizes', COUNT(*) FROM weekly_prizes
  UNION ALL SELECT 'bronze_fixtures', COUNT(*) FROM bronze_fixtures;
"

# 2. Compare against live D1
npx wrangler d1 execute betty-db --remote --command="
  SELECT 'users' AS tbl, COUNT(*) AS rows FROM users
  UNION ALL SELECT 'matches', COUNT(*) FROM matches
  UNION ALL SELECT 'predictions', COUNT(*) FROM predictions
  UNION ALL SELECT 'weekly_prizes', COUNT(*) FROM weekly_prizes
  UNION ALL SELECT 'bronze_fixtures', COUNT(*) FROM bronze_fixtures;
"

# 3. If counts match, the backup is valid
```

---

## How to rollback to 2.0

### When to rollback

Use this if a post-2.0 release breaks the app and you need to restore a known-good state. Three layers can be rolled back independently.

### Step 1: Rollback the Worker (API)

```bash
# Option A: Deploy from the v2.0 tag
git checkout v2.0
cd cf-worker
npx wrangler deploy

# Option B: Use Cloudflare's built-in rollback (if the v2.0 deployment ID is known)
npx wrangler rollback <v2.0-worker-version-id>
```

To find the current Worker version IDs:
```bash
npx wrangler deployments list
```

### Step 2: Rollback the Frontend

```bash
# Option A: Deploy from the v2.0 tag
git checkout v2.0
cd frontend
VITE_API_BASE=https://api.bettyscores.com npm run build
npx wrangler pages deploy dist --project-name=betty-scores-app --branch=main

# Option B: Use Cloudflare Pages dashboard
# Go to Pages > betty-scores-app > Deployments > find the v2.0 deployment > "Rollback to this deployment"
```

### Step 3: Rollback the Database (if needed)

Only needed if a post-2.0 migration broke data (not just added tables/columns).

```bash
# DANGER: This wipes the current database and restores from the backup.
# All data written after the backup will be lost (predictions, users, prizes).

# 1. Take a fresh backup of the CURRENT state first
npx wrangler d1 export betty-db --output=backups/betty-d1-pre-rollback-$(date +%Y%m%d).sql --remote

# 2. Restore from the v2.0 backup
npx wrangler d1 execute betty-db --remote --file=backups/betty-d1-v2.0.sql
```

**WARNING:** Database rollback is destructive. It loses all data written after the backup date. Only do this if the schema is broken beyond repair. If the issue is just bad data in new columns/tables, prefer targeted SQL fixes over a full restore.

### Step 4: Verify

```bash
# Check API responds
curl -s https://api.bettyscores.com/api/weeks/current | head -c 200

# Check frontend loads
curl -s -o /dev/null -w "%{http_code}" https://app.bettyscores.com

# Open in browser and confirm the app works end-to-end
```

---

## Creating a new backup

Before any future release, create a fresh backup:

```bash
cd ~/betty-predictor
npx wrangler d1 export betty-db --output=backups/betty-d1-<version>.sql --remote
git add backups/
git commit -m "Backup D1 before <version> release"
git push
```
