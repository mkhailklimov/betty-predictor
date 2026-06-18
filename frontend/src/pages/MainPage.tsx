import React from 'react'
import { MatchCard } from '../components/MatchCard'
import { resolveWeeks, isMatchLocked, MatchData } from '../data/matches'
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

// Replay every locally-stored prediction to the backend. The /api/predictions
// endpoint is an idempotent upsert, so re-sending is safe. This is the real
// "sync later" the old code only pretended to do: any prediction whose live
// POST failed (auth race, cold start, network blip) is recovered on next load.
let syncInFlight = false
export async function syncPendingPredictions(): Promise<void> {
  if (syncInFlight) return
  syncInFlight = true
  try {
    const preds = loadPredictions()
    for (const key of Object.keys(preds)) {
      const matchId = Number(key)
      const p = preds[matchId]
      if (!p || !p.score) continue
      const [h, a] = p.score.split(':').map(Number)
      if (Number.isNaN(h) || Number.isNaN(a)) continue
      try {
        await predictionsApi.create({
          match_id: toBackendMatchId(matchId),
          prediction_type: p.outcome as '1' | 'X' | '2',
          predicted_score: { home: h, away: a },
        })
      } catch {
        // Leave it in localStorage; the next load (or submit) retries.
      }
    }
  } finally {
    syncInFlight = false
  }
}

// Date of the day AFTER the last match of a week — for the "check results on …" line.
function resultsAvailableDate(weekMatches: MatchData[]): string {
  const last = weekMatches[weekMatches.length - 1]
  if (!last) return ''
  const d = new Date(last.kickoff)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export const MainPage: React.FC = () => {
  const [predictions, setPredictions] = React.useState(loadPredictions)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState('')
  const [reviewMode, setReviewMode] = React.useState(false)
  const doneRef = React.useRef<HTMLDivElement>(null)

  // Resolve the current week and, Mon→Fri, the optional "next week" (UTC cadence).
  const { current, next } = React.useMemo(() => resolveWeeks(), [])
  // If the current week is already fully locked (e.g. a late-week arrival), open
  // straight on the next week — that's the whole point of the toggle.
  const currentAllLocked = React.useMemo(() => current.matches.every(isMatchLocked), [current])
  const [selectedKey, setSelectedKey] = React.useState<'current' | 'next'>(
    next && currentAllLocked ? 'next' : 'current'
  )
  const week = selectedKey === 'next' && next ? next : current
  const matches = week.matches

  const switchWeek = (key: 'current' | 'next') => {
    setSelectedKey(key)
    setReviewMode(false)
    const wk = key === 'next' && next ? next : current
    const firstUnpredicted = wk.matches.findIndex(m => !predictions[m.id])
    setCurrentIndex(firstUnpredicted === -1 ? 0 : firstUnpredicted)
  }

  const weekTabs = next ? (
    <div className="week-tabs">
      <button
        className={`week-tab ${selectedKey === 'current' ? 'week-tab--active' : ''}`}
        onClick={() => switchWeek('current')}
      >
        {current.label}
      </button>
      <button
        className={`week-tab ${selectedKey === 'next' ? 'week-tab--active' : ''}`}
        onClick={() => switchWeek('next')}
      >
        {next.label}
      </button>
    </div>
  ) : null

  // Recover any predictions that never reached the backend (e.g. placed before
  // registration landed). Safe to run on every mount — the endpoint upserts.
  React.useEffect(() => {
    void syncPendingPredictions()
  }, [])

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
      // Other errors (auth race, cold start, network blip) — the prediction is
      // safe in localStorage; replay it to the backend instead of dropping it.
      console.error('Backend save failed, will retry:', detail || error)
      setTimeout(() => { void syncPendingPredictions() }, 1500)
    }

    const isAllDone = matches.every(m => updated[m.id])

    if (isAllDone) {
      setToastMessage('&#9989; Bets placed!')
      setShowToast(true)
      setTimeout(() => {
        doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
      setTimeout(() => setShowToast(false), 4000)
    } else if (currentIndex < matches.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 600)
    }
  }

  // Progress is scoped to the selected week only.
  const completedCount = matches.filter(m => predictions[m.id]).length
  const currentMatch = matches[currentIndex]
  const allDone = completedCount === matches.length

  // When all predictions are in and the user hasn't opted into review mode,
  // show a full confirmation screen instead of the card stack. This guarantees
  // the "bets saved" message is visible on every TG WebView (scrollIntoView is
  // unreliable inside Telegram's WebView).
  if (allDone && !reviewMode) {
    return (
      <div className="main-page">
        <div className="page-header">
          <h1>{week.label}</h1>
          {weekTabs}
        </div>
        <div className="all-done all-done--full" ref={doneRef}>
          <div className="all-done-icon">&#9989;</div>
          <div className="all-done-title">Your bets are saved!</div>
          <div className="all-done-text">You can change any prediction until that match kicks off.</div>
          <div className="all-done-hint">Check your results on <strong>{resultsAvailableDate(matches)}</strong>.</div>
          {next && selectedKey === 'current' && (
            <button
              className="all-done-review-btn"
              onClick={() => switchWeek('next')}
            >
              Predict {next.label} &#8594;
            </button>
          )}
          <button
            className={`all-done-review-btn ${next && selectedKey === 'current' ? 'all-done-review-btn--inline' : ''}`}
            onClick={() => setReviewMode(true)}
          >
            Review or change my bets
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main-page">
      <div className="page-header">
        <h1>{week.label}</h1>
        {weekTabs}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completedCount / matches.length) * 100}%` }}
          />
        </div>
        <p className="progress-text">
          Match {currentIndex + 1} of {matches.length}
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
          {matches.map((m, i) => (
            <span
              key={m.id}
              className={`dot ${i === currentIndex ? 'dot--current' : ''} ${predictions[m.id] ? 'dot--done' : ''}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </span>
        <button
          className="card-nav-btn"
          onClick={() => setCurrentIndex(Math.min(matches.length - 1, currentIndex + 1))}
          disabled={currentIndex === matches.length - 1}
        >
          Next &#8594;
        </button>
      </div>

      {allDone && reviewMode && (
        <button
          className="all-done-review-btn all-done-review-btn--inline"
          onClick={() => setReviewMode(false)}
        >
          Back to confirmation
        </button>
      )}

      {showToast && (
        <div className="toast" dangerouslySetInnerHTML={{ __html: toastMessage }}></div>
      )}
    </div>
  )
}
