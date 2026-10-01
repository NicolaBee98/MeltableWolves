import { useRef, useState } from 'react'

// vicino al bordo dello schermo la pagina scorre da sola durante il trascinamento
const MARGINE_SCROLL_PX = 60
const PASSO_SCROLL_PX = 12

// riordino con Pointer Events (mouse e touch, iOS compreso: il drag HTML5
// nativo non scatta su tocco). La maniglia chiama `inizia(id)` su pointerdown
// e riceve il resto dei gestori da `maniglia(id)`; le card di rilascio vanno
// marcate con data-giocatore-id. Il giocatore trascinato prende il posto del
// bersaglio: scendendo finisce dopo di lui, salendo prima.
export function useRiordina(giocatori, onRiordina) {
  const [stato, setStato] = useState(null) // { da, su } ids
  const corrente = useRef(null)

  function aggiorna(nuovo) {
    corrente.current = nuovo
    setStato(nuovo)
  }

  function maniglia(id) {
    return {
      onPointerDown(e) {
        if (e.button > 0) return
        e.currentTarget.setPointerCapture?.(e.pointerId)
        aggiorna({ da: id, su: null })
      },
      onPointerMove(e) {
        if (!corrente.current) return
        if (e.clientY < MARGINE_SCROLL_PX) window.scrollBy(0, -PASSO_SCROLL_PX)
        else if (e.clientY > window.innerHeight - MARGINE_SCROLL_PX) window.scrollBy(0, PASSO_SCROLL_PX)
        const su = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-giocatore-id]')?.dataset.giocatoreId ?? null
        if (su !== corrente.current.su) aggiorna({ da: id, su })
      },
      onPointerUp() {
        const { da, su } = corrente.current ?? {}
        aggiorna(null)
        if (!da || !su || su === da) return
        const sorgente = giocatori.find((g) => g.id === da)
        const senza = giocatori.filter((g) => g.id !== da)
        const indiceTarget = senza.findIndex((g) => g.id === su)
        if (!sorgente || indiceTarget === -1) return
        const scende = giocatori.findIndex((g) => g.id === da) < giocatori.findIndex((g) => g.id === su)
        const posto = scende ? indiceTarget + 1 : indiceTarget
        onRiordina([...senza.slice(0, posto), sorgente, ...senza.slice(posto)])
      },
      onPointerCancel: () => aggiorna(null),
    }
  }

  // classe CSS di una card: quella trascinata e il punto di rilascio evidenziato
  function classe(id) {
    if (!stato) return ''
    if (id === stato.da) return ' player-card--trascinata'
    if (id !== stato.su) return ''
    const scende = giocatori.findIndex((g) => g.id === stato.da) < giocatori.findIndex((g) => g.id === id)
    return scende ? ' player-card--rilascio-dopo' : ' player-card--rilascio-prima'
  }

  return { maniglia, classe }
}
