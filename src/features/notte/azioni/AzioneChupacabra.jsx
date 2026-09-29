import { useState } from 'react'
import { fazioneDi } from '../../../data/roles'
import { uccidiPatch, segnaUsoStanotte, RUOLI_IMMUNI_AL_CHUPACABRA } from '../../../data/effettiNotte'

const RUOLI = ['chupacabra']
const POTERE = 'chupacabra-caccia'

// come la pozione mortale della Strega: la chip scelta resta modificabile
// finché non si preme "Avanti". Il Chupacabra agisce dopo il branco dei
// lupi (vedi nightSteps.js): nessun altro potere mortale tocca ancora il suo
// bersaglio a questo punto della notte, quindi annullare la morte data a un
// click precedente per ripensare il bersaglio è sicuro.
export function AzioneChupacabra({ giocatori, aggiornaGiocatore, round }) {
  const chupacabra = giocatori.find((g) => g.ruoloSlug === 'chupacabra')
  const vivi = giocatori.filter(
    (g) => g.vivo && g.id !== chupacabra?.id && !RUOLI_IMMUNI_AL_CHUPACABRA.includes(g.ruoloSlug),
  )
  const nessunLupoVivo = !vivi.some((g) => fazioneDi(g) === 'lupi')
  const [target, setTarget] = useState(null)

  function confermaScelta(targetId) {
    if (target && target !== targetId) {
      aggiornaGiocatore(target, { vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoDa: undefined })
    }
    setTarget(targetId)
    const bersaglio = giocatori.find((g) => g.id === targetId)
    if (bersaglio) {
      const puoUccidere = fazioneDi(bersaglio) === 'lupi' || nessunLupoVivo
      if (puoUccidere) {
        const patch = uccidiPatch(bersaglio, round, { mortoDa: 'chupacabra' })
        if (patch) {
          aggiornaGiocatore(targetId, patch)
        }
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  if (vivi.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="scelta-giocatore">
      <p>Il Chupacabra caccia</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Il Chupacabra caccia">
        {/* il bersaglio appena colpito resta in lista anche se non è più
            vivo, altrimenti la sua chip sparirebbe subito dopo il click */}
        {giocatori
          .filter(
            (g) =>
              (g.vivo || g.id === target) &&
              g.id !== chupacabra?.id &&
              !RUOLI_IMMUNI_AL_CHUPACABRA.includes(g.ruoloSlug),
          )
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
    </div>
  )
}
