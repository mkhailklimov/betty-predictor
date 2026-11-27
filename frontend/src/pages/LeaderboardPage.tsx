import React, { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { leaderboardApi, userApi, guestApi, paymentsApi } from '../services/api'
import { LeaderboardEntry, User } from '../types'
import { FlagPickerModal } from '../components/FlagPickerModal'
import { getAvatar } from '../data/avatars'
import '../styles/LeaderboardPage.css'

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [me, setMe] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [nick, setNick] = useState('')
  const [nickError, setNickError] = useState<string | null>(null)
  const [nickBusy, setNickBusy] = useState(false)
  const [showFlagPicker, setShowFlagPicker] = useState(false)
  const [payStatus, setPayStatus] = useState<'idle' | 'loading' | 'failed'>('idle')
  const [showAll, setShowAll] = useState(false)

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

  const scorecard = leaderboard
    .filter((entry) => {
      const username = entry.username?.trim() || ''
      return username !== '' && !/^(guest|user_\d+)$/i.test(username)
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  // Top 10 by default; the viewer's own row is pinned below if they rank lower.
  const TOP_N = 10
  const collapsed = !showAll && scorecard.length > TOP_N
  const visibleRows = collapsed ? scorecard.slice(0, TOP_N) : scorecard
  const myRow = collapsed ? scorecard.slice(TOP_N).find((entry) => entry.user_id === me?.id) : undefined

  const renderRow = (entry: (typeof scorecard)[number]) => (
    <div
      key={entry.user_id}
      className={`table-row ${entry.rank <= 3 ? 'top-' + entry.rank : ''} ${entry.user_id === me?.id ? 'is-me' : ''}`}
    >
      <div className="col rank">
        {entry.rank === 1 && <span className="medal">&#129351;</span>}
        {entry.rank === 2 && <span className="medal">&#129352;</span>}
        {entry.rank === 3 && <span className="medal">&#129353;</span>}
        {entry.rank > 3 && <span className="rank-num">{entry.rank}</span>}
      </div>
      <div className="col player">
        {getAvatar(entry.fav_team) && (
          <img
            className="row-flag"
            src={getAvatar(entry.fav_team)!.src}
            alt={getAvatar(entry.fav_team)!.name}
          />
        )}
        {entry.username}
        {entry.is_premium && <span className="pro-badge">PRO</span>}
        {entry.league_name && <span className="league-tag">{entry.league_name}</span>}
      </div>
      <div className="col rounds">{entry.weeks_played ?? 0}</div>
      <div className="col ton">{entry.points}</div>
      <div className="col stars stars-bold">{entry.stars_earned ?? 0}</div>
    </div>
  )

  // Avatars cost 50 Stars (owner, 27 Nov). Payments work only inside Telegram.
  const isPremium = !!me?.is_premium
  const inTelegram = !!WebApp.initData
  const buyAvatar = async () => {
    setPayStatus('loading')
    try {
      const { data } = await paymentsApi.createStarsInvoice()
      WebApp.openInvoice(data.invoice_url, async (status) => {
        paymentsApi.reportStatus(data.payload, status).catch(() => {})
        if (status === 'paid') {
          setPayStatus('idle')
          // Telegram's payment message can reach the server a moment after this callback.
          for (let attempt = 0; attempt < 10; attempt++) {
            try {
              const { data: meData } = await userApi.getMe()
              setMe(meData)
              if (meData.is_premium) break
            } catch {}
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
          setShowFlagPicker(true)
        } else if (status === 'cancelled') {
          setPayStatus('idle')
        } else {
          setPayStatus('failed')
        }
      })
    } catch (e) {
      console.error('createStarsInvoice failed:', e)
      setPayStatus('failed')
    }
  }

  // Release 2.2: any player may choose a nickname (Latin letters, digits, spaces, _ . - #).
  const saveNick = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = nick.trim()
    if (value.length < 3) { setNickError('At least 3 characters'); return }
    setNickBusy(true)
    setNickError(null)
    try {
      const { data } = await guestApi.setNickname(value)
      setMe((prev) => (prev ? { ...prev, username: data.nickname } : prev))
      setLeaderboard((prev) => prev.map((row) => (me && row.user_id === me.id ? { ...row, username: data.nickname } : row)))
      setEditing(false)
    } catch (err: any) {
      setNickError(err?.response?.data?.detail || 'Could not save, try again')
    } finally {
      setNickBusy(false)
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
        <h1>Hall of Fame</h1>
      </div>

      {scorecard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#11088;</div>
          <p className="empty-title">No named players yet</p>
          <p className="empty-text">Players with a nickname will appear here once matches are scored.</p>
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
            {visibleRows.map(renderRow)}
            {myRow && (
              <>
                <div className="table-gap">&middot;&middot;&middot;</div>
                {renderRow(myRow)}
              </>
            )}
          </div>
          {scorecard.length > TOP_N && (
            <button className="show-all-btn" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show top 10' : `Show all (${scorecard.length})`}
            </button>
          )}
        </div>
      )}

      <div className="premium-zone me-zone">
        <p className="me-zone__title">Your player</p>
        <div className="me-zone__card">
          {getAvatar(me?.fav_team) ? (
            <img className="me-zone__avatar" src={getAvatar(me?.fav_team)!.src} alt={getAvatar(me?.fav_team)!.name} />
          ) : (
            <span className="me-zone__avatar me-zone__avatar--empty">?</span>
          )}
          <span className="me-zone__name">{me?.username || 'Player'}</span>
        </div>
        {editing ? (
          <form className="me-zone__form" onSubmit={saveNick}>
            <input
              className="me-zone__input"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              maxLength={20}
              placeholder="e.g. Gooner#1"
              aria-label="New nickname"
              autoFocus
            />
            <button className="premium-btn" type="submit" disabled={nickBusy}>Save</button>
            <button className="me-zone__cancel" type="button" onClick={() => { setEditing(false); setNickError(null) }}>Cancel</button>
          </form>
        ) : (
          <div className="me-zone__buttons">
            <button className="premium-btn" onClick={() => { setNick(me?.username || ''); setEditing(true) }}>Change name</button>
            {isPremium ? (
              <button className="premium-btn" onClick={() => setShowFlagPicker(true)}>{me?.fav_team ? 'Change avatar' : 'Pick avatar'}</button>
            ) : inTelegram ? (
              <button className="premium-btn" onClick={buyAvatar} disabled={payStatus === 'loading'}>
                {payStatus === 'loading' ? 'Opening...' : 'Get avatar for 50 Stars'}
              </button>
            ) : null}
          </div>
        )}
        {nickError && <p className="premium-error">{nickError}</p>}
        {payStatus === 'failed' && <p className="premium-error">Couldn&apos;t start payment. Try again later.</p>}
        <p className="me-zone__hint">
          Name: Latin letters, digits, spaces and _ . - # (3 to 20).
          {isPremium
            ? ' Avatar: any nation, Premier League or European club.'
            : inTelegram
              ? ' Avatar: any nation, Premier League or European club, 50 Stars once, yours for good.'
              : ' Avatars are bought with Stars in Telegram: open Betty in Telegram.'}
        </p>
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
