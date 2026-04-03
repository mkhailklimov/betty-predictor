export interface MatchData {
  id: number
  date: string
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

// Team codes that have card images in /teams/Cards/
export const TEAM_CARDS: Record<string, boolean> = {
  MEX: true, SAF: true, CAN: true, BIH: true, USA: true, PAR: true, BRA: true, MOR: true, GER: true, CUR: true, NED: true, JAP: true, FRA: true, ALG: true, ARG: true, SEN: true, ENG: true, CRO: true, ESP: true, CVE: true,
}

export function getCardImage(code: string): string | null {
  return TEAM_CARDS[code] ? `/teams/Cards/${code}.png` : null
}

export const WEEK1_MATCHES: MatchData[] = [
  {
    id: 1,
    date: 'Thu, June 11',
    group: 'A',
    venue: 'Mexico City',
    home: { name: 'Mexico', code: 'MEX', flag: '\u{1F1F2}\u{1F1FD}', keyPlayer: 'Edson Alvarez' },
    away: { name: 'South Africa', code: 'SAF', flag: '\u{1F1FF}\u{1F1E6}', keyPlayer: 'Percy Tau' },
  },
  {
    id: 2,
    date: 'Fri, June 12',
    group: 'B',
    venue: 'Toronto',
    home: { name: 'Canada', code: 'CAN', flag: '\u{1F1E8}\u{1F1E6}', keyPlayer: 'Alphonso Davies' },
    away: { name: 'Bosnia & Herzegovina', code: 'BIH', flag: '\u{1F1E7}\u{1F1E6}', keyPlayer: 'Edin Dzeko' },
  },
  {
    id: 3,
    date: 'Fri, June 12',
    group: 'D',
    venue: 'Los Angeles',
    home: { name: 'USA', code: 'USA', flag: '\u{1F1FA}\u{1F1F8}', keyPlayer: 'Christian Pulisic' },
    away: { name: 'Paraguay', code: 'PAR', flag: '\u{1F1F5}\u{1F1FE}', keyPlayer: 'Miguel Almiron' },
  },
  {
    id: 4,
    date: 'Sat, June 13',
    group: 'C',
    venue: 'New Jersey',
    home: { name: 'Brazil', code: 'BRA', flag: '\u{1F1E7}\u{1F1F7}', keyPlayer: 'Vinicius Jr' },
    away: { name: 'Morocco', code: 'MOR', flag: '\u{1F1F2}\u{1F1E6}', keyPlayer: 'Achraf Hakimi' },
  },
  {
    id: 5,
    date: 'Sun, June 14',
    group: 'E',
    venue: 'Houston',
    home: { name: 'Germany', code: 'GER', flag: '\u{1F1E9}\u{1F1EA}', keyPlayer: 'Jamal Musiala' },
    away: { name: 'Curacao', code: 'CUR', flag: '\u{1F1E8}\u{1F1FC}', keyPlayer: 'Juninho Bacuna' },
  },
  {
    id: 6,
    date: 'Sun, June 14',
    group: 'F',
    venue: 'Dallas',
    home: { name: 'Netherlands', code: 'NED', flag: '\u{1F1F3}\u{1F1F1}', keyPlayer: 'Cody Gakpo' },
    away: { name: 'Japan', code: 'JAP', flag: '\u{1F1EF}\u{1F1F5}', keyPlayer: 'Takefusa Kubo' },
  },
  {
    id: 7,
    date: 'Mon, June 15',
    group: 'H',
    venue: 'Atlanta',
    home: { name: 'Spain', code: 'ESP', flag: '\u{1F1EA}\u{1F1F8}', keyPlayer: 'Lamine Yamal' },
    away: { name: 'Cape Verde', code: 'CPV', flag: '\u{1F1E8}\u{1F1FB}', keyPlayer: 'Ryan Mendes' },
  },
  {
    id: 8,
    date: 'Tue, June 16',
    group: 'I',
    venue: 'New Jersey',
    home: { name: 'France', code: 'FRA', flag: '\u{1F1EB}\u{1F1F7}', keyPlayer: 'Kylian Mbappe' },
    away: { name: 'Senegal', code: 'SEN', flag: '\u{1F1F8}\u{1F1F3}', keyPlayer: 'Sadio Mane' },
  },
  {
    id: 9,
    date: 'Wed, June 17',
    group: 'L',
    venue: 'Dallas',
    home: { name: 'England', code: 'ENG', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', keyPlayer: 'Jude Bellingham' },
    away: { name: 'Croatia', code: 'CRO', flag: '\u{1F1ED}\u{1F1F7}', keyPlayer: 'Luka Modric' },
  },
  {
    id: 10,
    date: 'Wed, June 17',
    group: 'J',
    venue: 'Kansas City',
    home: { name: 'Argentina', code: 'ARG', flag: '\u{1F1E6}\u{1F1F7}', keyPlayer: 'Lionel Messi' },
    away: { name: 'Algeria', code: 'ALG', flag: '\u{1F1E9}\u{1F1FF}', keyPlayer: 'Riyad Mahrez' },
  },
]

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
