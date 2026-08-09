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

const LEAGUES = [
  { code: 'eng.1', short: 'EPL' },
  { code: 'esp.1', short: 'La Liga' },
  { code: 'ita.1', short: 'Serie A' },
  { code: 'ger.1', short: 'Bund.' },
  { code: 'fra.1', short: 'Ligue 1' },
  { code: 'uefa.cl', short: 'UCL' },
]

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
      <aside className="landing__tribune landing__tribune--left">
        <div className="landing__banner">Ad space</div>
        <div className="landing__banner">Ad space</div>
        <div className="landing__banner">Ad space</div>
      </aside>

      {/* Pitch — the main column */}
      <div className="landing__pitch">
        {/* Top goal */}
        <div className="landing__goal" />

        {/* Hero */}
        <header className="landing__hero">
          <img src="/betty-logo.png" alt="Betty" className="landing__logo" />
          <h1 className="landing__title">Betty Scores</h1>
          <p className="landing__subtitle">European Football Predictions</p>
          <p className="landing__slogan">Sniff the score, catch a star</p>
          <div className="landing__leagues">
            {LEAGUES.map(l => (
              <span key={l.code} className="landing__league-badge">{l.short}</span>
            ))}
          </div>
        </header>

        {/* Tab navigation */}
        <nav className="landing__tabs">
          {([
            ['play', 'Play'],
            ['leaderboard', 'Leaderboard'],
            ['champions', 'Champions'],
            ['rules', 'Rules'],
          ] as [Section, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`landing__tab${section === key ? ' landing__tab--active' : ''}`}
              onClick={() => setSection(key)}
            >
              {label}
            </button>
          ))}
        </nav>

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
                  href="https://t.me/bettyscores_bot/app"
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

        {/* Bottom goal */}
        <div className="landing__goal landing__goal--bottom" />
      </div>

      {/* Right tribune (desktop only) */}
      <aside className="landing__tribune landing__tribune--right">
        <div className="landing__banner">Ad space</div>
        <div className="landing__banner">Ad space</div>
        <div className="landing__banner">Ad space</div>
      </aside>

      {/* Sticky Telegram CTA for non-play tabs */}
      {section !== 'play' && (
        <a
          className="landing__sticky-cta"
          href="https://t.me/bettyscores_bot/app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Play in Telegram
        </a>
      )}
    </div>
  )
}
