import { auraDi } from '../../../data/aura'
import { usatoStanotte, segnaUsoStanotte, annullaUsoStanotte, aggiornaTuttiConRuolo, RUOLO_CAUSA_ACCECAMENTO } from '../../../data/effettiNotte'

// l'accecamento dal Polpo Mannaro (pag. 20) è specifico del Veggente, non
// del Veggente Mannaro, che il libretto non menziona in quella voce: passato
// come prop dalla registrazione in azioni/index.js invece che dedotto qui
// dallo slug dell'attore, così un futuro potere analogo non richiede un
// altro controllo inline sull'identità del ruolo.
// chip dei candidati: quella indagata stanotte ha il colore dell'esito e, se
// ricliccata, annulla l'indagine (condivisa con AzioneInquisitore)
export function ChipsIndagine({ candidati, etichetta, indagatoId, esito, onScegli, onAnnulla }) {
  return (
    <div className="scelta-giocatore__chips" role="group" aria-label={etichetta}>
      {candidati.map((g) => {
        const indagato = indagatoId === g.id
        const classeEsito = indagato ? ` chip--${esito === 'malvagia' ? 'malvagia' : 'benevola'}` : ''
        return (
          <button
            key={g.id}
            type="button"
            className={`chip${classeEsito}`}
            aria-pressed={indagato}
            onClick={() => (indagato ? onAnnulla() : onScegli(g.id))}
          >
            {g.nome}
          </button>
        )
      })}
    </div>
  )
}

