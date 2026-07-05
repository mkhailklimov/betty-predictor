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
// canonical Cards Drive folder). Teams not listed here fall back to Twemoji SVG flags.
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

// Week 2 — Weekstart 2026-06-19 (sheet betty_master_data). Match IDs 11-20.
// Re-cut from the sheet 2026-06-18: weeks are grouped by the Weekstart column.
// ET = UTC-4; kickoff is the authoritative UTC instant.
export const WEEK25_MATCHES: MatchData[] = [
  {
    id: 11,
    date: 'Fri, June 19 · 11:00 PM ET',
    kickoff: '2026-06-20T03:00:00Z',
    group: 'D',
    venue: 'San Francisco',
    home: { name: 'Paraguay', code: 'PAR', flag: '\u{1F1F5}\u{1F1FE}', keyPlayer: 'Miguel Almiron' },
    away: { name: 'Türkiye', code: 'TUR', flag: '\u{1F1F9}\u{1F1F7}', keyPlayer: 'Arda Guler' },
  },
  {
    id: 12,
    date: 'Sat, June 20 · 1:00 PM ET',
    kickoff: '2026-06-20T17:00:00Z',
    group: 'F',
    venue: 'Houston',
    home: { name: 'Netherlands', code: 'NED', flag: '\u{1F1F3}\u{1F1F1}', keyPlayer: 'Cody Gakpo' },
    away: { name: 'Sweden', code: 'SWE', flag: '\u{1F1F8}\u{1F1EA}', keyPlayer: 'Alexander Isak' },
  },
  {
    id: 13,
    date: 'Mon, June 22 · 8:00 PM ET',
    kickoff: '2026-06-23T00:00:00Z',
    group: 'I',
    venue: 'New Jersey',
    home: { name: 'Norway', code: 'NOR', flag: '\u{1F1F3}\u{1F1F4}', keyPlayer: 'Erling Haaland' },
    away: { name: 'Senegal', code: 'SEN', flag: '\u{1F1F8}\u{1F1F3}', keyPlayer: 'Sadio Mane' },
  },
  {
    id: 14,
    date: 'Tue, June 23 · 1:00 PM ET',
    kickoff: '2026-06-23T17:00:00Z',
    group: 'K',
    venue: 'Houston',
    home: { name: 'Portugal', code: 'POR', flag: '\u{1F1F5}\u{1F1F9}', keyPlayer: 'Cristiano Ronaldo' },
    away: { name: 'Uzbekistan', code: 'UZB', flag: '\u{1F1FA}\u{1F1FF}', keyPlayer: 'Eldor Shomurodov' },
  },
  {
    id: 15,
    date: 'Wed, June 24 · 9:00 PM ET',
    kickoff: '2026-06-25T01:00:00Z',
    group: 'A',
    venue: 'Mexico City',
    home: { name: 'Czechia', code: 'CZE', flag: '\u{1F1E8}\u{1F1FF}', keyPlayer: 'Patrik Schick' },
    away: { name: 'Mexico', code: 'MEX', flag: '\u{1F1F2}\u{1F1FD}', keyPlayer: 'Edson Alvarez' },
  },
  {
    id: 16,
    date: 'Wed, June 24 · 9:00 PM ET',
    kickoff: '2026-06-25T01:00:00Z',
    group: 'A',
    venue: 'Monterrey',
    home: { name: 'South Africa', code: 'SAF', flag: '\u{1F1FF}\u{1F1E6}', keyPlayer: 'Percy Tau' },
    away: { name: 'South Korea', code: 'KOR', flag: '\u{1F1F0}\u{1F1F7}', keyPlayer: 'Son Heung-min' },
  },
  {
    id: 17,
    date: 'Thu, June 25 · 7:00 PM ET',
    kickoff: '2026-06-25T23:00:00Z',
    group: 'F',
    venue: 'Dallas',
    home: { name: 'Japan', code: 'JAP', flag: '\u{1F1EF}\u{1F1F5}', keyPlayer: 'Takefusa Kubo' },
    away: { name: 'Sweden', code: 'SWE', flag: '\u{1F1F8}\u{1F1EA}', keyPlayer: 'Alexander Isak' },
  },
  {
    id: 18,
    date: 'Thu, June 25 · 10:00 PM ET',
    kickoff: '2026-06-26T02:00:00Z',
    group: 'D',
    venue: 'Los Angeles',
    home: { name: 'Türkiye', code: 'TUR', flag: '\u{1F1F9}\u{1F1F7}', keyPlayer: 'Arda Guler' },
    away: { name: 'USA', code: 'USA', flag: '\u{1F1FA}\u{1F1F8}', keyPlayer: 'Christian Pulisic' },
  },
  {
    id: 19,
    date: 'Thu, June 25 · 10:00 PM ET',
    kickoff: '2026-06-26T02:00:00Z',
    group: 'D',
    venue: 'San Francisco',
    home: { name: 'Paraguay', code: 'PAR', flag: '\u{1F1F5}\u{1F1FE}', keyPlayer: 'Miguel Almiron' },
    away: { name: 'Australia', code: 'AUS', flag: '\u{1F1E6}\u{1F1FA}', keyPlayer: 'Mat Ryan' },
  },
  {
    id: 20,
    date: 'Fri, June 26 · 3:00 PM ET',
    kickoff: '2026-06-26T19:00:00Z',
    group: 'I',
    venue: 'Boston',
    home: { name: 'Norway', code: 'NOR', flag: '\u{1F1F3}\u{1F1F4}', keyPlayer: 'Erling Haaland' },
    away: { name: 'France', code: 'FRA', flag: '\u{1F1EB}\u{1F1F7}', keyPlayer: 'Kylian Mbappe' },
  },
]

