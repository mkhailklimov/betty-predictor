import React from 'react'
import { MatchData, ALL_SCORES, getCardImage, getLocalFlag, isMatchLocked, flagToTwemojiUrl } from '../data/matches'
import '../styles/MatchCard.css'

interface MatchCardProps {
  match: MatchData
  prediction: { outcome: string; score: string } | null
  onPredict: (matchId: number, outcome: string, score: string) => void
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

  const locked = isMatchLocked(match)
  const homeCard = getCardImage(match.home.code)
  const awayCard = getCardImage(match.away.code)
  const homeFlag = getLocalFlag(match.home.code) || flagToTwemojiUrl(match.home.flag)
  const awayFlag = getLocalFlag(match.away.code) || flagToTwemojiUrl(match.away.flag)

  const handleOutcome = (outcome: string) => {
    if (locked) return
    if (selectedOutcome === outcome) {
      setSelectedOutcome(null)
      setSelectedScore(null)
    } else {
      setSelectedOutcome(outcome)
      setSelectedScore(null)
    }
  }

  const handleScore = (score: string) => {
    if (locked) return
    if (selectedScore === score) {
      setSelectedScore(null)
    } else {
      setSelectedScore(score)
      if (selectedOutcome) {
        onPredict(match.id, selectedOutcome, score)
      }
    }
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
              <img src={homeFlag} alt={match.home.name} className="mc__card-flag-img" />
            </div>
          )}
          <span className="mc__card-name">{match.home.name}</span>
        </div>

        <div className="mc__card-vs">
          <span className="mc__card-vs-text">VS</span>
          <span className="mc__card-info">Group {match.group}</span>
          <span className="mc__card-info">{match.date}</span>
        </div>

        <div className="mc__card-side">
          {awayCard ? (
            <img src={awayCard} alt={match.away.name} className="mc__card-img" />
          ) : (
            <div className="mc__card-fallback">
              <img src={awayFlag} alt={match.away.name} className="mc__card-flag-img" />
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
            {prediction.outcome === '1' ? match.home.name + ' wins' : prediction.outcome === '2' ? match.away.name + ' wins' : 'Draw'} — {prediction.score}
          </span>
        </div>
      )}
    </div>
  )
}
