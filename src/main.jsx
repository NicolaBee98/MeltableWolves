import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import './index.css'

// registra il Service Worker generato da vite-plugin-pwa (vedi
// vite.config.js): mette in cache l'app e gli asset al primo
// caricamento, così ai successivi funziona anche senza connessione.
// "prompt" senza callback: una nuova versione scaricata in background si
// attiva al prossimo avvio dell'app, mai con un reload a metà partita.
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
