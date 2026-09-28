import { useState } from 'react'

// riordino trascina-e-rilascia (drag & drop nativo HTML5, senza dipendenze):
// l'intera card è la maniglia, niente handle/frecce separate da mostrare.
// Su browser/dispositivi senza supporto (es. touch, che non genera
// dragstart) la card semplicemente non è trascinabile: nessun fallback,
// il narratore può comunque rimuovere e riaggiungere per riordinare.
const DRAG_AND_DROP_SUPPORTATO = typeof document !== 'undefined' && 'draggable' in document.createElement('div')

// tempo di pressione per rimuovere un giocatore: un tap secco è facile da
// far scattare per sbaglio in un tavolo affollato, quindi bisogna tenere
// premuto finché il pulsante non si riempie tutto di rosso (funziona sia a
// puntatore/tocco che da tastiera, tenendo premuto Invio/Spazio)
const DURATA_PRESSIONE_MS = 700

export function PlayerCard({ giocatore, onRemove, onDragStart, onDragOver, onDrop }) {
  const [eliminando, setEliminando] = useState(false)

  function iniziaEliminazione(e) {
    if (e.type === 'keydown' && e.repeat) return
    setEliminando(true)
  }

  function annullaEliminazione() {
    setEliminando(false)
  }

  // l'overlay di riempimento anima solo `width` (vedi CSS), quindi ogni
  // transitionend che arriva qui mentre si sta ancora tenendo premuto
  // significa che il riempimento è arrivato in fondo
  function confermaSeRiempimentoCompletato() {
    if (eliminando) {
      onRemove(giocatore.id)
    }
  }

  return (
    <article
      className="player-card"
      draggable={DRAG_AND_DROP_SUPPORTATO}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <header className="player-card__header">
        <h3>{giocatore.nome}</h3>
        <button
          type="button"
          className="player-card__elimina"
          aria-label={`Tieni premuto per rimuovere ${giocatore.nome}`}
          onPointerDown={iniziaEliminazione}
          onPointerUp={annullaEliminazione}
          onPointerLeave={annullaEliminazione}
          onPointerCancel={annullaEliminazione}
          onKeyDown={iniziaEliminazione}
          onKeyUp={annullaEliminazione}
        >
          <span
            className="player-card__elimina-riempimento"
            style={{ width: eliminando ? '100%' : '0%', transitionDuration: eliminando ? `${DURATA_PRESSIONE_MS}ms` : '0ms' }}
            onTransitionEnd={confermaSeRiempimentoCompletato}
          />
          <span className="player-card__elimina-etichetta" aria-hidden="true">
            ✕
          </span>
        </button>
      </header>
    </article>
  )
}
