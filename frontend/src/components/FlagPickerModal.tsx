import React, { useState } from 'react'
import { paymentsApi } from '../services/api'
import '../styles/FlagPickerModal.css'

const TEAMS: ReadonlyArray<{ code: string; name: string }> = [
  { code: 'ALG', name: 'Algeria' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'AUS', name: 'Australia' },
  { code: 'BIH', name: 'Bosnia & Herzegovina' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'CAN', name: 'Canada' },
  { code: 'CRO', name: 'Croatia' },
  { code: 'CUR', name: 'Curaçao' },
  { code: 'CVE', name: 'Cape Verde' },
  { code: 'CZE', name: 'Czechia' },
  { code: 'ENG', name: 'England' },
  { code: 'ESP', name: 'Spain' },
  { code: 'FRA', name: 'France' },
  { code: 'GER', name: 'Germany' },
  { code: 'JAP', name: 'Japan' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'MOR', name: 'Morocco' },
  { code: 'NED', name: 'Netherlands' },
  { code: 'NOR', name: 'Norway' },
  { code: 'PAR', name: 'Paraguay' },
  { code: 'POR', name: 'Portugal' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'SAF', name: 'South Africa' },
  { code: 'SCO', name: 'Scotland' },
  { code: 'SEN', name: 'Senegal' },
  { code: 'SWE', name: 'Sweden' },
  { code: 'SWZ', name: 'Switzerland' },
  { code: 'TUR', name: 'Turkey' },
  { code: 'USA', name: 'United States' },
  { code: 'UZB', name: 'Uzbekistan' },
]

interface Props {
  current?: string | null
  onPicked: (code: string) => void
  onClose: () => void
}

export const FlagPickerModal: React.FC<Props> = ({ current, onPicked, onClose }) => {
  const [picking, setPicking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
          <h2>Pick your team</h2>
          <button className="flag-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="flag-modal__hint">
          Your team's flag will appear next to your name on the leaderboard.
        </p>
        <div className="flag-modal__grid">
          {TEAMS.map((t) => {
            const isCurrent = t.code === current
            const isLoading = picking === t.code
            return (
              <button
                key={t.code}
                className={`flag-tile ${isCurrent ? 'flag-tile--current' : ''}`}
                onClick={() => select(t.code)}
                disabled={picking !== null}
                title={t.name}
              >
                <img src={`/teams/Cards/${t.code}.png`} alt={t.name} />
                <span className="flag-tile__code">{isLoading ? '…' : t.code}</span>
              </button>
            )
          })}
        </div>
        {error && <p className="flag-modal__error">{error}</p>}
      </div>
    </div>
  )
}
