export interface User {
  id: string
  tg_id: string
  username?: string
  is_premium?: boolean | number
  fav_team?: string | null
  points: number
  predictions_count: number
}

export interface Match {
  id: string
  home_team: string
  away_team: string
  date: string
  time?: string
  round?: string
  status: 'upcoming' | 'live' | 'finished'
  home_score?: number
  away_score?: number
}

// A row of the v2 `matches` table as served by /api/weeks/*. Superset of Match:
// the provenance and art columns migration 0004 added.
export interface ApiMatch extends Match {
  week_id?: string
  match_date_utc?: string
  league?: string
  source?: string
  source_id?: string
  crest_home?: string | null
  crest_away?: string | null
  code_home?: string | null
  code_away?: string | null
}

export interface WeekResponse {
  week_id: string
  starts_at: string
  ends_at: string
  status: 'draft' | 'published' | 'closed'
  published_at: string | null
  matches: ApiMatch[]
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  prediction_type: '1' | 'X' | '2'
  predicted_score?: {
    home: number
    away: number
  }
  created_at: string
  match?: Match
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  points: number
  correct_predictions: number
  correct_scores: number
  weeks_won?: number
  stars_earned?: number
  grams?: number
  is_premium?: boolean
  fav_team?: string | null
}

export interface ChampionEntry {
  rank: number
  user_id: string
  username: string
  points: number
  correct_predictions: number
  correct_scores: number
  matches_predicted: number
  week_id: string
  ton_earned: number
}

export interface ChampionsResponse {
  week_id: string | null
  results: ChampionEntry[]
}

export interface WeeklyReward {
  user_id: string
  week: number
  points: number
  ton_amount: number
  status: 'pending' | 'claimed'
  claimed_at?: string
}

// v2.1 Challenges
export type ChallengeType = 'exact_score' | 'will_score' | 'over_under' | 'clean_sheet' | 'first_to_score'

export interface Challenge {
  id: string
  week_id: string
  match_id: string | null
  type: ChallengeType
  question: string
  options: string[]  // ["Yes","No"] or ["Over","Under"] or ["reels"]
  points: number
  correct_answer: string | null
  resolved_at: string | null
  created_at: string
  my_prediction: { challenge_id: string; answer: string; points_earned: number } | null
}

export interface ChallengesResponse {
  week_id: string
  starts_at: string
  ends_at: string
  challenges: Challenge[]
}
