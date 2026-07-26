import React from 'react'
import { MatchData, ALL_SCORES, getCardImage, getTeamImage, isMatchLocked } from '../data/matches'
import '../styles/MatchCard.css'

interface MatchCardProps {
  match: MatchData
  prediction: { outcome: string; score: string } | null
  onPredict: (matchId: string, outcome: string, score: string) => void
}

// Last-resort tile when a team has neither our card art nor a feed crest.
function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, prediction, onPredict }) => {
  const [selectedOutcome, setSelectedOutcome] = React.useState<string | null>(
    prediction?.outcome || null
  )
  const [selectedScore, setSelectedScore] = React.useState<string | null>(
    prediction?.score || null
  )

  // Re-render exactly at kickoff (and when the tab regains focus) so an
  // already-open session locks itself live — without needing a reload.
  const [, tick] = React.useState(0)
  React.useEffect(() => {
    const rerender = () => tick(n => n + 1)
    const ms = new Date(match.kickoff).getTime() - Date.now()
    const timer = ms > 0 ? window.setTimeout(rerender, ms) : undefined
    const onVisible = () => { if (document.visibilityState === 'visible') rerender() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      if (timer) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [match.kickoff])

  // v1 showed the World Cup group or knockout stage. A weekly game spans many
  // competitions, so the equivalent context is which competition this is.
  const stageLabel = match.league

  const locked = isMatchLocked(match)
  // Our own card art exists for national teams only. Club fixtures fall back to
  // the crest the feed carries on the match row — without it a club match would
  // render as two blank tiles.
  const homeCard = getCardImage(match.home.code)
  const awayCard = getCardImage(match.away.code)
  const homeArt = getTeamImage(match.home)
  const awayArt = getTeamImage(match.away)

  // An outcome on its own is already a valid bet (1 pt); the exact score upgrades it
  // to 3. So persist as soon as the outcome is tapped, rather than waiting for a
  // score that many players never pick — an unsaved outcome used to vanish entirely.
  // Re-tapping the selected outcome is a no-op: there is no delete endpoint, so
  // clearing it locally would leave a ghost bet on the backend. Players change a bet
  // by picking a different outcome.
  const handleOutcome = (outcome: string) => {
    if (locked || selectedOutcome === outcome) return
    setSelectedOutcome(outcome)
    setSelectedScore(null)
    onPredict(match.id, outcome, '')
  }

  const handleScore = (score: string) => {
    if (locked || !selectedOutcome) return
    // Re-tapping the chosen score drops back to an outcome-only bet (score cleared).
    const next = selectedScore === score ? '' : score
    setSelectedScore(next || null)
    onPredict(match.id, selectedOutcome, next)
  }

  return (
    <div className={`mc ${locked ? 'mc--locked' : ''}`}>
      {/* Locked overlay */}
      {locked && (
        <div className="mc__locked-badge">
          <span>&#128274; Match started — betting closed</span>
        </div>
      )}

      {/* Team cards */}
      <div className="mc__cards">
        <div className="mc__card-side">
          {homeCard ? (
            <img src={homeCard} alt={match.home.name} className="mc__card-img" />
          ) : (
            <div className="mc__card-fallback">
              {homeArt
                ? <img src={homeArt} alt={match.home.name} className="mc__card-flag-img" />
                : <span className="mc__card-initials">{initials(match.home.name)}</span>}
            </div>
          )}
          <span className="mc__card-name">{match.home.name}</span>
        </div>

        <div className="mc__card-vs">
          <span className="mc__card-vs-text">VS</span>
          <span className="mc__card-info">{stageLabel}</span>
          <span className="mc__card-info">{match.date}</span>
        </div>

        <div className="mc__card-side">
          {awayCard ? (
            <img src={awayCard} alt={match.away.name} className="mc__card-img" />
          ) : (
            <div className="mc__card-fallback">
              {awayArt
                ? <img src={awayArt} alt={match.away.name} className="mc__card-flag-img" />
                : <span className="mc__card-initials">{initials(match.away.name)}</span>}
            </div>
          )}
          <span className="mc__card-name">{match.away.name}</span>
        </div>
      </div>

      {/* Outcome buttons */}
      <div className={`mc__outcomes ${locked ? 'mc__outcomes--locked' : ''}`}>
        <button
          className={`mc__btn mc__btn--w1 ${selectedOutcome === '1' ? 'mc__btn--active' : ''}`}
          onClick={() => handleOutcome('1')}
          disabled={locked}
        >
          WIN 1
        </button>
        <button
          className={`mc__btn mc__btn--draw ${selectedOutcome === 'X' ? 'mc__btn--active' : ''}`}
          onClick={() => handleOutcome('X')}
          disabled={locked}
        >
          DRAW
        </button>
        <button
          className={`mc__btn mc__btn--w2 ${selectedOutcome === '2' ? 'mc__btn--active' : ''}`}
          onClick={() => handleOutcome('2')}
          disabled={locked}
        >
          WIN 2
        </button>
      </div>

      {/* Score buttons — all from 9:0 to 0:9 */}
      {selectedOutcome && !locked && (
        <div className="mc__scores">
          <div className="mc__scores-grid">
            {ALL_SCORES.map(s => {
              const [h, a] = s.split(':').map(Number)
              const isWin1 = h > a
              const isDraw = h === a
              const isWin2 = a > h
              const matchesOutcome =
                (selectedOutcome === '1' && isWin1) ||
                (selectedOutcome === 'X' && isDraw) ||
                (selectedOutcome === '2' && isWin2)

              return (
                <button
                  key={s}
                  className={`mc__score ${selectedScore === s ? 'mc__score--active' : ''} ${!matchesOutcome ? 'mc__score--dim' : ''}`}
                  onClick={() => matchesOutcome && handleScore(s)}
                  disabled={!matchesOutcome}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Saved indicator */}
      {prediction && (
        <div className={`mc__saved ${locked ? 'mc__saved--locked' : ''}`}>
          <span className="mc__saved-text">
            {locked ? '&#128274; ' : ''}
            {prediction.outcome === '1' ? match.home.name + ' wins' : prediction.outcome === '2' ? match.away.name + ' wins' : 'Draw'}
            {prediction.score
              ? ' — ' + prediction.score
              : locked
                ? ' — no score'
                : ' — saved. Pick the exact score for 3 pts'}
          </span>
        </div>
      )}
    </div>
  )
}
