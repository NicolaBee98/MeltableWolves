import { useState } from 'react'
import { LogPartita } from './LogPartita'
import { useDialogA11y } from '../../components/useDialogA11y'

export function LogImpostazioniPopup({
  eventi,
  onNuovaPartita,
  mostraRuoliInVotazione,
  onCambiaMostraRuoliInVotazione,
  variantiFaccia,
  onCambiaVariantiFaccia,
  mostraNomeRuolo,
  onCambiaMostraNomeRuolo,
  durataTimer,
  onCambiaDurataTimer,
  promemoriaRuoliMorti,
  onCambiaPromemoriaRuoliMorti,
  varianteMedium,
  onCambiaVarianteMedium,
}) {
  const [aperto, setAperto] = useState(false)
  const [tab, setTab] = useState('impostazioni')
  const [confermaNuovaPartita, setConfermaNuovaPartita] = useState(false)

  function chiudi() {
    setAperto(false)
    setConfermaNuovaPartita(false)
  }

  const { dialogRef, triggerRef } = useDialogA11y(aperto, chiudi)

  function confermaNuova() {
    onNuovaPartita()
    chiudi()
  }

  return (
    <div className="log-impostazioni">
      <button
        type="button"
        ref={triggerRef}
        className="log-impostazioni__icona"
        aria-pressed={aperto}
        aria-label="Registro e impostazioni"
        onClick={() => setAperto((a) => !a)}
      >
        <span aria-hidden="true">⚙️</span>
      </button>
      {aperto && (
        <div
          className="log-impostazioni__popup"
          role="dialog"
          aria-modal="true"
          aria-label="Registro e impostazioni"
          ref={dialogRef}
          tabIndex={-1}
        >
          <button type="button" className="log-impostazioni__chiudi" onClick={chiudi} aria-label="Chiudi">
            ✕
          </button>
          {confermaNuovaPartita ? (
            <div className="log-impostazioni__conferma">
              <p>Iniziare una nuova partita? I dati della partita attuale (giocatori, ruoli, registro) andranno persi.</p>
              <button type="button" className="log-impostazioni__cta" onClick={confermaNuova}>
                Sì, ricomincia
              </button>
              <button type="button" onClick={() => setConfermaNuovaPartita(false)}>
                Annulla
              </button>
            </div>
          ) : (
            <>
              <div className="log-impostazioni__tabs">
                <button type="button" aria-pressed={tab === 'impostazioni'} onClick={() => setTab('impostazioni')}>
                  Impostazioni partita
                </button>
                <button type="button" aria-pressed={tab === 'log'} onClick={() => setTab('log')}>
                  Log partita
                </button>
              </div>
              {tab === 'log' ? (
                <LogPartita eventi={eventi} />
              ) : (
                <div className="log-impostazioni__impostazioni">
                  <label className="impostazioni__toggle">
                    <input
                      type="checkbox"
                      checked={mostraRuoliInVotazione}
                      onChange={(e) => onCambiaMostraRuoliInVotazione(e.target.checked)}
                    />
                    Mostra i ruoli durante la votazione (narratore)
                  </label>
                  <label className="impostazioni__toggle">
                    <input
                      type="checkbox"
                      checked={variantiFaccia}
                      onChange={(e) => onCambiaVariantiFaccia(e.target.checked)}
                    />
                    Varianti di icona per Lupi Mannari e Villici
                  </label>
                  <label className="impostazioni__toggle">
                    <input
                      type="checkbox"
                      checked={mostraNomeRuolo}
                      onChange={(e) => onCambiaMostraNomeRuolo(e.target.checked)}
                    />
                    Mostra il nome del ruolo tra parentesi accanto al nome
                  </label>
                  <label className="impostazioni__toggle">
                    <input
                      type="checkbox"
                      checked={promemoriaRuoliMorti}
                      onChange={(e) => onCambiaPromemoriaRuoliMorti(e.target.checked)}
                    />
                    Richiama di notte i ruoli morti con potere ricorrente (con l'icona ☠️)
                  </label>
                  <label className="impostazioni__toggle">
                    <input
                      type="checkbox"
                      checked={varianteMedium}
                      onChange={(e) => onCambiaVarianteMedium(e.target.checked)}
                    />
                    Variante Medium: percepisce solo l'aura del defunto, non il ruolo esatto
                  </label>
                  <label className="impostazioni__campo">
                    Durata timer arringa/spareggio (secondi)
                    <input
                      type="number"
                      min="1"
                      value={durataTimer}
                      onChange={(e) => onCambiaDurataTimer(Math.max(1, Math.round(Number(e.target.value) || 1)))}
                    />
                  </label>
                  <button type="button" className="log-impostazioni__cta" onClick={() => setConfermaNuovaPartita(true)}>
                    Nuova Partita
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
