import React from 'react'
import { MatchCard } from '../components/MatchCard'
import { ChallengeCard } from '../components/ChallengeCard'
import { isMatchLocked, toWeekMatches } from '../data/matches'
import { predictionsApi, weeksApi, challengesApi } from '../services/api'
import { WeekResponse, Challenge } from '../types'
import '../styles/MainPage.css'

const STORAGE_KEY = 'betty_predictions_v3'

type PredictionMap = Record<string, { outcome: string; score: string }>

function loadPredictions(): PredictionMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function savePredictionsLocal(preds: PredictionMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preds))
}

function parseScore(score: string): { home: number; away: number } | null {
  if (!score) return null
  const [h, a] = score.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(a)) return null
  return { home: h, away: a }
}

let syncInFlight = false
export async function syncPendingPredictions(): Promise<void> {
  if (syncInFlight) return
  syncInFlight = true
  try {
    const preds = loadPredictions()
    for (const matchId of Object.keys(preds)) {
      const p = preds[matchId]
      if (!p || !p.outcome) continue
      try {
        await predictionsApi.create({
          match_id: matchId,
          prediction_type: p.outcome as '1' | 'X' | '2',
          predicted_score: parseScore(p.score),
        })
      } catch {
        // Leave it in localStorage; the next load (or submit) retries.
      }
    }
  } finally {
    syncInFlight = false
  }
}

export const MainPage: React.FC = () => {
  const [predictions, setPredictions] = React.useState(loadPredictions)
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState('')

  const [week, setWeek] = React.useState<WeekResponse | null>(null)
  const [challenges, setChallenges] = React.useState<Challenge[]>([])
  const [loadError, setLoadError] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const loadData = React.useCallback(async () => {
    setLoadError(false)
    try {
      const [w, ch] = await Promise.allSettled([
        weeksApi.getCurrent(), challengesApi.getCurrent(),
      ])
      const wk = w.status === 'fulfilled' ? w.value.data : null
      const chs = ch.status === 'fulfilled' ? ch.value.data.challenges : []
      if (!wk && chs.length === 0) { setLoadError(true); return }
      setWeek(wk)
      setChallenges(chs)
      setCurrentIndex(0)
    } catch {
      setLoadError(true)
    }
  }, [])

  React.useEffect(() => { void loadData() }, [loadData])

  const matches = React.useMemo(() => toWeekMatches(week), [week])

  // Auto-save 0:0 for open matches the player hasn't touched yet.
  React.useEffect(() => {
    if (!week) return
    const current = loadPredictions()
    let changed = false
    const updated = { ...current }
    for (const m of matches) {
      if (isMatchLocked(m)) continue
      if (updated[m.id]?.score) continue
      updated[m.id] = { outcome: 'X', score: '0:0' }
      changed = true
    }
    if (changed) {
      setPredictions(updated)
      savePredictionsLocal(updated)
      void syncPendingPredictions()
    }
  }, [week, matches])

  React.useEffect(() => {
    void syncPendingPredictions()
  }, [])

  const handleChallengePredict = async (challengeId: string, answer: string) => {
    setChallenges(prev => prev.map(c =>
      c.id === challengeId
        ? { ...c, my_prediction: { challenge_id: challengeId, answer, points_earned: 0 } }
        : c
    ))
    try {
      await challengesApi.predict(challengeId, answer)
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail === 'Betting closed — match has started') {
        setToastMessage('&#128274; Betting closed — match has started')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        setChallenges(prev => prev.map(c =>
          c.id === challengeId ? { ...c, my_prediction: null } : c
        ))
        return
      }
      console.error('Challenge predict failed, will retry on reload:', detail || error)
    }
  }

  const handlePredict = async (matchId: string, outcome: string, score: string) => {
    const updated = { ...predictions, [matchId]: { outcome, score } }
    setPredictions(updated)
    savePredictionsLocal(updated)

    try {
      await predictionsApi.create({
        match_id: matchId,
        prediction_type: outcome as '1' | 'X' | '2',
        predicted_score: parseScore(score),
      })
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail === 'Betting closed — match has started') {
        setToastMessage('&#128274; Betting closed — match has started')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        const reverted = { ...predictions }
        delete reverted[matchId]
        setPredictions(reverted)
        savePredictionsLocal(reverted)
        return
      }
      console.error('Backend save failed, will retry:', detail || error)
      setTimeout(() => { void syncPendingPredictions() }, 1500)
    }
  }

  // --- Render states ---

  if (!week && challenges.length === 0 && !loadError) {
    return (
      <div className="main-page">
        <div className="all-done all-done--full">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="main-page">
        <div className="all-done all-done--full">
          <div className="all-done-icon">&#128225;</div>
          <div className="all-done-title">Couldn&rsquo;t load this week</div>
          <div className="all-done-text">Check your connection and try again.</div>
          <button className="all-done-review-btn" onClick={() => { void loadData() }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Unified card list: challenges first, then match score cards.
  type CardItem =
    | { kind: 'challenge'; challenge: Challenge }
    | { kind: 'match'; match: ReturnType<typeof toWeekMatches>[number] }

  const cards: CardItem[] = [
    ...challenges.map((c): CardItem => ({ kind: 'challenge', challenge: c })),
    ...matches.map((m): CardItem => ({ kind: 'match', match: m })),
  ]

  const totalCards = cards.length

  if (totalCards === 0) {
    return (
      <div className="main-page">
        <div className="all-done all-done--full">
          <div className="all-done-icon">&#9917;</div>
          <div className="all-done-title">No challenges yet</div>
          <div className="all-done-text">
            We haven&rsquo;t posted the next round yet. It shows up here the moment it does.
          </div>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]
  const progressLabel = `${currentIndex + 1} of ${totalCards}`

  return (
    <div className="main-page">
      <div className="page-header">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
        <p className="progress-text">{progressLabel}</p>
      </div>

      <div className="card-area">
        {currentCard.kind === 'challenge' ? (
          <ChallengeCard
            key={currentCard.challenge.id}
            challenge={currentCard.challenge}
            onPredict={handleChallengePredict}
          />
        ) : (
          <MatchCard
            key={currentCard.match.id}
            match={currentCard.match}
            prediction={predictions[currentCard.match.id] || null}
            onPredict={handlePredict}
          />
        )}
      </div>

      <div className="card-nav">
        <button
          className="card-nav-btn"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          &#8592; Prev
        </button>
        <span className="card-nav-dots">
          {cards.map((card, i) => {
            const id = card.kind === 'challenge' ? card.challenge.id : card.match.id
            const isDone = card.kind === 'challenge'
              ? !!card.challenge.my_prediction
              : !!predictions[card.match.id]?.score
            return (
              <span
                key={id}
                className={`dot ${i === currentIndex ? 'dot--current' : ''} ${isDone ? 'dot--done' : ''}`}
                onClick={() => setCurrentIndex(i)}
              />
            )
          })}
        </span>
        <button
          className="card-nav-btn"
          onClick={() => setCurrentIndex(Math.min(totalCards - 1, currentIndex + 1))}
          disabled={currentIndex === totalCards - 1}
        >
          Next &#8594;
        </button>
      </div>

      {showToast && (
        <div className="toast" dangerouslySetInnerHTML={{ __html: toastMessage }}></div>
      )}
    </div>
  )
}
