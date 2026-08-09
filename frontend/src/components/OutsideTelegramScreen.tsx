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

type Section = 'play' | 'rules' | 'champions' | 'leaderboard'

function getTelegramLink(): string {
  const guestToken = localStorage.getItem('betty_guest_token')
  if (guestToken) {
    return `https://t.me/bettyscores_bot/app?startapp=gt_${guestToken}`
  }
  return 'https://t.me/bettyscores_bot/app'
}

export const OutsideTelegramScreen: React.FC<OutsideTelegramScreenProps> = ({ onGuest }) => {
  const [section, setSection] = React.useState<Section>('play')

  // Create guest session if none exists yet
  React.useEffect(() => {
    if (!localStorage.getItem('betty_guest_token') && !localStorage.getItem('betty_tgauth')) {
      onGuest()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="landing">
      {/* Left tribune (desktop only) */}
      <aside className="landing__tribune landing__tribune--left" />

      {/* Pitch — the main column */}
      <div className="landing__pitch">
        {/* Hero */}
        <header className="landing__hero">
          <img src="/betty-logo.png" alt="Betty" className="landing__logo" />
          <h1 className="landing__title">Betty Scores</h1>
          <p className="landing__slogan">Sniff the Score, Catch a Star&#11088;!</p>
        </header>

        {/* Content */}
        <div className="landing__content">
          {section === 'play' && (
            <>
              <MainPage />
              <div className="landing__cta">
                <p className="landing__cta-text">
                  Compete on the leaderboard &amp; earn stars — play in Telegram!
                </p>
                <a
                  className="landing__cta-btn"
                  href={getTelegramLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Telegram
                </a>
              </div>
            </>
          )}
          {section === 'leaderboard' && <LeaderboardPage />}
          {section === 'champions' && <ChampionsPage />}
          {section === 'rules' && <AboutPage />}
        </div>

      </div>

      {/* Right tribune (desktop only) */}
      <aside className="landing__tribune landing__tribune--right" />

      {/* Bottom navigation */}
      <nav className="landing__bottom-nav">
        {([
          ['play',        '\u26BD', 'Play'],
          ['champions',   '\uD83C\uDFC6', 'Champions'],
          ['leaderboard', '\u2B50', 'Hall of Fame'],
          ['rules',       '\uD83D\uDCD6', 'Rules & Privacy'],
        ] as [Section, string, string][]).map(([key, icon, label]) => (
          <button
            key={key}
            className={`landing__nav-btn${section === key ? ' landing__nav-btn--active' : ''}`}
            onClick={() => setSection(key)}
          >
            <span className="landing__nav-icon">{icon}</span>
            <span className="landing__nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
