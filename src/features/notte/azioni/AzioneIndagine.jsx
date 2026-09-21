import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { auraDi } from '../../../data/aura'
import { usatoStanotte, segnaUsoStanotte } from '../../../data/effettiNotte'

export function AzioneIndagine({
  giocatori,
  aggiornaGiocatore,
  round,
  ruoloSlugAttore = 'veggente',
  etichettaAttore = 'Veggente',
}) {
  const ruoli = [ruoloSlugAttore]
  const potere = `${ruoloSlugAttore}-indagine`
  const veggente = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => g.vivo && g.id !== veggente?.id)
  const indagineStanotte = veggente?.ultimaIndagine?.notte === round ? veggente.ultimaIndagine : null
  // l'accecamento dal Polpo Mannaro (pag. 20) è specifico del Veggente, non
  // del Veggente Mannaro, che il libretto non menziona in quella voce
  const puoEssereAccecato = ruoloSlugAttore === 'veggente'

  if (usatoStanotte(giocatori, ruoli, potere)) {
    return (
      <div className="azione-indagine">
        <p>Potere già utilizzato questa notte.</p>
        {indagineStanotte && (
          <p className="azione-indagine__esito">
            Rispondi al {etichettaAttore}: aura {indagineStanotte.esito === 'malvagia' ? 'malvagia 🐺' : 'benevola 🕊️'}
          </p>
        )}
      </div>
    )
  }

  function confermaScelta(targetId) {
    if (veggente) {
      const target = giocatori.find((g) => g.id === targetId)
      if (target) {
        const accecato = puoEssereAccecato && veggente.condizioni?.includes('accecato')
        const esito = accecato ? 'benevola' : auraDi(target.ruoloSlug)
        const patch = { ultimaIndagine: { targetId, esito, notte: round } }
        if (puoEssereAccecato && !accecato && target.ruoloSlug === 'polpo-mannaro') {
          patch.condizioni = [...(veggente.condizioni ?? []), 'accecato']
        }
        aggiornaGiocatore(veggente.id, patch)
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
  }

  function salta() {
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
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
