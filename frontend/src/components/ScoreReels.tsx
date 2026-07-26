import React from 'react'
import '../styles/ScoreReels.css'

// Two 0–12 reels ARE the bet. v1 asked for an outcome (1/X/2) and then offered a
// grid of ~30 curated scorelines; v2 asks only for a scoreline and derives the
// outcome from it. See docs/RELEASE-2.0.md §5.2.
export const MAX_GOALS = 12
const STOPS = Array.from({ length: MAX_GOALS + 1 }, (_, i) => i)

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
  const ref = React.useRef<HTMLDivElement>(null)
  const settleTimer = React.useRef<number | undefined>(undefined)
  // Suppress the scroll handler while we scroll programmatically, or the
  // smooth-scroll animation reports intermediate stops as user choices.
  const programmatic = React.useRef(false)

  const scrollToIndex = React.useCallback((i: number, smooth: boolean) => {
    const el = ref.current
    if (!el) return
    const stop = el.querySelector<HTMLElement>(`[data-stop="${i}"]`)
    if (!stop) return
    programmatic.current = true
    el.scrollTo({ top: stop.offsetTop - (el.clientHeight - stop.clientHeight) / 2, behavior: smooth ? 'smooth' : 'auto' })
    window.setTimeout(() => { programmatic.current = false }, smooth ? 400 : 50)
  }, [])

  // Park the reel on its current value on mount and whenever it changes from
  // outside (e.g. a saved bet loading in).
  React.useEffect(() => { scrollToIndex(value, false) }, [value, scrollToIndex])

  const handleScroll = () => {
    if (disabled || programmatic.current) return
    window.clearTimeout(settleTimer.current)
    // Scroll-snap has no "snapped" event, so settle on a short idle window and
    // read whichever stop is nearest the centre line.
    settleTimer.current = window.setTimeout(() => {
      const el = ref.current
      if (!el) return
      const centre = el.scrollTop + el.clientHeight / 2
      let best = value
      let bestDist = Infinity
      el.querySelectorAll<HTMLElement>('[data-stop]').forEach((stop) => {
        const d = Math.abs(stop.offsetTop + stop.clientHeight / 2 - centre)
        if (d < bestDist) { bestDist = d; best = Number(stop.dataset.stop) }
      })
      if (best !== value) onChange(best)
    }, 120)
  }

  const step = (delta: number) => {
    if (disabled) return
    const next = Math.min(MAX_GOALS, Math.max(0, value + delta))
    if (next === value) return
    onChange(next)
    scrollToIndex(next, true)
  }

  return (
    <div className="reel">
      {/* Buttons are not decoration: scroll-snap is unusable with a keyboard, and
          desktop trackpads overshoot a 13-stop column. */}
      <button
        className="reel__step" onClick={() => step(1)} disabled={disabled || value >= MAX_GOALS}
        aria-label={`${label} score up`} type="button"
      >&#9650;</button>

      <div
        className="reel__window" ref={ref} onScroll={handleScroll}
        role="spinbutton" tabIndex={disabled ? -1 : 0}
        aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={MAX_GOALS}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); step(1) }
          if (e.key === 'ArrowDown') { e.preventDefault(); step(-1) }
        }}
      >
        <div className="reel__pad" />
        {STOPS.map((n) => (
          <div
            key={n} data-stop={n}
            className={`reel__stop ${n === value ? 'reel__stop--active' : ''}`}
            onClick={() => { if (!disabled && n !== value) { onChange(n); scrollToIndex(n, true) } }}
          >
            {n}
          </div>
        ))}
        <div className="reel__pad" />
      </div>

      <button
        className="reel__step" onClick={() => step(-1)} disabled={disabled || value <= 0}
        aria-label={`${label} score down`} type="button"
      >&#9660;</button>
    </div>
  )
}

interface ScoreReelsProps {
  home: number
  away: number
  // touched=false means the player has not moved a reel yet, so the 0:0 on
  // screen is a placeholder and NOT a prediction. Nothing is saved until this
  // fires. See §5.2 — "touch-to-bet".
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
          : 'Spin both reels to place your bet'}
    </p>
  </div>
)
