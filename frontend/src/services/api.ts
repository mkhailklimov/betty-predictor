import axios from 'axios'
import WebApp from '@twa-dev/sdk'
import { User, Match, Prediction, LeaderboardEntry, ChampionsResponse, WeekResponse } from '../types'

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

// Authenticate with Telegram's signed initData, which the API verifies against
// the bot token. We previously sent `Bearer <tg_id>` — an unsigned number, so
// anyone could act as any user by guessing it. Read it live from the SDK rather
// than from localStorage: it must be the launch string Telegram actually signed.
api.interceptors.request.use((config) => {
  const initData = WebApp.initData || ''
  if (initData) {
    config.headers.Authorization = `tma ${initData}`
  } else {
    // Outside Telegram there is no signed identity; fall back to the legacy
    // header so local dev (isLocalDev in App.tsx) still works. The API only
    // honours this while ALLOW_LEGACY_AUTH is on.
    const token = localStorage.getItem('tg_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// User API
export const userApi = {
  register: (userData: { tg_id: string; username?: string; first_name?: string; last_name?: string }) =>
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

// Weeks API — the v2 fixture source. The curation sheet publishes into D1 and
// this serves it; the app never talks to Google.
export const weeksApi = {
  getCurrent: () => api.get<WeekResponse>('/api/weeks/current'),
  getNext: () => api.get<WeekResponse>('/api/weeks/next'),
}

// Predictions API
export const predictionsApi = {
  create: (data: {
    match_id: string
    prediction_type: '1' | 'X' | '2'
    // null = an outcome-only bet (no exact score). The worker stores predicted_score
    // as nullable and scores such a bet on the outcome alone.
    predicted_score?: { home: number; away: number } | null
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

// Champions API — official weekly results from the Betty_Master_Data "Champions" tab.
export const championsApi = {
  getLastRound: (week?: string) =>
    api.get<ChampionsResponse>(week ? `/api/champions?week=${week}` : '/api/champions'),
}

// Payments API
export const paymentsApi = {
  createStarsInvoice: () =>
    api.post<{ invoice_url: string; payload: string }>('/api/payments/create-stars-invoice'),
  setFavTeam: (team_code: string) =>
    api.post<{ ok: boolean; fav_team: string }>('/api/user/fav-team', { team_code }),
}

// Rewards API
export const rewardsApi = {
  getEarned: (userId: string) => api.get(`/api/rewards/${userId}`),
  claimRewards: () => api.post('/api/rewards/claim', {}),
}

export default api
