import { useState } from 'react'
import { eLupo } from '../../../data/roles'
import { uccidiPatch, segnaUsoStanotte, RUOLI_IMMUNI_AL_CHUPACABRA } from '../../../data/effettiNotte'
import { annullaColpo } from './annullaColpo'

const RUOLI = ['chupacabra']
const POTERE = 'chupacabra-caccia'

// come la pozione mortale della Strega: la chip scelta resta modificabile
// finché non si preme "Avanti". Il Chupacabra agisce dopo il branco dei
// lupi (vedi nightSteps.js): nessun altro potere mortale tocca ancora il suo
// bersaglio a questo punto della notte, quindi annullare la morte data a un
// click precedente per ripensare il bersaglio è sicuro.
export function AzioneChupacabra({ giocatori, aggiornaGiocatore, annullaMorte, round, vivoAIngresso = (g) => g.vivo }) {
  const chupacabra = giocatori.find((g) => g.ruoloSlug === 'chupacabra')
  const [target, setTarget] = useState(null)
  const [colpito, setColpito] = useState(false)
  const [avviso, setAvviso] = useState(null)
  // il bersaglio appena colpito resta in lista anche se non è più vivo,
  // altrimenti la sua chip sparirebbe subito dopo il click
  const candidati = giocatori.filter(
    (g) => (vivoAIngresso(g) || g.id === target) && g.id !== chupacabra?.id && !RUOLI_IMMUNI_AL_CHUPACABRA.includes(g.ruoloSlug),
  )
  // calcolato con il bersaglio ancora tra i vivi: se il colpo ha appena
  // ucciso l'ultimo lupo, cambiare bersaglio non deve poter uccidere un non-lupo
  const nessunLupoVivo = !candidati.some((g) => eLupo(g.ruoloSlug))

  // deselezione (click sulla chip premuta): niente bersaglio, uso del potere tolto
  function deseleziona() {
    if (colpito) annullaColpo(target, aggiornaGiocatore, annullaMorte)
    giocatori
      .filter((g) => RUOLI.includes(g.ruoloSlug))
      .forEach((g) => {
        const usi = [...(g.usiNotte ?? [])]
        const idx = usi.lastIndexOf(POTERE)
        if (idx >= 0) usi.splice(idx, 1)
        aggiornaGiocatore(g.id, { usiNotte: usi })
      })
    setTarget(null)
    setColpito(false)
    setAvviso(null)
  }

  function confermaScelta(targetId) {
    if (targetId === target) return deseleziona()
    if (target && colpito) annullaColpo(target, aggiornaGiocatore, annullaMorte)
    const eraScelto = Boolean(target)
    setTarget(targetId)
    setColpito(false)
    setAvviso(null)
    const bersaglio = giocatori.find((g) => g.id === targetId)
    if (bersaglio) {
      if (!eLupo(bersaglio.ruoloSlug) && !nessunLupoVivo) {
        setAvviso(`${bersaglio.nome} non è un lupo: la caccia del Chupacabra fallisce.`)
      } else {
        const patch = uccidiPatch(bersaglio, round, { mortoDa: 'chupacabra' })
        if (patch) {
          aggiornaGiocatore(targetId, patch)
          setColpito(true)
        } else {
          setAvviso(`${bersaglio.nome} è protetto/a: la caccia non ha alcun effetto.`)
        }
      }
    }
    // cambiare bersaglio non è un nuovo uso
    if (!eraScelto) segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="scelta-giocatore">
      <p>Il Chupacabra caccia</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Il Chupacabra caccia">
        {candidati
          .map((g) => (
            <button
              key={g.id}
              type="button"
              className="chip"
              aria-pressed={target === g.id}
              onClick={() => confermaScelta(g.id)}
            >
              {g.nome}
            </button>
          ))}
      </div>
      {avviso && <p className="avviso">⚠️ {avviso}</p>}
    </div>
  )
}
