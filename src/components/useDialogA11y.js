import { useEffect, useRef } from 'react'

// Comportamento minimo atteso da un dialog per tastiera/screen reader (vedi
// audit UX): Esc lo chiude, il focus entra nel dialog all'apertura e torna
// al pulsante che l'ha aperto alla chiusura, invece di restare "perso" da
// qualche parte fuori dallo schermo. `dialogRef` va sul contenitore del
// dialog (con tabIndex={-1}), `triggerRef` sul pulsante che lo apre.
export function useDialogA11y(aperto, onChiudi) {
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!aperto) return
    dialogRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') onChiudi()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      triggerRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aperto])

  return { dialogRef, triggerRef }
}
