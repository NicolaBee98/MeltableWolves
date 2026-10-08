import { useDialogA11y } from './useDialogA11y'

// Mostra una carta a schermo intero (es. dal narratore al giocatore interrogato
// dalla Cartomante o dal Medium), con la ✕ in alto a destra per chiuderla.
export function CartaSchermoIntero({ src, etichetta, onChiudi }) {
  const { dialogRef } = useDialogA11y(true, onChiudi)
  return (
    <div className="carta-schermo-intero" role="dialog" aria-modal="true" aria-label={etichetta} ref={dialogRef} tabIndex={-1}>
      <button type="button" className="carta-schermo-intero__chiudi" onClick={onChiudi} aria-label="Chiudi">
        ✕
      </button>
      <img src={src} alt={etichetta} className="carta-schermo-intero__immagine" draggable={false} />
    </div>
  )
}
