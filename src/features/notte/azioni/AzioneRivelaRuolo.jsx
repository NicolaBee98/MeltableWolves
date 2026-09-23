import { SceltaGiocatore } from '../../../components/SceltaGiocatore'
import { ROLES } from '../../../data/roles'
import { usatoStanotte, segnaUsoStanotte, aggiornaTuttiConRuolo } from '../../../data/effettiNotte'

function nomeRuolo(ruoloSlug) {
  return ROLES.find((r) => r.slug === ruoloSlug)?.nome ?? 'ruolo sconosciuto'
}

// Usato da Cartomante (bersaglio vivo, "alternativa al Veggente" ma rivela
// il ruolo intero) e Medium (bersaglio morto, il "vecchio ruolo").
export function AzioneRivelaRuolo({ giocatori, aggiornaGiocatore, round, ruoloSlugAttore, etichettaAttore, bersaglio }) {
  const ruoli = [ruoloSlugAttore]
  const potere = `${ruoloSlugAttore}-indagine`
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => (bersaglio === 'morto' ? !g.vivo : g.vivo && g.id !== attore?.id))
  const indagineStanotte = attore?.ultimaIndagine?.notte === round ? attore.ultimaIndagine : null

  if (usatoStanotte(giocatori, ruoli, potere)) {
    return (
      <div className="azione-indagine">
        <p>Potere già utilizzato questa notte.</p>
        {indagineStanotte && (
          <p className="azione-indagine__esito">
            Mostra a {etichettaAttore} la carta: {nomeRuolo(indagineStanotte.ruoloRivelato)}
          </p>
        )}
      </div>
    )
  }

  function confermaScelta(targetId) {
    if (attore) {
      const target = giocatori.find((g) => g.id === targetId)
      if (target) {
        aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, ruoloSlugAttore, {
          ultimaIndagine: { targetId, ruoloRivelato: target.ruoloSlug, notte: round },
        })
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
  }

  return (
    <SceltaGiocatore
      candidati={candidati}
      onConferma={confermaScelta}
      onSalta={() => {}}
      etichetta={bersaglio === 'morto' ? 'Chi interrogare (defunto)' : 'Chi indagare'}
      mostraSalta={false}
    />
  )
}
