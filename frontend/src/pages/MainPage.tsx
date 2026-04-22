import React from 'react'
import { MatchCard } from '../components/MatchCard'
import { ACTIVE_MATCHES, ACTIVE_WEEK_LABEL } from '../data/matches'
import { predictionsApi } from '../services/api'
import '../styles/MainPage.css'

const STORAGE_KEY = 'betty_predictions_v2'

function loadPredictions(): Record<number, { outcome: string; score: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function savePredictionsLocal(preds: Record<number, { outcome: string; score: string }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preds))
}

// Map frontend match id (1-10) to backend match id (match-1 to match-10)
function toBackendMatchId(id: number): string {
  return `match-${id}`
}

export const MainPage: React.FC = () => {
  const [predictions, setPredictions] = React.useState(loadPredictions)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState('')
  const doneRef = React.useRef<HTMLDivElement>(null)

  const handlePredict = async (matchId: number, outcome: string, score: string) => {
    // Save to localStorage immediately (optimistic)
    const updated = { ...predictions, [matchId]: { outcome, score } }
    setPredictions(updated)
    savePredictionsLocal(updated)

    // Save to backend
    const [h, a] = score.split(':').map(Number)
    try {
      await predictionsApi.create({
        match_id: toBackendMatchId(matchId),
        prediction_type: outcome as '1' | 'X' | '2',
        predicted_score: { home: h, away: a },
      })
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail === 'Betting closed — match has started') {
        setToastMessage('&#128274; Betting closed — match has started')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        // Revert localStorage
        const reverted = { ...predictions }
        delete reverted[matchId]
        setPredictions(reverted)
        savePredictionsLocal(reverted)
        return
      }
      // Other errors — prediction saved locally, will sync later
      console.error('Backend save failed:', detail || error)
    }

    const newCount = Object.keys(updated).length
    const isAllDone = newCount === ACTIVE_MATCHES.length

    if (isAllDone) {
      setToastMessage('&#9989; Bets placed!')
      setShowToast(true)
      setTimeout(() => {
        doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
      setTimeout(() => setShowToast(false), 4000)
    } else if (currentIndex < ACTIVE_MATCHES.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 600)
    }
  }

  const completedCount = Object.keys(predictions).length
  const currentMatch = ACTIVE_MATCHES[currentIndex]
  const allDone = completedCount === ACTIVE_MATCHES.length

  return (
    <div className="main-page">
      <div className="page-header">
        <h1>{ACTIVE_WEEK_LABEL}</h1>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completedCount / ACTIVE_MATCHES.length) * 100}%` }}
          />
        </div>
        <p className="progress-text">
          Match {currentIndex + 1} of {ACTIVE_MATCHES.length}
          {completedCount > 0 && ` · ${completedCount} predicted`}
        </p>
      </div>

      <div className="card-area">
        <MatchCard
          key={currentMatch.id}
          match={currentMatch}
          prediction={predictions[currentMatch.id] || null}
          onPredict={handlePredict}
        />
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
          {ACTIVE_MATCHES.map((m, i) => (
            <span
              key={m.id}
              className={`dot ${i === currentIndex ? 'dot--current' : ''} ${predictions[m.id] ? 'dot--done' : ''}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </span>
        <button
          className="card-nav-btn"
          onClick={() => setCurrentIndex(Math.min(ACTIVE_MATCHES.length - 1, currentIndex + 1))}
          disabled={currentIndex === ACTIVE_MATCHES.length - 1}
        >
          Next &#8594;
        </button>
      </div>

      {allDone && (
        <div className="all-done" ref={doneRef}>
          <div className="all-done-icon">&#9989;</div>
          <div className="all-done-title">Bets placed!</div>
          <div className="all-done-text">You can change your predictions until each match begins.</div>
          <div className="all-done-hint">Results will be available the day after the last match of {ACTIVE_WEEK_LABEL}.</div>
        </div>
      )}

      {showToast && (
        <div className="toast" dangerouslySetInnerHTML={{ __html: toastMessage }}></div>
      )}
    </div>
  )
}
