import React from 'react'
import '../styles/OutsideTelegramScreen.css'

const BOT_USERNAME = 'bettyscores_bot'

// No t.me anywhere on this screen, and no auto-redirect. t.me is outside our
// control and went fully unresolvable on 2026-07-14 (no NS records, dead
// worldwide), which turned every browser visit to app.bettyscores.com — our one
// canonical link — into ERR_NAME_NOT_RESOLVED. Both routes below sidestep it:
//   tg://  is handled by the OS and never does a DNS lookup, so it opens the
//          installed Telegram app even while t.me is down.
//   web.telegram.org resolves independently of t.me and works in any browser.
const TG_APP_LINK = `tg://resolve?domain=${BOT_USERNAME}`
const TG_WEB_LINK = `https://web.telegram.org/k/#@${BOT_USERNAME}`

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
        <a className="outside-tg__button" href={TG_APP_LINK}>
          Open in the Telegram app
        </a>
        <p className="outside-tg__hint">
          No Telegram app?{' '}
          <a href={TG_WEB_LINK} target="_blank" rel="noreferrer">
            Open @{BOT_USERNAME} in Telegram Web
          </a>
          . Or open Telegram yourself and search for{' '}
          <strong>@{BOT_USERNAME}</strong>.
        </p>
      </div>
    </div>
  )
}
