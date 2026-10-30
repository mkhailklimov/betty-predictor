import React from 'react'
import WebApp from '@twa-dev/sdk'
import { guestApi } from '../services/api'
import '../styles/NicknameBar.css'

const NICK_KEY = 'betty_guest_nickname'

function readStorage(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

// Browser guests (players who came from YouTube, Facebook, ...) pick a nickname
// so they are ranked for the weekly Stars. Winners collect the Stars by opening
// Betty in Telegram, which moves their picks and prize to that account.
export const NicknameBar: React.FC = () => {
  const isGuest = !WebApp.initData && !readStorage('betty_tgauth') && !!readStorage('betty_guest_token')
  const [saved, setSaved] = React.useState(() => readStorage(NICK_KEY))
  const [justSaved, setJustSaved] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  if (!isGuest || (saved && !justSaved)) return null

  if (justSaved) {
    return (
      <div className="nick-bar nick-bar--done">
        You are in the race for Stars as <strong>{saved}</strong>. Winners collect them in Telegram.
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nick = value.trim()
    if (nick.length < 3) { setError('At least 3 characters'); return }
    setBusy(true)
    setError(null)
    try {
      const { data } = await guestApi.setNickname(nick)
      try { localStorage.setItem(NICK_KEY, data.nickname) } catch { /* private mode */ }
      setSaved(data.nickname)
      setJustSaved(true)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not save, try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="nick-bar" onSubmit={submit}>
      <div className="nick-bar__text">
        Pick a nickname to compete for Telegram Stars. Your YouTube or Facebook name works.
      </div>
      <div className="nick-bar__row">
        <input
          className="nick-bar__input"
          value={value}
          onChange={e => setValue(e.target.value)}
          maxLength={20}
          placeholder="Your nickname"
          aria-label="Nickname"
        />
        <button className="nick-bar__btn" type="submit" disabled={busy}>Save</button>
      </div>
      {error && <div className="nick-bar__error">{error}</div>}
    </form>
  )
}
