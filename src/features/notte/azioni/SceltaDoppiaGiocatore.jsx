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
    return <p>Servono almeno due bersagli disponibili.</p>
  }

  return (
    <div className="scelta-doppia-giocatore">
      <p>{etichetta}</p>
      <ul>
        {candidati.map((g) => (
          <li key={g.id}>
            <label>
              <input type="checkbox" checked={selezionati.includes(g.id)} onChange={() => toggleSelezione(g.id)} />
              {g.nome}
            </label>
          </li>
        ))}
      </ul>
      <button type="button" disabled={selezionati.length !== 2} onClick={() => onConferma(selezionati[0], selezionati[1])}>
        Conferma
      </button>
      <button type="button" onClick={onSalta}>
        Salta
      </button>
    </div>
  )
}
