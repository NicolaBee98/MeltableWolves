import { SceltaGiocatore } from './SceltaGiocatore'

export function AzioneCortigiana({ giocatori, aggiornaGiocatore }) {
  const cortigiana = giocatori.find((g) => g.ruoloSlug === 'cortigiana')
  const candidati = giocatori.filter((g) => g.vivo && g.id !== cortigiana?.id)

  function confermaScelta(targetId) {
    if (!cortigiana) return
    aggiornaGiocatore(cortigiana.id, { visitaNotturna: targetId })
  }

  return (
    <SceltaGiocatore candidati={candidati} onConferma={confermaScelta} onSalta={() => {}} etichetta="Chi visita la Cortigiana" />
  )
}
