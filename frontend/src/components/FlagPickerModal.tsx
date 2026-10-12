import React, { useState } from 'react'
import { paymentsApi } from '../services/api'
import { AVATAR_LIST, getAvatar } from '../data/avatars'
import '../styles/FlagPickerModal.css'

type Tab = 'nation' | 'epl'

interface Props {
  current?: string | null
  onPicked: (code: string) => void
  onClose: () => void
}

export const FlagPickerModal: React.FC<Props> = ({ current, onPicked, onClose }) => {
  const [picking, setPicking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>(getAvatar(current)?.group ?? 'nation')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const shown = AVATAR_LIST.filter(
    (a) => a.group === tab && (!q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q))
  )

  const select = async (code: string) => {
    setPicking(code)
    setError(null)
    try {
      await paymentsApi.setFavTeam(code)
      onPicked(code)
    } catch (e: unknown) {
      console.error('setFavTeam failed:', e)
      setError("Couldn't save. Try again.")
      setPicking(null)
    }
  }

  return (
    <div className="flag-modal__backdrop" onClick={onClose}>
      <div className="flag-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flag-modal__header">
          <h2>Pick your avatar</h2>
          <button className="flag-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="flag-modal__hint">
          Your avatar appears next to your name in the Hall of Fame.
        </p>
        <div className="flag-modal__tabs">
          <button
            className={`flag-modal__tab ${tab === 'nation' ? 'flag-modal__tab--active' : ''}`}
            onClick={() => setTab('nation')}
          >
            Nations
          </button>
          <button
            className={`flag-modal__tab ${tab === 'epl' ? 'flag-modal__tab--active' : ''}`}
            onClick={() => setTab('epl')}
          >
            Premier League
          </button>
        </div>
        {tab === 'nation' && (
          <input
            className="flag-modal__search"
            type="search"
            placeholder="Search country"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
        <div className="flag-modal__grid">
          {shown.map((a) => {
            const isCurrent = a.code === current
            const isLoading = picking === a.code
            return (
              <button
                key={a.code}
                className={`flag-tile ${isCurrent ? 'flag-tile--current' : ''}`}
                onClick={() => select(a.code)}
                disabled={picking !== null}
                title={a.name}
              >
                <img src={a.src} alt={a.name} loading="lazy" />
                <span className="flag-tile__code">{isLoading ? '…' : a.name}</span>
              </button>
            )
          })}
          {shown.length === 0 && <p className="flag-modal__empty">No match</p>}
        </div>
        {error && <p className="flag-modal__error">{error}</p>}
      </div>
    </div>
  )
}
