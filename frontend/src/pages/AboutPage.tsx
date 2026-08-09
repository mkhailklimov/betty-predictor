import React from 'react'
import '../styles/AboutPage.css'

export const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Betty Scores</h1>
      </div>

      <section className="about-section">
        <h2>How it works</h2>
        <p>
          Every week, Betty features <strong>10 top football matches</strong> from
          leagues around the world: Premier League, Champions League, MLS,
          national teams, and more.
        </p>
        <p>
          Use the <strong>score reels</strong> to predict the exact scoreline for
          each match before kickoff. Your prediction locks when the match starts.
        </p>
      </section>

      <section className="about-section">
        <h2>Scoring</h2>
        <div className="scoring-grid">
          <div className="scoring-item">
            <span className="scoring-pts">1 pt</span>
            <span className="scoring-desc">Correct outcome (1 / X / 2)</span>
          </div>
          <div className="scoring-item">
            <span className="scoring-pts">3 pts</span>
            <span className="scoring-desc">Exact score (includes the outcome)</span>
          </div>
        </div>
        <p className="scoring-note">
          An exact score is worth 3 points total, not 1 + 3. The maximum per
          match is 3.
        </p>
      </section>

      <section className="about-section">
        <h2>Weekly prizes</h2>
        <div className="scoring-grid">
          <div className="scoring-item">
            <span className="scoring-pts">100 Stars</span>
            <span className="scoring-desc">1st place each week</span>
          </div>
          <div className="scoring-item">
            <span className="scoring-pts">50 Stars</span>
            <span className="scoring-desc">2nd place each week</span>
          </div>
        </div>
        <p className="scoring-note">
          Tie-break: if two players have the same points, the one who placed
          their last prediction earlier wins. Guest players are not eligible for
          prizes until they log in with Telegram.
        </p>
        <p className="scoring-note">
          Participation is free and voluntary. The organisers are not obligated to
          distribute Star prizes; however, we commit to making every effort to
          deliver prizes within one month after results are calculated.
        </p>
      </section>

      <section className="about-section">
        <h2>The week</h2>
        <p>
          A week runs <strong>Monday 00:00 UTC</strong> to{' '}
          <strong>Sunday 23:59 UTC</strong>. New matches publish every Monday.
          Results and prizes are computed at the start of the following week.
        </p>
      </section>

      <section className="about-section">
        <h2>Privacy</h2>
        <p>
          We collect only the data necessary to run the game: your Telegram user ID,
          display name, and predictions. We do not sell or share your personal data
          with third parties.
        </p>
        <p>
          Your data is stored securely on Cloudflare infrastructure and is used solely
          to provide the game experience, compute scores, and distribute prizes. You
          can delete your account and all associated data at any time by contacting{' '}
          <strong>@bettyscores</strong> on Telegram.
        </p>
      </section>

      <section className="about-section about-section--footer">
        <p>
          Betty Scores is a Telegram Mini App. Questions or feedback? Message{' '}
          <strong>@bettyscores</strong> on Telegram.
        </p>
      </section>
    </div>
  )
}
