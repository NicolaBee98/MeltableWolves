import { useState } from 'react'
import { aggiungiCondizionePatch, uccidiPatch } from '../../../data/effettiNotte'

// le pozioni sono uniche per l'intera partita (non per notte): una volta
// davvero utilizzata (notte precedente, già scritta su giocatori) resta
// bloccata per sempre. Ma finché siamo ancora in QUESTA notte, prima di
// premere "Avanti", il bersaglio scelto resta modificabile: catturiamo lo
// stato "già usata" solo una volta, al montaggio del passo (mai più durante
// i click successivi), così un click su questa stessa notte non nasconde
// subito le chip.
export function AzioneStrega({ giocatori, aggiornaGiocatore, round }) {
  const strega = giocatori.find((g) => g.ruoloSlug === 'strega')
  const poteriUsati = strega?.poteriUsati ?? []
  const vivi = giocatori.filter((g) => g.vivo)
  const [avvisoVitale, setAvvisoVitale] = useState(null)
  const [avvisoMortale, setAvvisoMortale] = useState(null)
  const [giaUsataVitale] = useState(() => poteriUsati.includes('strega-pozione-vitale'))
  const [giaUsataMortale] = useState(() => poteriUsati.includes('strega-pozione-mortale'))
  const [targetVitale, setTargetVitale] = useState(null)
  const [targetMortale, setTargetMortale] = useState(null)

  function segnaPotereUsato(chiave) {
    if (!strega) return
    const poteriCorrenti = strega.poteriUsati ?? []
    if (poteriCorrenti.includes(chiave)) return
    aggiornaGiocatore(strega.id, { poteriUsati: [...poteriCorrenti, chiave] })
  }

  function usaPozioneVitale(targetId) {
    if (!strega) return
    // toglie la protezione data in un click precedente di questa notte, se
    // il narratore ha ripensato il bersaglio
    if (targetVitale && targetVitale !== targetId) {
      const vecchio = giocatori.find((g) => g.id === targetVitale)
      if (vecchio) aggiornaGiocatore(targetVitale, { condizioni: vecchio.condizioni.filter((c) => c !== 'protetto') })
    }
    setTargetVitale(targetId)
    const target = giocatori.find((g) => g.id === targetId)
    const patch = target && aggiungiCondizionePatch(target, 'protetto')
    if (patch) {
      aggiornaGiocatore(targetId, patch)
      setAvvisoVitale(null)
    } else {
      setAvvisoVitale(`${target.nome} era già protetto/a: la pozione non ha avuto alcun effetto.`)
    }
    segnaPotereUsato('strega-pozione-vitale')
  }

  function usaPozioneMortale(targetId) {
    if (!strega) return
    // annulla la morte data in un click precedente di questa notte, se il
    // narratore ha ripensato il bersaglio (nessun altro potere mortale ha
    // ancora agito stanotte a questo punto della sequenza: la Strega è
    // sempre il primo dei poteri mortali, vedi nightSteps.js)
    if (targetMortale && targetMortale !== targetId) {
      aggiornaGiocatore(targetMortale, { vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoDa: undefined })
    }
    setTargetMortale(targetId)
    const target = giocatori.find((g) => g.id === targetId)
    // la pozione mortale ignora la protezione: non è bloccata da "protetto"
    const patch = target && uccidiPatch(target, round, { ignoraProtezione: true })
    if (patch) {
      aggiornaGiocatore(targetId, patch)
      setAvvisoMortale(null)
    } else {
      setAvvisoMortale(`La pozione non ha avuto alcun effetto su ${target.nome}.`)
    }
    segnaPotereUsato('strega-pozione-mortale')
  }

  return (
    <div className="azione-strega">
      <div>
        <h3>Pozione vitale</h3>
        {giaUsataVitale ? (
          <p>Pozione vitale già utilizzata in questa partita.</p>
        ) : (
          <div className="scelta-giocatore">
            <p>Chi proteggere</p>
            <div className="scelta-giocatore__chips" role="group" aria-label="Chi proteggere">
              {vivi.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="chip"
                  aria-pressed={targetVitale === g.id}
                  onClick={() => usaPozioneVitale(g.id)}
                >
                  {g.nome}
                </button>
              ))}
            </div>
          </div>
        )}
        {avvisoVitale && <p className="avviso">⚠️ {avvisoVitale}</p>}
      </div>
      <div>
        <h3>Pozione mortale</h3>
        {giaUsataMortale ? (
          <p>Pozione mortale già utilizzata in questa partita.</p>
        ) : (
          <div className="scelta-giocatore">
            <p>Chi uccidere</p>
            <div className="scelta-giocatore__chips" role="group" aria-label="Chi uccidere">
              {/* il bersaglio appena colpito (pending, non ancora "Avanti")
                  resta comunque nella lista anche se non è più vivo,
                  altrimenti la sua chip sparirebbe subito dopo il click e non
                  si potrebbe più vedere né ripensare la scelta */}
              {giocatori
                .filter((g) => g.vivo || g.id === targetMortale)
                .map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className="chip"
                    aria-pressed={targetMortale === g.id}
                    onClick={() => usaPozioneMortale(g.id)}
                  >
                    {g.nome}
                  </button>
                ))}
            </div>
          </div>
        )}
        {avvisoMortale && <p className="avviso">⚠️ {avvisoMortale}</p>}
      </div>
    </div>
  )
}
