import { useEffect, useRef, useState } from 'react'

// vicino al bordo dello schermo la pagina scorre da sola durante il trascinamento
const MARGINE_SCROLL_PX = 60
const PASSO_SCROLL_PX = 12
// su touch il drag parte dopo una pressione prolungata (così tap e scroll
// verticale restano liberi); se il dito si muove prima, è uno scroll
const PRESSIONE_TOUCH_MS = 200
const SOGLIA_SCROLL_PX = 8

// riordino con Pointer Events (mouse e touch, iOS compreso: il drag HTML5
// nativo non scatta su tocco). Tutta la card è trascinabile (tranne il tasto
// ✕ di eliminazione): `maniglia(id)` dà i gestori da mettere sulla card, che
// va marcata con data-giocatore-id. Il giocatore trascinato prende il posto
// del bersaglio: scendendo finisce dopo di lui, salendo prima.
export function useRiordina(giocatori, onRiordina) {
  const [stato, setStato] = useState(null) // { da, su } ids
  const corrente = useRef(null)
  const attesa = useRef(null) // pressione touch in corso { timer, x, y }

  function aggiorna(nuovo) {
    corrente.current = nuovo
    setStato(nuovo)
  }

  function annullaAttesa() {
    clearTimeout(attesa.current?.timer)
    attesa.current = null
  }

  // a drag attivo su touch il browser scorrerebbe la pagina: lo si blocca
  // con un touchmove non passivo (touch-action andrebbe deciso prima del tocco)
  useEffect(() => {
    if (!stato) return
    const blocca = (e) => e.preventDefault()
    document.addEventListener('touchmove', blocca, { passive: false })
    return () => document.removeEventListener('touchmove', blocca)
  }, [stato])

  function maniglia(id) {
    return {
      onPointerDown(e) {
        if (e.button > 0 || e.target.closest?.('.player-card__elimina')) return
        const el = e.currentTarget
        const pointerId = e.pointerId
        const avvia = () => {
          el.setPointerCapture?.(pointerId)
          aggiorna({ da: id, su: null })
        }
        if (e.pointerType === 'touch') {
          annullaAttesa()
          attesa.current = { timer: setTimeout(() => { attesa.current = null; avvia() }, PRESSIONE_TOUCH_MS), x: e.clientX, y: e.clientY }
        } else avvia()
      },
      onPointerMove(e) {
        const a = attesa.current
        if (a && Math.hypot(e.clientX - a.x, e.clientY - a.y) > SOGLIA_SCROLL_PX) annullaAttesa()
        if (!corrente.current) return
        if (e.clientY < MARGINE_SCROLL_PX) window.scrollBy(0, -PASSO_SCROLL_PX)
        else if (e.clientY > window.innerHeight - MARGINE_SCROLL_PX) window.scrollBy(0, PASSO_SCROLL_PX)
        const su = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-giocatore-id]')?.dataset.giocatoreId ?? null
        if (su !== corrente.current.su) aggiorna({ da: id, su })
      },
      onPointerUp() {
        annullaAttesa()
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
      onPointerCancel: () => { annullaAttesa(); aggiorna(null) },
      onContextMenu: (e) => e.preventDefault(), // il long-press touch non deve aprire il menu
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
