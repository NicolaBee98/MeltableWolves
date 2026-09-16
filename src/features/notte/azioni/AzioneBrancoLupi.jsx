import { SceltaGiocatore } from './SceltaGiocatore'
import { uccidiPatch } from '../../../data/effettiNotte'

export function AzioneBrancoLupi({ giocatori, aggiornaGiocatore }) {
  const vivi = giocatori.filter((g) => g.vivo)

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const patch = uccidiPatch(target)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta="Il branco sbrana" />
}
