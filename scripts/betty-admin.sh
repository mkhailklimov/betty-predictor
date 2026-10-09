#!/usr/bin/env bash
# Betty admin helper — one entry point for the routine production steps, so
# they can be allowed with a single Claude Code permission rule:
#   "Bash(bash scripts/betty-admin.sh:*)"
# Run from the repo root. The admin token is read from cf-worker/.admin-token
# (git-ignored) and is never printed.
#
#   bash scripts/betty-admin.sh ingest                 refresh bronze_fixtures from ESPN (no sheet write)
#   bash scripts/betty-admin.sh publish 2026_43 --dry  validate a week from the Release2.1 tab, change nothing
#   bash scripts/betty-admin.sh publish 2026_43        publish the week's challenges
#   bash scripts/betty-admin.sh publish 2026_43 --force  replace a week that already has predictions (deletes them)
#   bash scripts/betty-admin.sh deploy-worker          npx wrangler deploy (cf-worker)
#   bash scripts/betty-admin.sh deploy-frontend        build + wrangler pages deploy to app.bettyscores.com
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="https://api.bettyscores.com"
TOKEN_FILE="$ROOT/cf-worker/.admin-token"

usage() { sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }

admin_post() {  # admin_post <path?query>
  [ -s "$TOKEN_FILE" ] || { echo "missing $TOKEN_FILE" >&2; exit 1; }
  curl -sS -X POST -H "Authorization: Bearer $(tr -d '\r\n' < "$TOKEN_FILE")" "$API$1"
}

# Short human summary of the JSON the admin endpoints return.
summarize() {
  node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
      let j; try { j = JSON.parse(s); } catch { console.log(s.slice(0, 500)); process.exit(1); }
      const i = j.ingest || j;
      const head = { ok: i.ok, week: i.week_id, dry: i.dry, published: i.published,
        landed: i.landed, range: i.range, errors: i.errors, warnings: i.warnings,
        failed: i.failed && i.failed.length ? i.failed : undefined };
      console.log(JSON.stringify(head, (k, v) => v === undefined ? undefined : v));
      for (const c of i.challenges || [])
        console.log(" ", c.kickoff_utc, "|", c.type, "|", c.points + "pt", "|", c.home_team, "vs", c.away_team);
      if (i.perLeague) console.log("  perLeague", JSON.stringify(i.perLeague));
      process.exit(i.ok ? 0 : 1);
    });'
}

cmd="${1:-}"; shift || true
case "$cmd" in
  ingest)
    admin_post "/api/admin/ingest-fixtures?sheet=0" | summarize
    ;;
  publish)
    week="${1:-}"; shift || true
    [[ "$week" =~ ^[0-9]{4}_[0-9]{2}$ ]] || { echo "week must look like 2026_43" >&2; exit 2; }
    q="week=$week"
    for flag in "$@"; do
      case "$flag" in
        --dry) q="$q&dry=1" ;;
        --force) q="$q&force=1" ;;
        *) echo "unknown flag $flag" >&2; exit 2 ;;
      esac
    done
    admin_post "/api/admin/publish-challenges?$q" | summarize
    ;;
  deploy-worker)
    (cd "$ROOT/cf-worker" && npx wrangler deploy)
    ;;
  deploy-frontend)
    (cd "$ROOT/frontend" && npm run build && \
      npx wrangler pages deploy dist --project-name betty-scores-app --branch main)
    ;;
  *) usage ;;
esac
