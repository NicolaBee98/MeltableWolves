import { useState } from 'react'
import { LogPartita } from './LogPartita'

export function LogImpostazioniPopup({ eventi }) {
  const [aperto, setAperto] = useState(false)
  const [tab, setTab] = useState('log')

  return (
    <div className="log-impostazioni">
      <button type="button" className="log-impostazioni__icona" onClick={() => setAperto(true)}>
        <span aria-hidden="true">📜</span> Registro e impostazioni
      </button>
      {aperto && (
        <div className="log-impostazioni__popup" role="dialog" aria-label="Registro e impostazioni">
          <div className="log-impostazioni__tabs">
            <button type="button" aria-pressed={tab === 'impostazioni'} onClick={() => setTab('impostazioni')}>
              Impostazioni partita
            </button>
            <button type="button" aria-pressed={tab === 'log'} onClick={() => setTab('log')}>
              Log partita
            </button>
          </div>
          {tab === 'log' ? <LogPartita eventi={eventi} /> : <p>Impostazioni in arrivo.</p>}
          <button type="button" onClick={() => setAperto(false)}>
            Chiudi
          </button>
        </div>
      )}
    </div>
  )
}
