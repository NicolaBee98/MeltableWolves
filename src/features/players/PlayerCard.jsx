import { useState } from 'react'

// riordino trascina-e-rilascia (drag & drop nativo HTML5, senza dipendenze):
// l'intera card è la maniglia. Il drag HTML5 non scatta su touch, quindi ci
// sono anche i pulsanti ▲/▼ (onSu/onGiu) come alternativa per tocco e tastiera.
const DRAG_AND_DROP_SUPPORTATO = typeof document !== 'undefined' && 'draggable' in document.createElement('div')

// tempo di pressione per rimuovere un giocatore: un tap secco è facile da
// far scattare per sbaglio in un tavolo affollato, quindi bisogna tenere
// premuto finché il pulsante non si riempie tutto di rosso (funziona sia a
// puntatore/tocco che da tastiera, tenendo premuto Invio/Spazio)
const DURATA_PRESSIONE_MS = 350

export function PlayerCard({ giocatore, onRemove, onDragStart, onDragOver, onDrop, onSu, onGiu }) {
  const [eliminando, setEliminando] = useState(false)
  // riempimento completato: la card si restringe e sfuma (CSS) prima di
  // sparire davvero, invece di scomparire di scatto nello stesso istante
  const [uscendo, setUscendo] = useState(false)

  function iniziaEliminazione(e) {
    if (e.type === 'keydown' && (e.repeat || !['Enter', ' '].includes(e.key))) return
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
      setUscendo(true)
    }
  }

  // la card ha una sola animazione (player-card-exit, vedi CSS): se questo
  // scatta è perché è quella, non serve controllarne il nome
  function completaRimozioneSeUscita() {
    if (uscendo) {
      onRemove(giocatore.id)
    }
  }

  return (
    <article
      className={`player-card${uscendo ? ' player-card--uscendo' : ''}`}
      draggable={DRAG_AND_DROP_SUPPORTATO && !uscendo}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onAnimationEnd={completaRimozioneSeUscita}
    >
      <header className="player-card__header">
        <h3>{giocatore.nome}</h3>
        {(onSu || onGiu) && (
          <div className="player-card__sposta">
            <button type="button" aria-label={`Sposta ${giocatore.nome} su`} disabled={!onSu} onClick={onSu}>
              ▲
            </button>
            <button type="button" aria-label={`Sposta ${giocatore.nome} giù`} disabled={!onGiu} onClick={onGiu}>
              ▼
            </button>
          </div>
        )}
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
          onBlur={annullaEliminazione}
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
