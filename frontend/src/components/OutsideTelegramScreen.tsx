import React from 'react'
import '../styles/OutsideTelegramScreen.css'

const BOT_USERNAME = 'bettyscores_bot'
const TG_HTTPS_LINK = `https://t.me/${BOT_USERNAME}`
const REDIRECT_DELAY_MS = 2000

export const OutsideTelegramScreen: React.FC = () => {
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.href = TG_HTTPS_LINK
    }, REDIRECT_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="outside-tg">
      <div className="outside-tg__card">
        <img src="/betty-logo.png" alt="Betty Scores" className="outside-tg__logo" />
        <h1 className="outside-tg__title">Opening Betty Scores…</h1>
        <p className="outside-tg__body">
          Taking you to Telegram, where predictions, points, and your weekly
          1&nbsp;TON prize live. This page can&apos;t sign you in or save bets — the
          game runs inside Telegram.
        </p>
        <div className="outside-tg__spinner" aria-hidden="true" />
        <a
          className="outside-tg__button"
          href={TG_HTTPS_LINK}
        >
          Open @{BOT_USERNAME}
        </a>
        <p className="outside-tg__hint">
          Not redirected automatically? Tap the button above, or open Telegram and
          search for <strong>@{BOT_USERNAME}</strong>.
        </p>
      </div>
    </div>
  )
}
