import React, { useEffect, useState } from 'react'
import { leaderboardApi } from '../services/api'
import { LeaderboardEntry } from '../types'
import '../styles/LeaderboardPage.css'

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true)
        const { data } = await leaderboardApi.getOverall()
        setLeaderboard(data)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadLeaderboard()
  }, [])

  if (isLoading) {
    return (
      <div className="leaderboard-page loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>TON Leaderboard</h1>
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128142;</div>
          <p className="empty-title">No rewards yet</p>
          <p className="empty-text">TON rewards will be distributed after Week 1 results are finalized.</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col rank">#</div>
            <div className="col player">Player</div>
            <div className="col rounds">Rounds</div>
            <div className="col ton">TON Won</div>
          </div>
          <div className="table-body">
            {leaderboard.map((entry) => (
              <div key={entry.user_id} className={`table-row ${entry.rank <= 3 ? 'top-' + entry.rank : ''}`}>
                <div className="col rank">
                  {entry.rank === 1 && <span className="medal">&#129351;</span>}
                  {entry.rank === 2 && <span className="medal">&#129352;</span>}
                  {entry.rank === 3 && <span className="medal">&#129353;</span>}
                  {entry.rank > 3 && <span className="rank-num">{entry.rank}</span>}
                </div>
                <div className="col player">{entry.username}</div>
                <div className="col rounds">{entry.correct_predictions + entry.correct_scores}</div>
                <div className="col ton">{entry.points > 0 ? (entry.points * 0.1).toFixed(1) : '0'} TON</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
