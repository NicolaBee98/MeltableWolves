const FAZIONE_LABEL = {
  villaggio: '👤 Villaggio',
  lupi: '🐺 Lupi',
  indipendente: '⭐ Indipendente',
  sconosciuto: '❓ Sconosciuto',
}

export function PlayerCard({ giocatore, ruolo, condizioniDisponibili, onToggleVivo, onChangeCondizioni, onChangeNote }) {
  function toggleCondizione(slug) {
    const next = giocatore.condizioni.includes(slug)
      ? giocatore.condizioni.filter((c) => c !== slug)
      : [...giocatore.condizioni, slug]
    onChangeCondizioni(giocatore.id, next)
  }

  return (
    <article className={`player-card${giocatore.vivo ? '' : ' player-card--morto'}`}>
      <header className="player-card__header">
        <h3>{giocatore.nome}</h3>
        <button type="button" onClick={() => onToggleVivo(giocatore.id)}>
          {giocatore.vivo ? 'Vivo' : 'Morto'}
        </button>
      </header>
      <p className="player-card__ruolo">
        {ruolo?.nome ?? 'Ruolo sconosciuto'}
        {ruolo && <span className="player-card__fazione"> — {FAZIONE_LABEL[ruolo.fazione]}</span>}
      </p>
      <div className="player-card__condizioni">
        {condizioniDisponibili.map((condizione) => (
          <button
            key={condizione.slug}
            type="button"
            aria-pressed={giocatore.condizioni.includes(condizione.slug)}
            onClick={() => toggleCondizione(condizione.slug)}
          >
            {condizione.nome}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Note..."
        value={giocatore.note}
        onChange={(event) => onChangeNote(giocatore.id, event.target.value)}
      />
    </article>
  )
}
