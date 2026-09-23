import { fazioneDi } from '../../../data/roles'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { uccidiPatch, usatoStanotte, segnaUsoStanotte, RUOLI_IMMUNI_AL_CHUPACABRA } from '../../../data/effettiNotte'

const RUOLI = ['chupacabra']
const POTERE = 'chupacabra-caccia'

export function AzioneChupacabra({ giocatori, aggiornaGiocatore, round }) {
  const vivi = giocatori.filter((g) => g.vivo && !RUOLI_IMMUNI_AL_CHUPACABRA.includes(g.ruoloSlug))
  const nessunLupoVivo = !vivi.some((g) => fazioneDi(g) === 'lupi')

  if (usatoStanotte(giocatori, RUOLI, POTERE)) {
    return <p>Potere già utilizzato questa notte.</p>
  }

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (target) {
      const puoUccidere = fazioneDi(target) === 'lupi' || nessunLupoVivo
      if (puoUccidere) {
        const patch = uccidiPatch(target, round, { mortoDa: 'chupacabra' })
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

  return (
    <SceltaGiocatore
      candidati={vivi}
      onConferma={confermaScelta}
      onSalta={salta}
      etichetta="Il Chupacabra caccia"
      mostraSalta={false}
    />
  )
}
