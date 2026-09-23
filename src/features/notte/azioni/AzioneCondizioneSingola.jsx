import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { aggiungiCondizionePatch, usatoStanotte, segnaUsoStanotte } from '../../../data/effettiNotte'

export function AzioneCondizioneSingola({
  giocatori,
  aggiornaGiocatore,
  condizione,
  etichetta,
  ruoloSlugAttore,
  escludiAttore = false,
}) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const vivi = giocatori.filter((g) => g.vivo && (!escludiAttore || g.id !== attore?.id))
  const ruoli = [ruoloSlugAttore]

  if (usatoStanotte(giocatori, ruoli, ruoloSlugAttore)) {
    return <p>Potere già utilizzato questa notte.</p>
  }

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (target) {
      const patch = aggiungiCondizionePatch(target, condizione)
      if (patch) {
        aggiornaGiocatore(targetId, patch)
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, ruoloSlugAttore)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, ruoloSlugAttore)
  }

  return (
    <SceltaGiocatore
      candidati={vivi}
      onConferma={confermaScelta}
      onSalta={salta}
      etichetta={etichetta}
      mostraSalta={false}
    />
  )
}
