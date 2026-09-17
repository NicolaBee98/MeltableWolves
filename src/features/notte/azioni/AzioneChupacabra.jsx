import { ROLES } from '../../../data/roles'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { uccidiPatch } from '../../../data/effettiNotte'

function fazioneDi(giocatore) {
  return ROLES.find((r) => r.slug === giocatore.ruoloSlug)?.fazione
}

export function AzioneChupacabra({ giocatori, aggiornaGiocatore, round }) {
  const vivi = giocatori.filter((g) => g.vivo)
  const nessunLupoVivo = !vivi.some((g) => fazioneDi(g) === 'lupi')

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return
    const puoUccidere = fazioneDi(target) === 'lupi' || nessunLupoVivo
    if (!puoUccidere) return
    const patch = uccidiPatch(target, round)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
  }

  return <SceltaGiocatore candidati={vivi} onConferma={confermaScelta} onSalta={() => {}} etichetta="Il Chupacabra caccia" />
}
