export function PlayerCard({ giocatore, onRemove }) {
  return (
    <article className="player-card">
      <header className="player-card__header">
        <h3>{giocatore.nome}</h3>
        <button type="button" onClick={() => onRemove(giocatore.id)} aria-label={`Rimuovi ${giocatore.nome}`}>
          ✕
        </button>
      </header>
    </article>
  )
}
