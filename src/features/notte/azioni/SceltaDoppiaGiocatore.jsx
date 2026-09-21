import { useState } from 'react'

export function SceltaDoppiaGiocatore({ candidati, onConferma, onSalta, etichetta }) {
  const [selezionati, setSelezionati] = useState([])

  function toggleSelezione(id) {
    setSelezionati((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  if (candidati.length < 2) {
    return (
      <div className="scelta-giocatore">
        <p>Servono almeno due bersagli disponibili.</p>
        <button type="button" onClick={onSalta}>
          Chiudi
        </button>
      </div>
    )
  }

  return (
    <div className="scelta-doppia-giocatore">
      <p>{etichetta}</p>
      <div className="scelta-giocatore__chips" role="group" aria-label={etichetta}>
        {candidati.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={selezionati.includes(g.id)}
            onClick={() => toggleSelezione(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
      <button type="button" disabled={selezionati.length !== 2} onClick={() => onConferma(selezionati[0], selezionati[1])}>
        Conferma
      </button>
      <button type="button" onClick={onSalta}>
        Salta
      </button>
    </div>
  )
}
