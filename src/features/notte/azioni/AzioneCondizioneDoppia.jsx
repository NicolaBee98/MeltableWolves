import { SceltaDoppiaGiocatore } from './SceltaDoppiaGiocatore'
import { aggiungiCondizionePatch, usatoStanotte, segnaUsoStanotte } from '../../../data/effettiNotte'

export function AzioneCondizioneDoppia({ giocatori, aggiornaGiocatore, condizione, etichetta, ruoloSlugAttore }) {
  const vivi = giocatori.filter((g) => g.vivo)
  const ruoli = [ruoloSlugAttore]

  if (usatoStanotte(giocatori, ruoli, ruoloSlugAttore)) {
    return <p>Potere già utilizzato questa notte.</p>
  }

  function confermaScelta(idA, idB) {
    for (const id of [idA, idB]) {
      const target = giocatori.find((g) => g.id === id)
      if (!target) continue
      const patch = aggiungiCondizionePatch(target, condizione)
      if (patch) {
        aggiornaGiocatore(id, patch)
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, ruoloSlugAttore)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, ruoloSlugAttore)
  }

  return <SceltaDoppiaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={salta} etichetta={etichetta} />
}
