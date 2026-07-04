import React from 'react'
import './styles/App.css'
import { useTelegram } from './hooks/useTelegram'
import { userApi } from './services/api'
import { MainPage, syncPendingPredictions } from './pages/MainPage'
import { Navigation } from './components/Navigation'
import { ChampionsPage } from './pages/ChampionsPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { OutsideTelegramScreen } from './components/OutsideTelegramScreen'
import { User } from './types'

type Page = 'champions' | 'matches' | 'leaderboard'

const isLocalDev = (): boolean => {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local')
}

function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>('matches')
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const { tg, user: tgUser, userId, initData } = useTelegram()

  if (!initData && !isLocalDev()) {
    return <OutsideTelegramScreen />
  }

  React.useEffect(() => {
    if (tg) {
      tg.MainButton.hide()
      tg.expand()
    }
  }, [tg])

  // Register or fetch user on startup
  React.useEffect(() => {
    const initUser = async () => {
      try {
        const tgId = userId ? String(userId) : null
        if (!tgId) {
          // Dev mode — no Telegram user
          console.log('No Telegram user, running in dev mode')
          setIsLoading(false)
          return
        }

        // Store tg_id as auth token
        localStorage.setItem('tg_token', tgId)

        // Register (returns existing user if already registered). Retry a few
        // times: a failed registration used to let the user in with no D1 row,
        // so their predictions hit "User not found" and were silently lost.
        let registered = false
        for (let attempt = 0; attempt < 3 && !registered; attempt++) {
          try {
            const { data } = await userApi.register({
              tg_id: tgId,
              username: tgUser?.username,
              first_name: tgUser?.first_name,
              last_name: tgUser?.last_name,
            })
            setUser(data)
            registered = true
          } catch (error) {
            console.error(`User registration attempt ${attempt + 1} failed:`, error)
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
          }
        }
      } catch (error) {
        console.error('User init error:', error)
      } finally {
        setIsLoading(false)
        // Flush any predictions stored locally from a prior session/blip.
        void syncPendingPredictions()
      }
    }

    initUser()
  }, [userId, tgUser])

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
      </div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  )
}

export default App
