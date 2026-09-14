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

// Type-specific fallback icons keep the card usable while a fixture sticker is
// being added to the illustration library.
const TYPE_ICON: Record<string, string> = {
  will_score: '\u26BD',
  over_under: '\u{1F4CA}',
  clean_sheet: '\u{1F9E4}',
  first_to_score: '\u{1F3AF}',
  exact_score: '\u{1F3B0}',
}

const RELEASE21_STICKERS: Record<string, { src: string; alt: string }> = {
  '1': {
    src: '/stickers/ENG_CRO.jpg',
    alt: 'England versus Croatia',
  },
  '2': {
    src: '/stickers/RAYA.jpg',
    alt: 'Raya making a save against Leeds United',
  },
  '3': {
    src: '/stickers/MUN_TOT.jpg',
    alt: 'Manchester United versus Tottenham Hotspur',
  },
  '4': {
    src: '/stickers/HAALAND.jpg',
    alt: 'Haaland celebrating a goal',
  },
  '5': {
    src: '/stickers/CHE_BRE.jpg',
    alt: 'Chelsea versus Brentford',
  },
  '6': {
    src: '/stickers/ARS_LEE.jpg',
    alt: 'Arsenal versus Leeds United exact score',
  },
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onPredict }) => {
  const isReels = challenge.options.length === 1 && challenge.options[0] === 'reels'
  const resolved = !!challenge.correct_answer
  const myAnswer = challenge.my_prediction?.answer ?? null
  const pointsEarned = challenge.my_prediction?.points_earned ?? 0
  const m = challenge.match
  const challengeNumberMatch = challenge.id.match(/(?:^|[-_])(?:ch[-_])?(\d+)$/i)
  const challengeNumber = challengeNumberMatch
    ? String(Number(challengeNumberMatch[1]))
    : null
  const fixtureText = m ? `${m.home_team} ${m.away_team}`.toLowerCase() : ''
  const questionText = challenge.question.toLowerCase()
  const stickerKey = challengeNumber ||
    (fixtureText.includes('england') && fixtureText.includes('croatia') ? '1' :
      fixtureText.includes('arsenal') && challenge.type === 'clean_sheet' ? '2' :
        fixtureText.includes('manchester united') && fixtureText.includes('tottenham') ? '3' :
          fixtureText.includes('liverpool') && fixtureText.includes('manchester city') &&
            challenge.type === 'will_score' ? '4' :
            fixtureText.includes('chelsea') && fixtureText.includes('brentford') ? '5' :
              fixtureText.includes('arsenal') && challenge.type === 'exact_score' ? '6' :
                questionText.includes('england') && questionText.includes('croatia') ? '1' :
                  questionText.includes('arsenal') && challenge.type === 'clean_sheet' ? '2' :
                    questionText.includes('manchester united') && questionText.includes('tottenham') ? '3' :
                      questionText.includes('liverpool') && questionText.includes('manchester city') &&
                        challenge.type === 'will_score' ? '4' :
                        questionText.includes('chelsea') && questionText.includes('brentford') ? '5' :
                          questionText.includes('arsenal') && challenge.type === 'exact_score' ? '6' : null)
  const sticker = stickerKey ? RELEASE21_STICKERS[stickerKey] : null
  const displayQuestion = stickerKey === '1'
    ? 'What will be the final score: England vs Croatia?'
    : stickerKey === '2'
      ? 'Will Raya keep a clean sheet against Leeds?'
      : stickerKey === '3'
        ? 'Who scores first: Red Devils, Spurs, or nobody?'
        : stickerKey === '4'
            ? 'Will Haaland score a goal?'
          : stickerKey === '5'
        ? 'Will Chelsea beat Brentford?'
            : stickerKey === '6'
          ? 'What will be the final score: Arsenal vs Leeds?'
              : challenge.question

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

  const optionLabel = (option: string): string => {
    if (challenge.type === 'first_to_score') {
      if (option === 'Home') return 'Red Devils'
      if (option === 'Away') return 'Spurs'
    }
    if (challenge.type === 'over_under') {
      if (option === 'Over') return 'Over 2.5'
      if (option === 'Under') return 'Under 2.5'
    }
    return option
  }

  const icon = TYPE_ICON[challenge.type] || '\u2753'

  return (
    <div className={`cc ${resolved ? 'cc--resolved' : ''}`}>
      {/* Points badge */}
      <div className="cc__points-badge">
        {challenge.points} {challenge.points === 1 ? 'pt' : 'pts'}
      </div>

      {sticker && (
        <img
          className="cc__illustration"
          src={sticker.src}
          alt={sticker.alt}
        />
      )}

      {!sticker && (
        <div className="cc__icon-hero">
          <span className="cc__icon-large">{icon}</span>
        </div>
      )}

      {/* Question */}
      <div className="cc__question">
        <span className="cc__question-text">{displayQuestion}</span>
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
                {optionLabel(opt)}
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
