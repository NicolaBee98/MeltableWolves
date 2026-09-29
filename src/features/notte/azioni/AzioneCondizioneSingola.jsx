import { segnaUsoStanotte } from '../../../data/effettiNotte'

// la chip scelta resta sempre modificabile finché non si preme "Avanti"
// (principio generale, vedi NightSequencer/azionePatches): niente più
// "Potere già utilizzato questa notte" che nasconde le chip subito dopo il
// primo click, il narratore può ripensarci fino a quando non avanza.
export function AzioneCondizioneSingola({
  giocatori,
  aggiornaGiocatore,
  condizione,
  etichetta,
  ruoloSlugAttore,
  escludiAttore = false,
}) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const vivi = giocatori.filter((g) => g.vivo && (!escludiAttore || g.id !== attore?.id))
  // chi ha già questa condizione (assegnata da questa stessa azione stanotte,
  // vedi pulizia a fine notte in NightSequencer) è il bersaglio scelto finora
  const scelto = vivi.find((g) => g.condizioni.includes(condizione))

  function confermaScelta(targetId) {
    // sposta la condizione: la toglie a chiunque altro la avesse presa in
    // un click precedente di questa stessa notte, e la aggiunge al nuovo
    // bersaglio, cosi la scelta resta sempre un singolo bersaglio alla volta
    giocatori
      .filter((g) => g.condizioni.includes(condizione) && g.id !== targetId)
      .forEach((g) => aggiornaGiocatore(g.id, { condizioni: g.condizioni.filter((c) => c !== condizione) }))
    const target = giocatori.find((g) => g.id === targetId)
    if (target && !target.condizioni.includes(condizione)) {
      aggiornaGiocatore(targetId, { condizioni: [...target.condizioni, condizione] })
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, [ruoloSlugAttore], ruoloSlugAttore)
  }

  if (vivi.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="scelta-giocatore">
      <p>{etichetta}</p>
      <div className="scelta-giocatore__chips" role="group" aria-label={etichetta}>
        {vivi.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={g.id === scelto?.id}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
    </div>
  )
}
