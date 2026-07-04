# Betty Scores — Disaster Recovery (`dr/`)

If global disaster strikes Cloudflare, GitHub still has this folder.

**Start with `RUNBOOK.md`** for step-by-step recovery instructions.

Files:
- `RUNBOOK.md` — recovery procedure (~10 steps)
- `secrets-inventory.md` — list of secrets and where to re-issue each (no values stored)
- `snapshot-YYYY-MM-DD.sql` — full D1 export, periodically refreshed

To refresh the snapshot:
```bash
cd cf-worker
npx wrangler d1 export betty-db --remote --output=../dr/snapshot-$(date +%Y-%m-%d).sql
```

Then commit + push.
