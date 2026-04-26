import React, { useEffect, useState } from 'react'
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { leaderboardApi, userApi } from '../services/api'
import { LeaderboardEntry, User } from '../types'
import '../styles/LeaderboardPage.css'

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [me, setMe] = useState<User | null>(null)
  const [savedAddress, setSavedAddress] = useState<string | null>(null)
  const tonAddress = useTonAddress()
  const [tonConnectUI] = useTonConnectUI()

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true)
        const [{ data: lb }, { data: meData }] = await Promise.all([
          leaderboardApi.getOverall(),
          userApi.getMe().catch(() => ({ data: null as User | null })),
        ])
        setLeaderboard(lb)
        setMe(meData)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadLeaderboard()
  }, [])

  // Persist newly-connected wallet to backend (once per address).
  useEffect(() => {
    if (!tonAddress || tonAddress === savedAddress) return
    userApi.saveWallet(tonAddress)
      .then(() => setSavedAddress(tonAddress))
      .catch((e) => console.error('saveWallet failed:', e))
  }, [tonAddress, savedAddress])

  const myEntry = me ? leaderboard.find((e) => e.user_id === me.id) : null
  const isEligible = !!myEntry && myEntry.rank <= 3

  // Disconnect if a non-eligible user somehow has a wallet connected.
  useEffect(() => {
    if (!isEligible && tonConnectUI.connected) {
      // Don't auto-disconnect — let them see their connected state but the button is hidden.
    }
  }, [isEligible, tonConnectUI])

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

      <div className="ton-connect-zone">
        {isEligible ? (
          <>
            <p className="ton-connect-hint">You're in the top 3 — connect a TON wallet to receive your prize.</p>
            <TonConnectButton />
          </>
        ) : (
          <p className="ton-connect-hint disabled">Reach top 3 this matchweek to connect your TON wallet.</p>
        )}
      </div>
    </div>
  )
}
