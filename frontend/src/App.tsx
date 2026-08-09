import React from 'react'
import './styles/App.css'
import { useTelegram } from './hooks/useTelegram'
import { userApi, guestApi } from './services/api'
import { MainPage, syncPendingPredictions } from './pages/MainPage'
import { Navigation } from './components/Navigation'
import { ChampionsPage } from './pages/ChampionsPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { OutsideTelegramScreen } from './components/OutsideTelegramScreen'
import { User } from './types'

type Page = 'champions' | 'matches' | 'leaderboard'

const PAGE_PATHS: Record<string, Page> = {
  '/': 'matches',
  '/matches': 'matches',
  '/leaderboard': 'leaderboard',
  '/champions': 'champions',
}

const PATH_FOR_PAGE: Record<Page, string> = {
  matches: '/matches',
  leaderboard: '/leaderboard',
  champions: '/champions',
}

function pageFromPath(): Page {
  return PAGE_PATHS[window.location.pathname] || 'matches'
}

function captureRefSource(): string | undefined {
  const params = new URLSearchParams(window.location.search)
  return params.get('ref') || params.get('utm_source') || undefined
}

const isLocalDev = (): boolean => {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local')
}

function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>(pageFromPath)
  const [, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [needsAuth, setNeedsAuth] = React.useState(false)
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
            // Token expired or invalid — clear and show auth screen.
            localStorage.removeItem('betty_tgauth')
            localStorage.removeItem('betty_guest_token')
            setNeedsAuth(true)
          }
        } else if (isLocalDev()) {
          // Dev mode.
          console.log('No Telegram user, running in dev mode')
        } else {
          // Browser visitor, no auth — show login/guest screen.
          setNeedsAuth(true)
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

  // Handle Telegram Login Widget callback.
  const handleWidgetLogin = React.useCallback(async (authData: Record<string, string>) => {
    const authJson = JSON.stringify(authData)
    localStorage.setItem('betty_tgauth', authJson)

    // If there was a guest session, merge it.
    const guestToken = localStorage.getItem('betty_guest_token')

    try {
      if (guestToken) {
        const { data } = await guestApi.merge(guestToken, authData.username)
        setUser(data.user)
        localStorage.removeItem('betty_guest_token')
      } else {
        // Register or fetch via widget auth.
        const { data } = await userApi.register({
          tg_id: String(authData.id),
          username: authData.username,
          first_name: authData.first_name,
          last_name: authData.last_name,
          ref_source: refSource.current,
        })
        setUser(data)
      }
      setNeedsAuth(false)
    } catch (error) {
      console.error('Widget login failed:', error)
    }
  }, [])

  // Handle guest play.
  const handleGuestPlay = React.useCallback(async () => {
    try {
      const { data } = await guestApi.create(refSource.current)
      localStorage.setItem('betty_guest_token', data.guest_token)
      setUser(data)
      setNeedsAuth(false)
    } catch (error) {
      console.error('Guest creation failed:', error)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
      </div>
    )
  }

  // Web visitors always see the stadium landing page, whether they have
  // a guest token or not. Only Telegram mini app users get the in-app view.
  if (!isTelegramApp) {
    return <OutsideTelegramScreen onLogin={handleWidgetLogin} onGuest={handleGuestPlay} />
  }

  return (
    <div className="app">
      <div className="app-content">
        {currentPage === 'champions' && <ChampionsPage />}
        {currentPage === 'matches' && <MainPage />}
        {currentPage === 'leaderboard' && <LeaderboardPage />}
      </div>
      <Navigation currentPage={currentPage} onPageChange={navigateTo} />
    </div>
  )
}

export default App
