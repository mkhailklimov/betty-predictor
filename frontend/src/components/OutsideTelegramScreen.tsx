import React from 'react'
import { AboutPage } from '../pages/AboutPage'
import { ChampionsPage } from '../pages/ChampionsPage'
import { LeaderboardPage } from '../pages/LeaderboardPage'
import '../styles/OutsideTelegramScreen.css'

interface OutsideTelegramScreenProps {
  onLogin: (authData: Record<string, string>) => void
  onGuest: () => void
}

type LandingSection = 'play' | 'about' | 'champions' | 'leaderboard' | 'privacy'

const BOT_USERNAME = 'bettyscores_bot'

export const OutsideTelegramScreen: React.FC<OutsideTelegramScreenProps> = ({ onLogin, onGuest }) => {
  const widgetRef = React.useRef<HTMLDivElement>(null)
  const [section, setSection] = React.useState<LandingSection>('play')

  // Mount the Telegram Login Widget. It calls window.onTelegramAuth on success.
  React.useEffect(() => {
    (window as any).onTelegramAuth = (user: Record<string, string>) => {
      onLogin(user)
    }

    if (widgetRef.current && widgetRef.current.childElementCount === 0) {
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?22'
      script.setAttribute('data-telegram-login', BOT_USERNAME)
      script.setAttribute('data-size', 'large')
      script.setAttribute('data-radius', '12')
      script.setAttribute('data-onauth', 'onTelegramAuth(user)')
      script.setAttribute('data-request-access', 'write')
      script.async = true
      widgetRef.current.appendChild(script)
    }

    return () => { delete (window as any).onTelegramAuth }
  }, [onLogin])

  const stripeNav = (
    <div className="outside-tg__stripe-nav">
      <button className="outside-tg__stripe-btn stripe-3" onClick={() => setSection(section === 'about' ? 'play' : 'about')}>
        About
      </button>
      <button className="outside-tg__stripe-btn stripe-4" onClick={() => setSection(section === 'champions' ? 'play' : 'champions')}>
        Champions
      </button>
      <button className="outside-tg__stripe-btn stripe-5" onClick={() => setSection(section === 'leaderboard' ? 'play' : 'leaderboard')}>
        Leaderboard
      </button>
      <button className="outside-tg__stripe-btn stripe-6" onClick={() => setSection(section === 'privacy' ? 'play' : 'privacy')}>
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

      <button className="outside-tg__play" onClick={onGuest}>
        Play
      </button>

      <div className="outside-tg__widget" ref={widgetRef} />
    </div>
  )
}
