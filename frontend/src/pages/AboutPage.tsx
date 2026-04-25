import React from 'react'
import '../styles/LandingPage.css'

export const AboutPage: React.FC = () => {
  return (
    <div className="info-page">
      <h2>About Betty</h2>
      <p>
        Betty is a free-to-play prediction game for the FIFA World Cup 2026. Open it in Telegram,
        predict the winner and exact score for each match, and climb the leaderboard. Predictions
        lock at each match's kickoff.
      </p>

      <h3>How to win</h3>
      <ul>
        <li>1 point for the correct outcome (home win / draw / away win).</li>
        <li>3 points for the exact score.</li>
        <li>Predictions lock at each match's kickoff (UTC). Late predictions are not accepted.</li>
      </ul>

      <h3>Prize</h3>
      <p>
        For each World Cup 2026 matchday (a <em>matchday</em> = all matches kicking off on the same
        UTC calendar day), Betty awards <strong>1 TON</strong> to one winner.
      </p>

      <h3>Winner determination</h3>
      <ol>
        <li>Highest total points from that matchday's matches.</li>
        <li>
          <strong>Tie-break 1:</strong> earliest timestamp of the player's last submitted
          prediction for that matchday.
        </li>
        <li>
          <strong>Tie-break 2:</strong> lowest Telegram user ID.
        </li>
      </ol>

      <h3>Rules</h3>
      <ol>
        <li>Free to enter. No purchase necessary.</li>
        <li>One Telegram account = one entry. Multi-account participants are disqualified.</li>
        <li>
          Winners are announced within 24 hours of the matchday's last final whistle and paid in
          TON to the Telegram Wallet linked to the winning Telegram account.
        </li>
        <li>Recipients are responsible for any taxes in their jurisdiction.</li>
        <li>
          Void where prohibited by local law. Not open to residents of jurisdictions where free
          prize contests with crypto rewards are restricted.
        </li>
        <li>
          Disputes: contact <a href="https://t.me/betty_worldcup2026_bot">@betty_worldcup2026_bot</a>{' '}
          within 48 hours of the matchday's last final whistle.
        </li>
      </ol>

      <p style={{ opacity: 0.7, fontSize: '0.9em', marginTop: '2em' }}>
        Betty is a free skill-based prediction contest. Winners are determined by prediction
        accuracy, not chance. Prizes have no cash value and cannot be exchanged for money outside
        the TON network.
      </p>
    </div>
  )
}