export function AzioneIndagine({
  giocatori,
  aggiornaGiocatore,
  round,
  ruoloSlugAttore = 'veggente',
  bersaglio = 'vivo',
  puoEssereAccecato = false,
  vivoAIngresso = (g) => g.vivo,
}) {
  const ruoli = [ruoloSlugAttore]
  const potere = `${ruoloSlugAttore}-indagine`
  // titolare e Mimo che lo copia giocano insieme: scelta e accecamento sono
  // condivisi. Un attore inibito dalla Fattucchiera non riceve l'indagine (la
  // fa chi non lo è); se lo sono tutti, il passo non arriva nemmeno qui.
  const attori = giocatori.filter((g) => g.ruoloSlug === ruoloSlugAttore)
  const inibiti = attori.filter((g) => (g.condizioni ?? []).includes('inibito'))
  const attivi = attori.filter((g) => !inibiti.includes(g))
  const veggente = attivi[0] ?? attori[0]
  const candidati = giocatori.filter((g) => (bersaglio === 'morto' ? !vivoAIngresso(g) : vivoAIngresso(g) && g.id !== veggente?.id))
  const indagineStanotte = veggente?.ultimaIndagine?.notte === round ? veggente.ultimaIndagine : null
  const giaUsato = usatoStanotte(giocatori, ruoli, potere)
  // l'esito si ricalcola dal bersaglio se l'indagine è stata scritta senza (variante del Medium cambiata a passo aperto)
  const esitoIndagine =
    indagineStanotte && (indagineStanotte.esito ?? auraDi(giocatori.find((g) => g.id === indagineStanotte.targetId)?.ruoloSlug))
  // l'accecamento dura "fino alla morte del Polpo" (permanente tra notti):
  // se il Veggente era già cieco PRIMA di questo passo, resta tale per tutta
  // la notte, qualunque bersaglio si scelga. Ma se è QUESTO stesso click a
  // provocarlo (indagando il Polpo per la prima volta stanotte), va tenuto
  // reversibile finché non si preme "Avanti": ripensare il bersaglio dopo
  // deve annullarlo di nuovo, non lasciarlo agire già da subito su chi non
  // ha ancora indagato nessuno.
  // "da questa scelta" si legge dall'indagine di stanotte (accecaQui, sul
  // giocatore) e non da uno stato locale: dopo un refresh a metà passo
  // ripensare il bersaglio deve annullare ancora l'accecamento
  const accecatoDaQuestaScelta = Boolean(indagineStanotte?.accecaQui)
  const accecatoAllIngresso = attori.some((g) => (g.condizioni ?? []).includes('accecato')) && !accecatoDaQuestaScelta

  // click sulla chip già scelta: toglie l'indagine, l'eventuale accecamento
  // provocato da questa scelta e il segno di potere usato
  function togliAccecamento() {
    attori.forEach((g) => aggiornaGiocatore(g.id, { condizioni: (g.condizioni ?? []).filter((c) => c !== 'accecato') }))
  }

  function annullaScelta() {
    if (veggente && accecatoDaQuestaScelta) togliAccecamento()
    aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, ruoloSlugAttore, { ultimaIndagine: undefined })
    annullaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
  }

  function confermaScelta(targetId) {
    if (veggente) {
      const target = giocatori.find((g) => g.id === targetId)
      if (target) {
        if (accecatoDaQuestaScelta) togliAccecamento()
        const accecato = puoEssereAccecato && accecatoAllIngresso
        const esito = accecato ? 'benevola' : auraDi(target.ruoloSlug)
        // ultimaIndagine è un dato del "ruolo", non del singolo corpo: va
        // sincronizzato su ogni giocatore che condivide questo ruoloSlug
        // (Mimo incluso, vedi aggiornaTuttiConRuolo). condizioni invece è
        // sempre per-persona fisica: l'accecamento si applica solo
        // all'attore che ha effettivamente indagato, senza toccare le
        // condizioni altrui di un eventuale secondo attore con lo stesso ruolo.
        // il Polpo acceca TUTTI i titolari (Veggente e Mimo-Veggente) fino alla sua morte
        const accecaQui = puoEssereAccecato && !accecato && target.ruoloSlug === RUOLO_CAUSA_ACCECAMENTO
        attivi.forEach((g) => aggiornaGiocatore(g.id, { ultimaIndagine: { targetId, esito, notte: round, ...(accecaQui && { accecaQui: true }) } }))
        if (accecaQui) {
          attori.forEach((g) => aggiornaGiocatore(g.id, { condizioni: [...(g.condizioni ?? []).filter((c) => c !== 'accecato'), 'accecato'] }))
        }
      }
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
  }

  if (candidati.length === 0) {
    return <p>Nessun giocatore da scegliere.</p>
  }

  // la chip resta sempre cliccabile, anche dopo aver già indagato questa
  // notte: il narratore può correggere la scelta finché non preme "Avanti"
  // (vedi principio generale "editabile fino ad Avanti" in NightSequencer).
  // L'etichetta dell'esito va sotto TUTTE le chip, non sotto quella singola.
  return (
    <div className="azione-indagine">
      <p>{bersaglio === 'morto' ? 'Chi interrogare (defunto)' : 'Chi indagare'}</p>
      <ChipsIndagine
        candidati={candidati}
        etichetta="Chi indagare"
        indagatoId={giaUsato ? indagineStanotte?.targetId : null}
        esito={esitoIndagine}
        onScegli={confermaScelta}
        onAnnulla={annullaScelta}
      />
      {attori.some((g) => (g.condizioni ?? []).includes('accecato')) && (
        <p>🐙 Accecat{attori.length > 1 ? 'i' : 'o'} dal Polpo Mannaro: {attori.map((g) => g.nome).join(', ')}.</p>
      )}
      {inibiti.length > 0 && attivi.length > 0 && (
        <p>🚫 Inibito dalla Fattucchiera: {inibiti.map((g) => g.nome).join(', ')} (non riceve l'indagine).</p>
      )}
      {giaUsato && indagineStanotte && (
        <p className="azione-indagine__etichetta-esito">
          Aura {esitoIndagine === 'malvagia' ? 'malvagia' : 'benevola'}
        </p>
      )}
    </div>
  )
}
