export interface MatchData {
  id: number
  date: string
  kickoff: string  // ISO 8601 UTC timestamp
  group: string
  venue: string
  home: {
    name: string
    code: string
    flag: string
    keyPlayer: string
  }
  away: {
    name: string
    code: string
    flag: string
    keyPlayer: string
  }
}

// Debug: set to an ISO date string to simulate a specific time, or null for real time
// Example: '2026-06-13T09:00:00Z' to simulate June 13, 9 AM UTC
export const DEBUG_TIME: string | null = null

export function getNow(): Date {
  return DEBUG_TIME ? new Date(DEBUG_TIME) : new Date()
}

export function isMatchLocked(match: MatchData): boolean {
  return getNow() >= new Date(match.kickoff)
}

// Team codes that have card images in /teams/Cards/.
// Kept in sync with the PNGs present in frontend/public/teams/Cards/ (sourced from the
// canonical Cards Drive folder). Teams not listed here fall back to Twemoji SVG flags.
export const TEAM_CARDS: Record<string, boolean> = {
  ALG: true, ARG: true, AUS: true, BIH: true, BRA: true, CAN: true, CRO: true, CUR: true,
  CVE: true, CZE: true, ENG: true, ESP: true, FRA: true, GER: true, JAP: true, KOR: true,
  MEX: true, MOR: true, NED: true, NOR: true, PAR: true, POR: true, QAT: true, SAF: true,
  SCO: true, SEN: true, SWE: true, SWZ: true, TUR: true, USA: true, UZB: true,
  NZL: true, BEL: true, URU: true, PAN: true, COL: true,
}

// Bump when any card PNG is updated — appended as ?v= to bust WebView caches.
const CARD_ASSETS_VERSION = '5'

export function getCardImage(code: string): string | null {
  return TEAM_CARDS[code] ? `/teams/Cards/${code}.png?v=${CARD_ASSETS_VERSION}` : null
}

// Locally bundled SVG flags for teams with no card PNG. TG WebViews and some
// networks block the jsdelivr CDN, so we serve these from our own origin.
const LOCAL_FLAGS: Record<string, boolean> = {
  CZE: true, SWZ: true, QAT: true, AUS: true, POR: true,
}

export function getLocalFlag(code: string): string | null {
  return LOCAL_FLAGS[code] ? `/teams/Flags/${code}.svg` : null
}

