import React from 'react'
import './styles/App.css'
import { useTelegram } from './hooks/useTelegram'
import { userApi } from './services/api'
import { MainPage } from './pages/MainPage'
import { Navigation } from './components/Navigation'
import { ChampionsPage } from './pages/ChampionsPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { User } from './types'

type Page = 'champions' | 'matches' | 'leaderboard'

function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>('matches')
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const { tg, user: tgUser, userId } = useTelegram()

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

        // Register (returns existing user if already registered)
        const { data } = await userApi.register({
          tg_id: tgId,
          username: tgUser?.username,
        })
        setUser(data)
      } catch (error) {
        console.error('User registration error:', error)
      } finally {
        setIsLoading(false)
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
