import { useState } from 'react'
import { auraDi } from '../../../data/aura'
import { usatoStanotte, segnaUsoStanotte, annullaUsoStanotte, aggiornaTuttiConRuolo, RUOLO_CAUSA_ACCECAMENTO } from '../../../data/effettiNotte'

// l'accecamento dal Polpo Mannaro (pag. 20) è specifico del Veggente, non
// del Veggente Mannaro, che il libretto non menziona in quella voce: passato
// come prop dalla registrazione in azioni/index.js invece che dedotto qui
// dallo slug dell'attore, così un futuro potere analogo non richiede un
// altro controllo inline sull'identità del ruolo.
export function AzioneIndagine({
  giocatori,
  aggiornaGiocatore,
  round,
  ruoloSlugAttore = 'veggente',
  etichettaAttore = 'Veggente',
  bersaglio = 'vivo',
  puoEssereAccecato = false,
}) {
  const ruoli = [ruoloSlugAttore]
  const potere = `${ruoloSlugAttore}-indagine`
  const veggente = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => (bersaglio === 'morto' ? !g.vivo : g.vivo && g.id !== veggente?.id))
  const indagineStanotte = veggente?.ultimaIndagine?.notte === round ? veggente.ultimaIndagine : null
  const giaUsato = usatoStanotte(giocatori, ruoli, potere)
  // l'accecamento dura "fino alla morte del Polpo" (permanente tra notti):
  // se il Veggente era già cieco PRIMA di questo passo, resta tale per tutta
  // la notte, qualunque bersaglio si scelga. Ma se è QUESTO stesso click a
  // provocarlo (indagando il Polpo per la prima volta stanotte), va tenuto
  // reversibile finché non si preme "Avanti": ripensare il bersaglio dopo
  // deve annullarlo di nuovo, non lasciarlo agire già da subito su chi non
  // ha ancora indagato nessuno.
  const [accecatoAllIngresso] = useState(() => veggente?.condizioni?.includes('accecato') ?? false)
  const [accecatoDaQuestaScelta, setAccecatoDaQuestaScelta] = useState(false)

  // click sulla chip già scelta: toglie l'indagine, l'eventuale accecamento
  // provocato da questa scelta e il segno di potere usato
  function annullaScelta() {
    if (veggente && accecatoDaQuestaScelta) {
      aggiornaGiocatore(veggente.id, { condizioni: (veggente.condizioni ?? []).filter((c) => c !== 'accecato') })
      setAccecatoDaQuestaScelta(false)
    }
    aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, ruoloSlugAttore, { ultimaIndagine: undefined })
    annullaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
  }

  function confermaScelta(targetId) {
    if (veggente) {
      const target = giocatori.find((g) => g.id === targetId)
      if (target) {
        if (accecatoDaQuestaScelta) {
          aggiornaGiocatore(veggente.id, {
            condizioni: (veggente.condizioni ?? []).filter((c) => c !== 'accecato'),
          })
          setAccecatoDaQuestaScelta(false)
        }
        const accecato = puoEssereAccecato && accecatoAllIngresso
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
        if (puoEssereAccecato && !accecato && target.ruoloSlug === RUOLO_CAUSA_ACCECAMENTO) {
          aggiornaGiocatore(veggente.id, { condizioni: [...(veggente.condizioni ?? []), 'accecato'] })
          setAccecatoDaQuestaScelta(true)
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
              onClick={() => (indagato ? annullaScelta() : confermaScelta(g.id))}
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
