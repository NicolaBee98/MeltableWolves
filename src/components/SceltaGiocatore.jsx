import { useState } from 'react'

export function SceltaGiocatore({ candidati, onConferma, onSalta, etichetta }) {
  const [selezionato, setSelezionato] = useState(candidati[0]?.id ?? '')

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

  const selezionatoValido = candidati.some((g) => g.id === selezionato) ? selezionato : candidati[0].id

  return (
    <div className="scelta-giocatore">
      <p>{etichetta}</p>
      <div className="scelta-giocatore__chips" role="group" aria-label={etichetta}>
        {candidati.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={g.id === selezionatoValido}
            onClick={() => setSelezionato(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => onConferma(selezionatoValido)}>
        Conferma
      </button>
      <button type="button" onClick={onSalta}>
        Salta
      </button>
    </div>
  )
}
