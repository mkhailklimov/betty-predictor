import React from 'react'
import '../styles/OutsideTelegramScreen.css'

interface OutsideTelegramScreenProps {
  onLogin: (authData: Record<string, string>) => void
  onGuest: () => void
}

const BOT_USERNAME = 'bettyscores_bot'

export const OutsideTelegramScreen: React.FC<OutsideTelegramScreenProps> = ({ onLogin, onGuest }) => {
  const widgetRef = React.useRef<HTMLDivElement>(null)

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

  return (
    <div className="outside-tg">
      <div className="outside-tg__card">
        <img src="/betty-logo.png" alt="Betty Scores" className="outside-tg__logo" />
        <h1 className="outside-tg__title">Betty Scores</h1>
        <p className="outside-tg__body">
          Predict 10 football matches every week. Top predictors win Telegram
          Stars prizes.
        </p>

        <div className="outside-tg__widget" ref={widgetRef} />

        <div className="outside-tg__divider">
          <span>or</span>
        </div>

        <button className="outside-tg__button outside-tg__button--guest" onClick={onGuest}>
          Play as guest
        </button>

        <p className="outside-tg__hint">
          Guests can play and appear on the leaderboard, but are not eligible
          for Stars prizes until they log in with Telegram.
        </p>
      </div>
    </div>
  )
}
