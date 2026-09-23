// il riordino trascina-e-rilascia (drag & drop nativo HTML5, senza
// dipendenze) resta come scorciatoia comoda su desktop/mouse, ma non è
// affidabile su touch (Safari iOS non genera affatto dragstart da tocco) né
// operabile da tastiera: i pulsanti ▲/▼ sono il modo che funziona sempre,
// su qualunque dispositivo il narratore stia usando al tavolo.
export function PlayerCard({ giocatore, onRemove, onSposta, primoDellaLista, ultimoDellaLista, onDragStart, onDragOver, onDrop }) {
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
        <div className="player-card__sposta">
          <button
            type="button"
            onClick={() => onSposta(giocatore.id, -1)}
            disabled={primoDellaLista}
            aria-label={`Sposta ${giocatore.nome} su`}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onSposta(giocatore.id, 1)}
            disabled={ultimoDellaLista}
            aria-label={`Sposta ${giocatore.nome} giù`}
          >
            ▼
          </button>
        </div>
        <h3>{giocatore.nome}</h3>
        <button type="button" onClick={() => onRemove(giocatore.id)} aria-label={`Rimuovi ${giocatore.nome}`}>
          ✕
        </button>
      </header>
    </article>
  )
}
