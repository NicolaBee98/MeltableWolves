// la chip scelta resta sempre modificabile finché non si preme "Avanti"
// (principio generale): il legame è permanente per tutta la partita una
// volta stabilito (pag. 9-10), ma finché siamo nel passo di questa notte il
// narratore può ancora ripensarci, come per ogni altra azione — niente più
// testo statico "Legame già stabilito" che nasconde le chip.
export function AzioneLegame({ giocatori, aggiornaGiocatore, ruoloSlugAttore, tipoLegame, etichetta }) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => g.vivo && g.id !== attore?.id)
  // solo se il legame è di QUESTO tipo: chi interpreta l'attore può essere
  // cambiato prima di Avanti (vedi rimuoviAssegnazione in NightSequencer),
  // ma se il giocatore appena tolto da questo ruolo aveva già un legame di
  // un ruolo precedente (es. un altro Apprendista con un altro maestro), non
  // va scambiato per il legame di questo attore
  const bersaglioAttuale = attore?.legame?.tipo === tipoLegame ? attore.legame.targetId : undefined

  function confermaScelta(targetId) {
    if (!attore) return
    aggiornaGiocatore(attore.id, { legame: { tipo: tipoLegame, targetId } })
  }

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
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
            aria-pressed={bersaglioAttuale === g.id}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
    </div>
  )
}
