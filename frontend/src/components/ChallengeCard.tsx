import React from 'react'
import { Challenge } from '../types'
import { ScoreReels } from './ScoreReels'
import '../styles/ChallengeCard.css'

interface ChallengeCardProps {
  challenge: Challenge
  onPredict: (challengeId: string, answer: string) => void
}

function parseScore(s: string): { home: number; away: number } | null {
  if (!s) return null
  const [h, a] = s.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(a)) return null
  return { home: h, away: a }
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// Type-specific illustration icons (large, sticker-style)
const TYPE_ICON: Record<string, string> = {
  will_score: '\u26BD',
  over_under: '\u{1F4CA}',
  clean_sheet: '\u{1F9E4}',
  first_to_score: '\u{1F3AF}',
  exact_score: '\u{1F3B0}',
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onPredict }) => {
  const isReels = challenge.options.length === 1 && challenge.options[0] === 'reels'
  const resolved = !!challenge.correct_answer
  const myAnswer = challenge.my_prediction?.answer ?? null
  const pointsEarned = challenge.my_prediction?.points_earned ?? 0
  const m = challenge.match

  const parsed = myAnswer ? parseScore(myAnswer) : null
  const [home, setHome] = React.useState(parsed?.home ?? 0)
  const [away, setAway] = React.useState(parsed?.away ?? 0)
  const [touched, setTouched] = React.useState(!!myAnswer)

  const handleOption = (answer: string) => {
    if (resolved) return
    onPredict(challenge.id, answer)
  }

  const handleReels = (h: number, a: number) => {
    if (resolved) return
    setHome(h)
    setAway(a)
    setTouched(true)
    onPredict(challenge.id, `${h}:${a}`)
  }

  const icon = TYPE_ICON[challenge.type] || '\u2753'

  return (
    <div className={`cc ${resolved ? 'cc--resolved' : ''}`}>
      {/* Points badge */}
      <div className="cc__points-badge">
        {challenge.points} {challenge.points === 1 ? 'pt' : 'pts'}
      </div>

      {/* Match illustration: crests + league, or big type icon */}
      {m ? (
        <div className="cc__match-header">
          <div className="cc__team">
            {m.crest_home
              ? <img src={m.crest_home} alt={m.home_team} className="cc__crest" />
              : <span className="cc__team-initials">{initials(m.home_team)}</span>}
            <span className="cc__team-name">{m.home_team}</span>
          </div>
          <div className="cc__vs">
            <span className="cc__type-icon">{icon}</span>
            {m.league && <span className="cc__league">{m.league}</span>}
          </div>
          <div className="cc__team">
            {m.crest_away
              ? <img src={m.crest_away} alt={m.away_team} className="cc__crest" />
              : <span className="cc__team-initials">{initials(m.away_team)}</span>}
            <span className="cc__team-name">{m.away_team}</span>
          </div>
        </div>
      ) : (
        <div className="cc__icon-hero">
          <span className="cc__icon-large">{icon}</span>
        </div>
      )}

      {/* Question */}
      <div className="cc__question">
        <span className="cc__question-text">{challenge.question}</span>
      </div>

      {/* Answer area */}
      {isReels ? (
        <div className="cc__reels">
          <ScoreReels
            home={home}
            away={away}
            onChange={handleReels}
            disabled={resolved}
            touched={touched}
            homeName={m?.home_team || 'Home'}
            awayName={m?.away_team || 'Away'}
          />
        </div>
      ) : (
        <div className="cc__options">
          {challenge.options.map((opt) => {
            const isSelected = myAnswer === opt
            const isCorrect = resolved && opt === challenge.correct_answer
            const isWrong = resolved && isSelected && opt !== challenge.correct_answer
            let cls = 'cc__option'
            if (isSelected && !resolved) cls += ' cc__option--selected'
            if (isCorrect) cls += ' cc__option--correct'
            if (isWrong) cls += ' cc__option--wrong'
            return (
              <button
                key={opt}
                className={cls}
                onClick={() => handleOption(opt)}
                disabled={resolved}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Result / saved indicator */}
      {resolved && myAnswer && (
        <div className={`cc__result ${pointsEarned > 0 ? 'cc__result--win' : 'cc__result--loss'}`}>
          {pointsEarned > 0
            ? `\u2705 Correct! +${pointsEarned} pts`
            : `\u274C Wrong \u2014 answer was: ${challenge.correct_answer}`}
        </div>
      )}
      {resolved && !myAnswer && (
        <div className="cc__result cc__result--missed">
          Answer: {challenge.correct_answer}
        </div>
      )}
      {!resolved && myAnswer && (
        <div className="cc__saved">
          Your pick: {myAnswer}
        </div>
      )}
    </div>
  )
}
