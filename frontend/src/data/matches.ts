import { ApiMatch, WeekResponse } from '../types'

// The week's fixtures now come from the API (GET /api/weeks/current|next), which
// serves whatever the curation sheet published into D1. v1 hardcoded five World
// Cup weeks here; a perpetual weekly game can't ship a redeploy every Monday.
// What stays in this file is presentation: locking, card art, flags.

export interface TeamData {
  name: string
  code: string | null   // feed abbreviation; may be absent
  crest: string | null  // logo URL from the feed — the only art club teams have
}

export interface MatchData {
  id: string            // API match id, e.g. 'espn-401864004' — a string, not 1..N
  date: string          // display label, derived from the kickoff
  kickoff: string       // ISO 8601 UTC timestamp
  league: string        // human-readable competition name
  home: TeamData
  away: TeamData
}

// Debug: set to an ISO date string to simulate a specific time, or null for real time.
export const DEBUG_TIME: string | null = null

export function getNow(): Date {
  return DEBUG_TIME ? new Date(DEBUG_TIME) : new Date()
}

export function isMatchLocked(match: MatchData): boolean {
  return getNow() >= new Date(match.kickoff)
}

// Team codes that have card images in /teams/Cards/.
// Kept in sync with the PNGs present in frontend/public/teams/Cards/ (sourced from the
// canonical Cards Drive folder). Teams not listed here fall back to the feed crest.
export const TEAM_CARDS: Record<string, boolean> = {
  ALG: true, ARG: true, AUS: true, BIH: true, BRA: true, CAN: true, CRO: true, CUR: true,
  CVE: true, CZE: true, ENG: true, ESP: true, FRA: true, GER: true, JAP: true, KOR: true,
  MEX: true, MOR: true, NED: true, NOR: true, PAR: true, POR: true, QAT: true, SAF: true,
  SCO: true, SEN: true, SWE: true, SWZ: true, TUR: true, USA: true, UZB: true,
  NZL: true, BEL: true, URU: true, PAN: true, COL: true, EGY: true,
  KSA: true, IRN: true, GHA: true, COD: true, AUT: true, JOR: true,
}

// Bump when any card PNG is updated — appended as ?v= to bust WebView caches.
const CARD_ASSETS_VERSION = '6'

export function getCardImage(code: string | null): string | null {
  return code && TEAM_CARDS[code] ? `/teams/Cards/${code}.png?v=${CARD_ASSETS_VERSION}` : null
}

// Locally bundled SVG flags for teams with no card PNG. TG WebViews and some
// networks block the jsdelivr CDN, so we serve these from our own origin.
const LOCAL_FLAGS: Record<string, boolean> = {
  CZE: true, SWZ: true, QAT: true, AUS: true, POR: true,
}

export function getLocalFlag(code: string | null): string | null {
  return code && LOCAL_FLAGS[code] ? `/teams/Flags/${code}.svg` : null
}

// Best available art for a team, in descending order of quality:
// our own card PNG (national teams only) → local flag SVG → the feed's crest.
// Club football only ever has the third, which is exactly why the crest URL is
// carried on the match row.
export function getTeamImage(team: TeamData): string | null {
  // Feed-sourced teams (clubs) carry their own crest — use it directly so that
  // a club code like PAR (Parma) doesn't collide with a national-team card (Paraguay).
  if (team.crest) return team.crest
  return getCardImage(team.code) || getLocalFlag(team.code) || null
}

// Kickoff → the card's date line, in the viewer's own timezone. v1 hardcoded
// US-Eastern strings because every World Cup match was played there; a global
// weekly game spans every timezone, so let the browser localise it.
export function formatKickoff(kickoff: string): string {
  const d = new Date(kickoff)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    weekday: 'short', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

// API row → the view model the cards render.
export function toMatchData(m: ApiMatch): MatchData {
  const kickoff = m.match_date_utc || m.time || m.date || ''
  return {
    id: m.id,
    kickoff,
    date: formatKickoff(kickoff),
    league: m.round || m.league || '',
    home: { name: m.home_team, code: m.code_home ?? null, crest: m.crest_home ?? null },
    away: { name: m.away_team, code: m.code_away ?? null, crest: m.crest_away ?? null },
  }
}

export function toWeekMatches(week: WeekResponse | null): MatchData[] {
  return (week?.matches ?? []).map(toMatchData)
}

// All scores where total goals <= 9 (e.g. 9:0 yes, 6:9 no)
export const ALL_SCORES: string[] = (() => {
  const scores: string[] = []
  // Home wins
  for (let h = 9; h >= 1; h--) {
    for (let a = 0; a < h && h + a <= 9; a++) {
      scores.push(`${h}:${a}`)
    }
  }
  // Draws
  for (let d = 0; d <= 4; d++) {
    scores.push(`${d}:${d}`)
  }
  // Away wins
  for (let a = 9; a >= 1; a--) {
    for (let h = 0; h < a && h + a <= 9; h++) {
      scores.push(`${h}:${a}`)
    }
  }
  return scores
})()
