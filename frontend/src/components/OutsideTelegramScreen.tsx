import React from 'react'
import '../styles/OutsideTelegramScreen.css'

const BOT_USERNAME = 'bettyscores_bot'
const TG_DEEP_LINK = `tg://resolve?domain=${BOT_USERNAME}`
const TG_HTTPS_LINK = `https://t.me/${BOT_USERNAME}`

export const OutsideTelegramScreen: React.FC = () => {
  const handleOpen = () => {
    window.location.href = TG_DEEP_LINK
    setTimeout(() => {
      window.location.href = TG_HTTPS_LINK
    }, 500)
  }

  return (
    <div className="outside-tg">
      <div className="outside-tg__card">
        <img src="/betty-logo.png" alt="Betty Scores" className="outside-tg__logo" />
        <h1 className="outside-tg__title">Open in Telegram</h1>
        <p className="outside-tg__body">
          Betty Scores runs as a Telegram Mini App. Predictions, points, and your weekly
          1&nbsp;TON prize all live inside Telegram — this page can&apos;t sign you in or save bets.
        </p>
        <button className="outside-tg__button" onClick={handleOpen}>
          Open @{BOT_USERNAME}
        </button>
        <p className="outside-tg__hint">
          Or open Telegram and search for <strong>@{BOT_USERNAME}</strong>.
        </p>
      </div>
    </div>
  )
}
