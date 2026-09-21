import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { uccidiPatch, usatoStanotte, segnaUsoStanotte } from '../../../data/effettiNotte'

const POTERE = 'branco-lupi-sbrana'

export function AzioneBrancoLupi({ giocatori, aggiornaGiocatore, round, ruoli = [] }) {
  const vivi = giocatori.filter((g) => g.vivo)

  if (usatoStanotte(giocatori, ruoli, POTERE)) {
    return <p>Il branco ha già sbranato una vittima questa notte.</p>
  }

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (target) {
      const patch = uccidiPatch(target, round)
      if (patch) {
        aggiornaGiocatore(targetId, patch)
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, POTERE)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, POTERE)
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={salta} etichetta="Il branco sbrana" />
}
