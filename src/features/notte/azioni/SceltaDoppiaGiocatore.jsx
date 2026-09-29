import { useState } from 'react'

export function SceltaDoppiaGiocatore({ candidati, onConferma, onSalta, etichetta, selezionatiIniziali = [] }) {
  const [selezionati, setSelezionati] = useState(selezionatiIniziali)

  function toggleSelezione(id) {
    if (selezionati.includes(id)) {
      setSelezionati(selezionati.filter((s) => s !== id))
      return
    }
    if (selezionati.length >= 2) return
    const nuovi = [...selezionati, id]
    setSelezionati(nuovi)
    if (nuovi.length === 2) onConferma(nuovi[0], nuovi[1])
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
    </div>
  )
}
