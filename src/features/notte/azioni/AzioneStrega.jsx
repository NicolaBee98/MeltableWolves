import { useState } from 'react'
import { aggiungiCondizionePatch, uccidiPatch, avvisoImmuneNotte, RUOLI_IMMUNI_ALLA_NOTTE } from '../../../data/effettiNotte'
import { annullaColpo } from './annullaColpo'

// le pozioni sono uniche per l'intera partita (non per notte): una volta
// davvero utilizzata (notte precedente) resta bloccata per sempre. Ma finché
// siamo ancora in QUESTA notte, prima di premere "Avanti", il bersaglio scelto
// resta modificabile: è scritto sulla Strega (sceltaNotte, ripulita all'alba)
// e non in uno stato locale, così "usata stanotte" si distingue da "usata in
// una notte precedente" anche dopo un refresh a metà passo.
// `attoreId`: Strega e Mimo-Strega condividono la schermata ma hanno due set di
// pozioni separati (poteriUsati di ciascuno): una istanza per attore
export function AzioneStrega({ giocatori, aggiornaGiocatore, annullaMorte, round, vivoAIngresso = (g) => g.vivo, attoreId }) {
  const strega = attoreId ? giocatori.find((g) => g.id === attoreId) : giocatori.find((g) => g.ruoloSlug === 'strega')
  const poteriUsati = strega?.poteriUsati ?? []
  const vivi = giocatori.filter(vivoAIngresso)
  const [avvisoVitale, setAvvisoVitale] = useState(null)
  const [avvisoMortale, setAvvisoMortale] = useState(null)
  // protezione: { targetId, protezione } — true solo se la pozione ha DAVVERO
  // aggiunto la protezione: se il bersaglio era già protetto (Paladino) cambiando
  // bersaglio non c'è niente da togliere (non va tolta la protezione del Paladino)
  // colpo: { targetId, colpo } — true solo se la pozione ha davvero ucciso
  const vitale = strega?.sceltaNotte?.['strega-vitale']
  const mortale = strega?.sceltaNotte?.['strega-mortale']
  const targetVitale = vitale?.targetId ?? null
  const targetMortale = mortale?.targetId ?? null
  const protezioneDataDaStrega = Boolean(vitale?.protezione)
  const colpoMortaleApplicato = Boolean(mortale?.colpo)
  const giaUsataVitale = poteriUsati.includes('strega-pozione-vitale') && !targetVitale
  const giaUsataMortale = poteriUsati.includes('strega-pozione-mortale') && !targetMortale

  // una sola patch: pozione segnata/rilasciata e scelta di stanotte insieme
  function scriviPozione(chiave, scelta, valore) {
    if (!strega) return
    const poteri = (strega.poteriUsati ?? []).filter((p) => p !== chiave)
    aggiornaGiocatore(strega.id, {
      poteriUsati: valore ? [...poteri, chiave] : poteri,
      sceltaNotte: { ...strega.sceltaNotte, [scelta]: valore },
    })
  }

  function togliProtezioneDataDaStrega() {
    const vecchio = protezioneDataDaStrega && giocatori.find((g) => g.id === targetVitale)
    if (vecchio) aggiornaGiocatore(vecchio.id, { condizioni: vecchio.condizioni.filter((c) => c !== 'protetto') })
  }

  function usaPozioneVitale(targetId) {
    if (!strega) return
    togliProtezioneDataDaStrega()
    setAvvisoVitale(null)
    if (targetVitale === targetId) {
      scriviPozione('strega-pozione-vitale', 'strega-vitale', undefined)
      return
    }
    const target = giocatori.find((g) => g.id === targetId)
    const patch = target && aggiungiCondizionePatch(target, 'protetto')
    scriviPozione('strega-pozione-vitale', 'strega-vitale', { targetId, protezione: Boolean(patch) })
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    } else {
      setAvvisoVitale(`${target.nome} era già protetto/a: la pozione non ha avuto alcun effetto.`)
    }
  }

  function usaPozioneMortale(targetId) {
    if (!strega) return
    // annulla la morte data in un click precedente di questa notte (con la
    // sua catena), se il narratore ha ripensato il bersaglio o deseleziona
    if (targetMortale && colpoMortaleApplicato) annullaColpo(targetMortale, aggiornaGiocatore, annullaMorte)
    setAvvisoMortale(null)
    if (targetMortale === targetId) {
      scriviPozione('strega-pozione-mortale', 'strega-mortale', undefined)
      return
    }
    const target = giocatori.find((g) => g.id === targetId)
    // la pozione mortale ignora la protezione: non è bloccata da "protetto"
    const patch = target && uccidiPatch(target, round, { ignoraProtezione: true, mortoDa: 'strega' })
    scriviPozione('strega-pozione-mortale', 'strega-mortale', { targetId, colpo: Boolean(patch) })
    if (patch) {
      aggiornaGiocatore(targetId, patch)
    } else {
      setAvvisoMortale(
        RUOLI_IMMUNI_ALLA_NOTTE.includes(target.ruoloSlug)
          ? `${avvisoImmuneNotte(target)}: la pozione non ha alcun effetto su ${target.nome}.`
          : `La pozione non ha avuto alcun effetto su ${target.nome}.`,
      )
    }
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
                .filter((g) => vivoAIngresso(g) || g.id === targetMortale)
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
