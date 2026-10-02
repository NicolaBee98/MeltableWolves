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
  attoreId,
}) {
  // `attoreId`: quale dei titolari agisce (titolare e Mimo che lo copia hanno
  // lo stesso ruoloSlug ma scelte indipendenti, vedi NightSequencer)
  const attore = attoreId ? giocatori.find((g) => g.id === attoreId) : giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const altriAttori = giocatori.filter((g) => g.ruoloSlug === ruoloSlugAttore && g.id !== attore?.id)
  const vivi = giocatori.filter((g) => g.vivo && (!escludiAttore || g.id !== attore?.id))
  // con più titolari ognuno ricorda la SUA scelta (sceltaNotte, ripulita a
  // fine notte): la condizione resta al bersaglio finché la vuole almeno uno
  const mia = attore?.sceltaNotte?.[condizione]
  const preso = (id) => altriAttori.some((a) => a.sceltaNotte?.[condizione] === id)
  // chi ha già questa condizione (assegnata da questa stessa azione stanotte,
  // vedi pulizia a fine notte in NightSequencer) è il bersaglio scelto finora
  const scelto = altriAttori.length > 0 ? vivi.find((g) => g.id === mia) : vivi.find((g) => g.condizioni.includes(condizione))

  function togli(id) {
    const g = giocatori.find((x) => x.id === id)
    if (g && !preso(id)) aggiornaGiocatore(id, { condizioni: g.condizioni.filter((c) => c !== condizione) })
  }

  function registra(bersaglio) {
    if (!attore) return
    aggiornaGiocatore(attore.id, {
      usiNotte: bersaglio ? [...(attore.usiNotte ?? []), ruoloSlugAttore] : (attore.usiNotte ?? []).filter((p) => p !== ruoloSlugAttore),
    })
    aggiornaGiocatore(attore.id, { sceltaNotte: { ...attore.sceltaNotte, [condizione]: bersaglio } })
  }

  function confermaScelta(targetId) {
    // click sulla chip già scelta: toglie la condizione e il potere torna non usato
    if (targetId === scelto?.id) {
      togli(targetId)
      registra(undefined)
      return
    }
    // sposta la condizione: la toglie a chiunque altro la avesse presa in
    // un click precedente di questa stessa notte, e la aggiunge al nuovo
    // bersaglio, cosi la scelta resta sempre un singolo bersaglio alla volta
    if (altriAttori.length > 0) {
      if (scelto) togli(scelto.id)
    } else {
      giocatori
        .filter((g) => g.condizioni.includes(condizione) && g.id !== targetId)
        .forEach((g) => aggiornaGiocatore(g.id, { condizioni: g.condizioni.filter((c) => c !== condizione) }))
    }
    const target = giocatori.find((g) => g.id === targetId)
    if (target && !target.condizioni.includes(condizione)) {
      aggiornaGiocatore(targetId, { condizioni: [...target.condizioni, condizione] })
    }
    registra(targetId)
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
