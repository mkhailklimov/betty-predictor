import React, { useEffect, useState } from 'react'
import { championsApi } from '../services/api'
import { ChampionEntry } from '../types'
import '../styles/ChampionsPage.css'

export const ChampionsPage: React.FC = () => {
  const [results, setResults] = useState<ChampionEntry[]>([])
  const [weekId, setWeekId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true)
        const { data } = await championsApi.getLastRound()
        setResults(data.results)
        setWeekId(data.week_id)
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadResults()
  }, [])

  if (isLoading) {
    return (
      <div className="champions-page loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="champions-page">
      <div className="page-header">
        <h1>Last Round Results</h1>
        {weekId && <p className="page-subtitle">Week {weekId.replace('_', ' · ')}</p>}
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#127942;</div>
          <p className="empty-title">No results yet</p>
          <p className="empty-text">Weekly results appear here once the round&apos;s matches are played and scored.</p>
        </div>
      ) : (
        <div className="results-table">
          <div className="table-header">
            <div className="col rank">#</div>
            <div className="col player">Player</div>
            <div className="col num">Results</div>
            <div className="col num">Scores</div>
            <div className="col num">Total</div>
          </div>
          <div className="table-body">
            {results.map((entry) => (
              <div key={entry.user_id} className={`table-row ${entry.rank <= 3 ? 'top-' + entry.rank : ''}`}>
                <div className="col rank">
                  {entry.rank === 1 && <span className="medal">&#129351;</span>}
                  {entry.rank === 2 && <span className="medal">&#129352;</span>}
                  {entry.rank === 3 && <span className="medal">&#129353;</span>}
                  {entry.rank > 3 && <span className="rank-num">{entry.rank}</span>}
                </div>
                <div className="col player">{entry.username}</div>
                <div className="col num">{entry.correct_predictions}</div>
                <div className="col num">{entry.correct_scores}</div>
                <div className="col num total">{entry.points}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
