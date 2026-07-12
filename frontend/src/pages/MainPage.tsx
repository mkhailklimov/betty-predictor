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

// "2:1" → {home,away}; empty/malformed → null, i.e. an outcome-only bet. The backend
// stores predicted_score as nullable and scores such a bet on the outcome alone.
function parseScore(score: string): { home: number; away: number } | null {
  if (!score) return null
  const [h, a] = score.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(a)) return null
  return { home: h, away: a }
}

// Which card to land on. A visitor arriving mid-week should not open onto a match
// that already kicked off (locked = a dead end they can't predict). Land on the
// nearest still-open match, preferring one not yet predicted; only fall back to a
// locked card when every match in the week has already started.
function nearestOpenIndex(
  list: MatchData[],
  preds: Record<number, { outcome: string; score: string }>,
): number {
  const openUnpredicted = list.findIndex(m => !isMatchLocked(m) && !preds[m.id])
  if (openUnpredicted !== -1) return openUnpredicted
  const open = list.findIndex(m => !isMatchLocked(m))
  if (open !== -1) return open
  const unpredicted = list.findIndex(m => !preds[m.id])
  return unpredicted === -1 ? 0 : unpredicted
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
      if (!p || !p.outcome) continue
      try {
        await predictionsApi.create({
          match_id: toBackendMatchId(matchId),
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
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState('')
  const [reviewMode, setReviewMode] = React.useState(false)
  const doneRef = React.useRef<HTMLDivElement>(null)

  // Resolve the current week and, Mon→Fri, the optional "next week" (UTC cadence).
  const { current, next } = React.useMemo(() => resolveWeeks(), [])

  // Which week to land on. Normally Current. But between a week's last kickoff and the
  // next week becoming current there is a dead zone — every match of the current week
  // has started, so Current is a wall of locked cards with nothing to predict (this
  // window ran 5 days in the group stage). When that happens and Next is already open,
  // land on Next so a newcomer always sees a match they can actually bet on.
  const [selectedKey, setSelectedKey] = React.useState<'current' | 'next'>(() =>
    next && current.matches.every(isMatchLocked) ? 'next' : 'current',
  )
  const week = selectedKey === 'next' && next ? next : current
  const matches = week.matches

  // Open on the nearest still-predictable match of that week, so a mid-week newcomer
  // isn't greeted by a locked (already-started) card.
  const [currentIndex, setCurrentIndex] = React.useState(() =>
    nearestOpenIndex(week.matches, loadPredictions()),
  )

  const switchWeek = (key: 'current' | 'next') => {
    setSelectedKey(key)
    setReviewMode(false)
    const wk = key === 'next' && next ? next : current
    setCurrentIndex(nearestOpenIndex(wk.matches, predictions))
  }

  // Single header row: "Current" (default) + "Next" (only when a next week is open).
  const weekHeader = (
    <div className="week-tabs">
      <button
        className={`week-tab ${selectedKey === 'current' ? 'week-tab--active' : ''}`}
        onClick={() => switchWeek('current')}
      >
        Current
      </button>
      {next && (
        <button
          className={`week-tab ${selectedKey === 'next' ? 'week-tab--active' : ''}`}
          onClick={() => switchWeek('next')}
        >
          Next
        </button>
      )}
    </div>
  )

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

    // Save to backend. score may be '' — an outcome-only bet, saved as-is.
    try {
      await predictionsApi.create({
        match_id: toBackendMatchId(matchId),
        prediction_type: outcome as '1' | 'X' | '2',
        predicted_score: parseScore(score),
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

    // Only move on once the bet is complete (outcome + score). Advancing on the bare
    // outcome would whisk the card away before the player could pick a score.
    if (!score) return

    const isAllDone = matches.every(m => updated[m.id]?.score)

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
  // "Complete" = outcome + score. An outcome-only bet is saved and scores 1 pt, but
  // still has the score bonus left on the table, so it reads as in-progress here and
  // keeps the card stack open instead of jumping to the all-done screen.
  const completedCount = matches.filter(m => predictions[m.id]?.score).length
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
          {weekHeader}
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
        {weekHeader}
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
              className={`dot ${i === currentIndex ? 'dot--current' : ''} ${predictions[m.id]?.score ? 'dot--done' : predictions[m.id] ? 'dot--partial' : ''}`}
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
