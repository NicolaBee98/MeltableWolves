import { useState } from 'react'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { aggiungiCondizionePatch, uccidiPatch } from '../../../data/effettiNotte'

export function AzioneStrega({ giocatori, aggiornaGiocatore, round }) {
  const strega = giocatori.find((g) => g.ruoloSlug === 'strega')
  const poteriUsati = strega?.poteriUsati ?? []
  const vivi = giocatori.filter((g) => g.vivo)
  const [avvisoVitale, setAvvisoVitale] = useState(null)
  const [avvisoMortale, setAvvisoMortale] = useState(null)

  function usaPozioneVitale(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !strega) return
    const patch = aggiungiCondizionePatch(target, 'protetto')
    if (patch) {
      aggiornaGiocatore(targetId, patch)
      setAvvisoVitale(null)
    } else {
      setAvvisoVitale(`${target.nome} era già protetto/a: la pozione non ha avuto alcun effetto.`)
    }
    aggiornaGiocatore(strega.id, { poteriUsati: [...poteriUsati, 'strega-pozione-vitale'] })
  }

  function usaPozioneMortale(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (!target || !strega) return
    // la pozione mortale ignora la protezione: non è bloccata da "protetto"
    const patch = uccidiPatch(target, round, { ignoraProtezione: true })
    if (patch) {
      aggiornaGiocatore(targetId, patch)
      setAvvisoMortale(null)
    } else {
      setAvvisoMortale(`La pozione non ha avuto alcun effetto su ${target.nome}.`)
    }
    aggiornaGiocatore(strega.id, { poteriUsati: [...poteriUsati, 'strega-pozione-mortale'] })
  }

  return (
    <div className="azione-strega">
      <div>
        <h3>Pozione vitale</h3>
        {avvisoVitale && <p className="azione-strega__avviso">{avvisoVitale}</p>}
        {poteriUsati.includes('strega-pozione-vitale') ? (
          <p>Pozione vitale già utilizzata.</p>
        ) : (
          <SceltaGiocatore
            candidati={vivi}
            onConferma={usaPozioneVitale}
            onSalta={() => {}}
            etichetta="Chi proteggere"
            mostraSalta={false}
          />
        )}
      </div>
      <div>
        <h3>Pozione mortale</h3>
        {avvisoMortale && <p className="azione-strega__avviso">{avvisoMortale}</p>}
        {poteriUsati.includes('strega-pozione-mortale') ? (
          <p>Pozione mortale già utilizzata.</p>
        ) : (
          <SceltaGiocatore
            candidati={vivi}
            onConferma={usaPozioneMortale}
            onSalta={() => {}}
            etichetta="Chi uccidere"
            mostraSalta={false}
          />
        )}
      </div>
    </div>
  )
}
