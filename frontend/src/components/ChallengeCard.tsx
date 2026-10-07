import React from 'react'
import { Challenge } from '../types'
import { ScoreReels } from './ScoreReels'
import '../styles/ChallengeCard.css'

interface ChallengeCardProps {
  challenge: Challenge
  /** True once kickoff has passed: the card is read-only. */
  locked: boolean
  onPredict: (challengeId: string, answer: string) => void
}

// The six hand-made launch stickers and copy belong to the 2026_41 preview
// week only. Matching them by keyword in later weeks mislabels real fixtures
// (e.g. any Arsenal exact-score card would show the Arsenal vs Leeds sticker).
const LAUNCH_WEEK = '2026_41'

function formatKickoff(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
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
    src: '/stickers/ENG_CRO.png',
    alt: 'England versus Croatia',
  },
  '2': {
    src: '/stickers/RAYA.png',
    alt: 'Raya making a save against Leeds United',
  },
  '3': {
    src: '/stickers/MUN_TOT.png',
    alt: 'Manchester United versus Tottenham Hotspur',
  },
  '4': {
    src: '/stickers/HAALAND.png',
    alt: 'Haaland celebrating a goal',
  },
  '5': {
    src: '/stickers/CHE_BOR-transparent.png',
    alt: 'Chelsea versus Bournemouth',
  },
  '6': {
    src: '/stickers/ARS_LEE.png',
    alt: 'Arsenal versus Leeds United exact score',
  },
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, locked, onPredict }) => {
  const isReels = challenge.options.length === 1 && challenge.options[0] === 'reels'
  const resolved = !!challenge.correct_answer
  const readOnly = resolved || locked
  const isLaunchWeek = challenge.week_id === LAUNCH_WEEK
  const myAnswer = challenge.my_prediction?.answer ?? null
  const pointsEarned = challenge.my_prediction?.points_earned ?? 0
  const m = challenge.match
  const challengeNumberMatch = challenge.id.match(/(?:^|[-_])(?:ch[-_])?(\d+)$/i)
  const challengeNumber = challengeNumberMatch
    ? String(Number(challengeNumberMatch[1]))
    : null
  const fixtureText = m ? `${m.home_team} ${m.away_team}`.toLowerCase() : ''
  const questionText = challenge.question.toLowerCase()
  const stickerKey = !isLaunchWeek ? null : challengeNumber ||
    (fixtureText.includes('england') && fixtureText.includes('croatia') ? '1' :
      fixtureText.includes('arsenal') && challenge.type === 'clean_sheet' ? '2' :
        fixtureText.includes('manchester united') && fixtureText.includes('tottenham') ? '3' :
          fixtureText.includes('liverpool') && fixtureText.includes('manchester city') &&
            challenge.type === 'will_score' ? '4' :
            fixtureText.includes('chelsea') &&
              (fixtureText.includes('bournemouth') || fixtureText.includes('brentford')) ? '5' :
              fixtureText.includes('arsenal') && challenge.type === 'exact_score' ? '6' :
                questionText.includes('england') && questionText.includes('croatia') ? '1' :
                  questionText.includes('arsenal') && challenge.type === 'clean_sheet' ? '2' :
                    questionText.includes('manchester united') && questionText.includes('tottenham') ? '3' :
                      questionText.includes('liverpool') && questionText.includes('manchester city') &&
                        challenge.type === 'will_score' ? '4' :
                        questionText.includes('chelsea') &&
                          (questionText.includes('bournemouth') || questionText.includes('brentford')) ? '5' :
                          questionText.includes('arsenal') && challenge.type === 'exact_score' ? '6' : null)
  const sticker = stickerKey ? RELEASE21_STICKERS[stickerKey] : null
  const homeName = challenge.home_team || m?.home_team || null
  const awayName = challenge.away_team || m?.away_team || null
  const fixture = stickerKey === '5'
    ? 'Chelsea vs Bournemouth'
    : challenge.fixture || (m ? `${m.home_team} vs ${m.away_team}` : null)
  const kickoffLabel = formatKickoff(challenge.kickoff_utc)
  const displayQuestion = stickerKey === '1'
    ? 'What will be the final score: England vs Croatia?'
    : stickerKey === '2'
      ? 'Will Raya keep a clean sheet against Leeds?'
      : stickerKey === '3'
        ? 'Who scores first: Red Devils, Spurs, or nobody?'
        : stickerKey === '4'
            ? 'Will Haaland score a goal?'
          : stickerKey === '5'
        ? 'Will Chelsea beat Bournemouth?'
            : stickerKey === '6'
          ? 'What will be the final score: Arsenal vs Leeds?'
              : challenge.question

  const parsed = myAnswer ? parseScore(myAnswer) : null
  const [home, setHome] = React.useState(parsed?.home ?? 0)
  const [away, setAway] = React.useState(parsed?.away ?? 0)
  const [touched, setTouched] = React.useState(!!myAnswer)

  const handleOption = (answer: string) => {
    if (readOnly) return
    onPredict(challenge.id, answer)
  }

  const handleReels = (h: number, a: number) => {
    if (readOnly) return
    setHome(h)
    setAway(a)
    setTouched(true)
    onPredict(challenge.id, `${h}:${a}`)
  }

  const optionLabel = (option: string): string => {
    if (challenge.type === 'first_to_score') {
      if (isLaunchWeek) {
        if (option === 'Home') return 'Red Devils'
        if (option === 'Away') return 'Spurs'
      }
      if (option === 'Home' && homeName) return homeName
      if (option === 'Away' && awayName) return awayName
    }
    if (challenge.type === 'over_under') {
      if (option === 'Over') return 'Over 2.5'
      if (option === 'Under') return 'Under 2.5'
    }
    return option
  }

  const icon = TYPE_ICON[challenge.type] || '\u2753'

  return (
    <div className={`cc ${resolved ? 'cc--resolved' : ''} ${locked && !resolved ? 'cc--locked' : ''}`}>
      {/* Points badge */}
      <div className="cc__points-badge">
        {challenge.points} {challenge.points === 1 ? 'pt' : 'pts'}
      </div>

      {fixture && (
        <div className="cc__fixture">{fixture}</div>
      )}
      {kickoffLabel && (
        <div className="cc__kickoff">Kick-off {kickoffLabel}</div>
      )}

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
            disabled={readOnly}
            touched={touched}
            homeName={homeName || 'Home'}
            awayName={awayName || 'Away'}
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
                disabled={readOnly}
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
            : `Result: ${optionLabel(challenge.correct_answer!)} \u00B7 Your pick: ${optionLabel(myAnswer)} \u2014 next one's yours!`}
        </div>
      )}
      {resolved && !myAnswer && (
        <div className="cc__result cc__result--missed">
          Answer: {challenge.correct_answer}
        </div>
      )}
      {locked && !resolved && (
        <div className="cc__locked" role="status">
          &#128274; The event is locked
          {myAnswer ? <span className="cc__locked-pick"> &middot; Your pick: {myAnswer}</span> : null}
        </div>
      )}
      {!locked && !resolved && myAnswer && (
        <div className="cc__saved">
          Your pick: {myAnswer}
        </div>
      )}
    </div>
  )
}
