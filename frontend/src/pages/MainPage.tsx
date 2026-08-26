import React from 'react'
import { MatchCard } from '../components/MatchCard'
import { ChallengeCard } from '../components/ChallengeCard'
import { isMatchLocked, toWeekMatches } from '../data/matches'
import { predictionsApi, weeksApi, challengesApi } from '../services/api'
import { WeekResponse, Challenge } from '../types'
import '../styles/MainPage.css'

// v3: keyed by the API's string match id. v1/v2 stored numeric 1..N keys, which
// under v2 ids would silently read as "not predicted" — or worse, collide. The
// bump makes the old shape unreadable rather than misread.
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

// "2:1" → {home,away}; empty/malformed → null, i.e. an outcome-only bet. The backend
// stores predicted_score as nullable and scores such a bet on the outcome alone.
function parseScore(score: string): { home: number; away: number } | null {
  if (!score) return null
  const [h, a] = score.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(a)) return null
  return { home: h, away: a }
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

  // The two weeks now come from the API, so they arrive asynchronously and either
  // of them can legitimately be empty — an unpublished week is a normal state in a
  // perpetual game, not an error.
  const [weeks, setWeeks] = React.useState<{ current: WeekResponse | null; next: WeekResponse | null } | null>(null)
  const [challenges, setChallenges] = React.useState<Challenge[]>([])
  const [loadError, setLoadError] = React.useState(false)
  const [selectedKey, setSelectedKey] = React.useState<'current' | 'next'>('current')
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const loadWeeks = React.useCallback(async () => {
    setLoadError(false)
    try {
      // Settled, not all: a published current week must still render if next 500s.
      const [c, n, ch] = await Promise.allSettled([
        weeksApi.getCurrent(), weeksApi.getNext(), challengesApi.getCurrent(),
      ])
      const cur = c.status === 'fulfilled' ? c.value.data : null
      const nxt = n.status === 'fulfilled' ? n.value.data : null
      const chs = ch.status === 'fulfilled' ? ch.value.data.challenges : []
      if (!cur && !nxt && chs.length === 0) { setLoadError(true); return }
      setWeeks({ current: cur, next: nxt })
      setChallenges(chs)

      // Land on the week the player can actually bet in. Between a week's last
      // kickoff and the next week going live, Current is a wall of locked cards
      // with nothing to predict; when that happens and Next has fixtures, open
      // there instead.
      const curMatches = toWeekMatches(cur)
      const nextMatches = toWeekMatches(nxt)
      const key = (curMatches.length === 0 || curMatches.every(isMatchLocked)) && nextMatches.length > 0
        ? 'next' : 'current'
      setSelectedKey(key)
      setCurrentIndex(0)
    } catch {
      setLoadError(true)
    }
  }, [])

  React.useEffect(() => { void loadWeeks() }, [loadWeeks])

  const currentMatches = React.useMemo(() => toWeekMatches(weeks?.current ?? null), [weeks])
  const nextMatches = React.useMemo(() => toWeekMatches(weeks?.next ?? null), [weeks])
  const hasNext = nextMatches.length > 0

  // "Mon 17 Aug" for the next week's first day, read off the API rather than
  // assumed — the empty-week screen is only allowed to name a date it can see.
  const nextOpensOn = React.useMemo(() => {
    const starts = weeks?.next?.starts_at
    if (!starts) return null
    const d = new Date(starts)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
    })
  }, [weeks])
  const matches = selectedKey === 'next' && hasNext ? nextMatches : currentMatches

  const switchWeek = (key: 'current' | 'next') => {
    setSelectedKey(key)
    setCurrentIndex(0)
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
      {hasNext && (
        <button
          className={`week-tab ${selectedKey === 'next' ? 'week-tab--active' : ''}`}
          onClick={() => switchWeek('next')}
        >
          Next
        </button>
      )}
    </div>
  )

  // Auto-save 0:0 (draw) for every open match the player hasn't touched yet.
  // This way if someone opens the app and leaves, all open matches count as 0:0.
  React.useEffect(() => {
    if (!weeks) return
    const allMatches = [...currentMatches, ...nextMatches]
    const current = loadPredictions()
    let changed = false
    const updated = { ...current }
    for (const m of allMatches) {
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
  }, [weeks, currentMatches, nextMatches])

  // Recover any predictions that never reached the backend (e.g. placed before
  // registration landed). Safe to run on every mount — the endpoint upserts.
  React.useEffect(() => {
    void syncPendingPredictions()
  }, [])

  const handleChallengePredict = async (challengeId: string, answer: string) => {
    // Optimistic update
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
        // Revert
        setChallenges(prev => prev.map(c =>
          c.id === challengeId ? { ...c, my_prediction: null } : c
        ))
        return
      }
      console.error('Challenge predict failed, will retry on reload:', detail || error)
    }
  }

  const handlePredict = async (matchId: string, outcome: string, score: string) => {
    // Save to localStorage immediately (optimistic)
    const updated = { ...predictions, [matchId]: { outcome, score } }
    setPredictions(updated)
    savePredictionsLocal(updated)

    // Save to backend. score may be '' — an outcome-only bet, saved as-is.
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

  }

  const currentMatch = matches[currentIndex]

  // Fixtures are fetched now, so the page has three states it never had while the
  // week was compiled into the bundle.
  if (!weeks && !loadError) {
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
          <button className="all-done-review-btn" onClick={() => { void loadWeeks() }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  // A week with no fixtures is normal — a perpetual game has quiet weeks, and a
  // round may simply not be curated yet.
  //
  // This screen must not name a day it cannot verify. It used to promise "this
  // week's ten matches go live on Monday", which is only true if a week is
  // actually being published that Monday; through a deliberate pause it sends
  // people back on a date with nothing waiting for them, and spends their second
  // visit as well as their first. So: name a date only when there is a published
  // week to read it off, and otherwise say plainly that we don't have one yet.
  // Unified card list: challenges first (the fun stuff), then match score cards.
  // Each item is tagged so the carousel knows which component to render.
  type CardItem =
    | { kind: 'challenge'; challenge: Challenge }
    | { kind: 'match'; match: typeof currentMatch }

  const cards: CardItem[] = [
    ...challenges.map((c): CardItem => ({ kind: 'challenge', challenge: c })),
    ...matches.map((m): CardItem => ({ kind: 'match', match: m })),
  ]

  const totalCards = cards.length

  if (totalCards === 0) {
    return (
      <div className="main-page">
        <div className="page-header">{weekHeader}</div>
        <div className="all-done all-done--full">
          <div className="all-done-icon">&#9917;</div>
          <div className="all-done-title">No matches yet</div>
          <div className="all-done-text">
            {hasNext && selectedKey === 'current' ? (
              <>The next round is already up{nextOpensOn ? <> — it opens {nextOpensOn}</> : null}.</>
            ) : (
              <>We haven&rsquo;t posted the next round yet. It shows up here the moment it does.</>
            )}
          </div>
          {hasNext && selectedKey === 'current' && (
            <button className="all-done-review-btn" onClick={() => switchWeek('next')}>
              See next week &#8594;
            </button>
          )}
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]
  const progressLabel = challenges.length > 0 && matches.length > 0
    ? `${currentIndex + 1} of ${totalCards}`
    : challenges.length > 0
      ? `Challenge ${currentIndex + 1} of ${totalCards}`
      : `Match ${currentIndex + 1} of ${totalCards}`

  return (
    <div className="main-page">
      <div className="page-header">
        {weekHeader}
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
