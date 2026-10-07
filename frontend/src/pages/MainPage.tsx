import React from 'react'
import { ChallengeCard } from '../components/ChallengeCard'
import { challengesApi } from '../services/api'
import { Challenge } from '../types'
import '../styles/MainPage.css'

// How often the carousel re-checks kickoff times while the app stays open.
const LOCK_TICK_MS = 15_000

function kickoffMs(c: Challenge): number | null {
  if (!c.kickoff_utc) return null
  const t = Date.parse(c.kickoff_utc)
  return Number.isNaN(t) ? null : t
}

function isLockedAt(c: Challenge, now: number): boolean {
  if (c.correct_answer) return true
  if (c.locked) return true
  const k = kickoffMs(c)
  return k !== null && now >= k
}

// First card a player can still answer, searching forward from `from` and
// wrapping. -1 when every card has kicked off.
function nextOpenIndex(list: Challenge[], now: number, from = 0): number {
  for (let step = 0; step < list.length; step++) {
    const i = (from + step) % list.length
    if (!isLockedAt(list[i], now)) return i
  }
  return -1
}

export const MainPage: React.FC = () => {
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState('')

  const [challenges, setChallenges] = React.useState<Challenge[]>([])
  const [loadError, setLoadError] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [weekEndsAt, setWeekEndsAt] = React.useState<number | null>(null)

  // Server-corrected clock: a phone set a few minutes slow must not reopen a
  // card the server has already locked.
  const clockOffset = React.useRef(0)
  const serverNow = () => Date.now() + clockOffset.current
  const [now, setNow] = React.useState(() => Date.now())

  const loadData = React.useCallback(async () => {
    setLoadError(false)
    setIsLoading(true)
    try {
      const { data } = await challengesApi.getCurrent()
      if (data.server_time) {
        const st = Date.parse(data.server_time)
        if (!Number.isNaN(st)) clockOffset.current = st - Date.now()
      }
      const t = Date.now() + clockOffset.current
      setNow(t)
      setChallenges(data.challenges)
      setWeekEndsAt(Date.parse(data.ends_at) || null)
      // Default to the first card still open; started events stay reachable
      // with Prev but are never shown first.
      const open = nextOpenIndex(data.challenges, t)
      setCurrentIndex(open === -1 ? 0 : open)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { void loadData() }, [loadData])

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(serverNow()), LOCK_TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  // New week (Monday 00:00 UTC) while the app is open: fetch it — once per
  // ended week, so a server still serving the old week can't cause a reload loop.
  const reloadedForWeekEnd = React.useRef<number | null>(null)
  React.useEffect(() => {
    if (!weekEndsAt || isLoading || now <= weekEndsAt) return
    if (reloadedForWeekEnd.current === weekEndsAt) return
    reloadedForWeekEnd.current = weekEndsAt
    void loadData()
  }, [now, weekEndsAt, isLoading, loadData])

  // If the card on screen kicks off while the player is looking at it, move
  // on to the next open card. A card the player navigated back to after it
  // locked is left alone.
  const lockedSeen = React.useRef<Set<string>>(new Set())
  React.useEffect(() => {
    const current = challenges[currentIndex]
    if (!current) return
    const lockedNow = isLockedAt(current, now)
    if (lockedNow && !lockedSeen.current.has(current.id)) {
      lockedSeen.current.add(current.id)
      const open = nextOpenIndex(challenges, now, currentIndex + 1)
      if (open !== -1 && open !== currentIndex) setCurrentIndex(open)
    }
  }, [now, challenges, currentIndex])

  // Cards already locked when they first appear count as seen, so Prev can
  // land on them without being bounced forward.
  React.useEffect(() => {
    for (const c of challenges) if (isLockedAt(c, now)) lockedSeen.current.add(c.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges])

  const handleChallengePredict = async (challengeId: string, answer: string) => {
    const target = challenges.find(c => c.id === challengeId)
    if (!target || isLockedAt(target, serverNow())) return
    const previous = target.my_prediction
    setChallenges(prev => prev.map(c =>
      c.id === challengeId
        ? { ...c, my_prediction: { challenge_id: challengeId, answer, points_earned: 0 } }
        : c
    ))
    try {
      await challengesApi.predict(challengeId, answer)
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (error?.response?.status === 403 || detail === 'Betting closed — match has started') {
        setToastMessage('&#128274; The event is locked — the match has started')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        // Keep whatever was saved before kickoff; mark the card locked so the
        // carousel moves on to the next open event.
        setChallenges(prev => prev.map(c =>
          c.id === challengeId ? { ...c, my_prediction: previous, locked: true } : c
        ))
        setNow(serverNow())
        return
      }
      console.error('Challenge predict failed, will retry on reload:', detail || error)
    }
  }

  // --- Render states ---

  if (isLoading) {
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

  const totalCards = challenges.length

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

  const currentChallenge = challenges[Math.min(currentIndex, totalCards - 1)]
  const progressLabel = `${currentIndex + 1} of ${totalCards}`
  const openChallenges = challenges.filter(c => !isLockedAt(c, now))
  const allLocked = openChallenges.length === 0
  const allPredictionsSaved = openChallenges.length > 0 &&
    openChallenges.every(challenge => !!challenge.my_prediction)

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
        <ChallengeCard
          key={currentChallenge.id}
          challenge={currentChallenge}
          locked={isLockedAt(currentChallenge, now)}
          onPredict={handleChallengePredict}
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
          {challenges.map((challenge, i) => {
            const isDone = !!challenge.my_prediction
            const isLocked = isLockedAt(challenge, now)
            return (
              <span
                key={challenge.id}
                title={isLocked ? 'The event is locked' : undefined}
                className={`dot ${i === currentIndex ? 'dot--current' : ''} ${isDone ? 'dot--done' : ''} ${isLocked ? 'dot--locked' : ''}`}
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

      {allPredictionsSaved && (
        <div className="all-done">
          <div className="all-done-icon">&#9989;</div>
          <div className="all-done-title">All predictions saved!</div>
          <div className="all-done-text">
            {openChallenges.length === totalCards
              ? `Your picks for all ${totalCards} challenges are saved.`
              : `Your picks for the ${openChallenges.length} open challenges are saved.`}
          </div>
          <div className="all-done-hint">You can change a pick until its match kicks off.</div>
        </div>
      )}

      {allLocked && (
        <div className="all-done">
          <div className="all-done-icon">&#128274;</div>
          <div className="all-done-title">This week&rsquo;s events have kicked off</div>
          <div className="all-done-text">
            New challenges arrive on Monday. Use the dots to review your picks.
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast" dangerouslySetInnerHTML={{ __html: toastMessage }}></div>
      )}
    </div>
  )
}
