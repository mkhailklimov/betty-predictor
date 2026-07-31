import React from 'react'
import '../styles/ScoreReels.css'

export const MAX_GOALS = 12

export function deriveOutcome(home: number, away: number): '1' | 'X' | '2' {
  return home > away ? '1' : home === away ? 'X' : '2'
}

interface ReelProps {
  value: number
  onChange: (v: number) => void
  disabled: boolean
  label: string
}

const Reel: React.FC<ReelProps> = ({ value, onChange, disabled, label }) => {
  const step = (delta: number) => {
    if (disabled) return
    const next = Math.min(MAX_GOALS, Math.max(0, value + delta))
    if (next !== value) onChange(next)
  }

  return (
    <div
      className="reel"
      role="spinbutton"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={MAX_GOALS}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); step(1) }
        if (e.key === 'ArrowDown') { e.preventDefault(); step(-1) }
      }}
    >
      <button
        className="reel__step" onClick={() => step(1)} disabled={disabled || value >= MAX_GOALS}
        aria-label={`${label} increase`} type="button"
      >&#9650;</button>

      <div className="reel__value">{value}</div>

      <button
        className="reel__step" onClick={() => step(-1)} disabled={disabled || value <= 0}
        aria-label={`${label} decrease`} type="button"
      >&#9660;</button>
    </div>
  )
}

interface ScoreReelsProps {
  home: number
  away: number
  onChange: (home: number, away: number) => void
  disabled?: boolean
  touched: boolean
  homeName: string
  awayName: string
}

export const ScoreReels: React.FC<ScoreReelsProps> = ({
  home, away, onChange, disabled = false, touched, homeName, awayName,
}) => (
  <div className={`reels ${disabled ? 'reels--disabled' : ''} ${touched ? '' : 'reels--untouched'}`}>
    <div className="reels__row">
      <Reel value={home} onChange={(v) => onChange(v, away)} disabled={disabled} label={`${homeName} goals`} />
      <span className="reels__colon">:</span>
      <Reel value={away} onChange={(v) => onChange(home, v)} disabled={disabled} label={`${awayName} goals`} />
    </div>
    <p className="reels__hint">
      {disabled
        ? 'Betting closed'
        : touched
          ? (home > away ? `${homeName} to win` : home < away ? `${awayName} to win` : 'Draw')
          : 'Tap arrows to set score'}
    </p>
  </div>
)
