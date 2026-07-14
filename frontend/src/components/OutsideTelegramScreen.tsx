import React from 'react'
import '../styles/OutsideTelegramScreen.css'

const BOT_USERNAME = 'bettyscores_bot'
const TG_HTTPS_LINK = `https://t.me/${BOT_USERNAME}`

// Deliberately no auto-redirect. t.me is outside our control and has gone
// unresolvable before (2026-07-14: no NS records, dead worldwide); navigating
// away replaces this card with a browser error page and strands the visitor.
// Keeping the card up means the bot username — which works even when t.me does
// not — always stays on screen.
export const OutsideTelegramScreen: React.FC = () => {
  return (
    <div className="outside-tg">
      <div className="outside-tg__card">
        <img src="/betty-logo.png" alt="Betty Scores" className="outside-tg__logo" />
        <h1 className="outside-tg__title">Betty Scores lives in Telegram</h1>
        <p className="outside-tg__body">
          Predictions, points, and your weekly 1&nbsp;TON prize all run inside
          Telegram. This page can&apos;t sign you in or save bets.
        </p>
        <a
          className="outside-tg__button"
          href={TG_HTTPS_LINK}
        >
          Open @{BOT_USERNAME}
        </a>
        <p className="outside-tg__hint">
          Button not working? Open Telegram and search for{' '}
          <strong>@{BOT_USERNAME}</strong>.
        </p>
      </div>
    </div>
  )
}
