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

  function confermaScelta(idA, idB) {
    const coppia = [idA, idB]
    // toglie la condizione a chi l'aveva presa in una coppia precedente di
    // questa stessa notte e non fa più parte della nuova coppia
    giocatori
      .filter((g) => g.condizioni.includes(condizione) && !coppia.includes(g.id))
      .forEach((g) => aggiornaGiocatore(g.id, { condizioni: g.condizioni.filter((c) => c !== condizione) }))
    for (const id of coppia) {
      const target = giocatori.find((g) => g.id === id)
      if (target && !target.condizioni.includes(condizione)) {
        aggiornaGiocatore(id, { condizioni: [...target.condizioni, condizione] })
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, [ruoloSlugAttore], ruoloSlugAttore)
  }

  const selezionatiIniziali = vivi.filter((g) => g.condizioni.includes(condizione)).map((g) => g.id)

  return (
    <SceltaDoppiaGiocatore
      candidati={vivi}
      onConferma={confermaScelta}
      onSalta={() => {}}
      etichetta={etichetta}
      selezionatiIniziali={selezionatiIniziali}
    />
  )
}
