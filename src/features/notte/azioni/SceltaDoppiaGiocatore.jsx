import { useState } from 'react'

// avvisoIncompleta (opzionale): messaggio non bloccante finché i giocatori scelti sono meno di 2
// massimo (default 2): quanti giocatori si scelgono; il Pifferaio con un solo
// non ipnotizzato rimasto ne sceglie uno (onConferma riceve un solo id)
// onAnnulla (opzionale): chiamato quando si toglie un giocatore da una coppia
// già confermata, così chi la usa può disfare ciò che onConferma aveva applicato
export function SceltaDoppiaGiocatore({ candidati, onConferma, onAnnulla, onSalta, etichetta, selezionatiIniziali = [], avvisoIncompleta, massimo = 2 }) {
  const [selezionati, setSelezionati] = useState(selezionatiIniziali)
  const [avviso, setAvviso] = useState(null)

  function toggleSelezione(id) {
    setAvviso(null)
    if (selezionati.includes(id)) {
      if (selezionati.length === massimo) onAnnulla?.()
      setSelezionati(selezionati.filter((s) => s !== id))
      return
    }
    if (selezionati.length >= massimo) {
      setAvviso(`Puoi scegliere al massimo ${massimo} ${massimo === 1 ? 'giocatore' : 'giocatori'}: deseleziona qualcuno per cambiare la scelta.`)
      return
    }
    const nuovi = [...selezionati, id]
    setSelezionati(nuovi)
    if (nuovi.length === massimo) onConferma(nuovi[0], nuovi[1])
  }

  if (candidati.length < massimo) {
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
      {avviso && <p className="avviso">⚠️ {avviso}</p>}
      {/* non bloccante: il narratore può voler procedere con la coppia incompleta */}
      {avvisoIncompleta && selezionati.length < massimo && <p className="avviso">⚠️ {avvisoIncompleta}</p>}
    </div>
  )
}
