import React from 'react'
import ReactDOM from 'react-dom/client'
import telegramAnalytics from '@telegram-apps/analytics'
import App from './App.tsx'
import './styles/index.css'

try {
  telegramAnalytics.init({
    token: 'eyJhcHBfbmFtZSI6ImJldHR5X3Njb3JlcyIsImFwcF91cmwiOiJodHRwczovL3QubWUvYmV0dHlzY29yZXNfYm90IiwiYXBwX2RvbWFpbiI6Imh0dHBzOi8vYXBwLmJldHR5c2NvcmVzLmNvbSJ9!Opsf6FhxfhyhklVlSXuM1T8/Jx+IueTfXeUbGcAEbbI=',
    appName: 'betty_scores',
  })
} catch (e) {
  console.warn('TG Analytics init failed:', e)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
