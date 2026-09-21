import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { resuscitaPatch } from '../../../data/effettiNotte'

export function AzioneResuscita({ giocatori, aggiornaGiocatore, potereSlug, ruoloSlugAttore, round }) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const poteriUsatiAttore = attore?.poteriUsati ?? []
  const giaUsato = poteriUsatiAttore.includes(potereSlug)
  const morti = giocatori.filter((g) => !g.vivo)

  if (giaUsato) {
    return <p>Potere già utilizzato in questa partita.</p>
  }

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !attore) return
    const patch = resuscitaPatch(target, round)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
    aggiornaGiocatore(attore.id, { poteriUsati: [...poteriUsatiAttore, potereSlug] })
  }

  return <SceltaGiocatore candidati={morti} onConferma={confermaScelta} onSalta={() => {}} etichetta="Chi resuscitare" />
}
