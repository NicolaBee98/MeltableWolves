import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { usatoStanotte, segnaUsoStanotte } from '../../../data/effettiNotte'

const RUOLI = ['cortigiana']
const POTERE = 'cortigiana-visita'

export function AzioneCortigiana({ giocatori, aggiornaGiocatore }) {
  const cortigiana = giocatori.find((g) => g.ruoloSlug === 'cortigiana')
  const candidati = giocatori.filter((g) => g.vivo && g.id !== cortigiana?.id)

  if (usatoStanotte(giocatori, RUOLI, POTERE)) {
    return <p>Potere già utilizzato questa notte.</p>
  }

  function confermaScelta(targetId) {
    if (cortigiana) {
      aggiornaGiocatore(cortigiana.id, { visitaNotturna: targetId })
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  return (
    <SceltaGiocatore candidati={candidati} onConferma={confermaScelta} onSalta={salta} etichetta="Chi visita la Cortigiana" />
  )
}
