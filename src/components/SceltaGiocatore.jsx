import { useState } from 'react'

// `richiedeConferma`: per le scelte più consequenziali (es. dichiarare chi è
// morto per l'unzione) la chip non applica subito la scelta al click, ma la
// marca soltanto (aria-pressed) — serve poi un esplicito "Conferma"
// (disabilitato finché non si seleziona qualcuno). Le altre scelte restano
// invece a singolo click, invariate (default false).
export function SceltaGiocatore({
  candidati,
  onConferma,
  onSalta,
  etichetta,
  mostraSalta = true,
  etichettaSalta = 'Salta',
  richiedeConferma = false,
  // scelta già applicata dal chiamante: la chip risulta premuta (cliccarla
  // di nuovo spetta a onConferma, che la annulla)
  selezionatoEsternoId,
  // nodo mostrato sotto le chip per la chip selezionata (solo richiedeConferma),
  // es. promemoria delle conseguenze prima di confermare
  dettaglioSelezione,
}) {
  const [selezionatoId, setSelezionatoId] = useState(null)

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
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={richiedeConferma ? selezionatoId === g.id : selezionatoEsternoId !== undefined ? selezionatoEsternoId === g.id : undefined}
            onClick={() => (richiedeConferma ? setSelezionatoId(g.id) : onConferma(g.id))}
          >
            {g.nome}
          </button>
        ))}
      </div>
      {richiedeConferma && selezionatoId && dettaglioSelezione?.(selezionatoId)}
      {richiedeConferma && (
        <button type="button" disabled={!selezionatoId} onClick={() => onConferma(selezionatoId)}>
          Conferma
        </button>
      )}
      {mostraSalta && (
        <button type="button" onClick={onSalta}>
          {etichettaSalta}
        </button>
      )}
    </div>
  )
}
