import React from 'react'
import { ChallengeCard } from '../components/ChallengeCard'
import { challengesApi } from '../services/api'
import { Challenge } from '../types'
import '../styles/MainPage.css'

export const MainPage: React.FC = () => {
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState('')

  const [challenges, setChallenges] = React.useState<Challenge[]>([])
  const [loadError, setLoadError] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
    setLoadError(false)
    setIsLoading(true)
    try {
      const { data } = await challengesApi.getCurrent()
      setChallenges(data.challenges)
      setCurrentIndex(0)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { void loadData() }, [loadData])

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

  const currentChallenge = challenges[currentIndex]
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
        <ChallengeCard
          key={currentChallenge.id}
          challenge={currentChallenge}
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
            return (
              <span
                key={challenge.id}
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
