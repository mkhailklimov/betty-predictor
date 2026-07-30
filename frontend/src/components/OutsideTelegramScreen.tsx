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

type LandingSection = 'play' | 'about' | 'champions' | 'leaderboard' | 'matches' | 'privacy'

const BOT_USERNAME = 'bettyscores_bot'

export const OutsideTelegramScreen: React.FC<OutsideTelegramScreenProps> = ({ onGuest }) => {
  const [section, setSection] = React.useState<LandingSection>('play')

  const stripeNav = (
    <div className="outside-tg__stripe-nav">
      <button className="outside-tg__stripe-btn stripe-2" onClick={() => setSection('play')}>
        Home
      </button>
      <button className="outside-tg__stripe-btn stripe-3" onClick={() => setSection('about')}>
        About
      </button>
      <button className="outside-tg__stripe-btn stripe-4" onClick={() => setSection('champions')}>
        Champions
      </button>
      <button className="outside-tg__stripe-btn stripe-5" onClick={() => setSection('leaderboard')}>
        Leaderboard
      </button>
      <button className="outside-tg__stripe-btn stripe-6" onClick={() => setSection('matches')}>
        Matches
      </button>
      <button className="outside-tg__stripe-btn stripe-7" onClick={() => setSection('privacy')}>
        Privacy Policy
      </button>
    </div>
  )

  if (section !== 'play') {
    return (
      <div className="outside-tg outside-tg--page">
        {stripeNav}
        <div className="outside-tg__page-content">
          {section === 'about' && <AboutPage />}
          {section === 'champions' && <ChampionsPage />}
          {section === 'leaderboard' && <LeaderboardPage />}
          {section === 'matches' && <MainPage />}
          {section === 'privacy' && (
            <div className="about-page">
              <div className="page-header"><h1>Privacy Policy</h1></div>
              <section className="about-section">
                <p>Betty Scores stores only the minimum data needed to run the game: your Telegram user ID, username, and predictions. We do not share your data with third parties. Guest accounts are anonymous and can be deleted at any time by clearing your browser storage.</p>
              </section>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="outside-tg">
      {stripeNav}

      <p className="outside-tg__tagline">
        Predict the score and win stars <span className="outside-tg__star">⭐</span>!
      </p>

      <div className="outside-tg__circle">
        <img src="/betty-logo.png" alt="Betty Scores" className="outside-tg__logo" />
      </div>

      <div className="outside-tg__buttons">
        <a
          className="outside-tg__play outside-tg__play--tg"
          href="https://t.me/bettyscores_bot/app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Play in Telegram
        </a>
        <button
          className="outside-tg__play outside-tg__play--site"
          onClick={async () => {
            await onGuest()
            setSection('matches')
          }}
        >
          Play on site
        </button>
      </div>

      <p className="outside-tg__hint">
        Play on site as a guest — your predictions are saved. To win
        Telegram Stars prizes, open Betty in Telegram.
      </p>
    </div>
  )
}
