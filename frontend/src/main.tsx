import React from 'react'
import ReactDOM from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import telegramAnalytics from '@telegram-apps/analytics'
import App from './App.tsx'
import './styles/index.css'

const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`

try {
  const token = import.meta.env.VITE_TG_ANALYTICS_TOKEN
  const appName = import.meta.env.VITE_TG_ANALYTICS_APP_NAME
  if (token && appName) {
    telegramAnalytics.init({ token, appName })
  }
} catch (e) {
  console.warn('TG Analytics init failed:', e)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
)
