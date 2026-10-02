import { useState } from 'react'
import { SceltaDoppiaGiocatore } from './SceltaDoppiaGiocatore'
import { segnaUsoStanotte } from '../../../data/effettiNotte'

// la coppia scelta resta modificabile finché non si preme "Avanti" (stesso
// principio di AzioneCondizioneSingola): niente più gate che nasconde le
// chip subito dopo la prima coppia confermata.
export function AzioneCondizioneDoppia({
  giocatori,
  aggiornaGiocatore,
  condizione,
  etichetta,
  ruoloSlugAttore,
  escludiAttore = false,
  attoreId,
}) {
  // `attoreId` (solo Sacerdote, scelta della prima notte): quale titolare agisce,
  // titolare e Mimo scelgono ognuno la propria coppia. Senza (Pifferaio, ogni
  // notte) la scelta è unica e condivisa tra tutti i titolari.
  const attore = attoreId ? giocatori.find((g) => g.id === attoreId) : giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const altriAttori = !attoreId ? [] : giocatori.filter((g) => g.ruoloSlug === ruoloSlugAttore && g.id !== attore?.id)
  const vivi = giocatori.filter((g) => g.vivo && (!escludiAttore || g.id !== attore?.id))
  // chi aveva già la condizione PRIMA di questo passo (es. il Pifferaio:
  // ipnotizzato è cumulativo tra notti, mai ripulito) non va mai toccato da
  // un ripensamento di QUESTA notte: solo la coppia scelta ora resta
  // sostituibile finché non si preme Avanti
  const [condizionatiAllIngresso] = useState(() => new Set(vivi.filter((g) => g.condizioni.includes(condizione)).map((g) => g.id)))
  const [coppiaSessione, setCoppiaSessione] = useState(null)

  // Innamorati: ogni coppia è indipendente (due Sacerdoti = due coppie), quindi
  // ognuno ricorda i propri partner in `innamoratiCon` (vedi applicaCrepacuore).
  // Ritorna {id: partner[]} dopo aver sciolto `vecchia` e unito `nuova`; una
  // coppia identica scelta anche da un altro titolare non si scioglie.
  function ricalcolaLegami(vecchia, nuova) {
    const m = new Map()
    const di = (id) => {
      if (!m.has(id)) m.set(id, [...(giocatori.find((x) => x.id === id)?.innamoratiCon ?? [])])
      return m.get(id)
    }
    const dellAltro = (a, b) =>
      altriAttori.some((t) => {
        const c = t.sceltaNotte?.[condizione] ?? []
        return c.includes(a) && c.includes(b)
      })
    if (vecchia && !dellAltro(vecchia[0], vecchia[1])) {
      m.set(vecchia[0], di(vecchia[0]).filter((x) => x !== vecchia[1]))
      m.set(vecchia[1], di(vecchia[1]).filter((x) => x !== vecchia[0]))
    }
    if (nuova) {
      if (!di(nuova[0]).includes(nuova[1])) di(nuova[0]).push(nuova[1])
      if (!di(nuova[1]).includes(nuova[0])) di(nuova[1]).push(nuova[0])
    }
    return m
  }

  function scriviLegami(m) {
    m.forEach((innamoratiCon, id) => aggiornaGiocatore(id, { innamoratiCon }))
  }

  // toglie la condizione a chi era nella coppia di QUESTA sessione (mai a chi
  // la aveva già da prima, né a chi ha ancora un'altra coppia)
  function togliA(ids, legami = new Map()) {
    ids
      .filter(
        (id) =>
          !condizionatiAllIngresso.has(id) &&
          !altriAttori.some((a) => (a.sceltaNotte?.[condizione] ?? []).includes(id)) &&
          !(legami.get(id)?.length),
      )
      .forEach((id) => {
        const g = giocatori.find((x) => x.id === id)
        if (g) aggiornaGiocatore(id, { condizioni: g.condizioni.filter((c) => c !== condizione) })
      })
  }

  // la coppia viene sciolta dalla deselezione
  function annullaScelta() {
    const legami = condizione === 'innamorato' && coppiaSessione ? ricalcolaLegami(coppiaSessione, null) : new Map()
    togliA(coppiaSessione ?? [], legami)
    scriviLegami(legami)
    setCoppiaSessione(null)
    if (attoreId && attore) aggiornaGiocatore(attore.id, { sceltaNotte: { ...attore.sceltaNotte, [condizione]: undefined } })
  }

  function confermaScelta(idA, idB) {
    const coppia = [idA, idB]
    // toglie la condizione a chi era stato scelto in una coppia precedente
    // di QUESTA sessione (non a chi la aveva già da prima) e non fa più
    // parte della nuova coppia
    const legami = condizione === 'innamorato' ? ricalcolaLegami(coppiaSessione, coppia) : new Map()
    togliA((coppiaSessione ?? []).filter((id) => !coppia.includes(id)), legami)
    scriviLegami(legami)
    setCoppiaSessione(coppia)
    for (const id of coppia) {
      const target = giocatori.find((g) => g.id === id)
      if (target && !target.condizioni.includes(condizione)) {
        aggiornaGiocatore(id, { condizioni: [...target.condizioni, condizione] })
      }
    }
    if (!attoreId) {
      segnaUsoStanotte(giocatori, aggiornaGiocatore, [ruoloSlugAttore], ruoloSlugAttore)
    } else if (attore) {
      aggiornaGiocatore(attore.id, { usiNotte: [...(attore.usiNotte ?? []), ruoloSlugAttore] })
      aggiornaGiocatore(attore.id, { sceltaNotte: { ...attore.sceltaNotte, [condizione]: coppia } })
    }
  }

  return <SceltaDoppiaGiocatore candidati={vivi} onConferma={confermaScelta} onAnnulla={annullaScelta} onSalta={() => {}} etichetta={etichetta} />
}
