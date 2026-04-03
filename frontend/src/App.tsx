import React from 'react'
import './styles/App.css'
import { useTelegram } from './hooks/useTelegram'
import { MainPage } from './pages/MainPage'
import { Navigation } from './components/Navigation'
import { ChampionsPage } from './pages/ChampionsPage'
import { LeaderboardPage } from './pages/LeaderboardPage'

type Page = 'champions' | 'matches' | 'leaderboard'

function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>('matches')
  const { tg } = useTelegram()

  React.useEffect(() => {
    if (tg) {
      tg.MainButton.hide()
      tg.expand()
    }
  }, [tg])

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
