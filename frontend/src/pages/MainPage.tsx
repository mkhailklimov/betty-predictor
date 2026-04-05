import React from 'react'
import { MatchCard } from '../components/MatchCard'
import { WEEK1_MATCHES } from '../data/matches'
import '../styles/MainPage.css'

const STORAGE_KEY = 'betty_predictions_v2'

function loadPredictions(): Record<number, { outcome: string; score: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function savePredictions(preds: Record<number, { outcome: string; score: string }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preds))
}

export const MainPage: React.FC = () => {
  const [predictions, setPredictions] = React.useState(loadPredictions)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [showToast, setShowToast] = React.useState(false)
  const doneRef = React.useRef<HTMLDivElement>(null)

  const handlePredict = (matchId: number, outcome: string, score: string) => {
    const updated = { ...predictions, [matchId]: { outcome, score } }
    setPredictions(updated)
    savePredictions(updated)

    const newCount = Object.keys(updated).length
    const isAllDone = newCount === WEEK1_MATCHES.length

    if (isAllDone) {
      // Show toast and scroll to message
      setShowToast(true)
      setTimeout(() => {
        doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
      setTimeout(() => setShowToast(false), 4000)
    } else if (currentIndex < WEEK1_MATCHES.length - 1) {
      // Auto-advance to next card
      setTimeout(() => setCurrentIndex(currentIndex + 1), 600)
    }
  }

  const completedCount = Object.keys(predictions).length
  const currentMatch = WEEK1_MATCHES[currentIndex]
  const allDone = completedCount === WEEK1_MATCHES.length

  return (
    <div className="main-page">
      <div className="page-header">
        <h1>Week 1</h1>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completedCount / WEEK1_MATCHES.length) * 100}%` }}
          />
        </div>
        <p className="progress-text">
          Match {currentIndex + 1} of {WEEK1_MATCHES.length}
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
          {WEEK1_MATCHES.map((m, i) => (
            <span
              key={m.id}
              className={`dot ${i === currentIndex ? 'dot--current' : ''} ${predictions[m.id] ? 'dot--done' : ''}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </span>
        <button
          className="card-nav-btn"
          onClick={() => setCurrentIndex(Math.min(WEEK1_MATCHES.length - 1, currentIndex + 1))}
          disabled={currentIndex === WEEK1_MATCHES.length - 1}
        >
          Next &#8594;
        </button>
      </div>

      {allDone && (
        <div className="all-done" ref={doneRef}>
          <div className="all-done-icon">&#9989;</div>
          <div className="all-done-title">Bets placed!</div>
          <div className="all-done-text">You can change your predictions until each match begins.</div>
          <div className="all-done-hint">Results will be available on June 18 — the day after the last Week 1 match.</div>
        </div>
      )}

      {showToast && (
        <div className="toast">&#9989; Bets placed!</div>
      )}
    </div>
  )
}
