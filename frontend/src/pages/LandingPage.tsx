import React from 'react'
import './LandingPage.css'

interface StartPageProps {
  onStart: () => void
}

export const LandingPage: React.FC<StartPageProps> = ({ onStart }) => {
  return (
    <div className="start-page">
      <div className="start-content">
        <img src="/betty-logo.png" alt="Betty" className="start-logo" />
        <h1 className="start-title">Betty Scores</h1>
        <p className="start-subtitle">European Football Predictions</p>
        <p className="start-slogan">Sniff the score, catch a star</p>
        <button className="start-btn" onClick={onStart}>
          Start Game
        </button>
      </div>
    </div>
  )
}
