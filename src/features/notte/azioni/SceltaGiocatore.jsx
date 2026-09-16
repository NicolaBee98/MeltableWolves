import { useState } from 'react'

export function SceltaGiocatore({ candidati, onConferma, onSalta, etichetta }) {
  const [selezionato, setSelezionato] = useState(candidati[0]?.id ?? '')

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="scelta-giocatore">
      <label>
        {etichetta}
        <select value={selezionato} onChange={(event) => setSelezionato(event.target.value)}>
          {candidati.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => onConferma(selezionato)}>
        Conferma
      </button>
      <button type="button" onClick={onSalta}>
        Salta
      </button>
    </div>
  )
}
