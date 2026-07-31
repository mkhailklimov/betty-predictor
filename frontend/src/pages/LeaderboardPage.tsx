import React, { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { leaderboardApi, userApi, paymentsApi } from '../services/api'
import { LeaderboardEntry, User } from '../types'
import { FlagPickerModal } from '../components/FlagPickerModal'
import '../styles/LeaderboardPage.css'

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [me, setMe] = useState<User | null>(null)
  const [premiumStatus, setPremiumStatus] = useState<'idle' | 'loading' | 'paid' | 'failed'>('idle')
  const [showFlagPicker, setShowFlagPicker] = useState(false)

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

  const isPremium = !!me?.is_premium

  const handleBuyPremium = async () => {
    setPremiumStatus('loading')
    try {
      const { data } = await paymentsApi.createStarsInvoice()
      WebApp.openInvoice(data.invoice_url, async (status) => {
        if (status === 'paid') {
          setPremiumStatus('paid')
          try {
            const { data: meData } = await userApi.getMe()
            setMe(meData)
            setShowFlagPicker(true)
          } catch {}
        } else if (status === 'cancelled') {
          setPremiumStatus('idle')
        } else {
          setPremiumStatus('failed')
        }
      })
    } catch (e) {
      console.error('createStarsInvoice failed:', e)
      setPremiumStatus('failed')
    }
  }

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
        <h1>Leaderboard</h1>
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128142;</div>
          <p className="empty-title">No results yet</p>
          <p className="empty-text">Scores appear here once the first week&apos;s matches are played.</p>
        </div>
      ) : (
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col rank">#</div>
            <div className="col player">Player</div>
            <div className="col rounds">Weeks</div>
            <div className="col ton">Points</div>
            <div className="col stars">&#11088;</div>
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
                <div className="col player">
                  {entry.fav_team && (
                    <img
                      className="row-flag"
                      src={`/teams/Cards/${entry.fav_team}.png`}
                      alt={entry.fav_team}
                    />
                  )}
                  {entry.username}
                  {entry.is_premium && <span className="pro-badge">PRO</span>}
                </div>
                <div className="col rounds">{entry.weeks_won ?? 0}</div>
                <div className="col ton">{entry.points}</div>
                <div className="col stars stars-bold">{entry.stars_earned ?? 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="premium-zone">
        {isPremium || premiumStatus === 'paid' ? (
          <>
            <p className="premium-hint">
              <span className="pro-badge">PRO</span>
              {me?.fav_team
                ? ` You're flying the ${me.fav_team} flag.`
                : ' Pick your team to fly its flag.'}
            </p>
            <button className="premium-btn" onClick={() => setShowFlagPicker(true)}>
              {me?.fav_team ? 'Change my flag' : 'Pick my flag'}
            </button>
          </>
        ) : (
          <>
            <p className="premium-hint">
              Pick your favourite team and fly its flag next to your name on the leaderboard.
            </p>
            <button
              className="premium-btn"
              onClick={handleBuyPremium}
              disabled={premiumStatus === 'loading'}
            >
              {premiumStatus === 'loading' ? 'Opening...' : 'Get fave team avatar  Stars 50'}
            </button>
            {premiumStatus === 'failed' && (
              <p className="premium-error">Couldn&apos;t start payment. Try again later.</p>
            )}
          </>
        )}
      </div>

      {showFlagPicker && (
        <FlagPickerModal
          current={me?.fav_team ?? null}
          onPicked={(code) => {
            setMe((prev) => (prev ? { ...prev, fav_team: code } : prev))
            setLeaderboard((prev) =>
              prev.map((row) => (me && row.user_id === me.id ? { ...row, fav_team: code } : row))
            )
            setShowFlagPicker(false)
          }}
          onClose={() => setShowFlagPicker(false)}
        />
      )}
    </div>
  )
}
