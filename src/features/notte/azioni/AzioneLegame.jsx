import { SceltaGiocatore } from './SceltaGiocatore'

export function AzioneLegame({ giocatori, aggiornaGiocatore, ruoloSlugAttore, tipoLegame, etichetta }) {
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => g.vivo && g.id !== attore?.id)

  if (attore?.legame) {
    const bersaglio = giocatori.find((g) => g.id === attore.legame.targetId)
    return <p>Legame già stabilito con {bersaglio?.nome ?? 'un giocatore'}.</p>
  }

  function confermaScelta(targetId) {
    if (!attore) return
    aggiornaGiocatore(attore.id, { legame: { tipo: tipoLegame, targetId } })
  }

  return <SceltaGiocatore candidati={candidati} onConferma={confermaScelta} onSalta={() => {}} etichetta={etichetta} />
}
