export interface User {
  id: string
  tg_id: string
  username?: string
  is_premium?: boolean
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

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  prediction_type: '1' | 'X' | '2'
  predicted_score?: {
    home: number
    away: number
  }
  points_earned?: number
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
  is_premium?: boolean
}

export interface WeeklyReward {
  user_id: string
  week: number
  points: number
  ton_amount: number
  status: 'pending' | 'claimed'
  claimed_at?: string
}
