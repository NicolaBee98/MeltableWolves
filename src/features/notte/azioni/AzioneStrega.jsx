import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { aggiungiCondizionePatch, uccidiPatch } from '../../../data/effettiNotte'

export function AzioneStrega({ giocatori, aggiornaGiocatore, round }) {
  const strega = giocatori.find((g) => g.ruoloSlug === 'strega')
  const poteriUsati = strega?.poteriUsati ?? []
  const vivi = giocatori.filter((g) => g.vivo)

  function usaPozioneVitale(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !strega) return
    const patch = aggiungiCondizionePatch(target, 'protetto')
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
    aggiornaGiocatore(strega.id, { poteriUsati: [...poteriUsati, 'strega-pozione-vitale'] })
  }

  function usaPozioneMortale(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !strega) return
    const patch = uccidiPatch(target, round)
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    }
    aggiornaGiocatore(strega.id, { poteriUsati: [...poteriUsati, 'strega-pozione-mortale'] })
  }

  return (
    <div className="azione-strega">
      <div>
        <h3>Pozione vitale</h3>
        {poteriUsati.includes('strega-pozione-vitale') ? (
          <p>Pozione vitale già utilizzata.</p>
        ) : (
          <SceltaGiocatore candidati={vivi} onConferma={usaPozioneVitale} onSalta={() => {}} etichetta="Chi proteggere" />
        )}
      </div>
      <div>
        <h3>Pozione mortale</h3>
        {poteriUsati.includes('strega-pozione-mortale') ? (
          <p>Pozione mortale già utilizzata.</p>
        ) : (
          <SceltaGiocatore candidati={vivi} onConferma={usaPozioneMortale} onSalta={() => {}} etichetta="Chi uccidere" />
        )}
      </div>
    </div>
  )
}
