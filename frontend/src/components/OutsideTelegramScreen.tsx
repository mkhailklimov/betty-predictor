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
      <p className="outside-tg__tagline">
        Guess the score and win <span className="outside-tg__star">⭐</span> Stars!
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
