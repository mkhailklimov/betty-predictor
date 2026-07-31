import React from 'react'
import './styles/App.css'
import { useTelegram } from './hooks/useTelegram'
import { userApi, guestApi } from './services/api'
import { MainPage, syncPendingPredictions } from './pages/MainPage'
import { Navigation } from './components/Navigation'
import { ChampionsPage } from './pages/ChampionsPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { AboutPage } from './pages/AboutPage'
import { User } from './types'

type Page = 'champions' | 'matches' | 'leaderboard' | 'about'

const PAGE_PATHS: Record<string, Page> = {
  '/': 'matches',
  '/matches': 'matches',
  '/leaderboard': 'leaderboard',
  '/champions': 'champions',
  '/about': 'about',
}

const PATH_FOR_PAGE: Record<Page, string> = {
  matches: '/matches',
  leaderboard: '/leaderboard',
  champions: '/champions',
  about: '/about',
}

function pageFromPath(): Page {
  return PAGE_PATHS[window.location.pathname] || 'matches'
}

function captureRefSource(): string | undefined {
  const params = new URLSearchParams(window.location.search)
  return params.get('ref') || params.get('utm_source') || undefined
}

function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>(pageFromPath)
  const [, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const { tg, user: tgUser, userId, initData } = useTelegram()
  const refSource = React.useRef(captureRefSource())

  // History API routing — update URL without reload.
  const navigateTo = React.useCallback((page: Page) => {
    setCurrentPage(page)
    const path = PATH_FOR_PAGE[page]
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }
  }, [])

  React.useEffect(() => {
    const onPopState = () => setCurrentPage(pageFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Determine auth mode on mount.
  const isTelegramApp = !!initData
  const hasWidgetAuth = !!localStorage.getItem('betty_tgauth')
  const hasGuestToken = !!localStorage.getItem('betty_guest_token')

  React.useEffect(() => {
    if (tg && isTelegramApp) {
      tg.MainButton.hide()
      tg.expand()
    }
  }, [tg, isTelegramApp])

  // Register or fetch user on startup.
  React.useEffect(() => {
    const initUser = async () => {
      try {
        if (isTelegramApp) {
          // Mini App auth — signed initData.
          const tgId = userId ? String(userId) : null
          if (!tgId) {
            setIsLoading(false)
            return
          }
          localStorage.setItem('tg_token', tgId)
          await registerWithRetry()
        } else if (hasWidgetAuth || hasGuestToken) {
          // Returning browser user — widget or guest token in localStorage.
          try {
            const { data } = await userApi.getMe()
            setUser(data)
          } catch {
            // Token expired or invalid — clear and re-create guest.
            localStorage.removeItem('betty_tgauth')
            localStorage.removeItem('betty_guest_token')
            const { data: fresh } = await guestApi.create(refSource.current)
            localStorage.setItem('betty_guest_token', fresh.guest_token)
            setUser(fresh)
          }
        } else {
          // Browser visitor — auto-create guest session so matches show immediately.
          try {
            const { data } = await guestApi.create(refSource.current)
            localStorage.setItem('betty_guest_token', data.guest_token)
            setUser(data)
          } catch (error) {
            console.error('Auto-guest creation failed:', error)
          }
        }
      } catch (error) {
        console.error('User init error:', error)
      } finally {
        setIsLoading(false)
        void syncPendingPredictions()
      }
    }

    async function registerWithRetry() {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const tgUserObj = typeof tgUser === 'object' && tgUser ? tgUser : null
          const { data } = await userApi.register({
            tg_id: String(userId),
            username: tgUserObj?.username,
            first_name: tgUserObj?.first_name,
            last_name: tgUserObj?.last_name,
            ref_source: refSource.current,
          })
          setUser(data)
          return
        } catch (error) {
          console.error(`Registration attempt ${attempt + 1} failed:`, error)
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
        }
      }
    }

    initUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app-content">
        {currentPage === 'champions' && <ChampionsPage />}
        {currentPage === 'matches' && <MainPage />}
        {currentPage === 'leaderboard' && <LeaderboardPage />}
        {currentPage === 'about' && <AboutPage />}
      </div>
      <Navigation currentPage={currentPage} onPageChange={navigateTo} />
    </div>
  )
}

export default App
