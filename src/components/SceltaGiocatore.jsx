export function SceltaGiocatore({ candidati, onConferma, onSalta, etichetta, mostraSalta = true, etichettaSalta = 'Salta' }) {
  if (candidati.length === 0) {
    return (
      <div className="scelta-giocatore">
        <p>Nessun bersaglio disponibile.</p>
        <button type="button" onClick={onSalta}>
          Chiudi
        </button>
      </div>
    )
  }

  return (
    <div className="scelta-giocatore">
      <p>{etichetta}</p>
      <div className="scelta-giocatore__chips" role="group" aria-label={etichetta}>
        {candidati.map((g) => (
          <button key={g.id} type="button" className="chip" onClick={() => onConferma(g.id)}>
            {g.nome}
          </button>
        ))}
      </div>
      {mostraSalta && (
        <button type="button" onClick={onSalta}>
          {etichettaSalta}
        </button>
      )}
    </div>
  )
}
