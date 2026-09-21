import { ROLES } from '../../../data/roles'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { uccidiPatch, usatoStanotte, segnaUsoStanotte } from '../../../data/effettiNotte'

const RUOLI = ['chupacabra']
const POTERE = 'chupacabra-caccia'

function fazioneDi(giocatore) {
  return ROLES.find((r) => r.slug === giocatore.ruoloSlug)?.fazione
}

export function AzioneChupacabra({ giocatori, aggiornaGiocatore, round }) {
  const vivi = giocatori.filter((g) => g.vivo)
  const nessunLupoVivo = !vivi.some((g) => fazioneDi(g) === 'lupi')

  if (usatoStanotte(giocatori, RUOLI, POTERE)) {
    return <p>Potere già utilizzato questa notte.</p>
  }

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (target) {
      const puoUccidere = fazioneDi(target) === 'lupi' || nessunLupoVivo
      if (puoUccidere) {
        const patch = uccidiPatch(target, round)
        if (patch) {
          aggiornaGiocatore(targetId, patch)
        }
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={salta} etichetta="Il Chupacabra caccia" />
}
