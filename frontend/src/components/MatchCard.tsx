import React from 'react'
import { MatchData, getCardImage, getTeamImage, isMatchLocked } from '../data/matches'
import { ScoreReels, deriveOutcome } from './ScoreReels'
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

// "2:1" → {home,away}. Stored predictions keep the v1 "h:a" string shape so the
// localStorage/POST contract is unchanged under reels (§5.2, load-bearing for §4).
function parseScore(score?: string): { home: number; away: number } | null {
  if (!score) return null
  const [h, a] = score.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(a)) return null
  return { home: h, away: a }
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, prediction, onPredict }) => {
  // The reels always show a scoreline, so "has the player bet?" can't be read off
  // the displayed value — an untouched card shows 0:0, which is also a perfectly
  // legitimate prediction. `touched` is the real signal, seeded from a saved bet.
  const parsed = parseScore(prediction?.score)
  const [home, setHome] = React.useState(parsed?.home ?? 0)
  const [away, setAway] = React.useState(parsed?.away ?? 0)
  const [touched, setTouched] = React.useState(Boolean(prediction?.outcome))

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

  // Every reel movement is a complete bet: the scoreline is the prediction and the
  // outcome falls out of it. There is no outcome-only state any more, and nothing
  // is saved until the first movement — an untouched 0:0 is not a prediction.
  const handleReels = (h: number, a: number) => {
    if (locked) return
    setHome(h)
    setAway(a)
    setTouched(true)
    onPredict(match.id, deriveOutcome(h, a), `${h}:${a}`)
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

      {/* Two reels 0–12 are the whole bet; the outcome is derived from them. */}
      <ScoreReels
        home={home}
        away={away}
        onChange={handleReels}
        disabled={locked}
        touched={touched}
        homeName={match.home.name}
        awayName={match.away.name}
      />

      {/* Saved indicator */}
      {prediction && touched && (
        <div className={`mc__saved ${locked ? 'mc__saved--locked' : ''}`}>
          <span className="mc__saved-text">
            {locked ? '\u{1F512} ' : ''}
            {prediction.outcome === '1' ? match.home.name + ' wins' : prediction.outcome === '2' ? match.away.name + ' wins' : 'Draw'}
            {prediction.score ? ' — ' + prediction.score : ''}
            {locked ? '' : ' — saved'}
          </span>
        </div>
      )}
    </div>
  )
}
