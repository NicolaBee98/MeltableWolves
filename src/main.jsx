import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import './index.css'

// registra il Service Worker generato da vite-plugin-pwa (vedi
// vite.config.js): mette in cache l'app e gli asset al primo
// caricamento, così ai successivi funziona anche senza connessione.
// "autoUpdate" aggiorna la cache in background da solo, senza dover
// costruire un banner "nuova versione disponibile" per un'app a
// singolo utente come questa.
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
