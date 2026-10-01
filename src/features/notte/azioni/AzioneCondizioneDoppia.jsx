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
}) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const vivi = giocatori.filter((g) => g.vivo && (!escludiAttore || g.id !== attore?.id))
  // chi aveva già la condizione PRIMA di questo passo (es. il Pifferaio:
  // ipnotizzato è cumulativo tra notti, mai ripulito) non va mai toccato da
  // un ripensamento di QUESTA notte: solo la coppia scelta ora resta
  // sostituibile finché non si preme Avanti
  const [condizionatiAllIngresso] = useState(() => new Set(vivi.filter((g) => g.condizioni.includes(condizione)).map((g) => g.id)))
  const [coppiaSessione, setCoppiaSessione] = useState(null)

  // toglie la condizione a chi era nella coppia di QUESTA sessione (mai a chi
  // la aveva già da prima): la coppia viene sciolta dalla deselezione
  function annullaScelta() {
    ;(coppiaSessione ?? [])
      .filter((id) => !condizionatiAllIngresso.has(id))
      .forEach((id) => {
        const g = giocatori.find((x) => x.id === id)
        if (g) aggiornaGiocatore(id, { condizioni: g.condizioni.filter((c) => c !== condizione) })
      })
    setCoppiaSessione(null)
  }

  function confermaScelta(idA, idB) {
    const coppia = [idA, idB]
    // toglie la condizione a chi era stato scelto in una coppia precedente
    // di QUESTA sessione (non a chi la aveva già da prima) e non fa più
    // parte della nuova coppia
    ;(coppiaSessione ?? [])
      .filter((id) => !coppia.includes(id) && !condizionatiAllIngresso.has(id))
      .forEach((id) => {
        const g = giocatori.find((x) => x.id === id)
        if (g) aggiornaGiocatore(id, { condizioni: g.condizioni.filter((c) => c !== condizione) })
      })
    setCoppiaSessione(coppia)
    for (const id of coppia) {
      const target = giocatori.find((g) => g.id === id)
      if (target && !target.condizioni.includes(condizione)) {
        aggiornaGiocatore(id, { condizioni: [...target.condizioni, condizione] })
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, [ruoloSlugAttore], ruoloSlugAttore)
  }

  return <SceltaDoppiaGiocatore candidati={vivi} onConferma={confermaScelta} onAnnulla={annullaScelta} onSalta={() => {}} etichetta={etichetta} />
}
