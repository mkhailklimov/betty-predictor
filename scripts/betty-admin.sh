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
#   bash scripts/betty-admin.sh resolve 2026_42 <challenge_id>=<answer> ...   set results and award points
#   bash scripts/betty-admin.sh rebuild                rebuild silver + gold marts (Champions, Hall of Fame)
#   bash scripts/betty-admin.sh paid 2026_41 1         mark a Stars prize paid (week or bonus_N, rank) — only after it was sent
#   bash scripts/betty-admin.sh notify <tg_id> msg.txt ["Open Betty"]  one bot message to one player (+ optional Mini App button)
#   bash scripts/betty-admin.sh broadcast ids.txt msg.txt "Open Betty"  same message (+ optional Mini App button) to many players
#   bash scripts/betty-admin.sh deploy-worker          npx wrangler deploy (cf-worker)
#   bash scripts/betty-admin.sh deploy-frontend        build + wrangler pages deploy to app.bettyscores.com
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="https://api.bettyscores.com"
TOKEN_FILE="$ROOT/cf-worker/.admin-token"

usage() { sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }

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
  resolve)
    # Answers must match the stored options exactly: Yes/No, Over/Under,
    # Home/Away/Nobody, or a score as home:away (e.g. 2:1). Re-running is safe:
    # it overwrites the answer and re-scores every prediction.
    week="${1:-}"; shift || true
    [[ "$week" =~ ^[0-9]{4}_[0-9]{2}$ ]] || { echo "week must look like 2026_42" >&2; exit 2; }
    [ $# -ge 1 ] || { echo "give at least one <challenge_id>=<answer>" >&2; exit 2; }
    for pair in "$@"; do
      [[ "$pair" =~ ^[A-Za-z0-9_-]+=(Yes|No|Over|Under|Home|Away|Nobody|[0-9]{1,2}:[0-9]{1,2})$ ]] \
        || { echo "bad answer '$pair' (use id=Yes|No|Over|Under|Home|Away|Nobody|H:A)" >&2; exit 2; }
    done
    body="$(node -e 'const a={};for(const p of process.argv.slice(1)){const i=p.indexOf("=");a[p.slice(0,i)]=p.slice(i+1)}console.log(JSON.stringify({answers:a}))' "$@")"
    [ -s "$TOKEN_FILE" ] || { echo "missing $TOKEN_FILE" >&2; exit 1; }
    curl -sS -X POST -H "Authorization: Bearer $(tr -d '\r\n' < "$TOKEN_FILE")" \
      -H "Content-Type: application/json" -d "$body" "$API/api/admin/resolve-challenges?week=$week"
    echo
    ;;
  rebuild)
    admin_post "/api/admin/rebuild"; echo
    ;;
  paid)
    week="${1:-}"; rank="${2:-}"
    [[ "$week" =~ ^([0-9]{4}_[0-9]{2}|bonus_[0-9]+)$ ]] || { echo "week must look like 2026_41 or bonus_1" >&2; exit 2; }
    [[ "$rank" =~ ^[1-9]$ ]] || { echo "rank must be 1-9" >&2; exit 2; }
    admin_post "/api/admin/prizes/$week/paid?rank=$rank"; echo
    ;;
  notify)
    # One message from the bot to one player; the text is read from a file (UTF-8).
    # Optional 3rd arg: label of a button under the message that opens the Mini App.
    tg="${1:-}"; file="${2:-}"; button="${3:-}"
    [[ "$tg" =~ ^[0-9]{5,15}$ ]] || { echo "tg_id must be digits" >&2; exit 2; }
    [ -s "$file" ] || { echo "give a text file with the message" >&2; exit 2; }
    body="$(node -e 'const fs=require("fs");console.log(JSON.stringify({tg_id:process.argv[1],text:fs.readFileSync(process.argv[2],"utf8").trim(),button:process.argv[3]||""}))' "$tg" "$file" "$button")"
    [ -s "$TOKEN_FILE" ] || { echo "missing $TOKEN_FILE" >&2; exit 1; }
    curl -sS -X POST -H "Authorization: Bearer $(tr -d '\r\n' < "$TOKEN_FILE")" \
      -H "Content-Type: application/json" -d "$body" "$API/api/admin/notify"
    echo
    ;;
  broadcast)
    # The same message to every tg_id listed in a file (one per line, "#" = comment).
    ids="${1:-}"; file="${2:-}"; button="${3:-}"
    [ -s "$ids" ] || { echo "give a file with tg_ids, one per line" >&2; exit 2; }
    grep -oE '^[0-9]{5,15}' "$ids" | while read -r tg; do
      echo -n "$tg "; bash "$0" notify "$tg" "$file" "$button"
      sleep 0.2
    done
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
