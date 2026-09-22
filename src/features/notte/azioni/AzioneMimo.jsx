import { ROLES } from '../../../data/roles'
import { ruoliAssegnabili } from '../../../data/assegnazione'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'

function nomeRuolo(slug) {
  return ROLES.find((r) => r.slug === slug)?.nome ?? slug
}

// "La prima notte sceglie un giocatore e ne imita il ruolo per tutta la
// partita" (pag. 18): il Mimo agisce molto presto, spesso prima che il
// bersaglio abbia già un ruolo assegnato in app. Il narratore, che conosce
// la carta fisica del bersaglio, la sceglie qui: da quel momento il Mimo ha
// letteralmente quel ruoloSlug (non un'imitazione a parte), quindi si
// sveglia da solo insieme a lui, senza una seconda azione separata.
export function AzioneMimo({ giocatori, aggiornaGiocatore, ruoliSelezionati = [], quantita = {} }) {
  const mimo = giocatori.find((g) => g.ruoloSlug === 'mimo')
  if (!mimo) return null

  if (!mimo.legame) {
    const candidati = giocatori.filter((g) => g.vivo && g.id !== mimo.id)
    return (
      <SceltaGiocatore
        candidati={candidati}
        onConferma={(targetId) => aggiornaGiocatore(mimo.id, { legame: { tipo: 'mimo', targetId } })}
        onSalta={() => {}}
        etichetta="Chi imitare"
        mostraSalta={false}
      />
    )
  }

  const target = giocatori.find((g) => g.id === mimo.legame.targetId)

  if (target?.ruoloSlug) {
    return (
      <p>
        Il Mimo imita {target.nome}: ha assunto il ruolo di {nomeRuolo(target.ruoloSlug)}.
      </p>
    )
  }

  // il bersaglio non ha ancora un ruolo noto in app: il narratore guarda la
  // sua carta fisica e la comunica qui. "villico" è sempre proponibile anche
  // se non compare esplicitamente nel mazzo (vedi RUOLI_NON_ASSEGNABILI_MANUALMENTE)
  const opzioni = [
    ...new Set([...ruoliAssegnabili(ruoliSelezionati.filter((slug) => slug !== 'mimo'), giocatori, quantita), 'villico']),
  ]

  function scegliRuolo(slug) {
    aggiornaGiocatore(mimo.id, {
      ruoloSlug: slug,
      storiaRuoli: [...(mimo.storiaRuoli ?? []), slug],
    })
    aggiornaGiocatore(target.id, {
      ruoloSlug: slug,
      storiaRuoli: [...(target.storiaRuoli ?? []), slug],
    })
  }

  return (
    <div className="azione-mimo">
      <p>Che carta ha davvero {target?.nome}?</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Che carta ha il bersaglio del Mimo">
        {opzioni.map((slug) => (
          <button key={slug} type="button" className="chip" onClick={() => scegliRuolo(slug)}>
            {nomeRuolo(slug)}
          </button>
        ))}
      </div>
    </div>
  )
}
