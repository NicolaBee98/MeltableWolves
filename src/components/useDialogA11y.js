import { useEffect, useRef } from 'react'

// Comportamento minimo atteso da un dialog per tastiera/screen reader (vedi
// audit UX): Esc lo chiude, il focus entra nel dialog all'apertura e torna
// al pulsante che l'ha aperto alla chiusura, invece di restare "perso" da
// qualche parte fuori dallo schermo; Tab resta dentro il dialog (aria-modal). `dialogRef` va sul contenitore del
// dialog (con tabIndex={-1}), `triggerRef` sul pulsante che lo apre.
export function useDialogA11y(aperto, onChiudi) {
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!aperto) return
    dialogRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') onChiudi()
      // focus trap minimo: Tab/Shift+Tab ciclano tra gli elementi del dialog
      // invece di uscire sulla pagina sotto
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusabili = [...dialogRef.current.querySelectorAll('button, input, select, textarea, a[href]')].filter(
        (el) => !el.disabled,
      )
      if (focusabili.length === 0) return
      const primo = focusabili[0]
      const ultimo = focusabili[focusabili.length - 1]
      const attivo = document.activeElement
      if (e.shiftKey && (attivo === primo || attivo === dialogRef.current)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && attivo === ultimo) {
        e.preventDefault()
        primo.focus()
      }
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
