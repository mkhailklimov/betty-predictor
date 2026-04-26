import axios from 'axios'
import { User, Match, Prediction, LeaderboardEntry } from '../types'

// Host-based API routing: prod domain → prod Worker, everything else → dev Worker.
// Lets the `dev` branch's preview URL hit the dev API without a separate env var.
function resolveApiBase(): string {
  if (typeof window === 'undefined') return 'http://localhost:8000'
  const host = window.location.hostname
  if (host === 'app.bettyscores.com') return 'https://api.bettyscores.com'
  if (host.endsWith('.pages.dev')) return 'https://betty-api-dev.mihel-klimm.workers.dev'
  return import.meta.env.VITE_API_URL || 'http://localhost:8000'
}

const API_BASE = resolveApiBase()

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tg_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// User API
export const userApi = {
  register: (userData: { tg_id: string; username?: string }) =>
    api.post<User>('/api/user/register', userData),
  getMe: () => api.get<User>('/api/user/me'),
  getProfile: (userId: string) => api.get<User>(`/api/user/${userId}`),
  saveWallet: (ton_address: string) =>
    api.post<{ ok: boolean }>('/api/user/wallet', { ton_address }),
}

// Matches API
export const matchesApi = {
  getActive: () => api.get<Match[]>('/api/matches/active'),
  getAll: () => api.get<Match[]>('/api/matches'),
  getById: (matchId: string) => api.get<Match>(`/api/matches/${matchId}`),
}

// Predictions API
export const predictionsApi = {
  create: (data: {
    match_id: string
    prediction_type: '1' | 'X' | '2'
    predicted_score?: { home: number; away: number }
  }) => api.post<Prediction>('/api/predictions', data),
  getUserPredictions: (userId: string) => api.get<Prediction[]>(`/api/predictions/user/${userId}`),
  getMyPredictions: () => api.get<Prediction[]>('/api/predictions/me'),
  getMatchPredictions: (matchId: string) => api.get<Prediction[]>(`/api/predictions/match/${matchId}`),
}

// Leaderboard API
export const leaderboardApi = {
  getWeekly: (week?: number) =>
    api.get<LeaderboardEntry[]>(week ? `/api/leaderboard?week=${week}` : '/api/leaderboard'),
  getOverall: () => api.get<LeaderboardEntry[]>('/api/leaderboard/overall'),
}

// Rewards API
export const rewardsApi = {
  getEarned: (userId: string) => api.get(`/api/rewards/${userId}`),
  claimRewards: () => api.post('/api/rewards/claim', {}),
}

export default api
