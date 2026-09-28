// riordino trascina-e-rilascia (drag & drop nativo HTML5, senza dipendenze):
// l'intera card è la maniglia, niente handle/frecce separate da mostrare.
// Su browser/dispositivi senza supporto (es. touch, che non genera
// dragstart) la card semplicemente non è trascinabile: nessun fallback,
// il narratore può comunque rimuovere e riaggiungere per riordinare.
const DRAG_AND_DROP_SUPPORTATO = typeof document !== 'undefined' && 'draggable' in document.createElement('div')

export function PlayerCard({ giocatore, onRemove, onDragStart, onDragOver, onDrop }) {
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
        <button type="button" onClick={() => onRemove(giocatore.id)} aria-label={`Rimuovi ${giocatore.nome}`}>
          ✕
        </button>
      </header>
    </article>
  )
}