// Convert a flag-emoji string (e.g. "\u{1F1E8}\u{1F1FF}") to a Twemoji SVG URL.
// TG WebViews often lack glyphs for less-common flags; Twemoji renders them as
// inline <img>s and works everywhere.
export function flagToTwemojiUrl(flag: string): string {
  const codes: string[] = []
  for (const ch of flag) {
    const cp = ch.codePointAt(0)
    if (cp && cp !== 0xFE0F) codes.push(cp.toString(16))
  }
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codes.join('-')}.svg`
}

export const WEEK1_MATCHES: MatchData[] = [
  {
    id: 1,
    date: 'Thu, June 11 · 9:00 PM ET',
    kickoff: '2026-06-12T01:00:00Z', // 21:00 ET (UTC-4)
    group: 'A',
    venue: 'Mexico City',
    home: { name: 'Mexico', code: 'MEX', flag: '\u{1F1F2}\u{1F1FD}', keyPlayer: 'Edson Alvarez' },
    away: { name: 'South Africa', code: 'SAF', flag: '\u{1F1FF}\u{1F1E6}', keyPlayer: 'Percy Tau' },
  },
  {
    id: 2,
    date: 'Fri, June 12 · 6:00 PM ET',
    kickoff: '2026-06-12T22:00:00Z', // 18:00 ET
    group: 'B',
    venue: 'Toronto',
    home: { name: 'Canada', code: 'CAN', flag: '\u{1F1E8}\u{1F1E6}', keyPlayer: 'Alphonso Davies' },
    away: { name: 'Bosnia & Herzegovina', code: 'BIH', flag: '\u{1F1E7}\u{1F1E6}', keyPlayer: 'Edin Dzeko' },
  },
  {
    id: 3,
    date: 'Fri, June 12 · 9:00 PM ET',
    kickoff: '2026-06-13T01:00:00Z', // 21:00 ET
    group: 'D',
    venue: 'Los Angeles',
    home: { name: 'USA', code: 'USA', flag: '\u{1F1FA}\u{1F1F8}', keyPlayer: 'Christian Pulisic' },
    away: { name: 'Paraguay', code: 'PAR', flag: '\u{1F1F5}\u{1F1FE}', keyPlayer: 'Miguel Almiron' },
  },
  {
    id: 4,
    date: 'Sat, June 13 · 6:00 PM ET',
    kickoff: '2026-06-13T22:00:00Z', // 18:00 ET
    group: 'C',
    venue: 'New Jersey',
    home: { name: 'Brazil', code: 'BRA', flag: '\u{1F1E7}\u{1F1F7}', keyPlayer: 'Vinicius Jr' },
    away: { name: 'Morocco', code: 'MOR', flag: '\u{1F1F2}\u{1F1E6}', keyPlayer: 'Achraf Hakimi' },
  },
  {
    id: 5,
    date: 'Sun, June 14 · 3:00 PM ET',
    kickoff: '2026-06-14T19:00:00Z', // 15:00 ET
    group: 'E',
    venue: 'Houston',
    home: { name: 'Germany', code: 'GER', flag: '\u{1F1E9}\u{1F1EA}', keyPlayer: 'Jamal Musiala' },
    away: { name: 'Curacao', code: 'CUR', flag: '\u{1F1E8}\u{1F1FC}', keyPlayer: 'Juninho Bacuna' },
  },
  {
    id: 6,
    date: 'Sun, June 14 · 6:00 PM ET',
    kickoff: '2026-06-14T22:00:00Z', // 18:00 ET
    group: 'F',
    venue: 'Dallas',
    home: { name: 'Netherlands', code: 'NED', flag: '\u{1F1F3}\u{1F1F1}', keyPlayer: 'Cody Gakpo' },
    away: { name: 'Japan', code: 'JAP', flag: '\u{1F1EF}\u{1F1F5}', keyPlayer: 'Takefusa Kubo' },
  },
  {
    id: 7,
    date: 'Mon, June 15 · 6:00 PM ET',
    kickoff: '2026-06-15T22:00:00Z', // 18:00 ET
    group: 'H',
    venue: 'Atlanta',
    home: { name: 'Spain', code: 'ESP', flag: '\u{1F1EA}\u{1F1F8}', keyPlayer: 'Nico Williams' },
    away: { name: 'Cape Verde', code: 'CVE', flag: '\u{1F1E8}\u{1F1FB}', keyPlayer: 'Ryan Mendes' },
  },
  {
    id: 8,
    date: 'Tue, June 16 · 6:00 PM ET',
    kickoff: '2026-06-16T22:00:00Z', // 18:00 ET
    group: 'I',
    venue: 'New Jersey',
    home: { name: 'France', code: 'FRA', flag: '\u{1F1EB}\u{1F1F7}', keyPlayer: 'Kylian Mbappe' },
    away: { name: 'Senegal', code: 'SEN', flag: '\u{1F1F8}\u{1F1F3}', keyPlayer: 'Sadio Mane' },
  },
  {
    id: 9,
    date: 'Wed, June 17 · 3:00 PM ET',
    kickoff: '2026-06-17T19:00:00Z', // 15:00 ET
    group: 'L',
    venue: 'Dallas',
    home: { name: 'England', code: 'ENG', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', keyPlayer: 'Jude Bellingham' },
    away: { name: 'Croatia', code: 'CRO', flag: '\u{1F1ED}\u{1F1F7}', keyPlayer: 'Luka Modric' },
  },
  {
    id: 10,
    date: 'Wed, June 17 · 6:00 PM ET',
    kickoff: '2026-06-17T22:00:00Z', // 18:00 ET
    group: 'J',
    venue: 'Kansas City',
    home: { name: 'Argentina', code: 'ARG', flag: '\u{1F1E6}\u{1F1F7}', keyPlayer: 'Lionel Messi' },
    away: { name: 'Algeria', code: 'ALG', flag: '\u{1F1E9}\u{1F1FF}', keyPlayer: 'Riyad Mahrez' },
  },
]

// Week 2 (ISO week 2026_25) — June 18–23, 2026. Match IDs 11-20 (distinct from Week 1's 1-10
// so predictions don't collide in the shared D1 predictions table).
export const WEEK25_MATCHES: MatchData[] = [
  {
    id: 11,
    date: 'Thu, June 18 · 12:00 PM ET',
    kickoff: '2026-06-18T16:00:00Z',
    group: 'A',
    venue: 'Atlanta',
    home: { name: 'South Africa', code: 'SAF', flag: '\u{1F1FF}\u{1F1E6}', keyPlayer: 'Percy Tau' },
    away: { name: 'Czechia', code: 'CZE', flag: '\u{1F1E8}\u{1F1FF}', keyPlayer: 'Patrik Schick' },
  },
  {
    id: 12,
    date: 'Thu, June 18 · 3:00 PM ET',
    kickoff: '2026-06-18T19:00:00Z',
    group: 'B',
    venue: 'Los Angeles',
    home: { name: 'Switzerland', code: 'SWZ', flag: '\u{1F1E8}\u{1F1ED}', keyPlayer: 'Granit Xhaka' },
    away: { name: 'Bosnia & Herzegovina', code: 'BIH', flag: '\u{1F1E7}\u{1F1E6}', keyPlayer: 'Edin Dzeko' },
  },
  {
    id: 13,
    date: 'Thu, June 18 · 6:00 PM ET',
    kickoff: '2026-06-18T22:00:00Z',
    group: 'B',
    venue: 'Vancouver',
    home: { name: 'Canada', code: 'CAN', flag: '\u{1F1E8}\u{1F1E6}', keyPlayer: 'Alphonso Davies' },
    away: { name: 'Qatar', code: 'QAT', flag: '\u{1F1F6}\u{1F1E6}', keyPlayer: 'Akram Afif' },
  },
  {
    id: 14,
    date: 'Thu, June 18 · 9:00 PM ET',
    kickoff: '2026-06-19T01:00:00Z',
    group: 'A',
    venue: 'Guadalajara',
    home: { name: 'Mexico', code: 'MEX', flag: '\u{1F1F2}\u{1F1FD}', keyPlayer: 'Edson Alvarez' },
    away: { name: 'South Korea', code: 'KOR', flag: '\u{1F1F0}\u{1F1F7}', keyPlayer: 'Son Heung-min' },
  },
  {
    id: 15,
    date: 'Fri, June 19 · 3:00 PM ET',
    kickoff: '2026-06-19T19:00:00Z',
    group: 'D',
    venue: 'Seattle',
    home: { name: 'USA', code: 'USA', flag: '\u{1F1FA}\u{1F1F8}', keyPlayer: 'Christian Pulisic' },
    away: { name: 'Australia', code: 'AUS', flag: '\u{1F1E6}\u{1F1FA}', keyPlayer: 'Mathew Leckie' },
  },
  {
    id: 16,
    date: 'Fri, June 19 · 6:00 PM ET',
    kickoff: '2026-06-19T22:00:00Z',
    group: 'C',
    venue: 'Boston',
    home: { name: 'Scotland', code: 'SCO', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}', keyPlayer: 'Scott McTominay' },
    away: { name: 'Morocco', code: 'MOR', flag: '\u{1F1F2}\u{1F1E6}', keyPlayer: 'Achraf Hakimi' },
  },
  {
    id: 17,
    date: 'Fri, June 19 · 11:00 PM ET',
    kickoff: '2026-06-20T03:00:00Z',
    group: 'D',
    venue: 'San Francisco',
    home: { name: 'Paraguay', code: 'PAR', flag: '\u{1F1F5}\u{1F1FE}', keyPlayer: 'Miguel Almiron' },
    away: { name: 'Türkiye', code: 'TUR', flag: '\u{1F1F9}\u{1F1F7}', keyPlayer: 'Arda Guler' },
  },
  {
    id: 18,
    date: 'Sat, June 20 · 1:00 PM ET',
    kickoff: '2026-06-20T17:00:00Z',
    group: 'F',
    venue: 'Houston',
    home: { name: 'Netherlands', code: 'NED', flag: '\u{1F1F3}\u{1F1F1}', keyPlayer: 'Cody Gakpo' },
    away: { name: 'Sweden', code: 'SWE', flag: '\u{1F1F8}\u{1F1EA}', keyPlayer: 'Alexander Isak' },
  },
  {
    id: 19,
    date: 'Mon, June 22 · 8:00 PM ET',
    kickoff: '2026-06-23T00:00:00Z',
    group: 'I',
    venue: 'New Jersey',
    home: { name: 'Norway', code: 'NOR', flag: '\u{1F1F3}\u{1F1F4}', keyPlayer: 'Erling Haaland' },
    away: { name: 'Senegal', code: 'SEN', flag: '\u{1F1F8}\u{1F1F3}', keyPlayer: 'Sadio Mane' },
  },
  {
    id: 20,
    date: 'Tue, June 23 · 1:00 PM ET',
    kickoff: '2026-06-23T17:00:00Z',
    group: 'K',
    venue: 'Houston',
    home: { name: 'Portugal', code: 'POR', flag: '\u{1F1F5}\u{1F1F9}', keyPlayer: 'Cristiano Ronaldo' },
    away: { name: 'Uzbekistan', code: 'UZB', flag: '\u{1F1FA}\u{1F1FF}', keyPlayer: 'Eldor Shomurodov' },
  },
]

// Week 3 (final group-stage round) — the 10 matches selected in the master sheet
// (Matches tab, week_id 2026_26, IDs 21-30). ET = UTC-4; kickoff is the UTC instant.
export const WEEK3_MATCHES: MatchData[] = [
  {
    id: 21,
    date: 'Wed, June 24 · 9:00 PM ET',
    kickoff: '2026-06-25T01:00:00Z',
    group: 'A',
    venue: 'Mexico City',
    home: { name: 'Czechia', code: 'CZE', flag: '\u{1F1E8}\u{1F1FF}', keyPlayer: 'Patrik Schick' },
    away: { name: 'Mexico', code: 'MEX', flag: '\u{1F1F2}\u{1F1FD}', keyPlayer: 'Edson Alvarez' },
  },
  {
    id: 22,
    date: 'Wed, June 24 · 9:00 PM ET',
    kickoff: '2026-06-25T01:00:00Z',
    group: 'A',
    venue: 'Monterrey',
    home: { name: 'South Africa', code: 'SAF', flag: '\u{1F1FF}\u{1F1E6}', keyPlayer: 'Percy Tau' },
    away: { name: 'South Korea', code: 'KOR', flag: '\u{1F1F0}\u{1F1F7}', keyPlayer: 'Son Heung-min' },
  },
  {
    id: 23,
    date: 'Thu, June 25 · 7:00 PM ET',
    kickoff: '2026-06-25T23:00:00Z',
    group: 'F',
    venue: 'Dallas',
    home: { name: 'Japan', code: 'JAP', flag: '\u{1F1EF}\u{1F1F5}', keyPlayer: 'Takefusa Kubo' },
    away: { name: 'Sweden', code: 'SWE', flag: '\u{1F1F8}\u{1F1EA}', keyPlayer: 'Alexander Isak' },
  },
  {
    id: 24,
    date: 'Thu, June 25 · 10:00 PM ET',
    kickoff: '2026-06-26T02:00:00Z',
    group: 'D',
    venue: 'Los Angeles',
    home: { name: 'Turkiye', code: 'TUR', flag: '\u{1F1F9}\u{1F1F7}', keyPlayer: 'Arda Guler' },
    away: { name: 'USA', code: 'USA', flag: '\u{1F1FA}\u{1F1F8}', keyPlayer: 'Christian Pulisic' },
  },
  {
    id: 25,
    date: 'Thu, June 25 · 10:00 PM ET',
    kickoff: '2026-06-26T02:00:00Z',
    group: 'D',
    venue: 'San Francisco',
    home: { name: 'Paraguay', code: 'PAR', flag: '\u{1F1F5}\u{1F1FE}', keyPlayer: 'Miguel Almiron' },
    away: { name: 'Australia', code: 'AUS', flag: '\u{1F1E6}\u{1F1FA}', keyPlayer: 'Mat Ryan' },
  },
  {
    id: 26,
    date: 'Fri, June 26 · 3:00 PM ET',
    kickoff: '2026-06-26T19:00:00Z',
    group: 'I',
    venue: 'Boston',
    home: { name: 'Norway', code: 'NOR', flag: '\u{1F1F3}\u{1F1F4}', keyPlayer: 'Erling Haaland' },
    away: { name: 'France', code: 'FRA', flag: '\u{1F1EB}\u{1F1F7}', keyPlayer: 'Kylian Mbappe' },
  },
  {
    id: 27,
    date: 'Fri, June 26 · 8:00 PM ET',
    kickoff: '2026-06-27T00:00:00Z',
    group: 'H',
    venue: 'Guadalajara',
    home: { name: 'Uruguay', code: 'URU', flag: '\u{1F1FA}\u{1F1FE}', keyPlayer: 'Federico Valverde' },
    away: { name: 'Spain', code: 'ESP', flag: '\u{1F1EA}\u{1F1F8}', keyPlayer: 'Nico Williams' },
  },
  {
    id: 28,
    date: 'Fri, June 26 · 11:00 PM ET',
    kickoff: '2026-06-27T03:00:00Z',
    group: 'G',
    venue: 'Vancouver',
    home: { name: 'New Zealand', code: 'NZL', flag: '\u{1F1F3}\u{1F1FF}', keyPlayer: 'Chris Wood' },
    away: { name: 'Belgium', code: 'BEL', flag: '\u{1F1E7}\u{1F1EA}', keyPlayer: 'Kevin De Bruyne' },
  },
  {
    id: 29,
    date: 'Sat, June 27 · 5:00 PM ET',
    kickoff: '2026-06-27T21:00:00Z',
    group: 'L',
    venue: 'New Jersey',
    home: { name: 'Panama', code: 'PAN', flag: '\u{1F1F5}\u{1F1E6}', keyPlayer: 'Adalberto Carrasquilla' },
    away: { name: 'England', code: 'ENG', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', keyPlayer: 'Harry Kane' },
  },
  {
    id: 30,
    date: 'Sat, June 27 · 7:30 PM ET',
    kickoff: '2026-06-27T23:30:00Z',
    group: 'K',
    venue: 'Miami',
    home: { name: 'Colombia', code: 'COL', flag: '\u{1F1E8}\u{1F1F4}', keyPlayer: 'Luis Diaz' },
    away: { name: 'Portugal', code: 'POR', flag: '\u{1F1F5}\u{1F1F9}', keyPlayer: 'Cristiano Ronaldo' },
  },
]

// Which week the current deploy should show.
// Prod (app.bettyscores.com) always shows Week 1. Any other host (pages.dev previews,
// localhost) shows the dev preview week. This runtime switch lives on the `dev` branch so
// prod builds from `main` continue to show Week 1 even if this code is merged back later.
const PROD_HOST = 'app.bettyscores.com'
const isProdHost =
  typeof window !== 'undefined' && window.location.hostname === PROD_HOST

export const ACTIVE_MATCHES: MatchData[] = isProdHost ? WEEK1_MATCHES : WEEK3_MATCHES
export const ACTIVE_WEEK_LABEL = isProdHost ? 'Week 1' : 'Week 3'

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
