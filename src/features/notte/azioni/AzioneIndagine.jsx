import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { auraDi } from '../../../data/aura'

export function AzioneIndagine({ giocatori, aggiornaGiocatore, round }) {
  const veggente = giocatori.find((g) => g.ruoloSlug === 'veggente')
  const candidati = giocatori.filter((g) => g.vivo && g.id !== veggente?.id)

  function confermaScelta(targetId) {
    if (!veggente) return
    const target = giocatori.find((g) => g.id === targetId)
    if (!target) return

    const accecato = veggente.condizioni?.includes('accecato')
    const esito = accecato ? 'benevola' : auraDi(target.ruoloSlug)

    aggiornaGiocatore(veggente.id, { ultimaIndagine: { targetId, esito, notte: round } })
  }

  return (
    <SceltaGiocatore candidati={candidati} onConferma={confermaScelta} onSalta={() => {}} etichetta="Chi indagare" />
  )
}
