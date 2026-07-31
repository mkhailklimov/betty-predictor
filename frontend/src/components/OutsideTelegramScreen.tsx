import React from 'react'
import { AboutPage } from '../pages/AboutPage'
import { ChampionsPage } from '../pages/ChampionsPage'
import { LeaderboardPage } from '../pages/LeaderboardPage'
import { MainPage } from '../pages/MainPage'
import '../styles/OutsideTelegramScreen.css'

interface OutsideTelegramScreenProps {
  onLogin: (authData: Record<string, string>) => void
  onGuest: () => void
}

type LandingSection = 'play' | 'rules' | 'champions' | 'leaderboard' | 'privacy' | 'stats'

export const OutsideTelegramScreen: React.FC<OutsideTelegramScreenProps> = ({ onGuest }) => {
  const [section, setSection] = React.useState<LandingSection>('play')

  // Auto-create guest session on mount so Play tab works immediately
  React.useEffect(() => {
    onGuest()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stripeBtn = (stripe: string, key: LandingSection, label: string) => (
    <button
      className={`outside-tg__stripe-btn ${stripe}${section === key ? ' outside-tg__stripe-btn--active' : ''}`}
      onClick={() => setSection(key)}
    >
      {label}
    </button>
  )

  const stripeNav = (
    <div className="outside-tg__stripe-nav">
      {stripeBtn('stripe-2', 'play', 'Play')}
      {stripeBtn('stripe-3', 'rules', 'Rules')}
      {stripeBtn('stripe-4', 'champions', 'Champions')}
      {stripeBtn('stripe-5', 'leaderboard', 'Leaderboard')}
      {stripeBtn('stripe-6', 'privacy', 'Privacy')}
      {stripeBtn('stripe-7', 'stats', 'My Stats')}
    </div>
  )

  if (section === 'play') {
    return (
      <div className="outside-tg outside-tg--page">
        {stripeNav}
        <div className="outside-tg__page-content">
          <MainPage />
          <div className="outside-tg__tg-cta">
            <p>Want to get Stars for smart predictions? Play in Telegram!</p>
            <a
              className="outside-tg__tg-cta-btn"
              href="https://t.me/bettyscores_bot/app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Telegram
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="outside-tg outside-tg--page">
      {stripeNav}
      <div className="outside-tg__page-content">
        {section === 'rules' && <AboutPage />}
        {section === 'champions' && <ChampionsPage />}
        {section === 'leaderboard' && <LeaderboardPage />}
        {section === 'privacy' && (
          <div className="about-page">
            <div className="page-header"><h1>Privacy Policy</h1></div>
            <section className="about-section">
              <p>Betty Scores stores only the minimum data needed to run the game: your Telegram user ID, username, and predictions. We do not share your data with third parties. Guest accounts are anonymous and can be deleted at any time by clearing your browser storage.</p>
            </section>
          </div>
        )}
        {section === 'stats' && (
          <div className="about-page">
            <div className="page-header"><h1>My Stats</h1></div>
            <section className="about-section">
              <p>Your personal stats will appear here once you start predicting.</p>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
