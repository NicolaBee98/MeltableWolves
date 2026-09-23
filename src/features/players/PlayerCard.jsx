// il riordino trascina-e-rilascia usa il drag & drop nativo HTML5, senza
// dipendenze: la maniglia è l'unico elemento draggable, così un trascinamento
// accidentale partito dal nome o dal pulsante di rimozione non riordina nulla
export function PlayerCard({ giocatore, onRemove, onDragStart, onDragOver, onDrop }) {
  return (
    <article className="player-card" onDragOver={onDragOver} onDrop={onDrop}>
      <header className="player-card__header">
        <span
          className="player-card__maniglia"
          draggable="true"
          onDragStart={onDragStart}
          role="button"
          aria-label={`Trascina per riordinare ${giocatore.nome}`}
        >
          ⠿
        </span>
        <h3>{giocatore.nome}</h3>
        <button type="button" onClick={() => onRemove(giocatore.id)} aria-label={`Rimuovi ${giocatore.nome}`}>
          ✕
        </button>
      </header>
    </article>
  )
}
