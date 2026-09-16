import { SceltaGiocatore } from './SceltaGiocatore'
import { aggiungiCondizionePatch } from '../../../data/effettiNotte'

export function AzioneCondizioneSingola({ giocatori, aggiornaGiocatore, condizione, etichetta }) {
  const vivi = giocatori.filter((g) => g.vivo)

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const patch = aggiungiCondizionePatch(target, condizione)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta={etichetta} />
}
