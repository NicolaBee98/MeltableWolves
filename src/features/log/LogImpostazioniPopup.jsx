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
  addolorataEreditaScelte = true,
  onCambiaAddolorataEreditaScelte = () => {},
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
        aria-label="Diario e impostazioni"
        onClick={() => setAperto((a) => !a)}
      >
        <img src="/assets/icone/ui/ingranaggio.svg" alt="" aria-hidden="true" className="log-impostazioni__img" />
      </button>
      {aperto && (
        <div
          className="log-impostazioni__popup"
          role="dialog"
          aria-modal="true"
          aria-label="Diario e impostazioni"
          ref={dialogRef}
          tabIndex={-1}
        >
          <button type="button" className="log-impostazioni__chiudi" onClick={chiudi} aria-label="Chiudi">
            ✕
          </button>
          {confermaNuovaPartita ? (
            <div className="log-impostazioni__conferma">
              <p>Iniziare una nuova partita? Ruoli, mazzo e diario della partita attuale saranno azzerati.</p>
              <button type="button" className="log-impostazioni__cta" onClick={confermaNuova}>
                Sì, ricomincia
              </button>
              <button type="button" onClick={() => setConfermaNuovaPartita(false)}>
                Annulla
              </button>
            </div>
          ) : (
            <>
              <div className="log-impostazioni__tabs" role="tablist">
                <button type="button" role="tab" aria-selected={tab === 'impostazioni'} onClick={() => setTab('impostazioni')}>
                  Impostazioni partita
                </button>
                <button type="button" role="tab" aria-selected={tab === 'log'} onClick={() => setTab('log')}>
                  Diario
                </button>
              </div>
              {tab === 'log' ? (
                <LogPartita eventi={eventi} />
              ) : (
                <div className="log-impostazioni__impostazioni">
                  {[
                    [mostraRuoliInVotazione, onCambiaMostraRuoliInVotazione, 'Mostra le icone dei ruoli durante la votazione'],
                    [variantiFaccia, onCambiaVariantiFaccia, 'Utilizza le varianti di icona per Lupi Mannari e Villici'],
                    [mostraNomeRuolo, onCambiaMostraNomeRuolo, 'Mostra il ruolo di un giocatore tra parentesi durante la votazione'],
                    [promemoriaRuoliMorti, onCambiaPromemoriaRuoliMorti, 'Promemoria durante la notte per i ruoli morti che agirebbero'],
                    [varianteMedium, onCambiaVarianteMedium, "Variante Medium: percepisce solo l'aura del defunto, non il ruolo esatto"],
                    [addolorataEreditaScelte, onCambiaAddolorataEreditaScelte, "L'Addolorata eredita le scelte dei legami (maestro, protetto, genitore)"],
                  ].map(([valore, onCambia, testo]) => (
                    <label key={testo} className="impostazioni__toggle">
                      <input type="checkbox" checked={valore} onChange={(e) => onCambia(e.target.checked)} />
                      {testo}
                    </label>
                  ))}
                  <label className="impostazioni__campo">
                    Durata timer spareggio (secondi)
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
