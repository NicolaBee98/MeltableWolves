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

  // toglie la condizione a chi era nella coppia di QUESTA sessione (mai a chi
  // la aveva già da prima, né a chi l'ha scelto anche un altro titolare)
  function togliA(ids) {
    ids
      .filter((id) => !condizionatiAllIngresso.has(id) && !altriAttori.some((a) => (a.sceltaNotte?.[condizione] ?? []).includes(id)))
      .forEach((id) => {
        const g = giocatori.find((x) => x.id === id)
        if (g) aggiornaGiocatore(id, { condizioni: g.condizioni.filter((c) => c !== condizione) })
      })
  }

  // la coppia viene sciolta dalla deselezione
  function annullaScelta() {
    togliA(coppiaSessione ?? [])
    setCoppiaSessione(null)
    if (attoreId && attore) aggiornaGiocatore(attore.id, { sceltaNotte: { ...attore.sceltaNotte, [condizione]: undefined } })
  }

  function confermaScelta(idA, idB) {
    const coppia = [idA, idB]
    // toglie la condizione a chi era stato scelto in una coppia precedente
    // di QUESTA sessione (non a chi la aveva già da prima) e non fa più
    // parte della nuova coppia
    togliA((coppiaSessione ?? []).filter((id) => !coppia.includes(id)))
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
