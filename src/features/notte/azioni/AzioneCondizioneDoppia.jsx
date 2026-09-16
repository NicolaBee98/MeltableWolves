import { SceltaDoppiaGiocatore } from './SceltaDoppiaGiocatore'
import { aggiungiCondizionePatch } from '../../../data/effettiNotte'

export function AzioneCondizioneDoppia({ giocatori, aggiornaGiocatore, condizione, etichetta }) {
  const vivi = giocatori.filter((g) => g.vivo)

  function confermaScelta(idA, idB) {
    for (const id of [idA, idB]) {
      const target = giocatori.find((g) => g.id === id)
      if (!target) continue
      const patch = aggiungiCondizionePatch(target, condizione)
      if (patch) {
        aggiornaGiocatore(id, patch)
      }
    }
  }

  return <SceltaDoppiaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta={etichetta} />
}
