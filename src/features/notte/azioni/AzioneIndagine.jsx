import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { auraDi } from '../../../data/aura'
import { usatoStanotte, segnaUsoStanotte } from '../../../data/effettiNotte'

const RUOLI = ['veggente']
const POTERE = 'veggente-indagine'

export function AzioneIndagine({ giocatori, aggiornaGiocatore, round }) {
  const veggente = giocatori.find((g) => g.ruoloSlug === 'veggente')
  const candidati = giocatori.filter((g) => g.vivo && g.id !== veggente?.id)
  const indagineStanotte = veggente?.ultimaIndagine?.notte === round ? veggente.ultimaIndagine : null

  if (usatoStanotte(giocatori, RUOLI, POTERE)) {
    return (
      <div className="azione-indagine">
        <p>Potere già utilizzato questa notte.</p>
        {indagineStanotte && (
          <p className="azione-indagine__esito">
            Rispondi al Veggente: aura {indagineStanotte.esito === 'malvagia' ? 'malvagia 🐺' : 'benevola 🕊️'}
          </p>
        )}
      </div>
    )
  }

  function confermaScelta(targetId) {
    if (veggente) {
      const target = giocatori.find((g) => g.id === targetId)
      if (target) {
        const accecato = veggente.condizioni?.includes('accecato')
        const esito = accecato ? 'benevola' : auraDi(target.ruoloSlug)
        aggiornaGiocatore(veggente.id, { ultimaIndagine: { targetId, esito, notte: round } })
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  return (
    <SceltaGiocatore
      candidati={candidati}
      onConferma={confermaScelta}
      onSalta={salta}
      etichetta="Chi indagare"
      mostraSalta={false}
    />
  )
}
