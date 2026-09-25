import { auraDi } from '../../../data/aura'
import { usatoStanotte, segnaUsoStanotte, aggiornaTuttiConRuolo } from '../../../data/effettiNotte'

export function AzioneIndagine({
  giocatori,
  aggiornaGiocatore,
  round,
  ruoloSlugAttore = 'veggente',
  etichettaAttore = 'Veggente',
  bersaglio = 'vivo',
}) {
  const ruoli = [ruoloSlugAttore]
  const potere = `${ruoloSlugAttore}-indagine`
  const veggente = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => (bersaglio === 'morto' ? !g.vivo : g.vivo && g.id !== veggente?.id))
  const indagineStanotte = veggente?.ultimaIndagine?.notte === round ? veggente.ultimaIndagine : null
  // l'accecamento dal Polpo Mannaro (pag. 20) è specifico del Veggente, non
  // del Veggente Mannaro, che il libretto non menziona in quella voce
  const puoEssereAccecato = ruoloSlugAttore === 'veggente'
  const giaUsato = usatoStanotte(giocatori, ruoli, potere)

  function confermaScelta(targetId) {
    if (veggente) {
      const target = giocatori.find((g) => g.id === targetId)
      if (target) {
        const accecato = puoEssereAccecato && veggente.condizioni?.includes('accecato')
        const esito = accecato ? 'benevola' : auraDi(target.ruoloSlug)
        // ultimaIndagine è un dato del "ruolo", non del singolo corpo: va
        // sincronizzato su ogni giocatore che condivide questo ruoloSlug
        // (Mimo incluso, vedi aggiornaTuttiConRuolo). condizioni invece è
        // sempre per-persona fisica: l'accecamento si applica solo
        // all'attore che ha effettivamente indagato, senza toccare le
        // condizioni altrui di un eventuale secondo attore con lo stesso ruolo.
        aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, ruoloSlugAttore, {
          ultimaIndagine: { targetId, esito, notte: round },
        })
        if (puoEssereAccecato && !accecato && target.ruoloSlug === 'polpo-mannaro') {
          aggiornaGiocatore(veggente.id, { condizioni: [...(veggente.condizioni ?? []), 'accecato'] })
        }
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
  }

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  // la chip resta sempre cliccabile, anche dopo aver già indagato questa
  // notte: il narratore può correggere la scelta finché non preme "Avanti"
  // (vedi principio generale "editabile fino ad Avanti" in NightSequencer).
  // L'etichetta dell'esito va sotto TUTTE le chip, non sotto quella singola.
  return (
    <div className="azione-indagine">
      <p>{bersaglio === 'morto' ? 'Chi interrogare (defunto)' : 'Chi indagare'}</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Chi indagare">
        {candidati.map((g) => {
          const indagato = giaUsato && indagineStanotte?.targetId === g.id
          const classeEsito = indagato ? `chip--${indagineStanotte.esito === 'malvagia' ? 'malvagia' : 'benevola'}` : ''
          return (
            <button
              key={g.id}
              type="button"
              className={`chip ${classeEsito}`.trim()}
              aria-pressed={indagato}
              onClick={() => confermaScelta(g.id)}
            >
              {g.nome}
            </button>
          )
        })}
      </div>
      {giaUsato && indagineStanotte && (
        <p className="azione-indagine__etichetta-esito">
          Aura {indagineStanotte.esito === 'malvagia' ? 'malvagia' : 'benevola'}
        </p>
      )}
    </div>
  )
}
