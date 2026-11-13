import React, { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { leagueApi } from '../services/api'
import { LeagueResponse, LeagueRow } from '../types'
import { getAvatar } from '../data/avatars'
import '../styles/LeaderboardPage.css'
import '../styles/LeaguePage.css'

const BOT_APP_URL = 'https://t.me/bettyscores_bot/app'
const TOP_N = 20

// Week ids are ISO weeks ("2026_49"): Monday of that week, e.g. "Mon 30 Nov".
export function weekStartLabel(weekId: string): string {
  const [y, w] = weekId.split('_').map(Number)
  if (!y || !w) return weekId
  const jan4 = new Date(Date.UTC(y, 0, 4))
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + (w - 1) * 7)
  return monday.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function seasonStarted(weekId: string): boolean {
  const [y, w] = weekId.split('_').map(Number)
  const jan4 = Date.UTC(y, 0, 4)
  const day = (new Date(jan4).getUTCDay() + 6) % 7
  return Date.now() >= jan4 + ((w - 1) * 7 - day) * 86400000
}

export const LeaguePage: React.FC = () => {
  const [data, setData] = useState<LeagueResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    leagueApi.getMine()
      .then(({ data }) => setData(data))
      .catch((e) => {
        console.error('Error loading league:', e)
        setData({ league: null, table: [] })
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="leaderboard-page loading">
        <div className="spinner"></div>
      </div>
    )
  }

  const league = data?.league
  if (!league) {
    return (
      <div className="leaderboard-page">
        <div className="page-header">
          <h1>League</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">&#128737;</div>
          <p className="empty-title">You are not in a league yet</p>
          <p className="empty-text">
            A league is a table just for the players of one channel or group. You play the same
            matches and can still win the weekly Stars. Ask your channel admin for the league link.
          </p>
        </div>
      </div>
    )
  }

  const table = data!.table
  const visible = table.slice(0, TOP_N)
  const myRow = table.slice(TOP_N).find((r) => r.is_me)
  const started = seasonStarted(league.season_start_week)
  const startLabel = weekStartLabel(league.season_start_week)

  const invite = () => {
    const link = `${BOT_APP_URL}?startapp=league_${league.id}`
    const text = `Join me in the ${league.name} on Betty Scores: predict the scores, climb our table and win Telegram Stars.`
    const share = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
    try {
      WebApp.openTelegramLink(share)
    } catch {
      window.open(share, '_blank')
    }
  }

  const renderRow = (r: LeagueRow) => {
    const avatar = getAvatar(r.fav_team)
    return (
      <div key={r.user_id} className={`table-row ${r.rank <= 3 && r.points > 0 ? 'top-' + r.rank : ''} ${r.is_me ? 'is-me' : ''}`}>
        <div className="col rank"><span className="rank-num">{r.rank}</span></div>
        <div className="col player">
          {avatar && <img className="row-flag" src={avatar.src} alt={avatar.name} />}
          {r.username}
        </div>
        <div className="col lg-num">{r.weeks_played}</div>
        <div className="col lg-num">{r.correct_results}</div>
        <div className="col lg-num lg-exact">{r.exact_scores}</div>
        <div className="col lg-pts">{r.points}</div>
      </div>
    )
  }

  return (
    <div className="leaderboard-page league-page">
      <div className="page-header">
        <h1>{league.name}</h1>
        <p className="league-sub">
          {league.members} {league.members === 1 ? 'player' : 'players'}
          {' · '}
          {started ? `Season from ${startLabel}` : `Season starts ${startLabel}`}
        </p>
      </div>

      {!started && (
        <p className="league-note">
          Points from the week of {startLabel} count for the league. Invite your friends before the start.
        </p>
      )}

      <div className="leaderboard-table league-table">
        <div className="table-header">
          <div className="col rank">#</div>
          <div className="col player">Player</div>
          <div className="col lg-num">Wk</div>
          <div className="col lg-num">Res</div>
          <div className="col lg-num lg-exact">Exact</div>
          <div className="col lg-pts">Pts</div>
        </div>
        <div className="table-body">
          {visible.map(renderRow)}
          {myRow && (
            <>
              <div className="table-gap">&middot;&middot;&middot;</div>
              {renderRow(myRow)}
            </>
          )}
        </div>
      </div>

      <p className="league-legend">
        Wk = weeks played, Res = correct results, Exact = exact scores. You still play for the weekly
        100 and 50 Stars with everyone.
      </p>

      <div className="premium-zone">
        <button className="premium-btn" onClick={invite}>Invite friends</button>
      </div>
    </div>
  )
}