// Week 3 — Weekstart 2026-06-26 (sheet betty_master_data). Match IDs 21-30.
// The real group-stage final round, verified against the FIFA WC2026 calendar
// (api.fifa.com competition 17 / season 285023): Groups H, G, L, K (Jun 27) +
// Group J (Jun 28 02:00 UTC). ET = UTC-4; kickoff is the authoritative UTC instant.
// All 10 active — every team card is now present.
export const WEEK3_MATCHES: MatchData[] = [
  {
    id: 21,
    date: 'Fri, June 26 · 8:00 PM ET',
    kickoff: '2026-06-27T00:00:00Z',
    group: 'H',
    venue: 'Guadalajara',
    home: { name: 'Uruguay', code: 'URU', flag: '\u{1F1FA}\u{1F1FE}', keyPlayer: 'Federico Valverde' },
    away: { name: 'Spain', code: 'ESP', flag: '\u{1F1EA}\u{1F1F8}', keyPlayer: 'Nico Williams' },
  },
  {
    id: 22,
    date: 'Fri, June 26 · 8:00 PM ET',
    kickoff: '2026-06-27T00:00:00Z',
    group: 'H',
    venue: 'Houston',
    home: { name: 'Cape Verde', code: 'CVE', flag: '\u{1F1E8}\u{1F1FB}', keyPlayer: 'Ryan Mendes' },
    away: { name: 'Saudi Arabia', code: 'KSA', flag: '\u{1F1F8}\u{1F1E6}', keyPlayer: 'Salem Al-Dawsari' },
  },
  {
    id: 23,
    date: 'Fri, June 26 · 11:00 PM ET',
    kickoff: '2026-06-27T03:00:00Z',
    group: 'G',
    venue: 'Vancouver',
    home: { name: 'New Zealand', code: 'NZL', flag: '\u{1F1F3}\u{1F1FF}', keyPlayer: 'Chris Wood' },
    away: { name: 'Belgium', code: 'BEL', flag: '\u{1F1E7}\u{1F1EA}', keyPlayer: 'Kevin De Bruyne' },
  },
  {
    id: 24,
    date: 'Fri, June 26 · 11:00 PM ET',
    kickoff: '2026-06-27T03:00:00Z',
    group: 'G',
    venue: 'Seattle',
    home: { name: 'Egypt', code: 'EGY', flag: '\u{1F1EA}\u{1F1EC}', keyPlayer: 'Mohamed Salah' },
    away: { name: 'Iran', code: 'IRN', flag: '\u{1F1EE}\u{1F1F7}', keyPlayer: 'Mehdi Taremi' },
  },
  {
    id: 25,
    date: 'Sat, June 27 · 5:00 PM ET',
    kickoff: '2026-06-27T21:00:00Z',
    group: 'L',
    venue: 'New Jersey',
    home: { name: 'Panama', code: 'PAN', flag: '\u{1F1F5}\u{1F1E6}', keyPlayer: 'Adalberto Carrasquilla' },
    away: { name: 'England', code: 'ENG', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', keyPlayer: 'Harry Kane' },
  },
  {
    id: 26,
    date: 'Sat, June 27 · 5:00 PM ET',
    kickoff: '2026-06-27T21:00:00Z',
    group: 'L',
    venue: 'Philadelphia',
    home: { name: 'Croatia', code: 'CRO', flag: '\u{1F1ED}\u{1F1F7}', keyPlayer: 'Luka Modric' },
    away: { name: 'Ghana', code: 'GHA', flag: '\u{1F1EC}\u{1F1ED}', keyPlayer: 'Mohammed Kudus' },
  },
  {
    id: 27,
    date: 'Sat, June 27 · 7:30 PM ET',
    kickoff: '2026-06-27T23:30:00Z',
    group: 'K',
    venue: 'Miami',
    home: { name: 'Colombia', code: 'COL', flag: '\u{1F1E8}\u{1F1F4}', keyPlayer: 'Luis Diaz' },
    away: { name: 'Portugal', code: 'POR', flag: '\u{1F1F5}\u{1F1F9}', keyPlayer: 'Cristiano Ronaldo' },
  },
  {
    id: 28,
    date: 'Sat, June 27 · 7:30 PM ET',
    kickoff: '2026-06-27T23:30:00Z',
    group: 'K',
    venue: 'Atlanta',
    home: { name: 'Congo DR', code: 'COD', flag: '\u{1F1E8}\u{1F1E9}', keyPlayer: 'Cedric Bakambu' },
    away: { name: 'Uzbekistan', code: 'UZB', flag: '\u{1F1FA}\u{1F1FF}', keyPlayer: 'Eldor Shomurodov' },
  },
  {
    id: 29,
    date: 'Sat, June 27 · 10:00 PM ET',
    kickoff: '2026-06-28T02:00:00Z',
    group: 'J',
    venue: 'Kansas City',
    home: { name: 'Algeria', code: 'ALG', flag: '\u{1F1E9}\u{1F1FF}', keyPlayer: 'Riyad Mahrez' },
    away: { name: 'Austria', code: 'AUT', flag: '\u{1F1E6}\u{1F1F9}', keyPlayer: 'David Alaba' },
  },
  {
    id: 30,
    date: 'Sat, June 27 · 10:00 PM ET',
    kickoff: '2026-06-28T02:00:00Z',
    group: 'J',
    venue: 'Dallas',
    home: { name: 'Jordan', code: 'JOR', flag: '\u{1F1EF}\u{1F1F4}', keyPlayer: 'Mousa Al-Tamari' },
    away: { name: 'Argentina', code: 'ARG', flag: '\u{1F1E6}\u{1F1F7}', keyPlayer: 'Lionel Messi' },
  },
]

// Week 4 — Weekstart 2026-06-29 (sheet betty_master_data). Knockout week: opens
// with the two Round-of-32 ties on 07-03; the eight Round-of-16 ties (IDs 33-40)
// are appended once the R32 bracket resolves (~07-03/04). Match IDs 31+.
export const WEEK4_MATCHES: MatchData[] = [
  {
    id: 31,
    date: 'Fri, July 3 · 2:00 PM ET',
    kickoff: '2026-07-03T18:00:00Z', // 14:00 ET (UTC-4)
    group: 'R32',
    venue: 'Dallas',
    home: { name: 'Australia', code: 'AUS', flag: '\u{1F1E6}\u{1F1FA}', keyPlayer: 'Mat Ryan' },
    away: { name: 'Egypt', code: 'EGY', flag: '\u{1F1EA}\u{1F1EC}', keyPlayer: 'Mohamed Salah' },
  },
  {
    id: 32,
    date: 'Fri, July 3 · 6:00 PM ET',
    kickoff: '2026-07-03T22:00:00Z', // 18:00 ET
    group: 'R32',
    venue: 'Miami',
    home: { name: 'Argentina', code: 'ARG', flag: '\u{1F1E6}\u{1F1F7}', keyPlayer: 'Lionel Messi' },
    away: { name: 'Cape Verde', code: 'CVE', flag: '\u{1F1E8}\u{1F1FB}', keyPlayer: 'Ryan Mendes' },
  },
  // Round of 16 — 6 ties whose pairings are set (FIFA feed, comp 17 / season 285023).
  // The remaining 2 R16 ties (Atlanta, Vancouver) depend on the Jul 3 R32 winners
  // (AUS/EGY, ARG/CVE) and are appended once those resolve (~Jul 4).
  {
    id: 33,
    date: 'Sat, July 4 · 1:00 PM ET',
    kickoff: '2026-07-04T17:00:00Z', // 13:00 ET (UTC-4)
    group: 'R16',
    venue: 'Houston',
    home: { name: 'Canada', code: 'CAN', flag: '\u{1F1E8}\u{1F1E6}', keyPlayer: 'Alphonso Davies' },
    away: { name: 'Morocco', code: 'MOR', flag: '\u{1F1F2}\u{1F1E6}', keyPlayer: 'Achraf Hakimi' },
  },
  {
    id: 34,
    date: 'Sat, July 4 · 5:00 PM ET',
    kickoff: '2026-07-04T21:00:00Z', // 17:00 ET
    group: 'R16',
    venue: 'Philadelphia',
    home: { name: 'Paraguay', code: 'PAR', flag: '\u{1F1F5}\u{1F1FE}', keyPlayer: 'Miguel Almiron' },
    away: { name: 'France', code: 'FRA', flag: '\u{1F1EB}\u{1F1F7}', keyPlayer: 'Kylian Mbappe' },
  },
  {
    id: 35,
    date: 'Sun, July 5 · 4:00 PM ET',
    kickoff: '2026-07-05T20:00:00Z', // 16:00 ET
    group: 'R16',
    venue: 'New Jersey',
    home: { name: 'Brazil', code: 'BRA', flag: '\u{1F1E7}\u{1F1F7}', keyPlayer: 'Vinicius Jr' },
    away: { name: 'Norway', code: 'NOR', flag: '\u{1F1F3}\u{1F1F4}', keyPlayer: 'Erling Haaland' },
  },
  {
    id: 36,
    date: 'Sun, July 5 · 8:00 PM ET',
    kickoff: '2026-07-06T00:00:00Z', // 20:00 ET (Jul 5)
    group: 'R16',
    venue: 'Mexico City',
    home: { name: 'Mexico', code: 'MEX', flag: '\u{1F1F2}\u{1F1FD}', keyPlayer: 'Edson Alvarez' },
    away: { name: 'England', code: 'ENG', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', keyPlayer: 'Jude Bellingham' },
  },
  {
    id: 37,
    date: 'Mon, July 6 · 3:00 PM ET',
    kickoff: '2026-07-06T19:00:00Z', // 15:00 ET
    group: 'R16',
    venue: 'Dallas',
    home: { name: 'Portugal', code: 'POR', flag: '\u{1F1F5}\u{1F1F9}', keyPlayer: 'Cristiano Ronaldo' },
    away: { name: 'Spain', code: 'ESP', flag: '\u{1F1EA}\u{1F1F8}', keyPlayer: 'Nico Williams' },
  },
  {
    id: 38,
    date: 'Mon, July 6 · 8:00 PM ET',
    kickoff: '2026-07-07T00:00:00Z', // 20:00 ET (Jul 6)
    group: 'R16',
    venue: 'Seattle',
    home: { name: 'USA', code: 'USA', flag: '\u{1F1FA}\u{1F1F8}', keyPlayer: 'Christian Pulisic' },
    away: { name: 'Belgium', code: 'BEL', flag: '\u{1F1E7}\u{1F1EA}', keyPlayer: 'Kevin De Bruyne' },
  },
  // Final 2 R16 ties, appended Jul 4 once the last R32 winners resolved.
  {
    id: 39,
    date: 'Tue, July 7 · 12:00 PM ET',
    kickoff: '2026-07-07T16:00:00Z', // 12:00 ET (UTC-4)
    group: 'R16',
    venue: 'Atlanta',
    home: { name: 'Argentina', code: 'ARG', flag: '\u{1F1E6}\u{1F1F7}', keyPlayer: 'Lionel Messi' },
    away: { name: 'Egypt', code: 'EGY', flag: '\u{1F1EA}\u{1F1EC}', keyPlayer: 'Mohamed Salah' },
  },
  {
    id: 40,
    date: 'Tue, July 7 · 4:00 PM ET',
    kickoff: '2026-07-07T20:00:00Z', // 16:00 ET (UTC-4)
    group: 'R16',
    venue: 'Vancouver',
    home: { name: 'Switzerland', code: 'SWZ', flag: '\u{1F1E8}\u{1F1ED}', keyPlayer: 'Granit Xhaka' },
    away: { name: 'Colombia', code: 'COL', flag: '\u{1F1E8}\u{1F1F4}', keyPlayer: 'Luis Diaz' },
  },
]

// Week 5 — Quarter-finals (FIFA matches 97-100). Opens as Next Mon Jul 6 00:00 UTC
// (usual cadence). Fixed schedule / venues / kickoffs below; pairings resolve from
// the Week-4 R16 winners. Following the Week-4 append model, this array holds only
// RESOLVED ties — the rest are appended as their R16 feeders finish (Jul 6-7), so
// players never see an unpredictable TBD card:
//   id 42 (Los Angeles), Fri Jul 10 19:00Z: W37 (Portugal/Spain, Jul 6) v W38 (USA/Belgium, Jul 7)
//   id 43 (Miami),       Sat Jul 11 21:00Z: W35 (Brazil/Norway, Jul 5)  v W36 (Mexico/England, Jul 6)
//   id 44 (Kansas City), Sun Jul 12 01:00Z: W39 (Argentina/Egypt, Jul 7) v W40 (Switzerland/Colombia, Jul 7)
export const WEEK5_MATCHES: MatchData[] = [
  {
    id: 41,
    date: 'Thu, July 9 · 4:00 PM ET',
    kickoff: '2026-07-09T20:00:00Z', // 16:00 ET (UTC-4)
    group: 'QF',
    venue: 'Boston',
    home: { name: 'France', code: 'FRA', flag: '\u{1F1EB}\u{1F1F7}', keyPlayer: 'Kylian Mbappe' }, // won R16 id 34 (v Paraguay)
    away: { name: 'Morocco', code: 'MOR', flag: '\u{1F1F2}\u{1F1E6}', keyPlayer: 'Achraf Hakimi' }, // won R16 id 33 (v Canada)
  },
]

// ---------------------------------------------------------------------------
// Weekly cadence (UTC). Each "week" is a pool of matches players predict.
//   - becomesCurrent: Friday 06:00 UTC — this week becomes the default "current"
//     week (the previous week's results are collected / Grams prize awarded).
//   - opensAsNext:   Monday 00:00 UTC — this week appears as the optional
//     "Next week" tab so newcomers / early birds can predict ahead.
//     null = the first week, which is never shown as a "next" tab.
// => Mon→Fri both current + next are selectable; Fri→Mon only the current week.
// Per-match locking is still at kickoff (isMatchLocked), so opening a week early
// carries no integrity risk: a started match can never be predicted.
// ---------------------------------------------------------------------------
export interface WeekDef {
  id: string                  // week_id, e.g. '2026_24'
  label: string               // 'Week 1'
  matches: MatchData[]
  becomesCurrent: string      // ISO, Friday 06:00 UTC
  opensAsNext: string | null  // ISO, Monday 00:00 UTC (null for the first week)
}

export const WEEKS: WeekDef[] = [
  { id: '2026_24', label: 'Week 1', matches: WEEK1_MATCHES,  becomesCurrent: '2026-06-12T06:00:00Z', opensAsNext: null },
  { id: '2026_25', label: 'Week 2', matches: WEEK25_MATCHES, becomesCurrent: '2026-06-19T06:00:00Z', opensAsNext: '2026-06-15T00:00:00Z' },
  { id: '2026_26', label: 'Week 3', matches: WEEK3_MATCHES,  becomesCurrent: '2026-06-26T06:00:00Z', opensAsNext: '2026-06-22T00:00:00Z' },
  { id: '2026_27', label: 'Week 4', matches: WEEK4_MATCHES,  becomesCurrent: '2026-07-03T06:00:00Z', opensAsNext: '2026-06-29T00:00:00Z' },
  // Week 5 (Quarter-finals). Opens as Next Mon Jul 6 00:00 UTC (usual cadence) with
  // the one resolved tie (France v Morocco); QF2-4 are appended to WEEK5_MATCHES as
  // their R16 feeders finish (Jul 6-7). becomesCurrent Thu Jul 9 06:00 UTC — before
  // the first QF (Jul 9 20:00Z).
  { id: '2026_28', label: 'Week 5', matches: WEEK5_MATCHES,  becomesCurrent: '2026-07-09T06:00:00Z', opensAsNext: '2026-07-06T00:00:00Z' },
]

// Resolve which week is "current" and whether a "next" week is open, from now.
//   current = the latest week whose becomesCurrent has passed (fallback: first).
//   next    = the week after current, but only once its opensAsNext has passed.
export function resolveWeeks(now: Date = getNow()): { current: WeekDef; next: WeekDef | null } {
  let current = WEEKS[0]
  for (const w of WEEKS) {
    if (now >= new Date(w.becomesCurrent)) current = w
  }
  const idx = WEEKS.indexOf(current)
  const candidate = WEEKS[idx + 1] ?? null
  const next =
    candidate && candidate.opensAsNext && now >= new Date(candidate.opensAsNext)
      ? candidate
      : null
  return { current, next }
}

// Back-compat: the current week's matches/label. Prefer resolveWeeks() in new code.
export const ACTIVE_MATCHES: MatchData[] = resolveWeeks().current.matches
export const ACTIVE_WEEK_LABEL: string = resolveWeeks().current.label

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
