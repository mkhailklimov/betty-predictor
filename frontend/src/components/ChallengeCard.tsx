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

const DEV_ENGLAND_CROATIA_IMAGE =
  'https://lh3.googleusercontent.com/u/0/d/1a4RkNbkrLxlu_9FI9dtnxNyATsUieNWe=w900'
const DEV_MUN_TOT_IMAGE =
  'https://lh3.googleusercontent.com/u/0/d/1DouPIoMgnvchSk4BtCK99tW1v49AwwPG=w900'
const DEV_MCI_LIV_IMAGE =
  'https://drive.google.com/uc?export=view&id=10wylMGnHUyB6--4nN_ksuwpCHzg8_zyw'
const DEV_ARS_LUN_IMAGE =
  'https://drive.google.com/uc?export=view&id=1RLdfw-brMyNJtobOFANTlB6PRJFDHURg'
const DEV_CHE_BRE_IMAGE =
  'https://drive.google.com/uc?export=view&id=1G0FtRHVS58yKFvv7ogFCHJEmjqgjMvRS'

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onPredict }) => {
  const isReels = challenge.options.length === 1 && challenge.options[0] === 'reels'
  const resolved = !!challenge.correct_answer
  const myAnswer = challenge.my_prediction?.answer ?? null
  const pointsEarned = challenge.my_prediction?.points_earned ?? 0
  const m = challenge.match
  const questionText = challenge.question.toLowerCase()
  const fixtureText = m ? `${m.home_team} ${m.away_team}`.toLowerCase() : ''
  const illustration = (
    (questionText.includes('england') && questionText.includes('croatia')) ||
    (fixtureText.includes('england') && fixtureText.includes('croatia'))
  )
    ? DEV_ENGLAND_CROATIA_IMAGE
    : questionText.includes('arsenal') || fixtureText.includes('arsenal')
      ? DEV_ARS_LUN_IMAGE
      : (
          (questionText.includes('manchester united') && questionText.includes('tottenham')) ||
          (fixtureText.includes('manchester united') && fixtureText.includes('tottenham'))
        )
        ? DEV_MUN_TOT_IMAGE
        : (
            (questionText.includes('liverpool') && questionText.includes('manchester city')) ||
            (fixtureText.includes('liverpool') && fixtureText.includes('manchester city'))
          )
          ? DEV_MCI_LIV_IMAGE
          : (
              (questionText.includes('chelsea') && questionText.includes('brentford')) ||
              (fixtureText.includes('chelsea') && fixtureText.includes('brentford'))
            )
            ? DEV_CHE_BRE_IMAGE
            : null

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

      {illustration && (
        <img
          className="cc__illustration"
          src={illustration}
          alt={
            illustration === DEV_MUN_TOT_IMAGE
                ? 'Manchester United versus Tottenham'
                : illustration === DEV_MCI_LIV_IMAGE
                  ? 'Manchester City versus Liverpool'
                  : illustration === DEV_ARS_LUN_IMAGE
                    ? 'Arsenal challenge sticker'
                    : illustration === DEV_CHE_BRE_IMAGE
                      ? 'Chelsea versus Brentford'
                      : 'England versus Croatia'
          }
        />
      )}

      {!illustration && (
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
