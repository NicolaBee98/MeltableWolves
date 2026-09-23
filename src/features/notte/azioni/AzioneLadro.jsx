import { ROLES } from '../../../data/roles'
import { ruoliAssegnabili } from '../../../data/assegnazione'

function nomeRuolo(slug) {
  return ROLES.find((r) => r.slug === slug)?.nome ?? slug
}

const POTERE = 'ladro-scelta'

// Il mazzo fisico ha due carte in più quando c'è il Ladro (pag. 15): quali
// due ruoli siano non si decide componendo il mazzo, ma qui, quando tocca al
// Ladro guardarle. Le due carte candidate si tengono sul giocatore stesso
// (non in uno stato locale del componente) così sopravvivono a "Indietro" e
// a un refresh come qualunque altra scelta di notte.
export function AzioneLadro({ giocatori, aggiornaGiocatore, ruoliSelezionati = [], quantita = {}, onCambiaQuantita = () => {} }) {
  const ladro = giocatori.find((g) => g.ruoloSlug === 'ladro')
  const usato = (ladro?.poteriUsati ?? []).includes(POTERE)
  const [carta1, carta2] = ladro?.scartoLadro ?? []
  // solo carte non ancora in mano a nessuno ("tra quelle non assegnate a
  // nessuno", come dice il testo sotto): altrimenti si potrebbe scartare la
  // carta di un giocatore che la tiene già fisicamente (es. il bersaglio del
  // Mimo, assegnato un passo prima)
  const disponibili = ruoliAssegnabili(
    ruoliSelezionati.filter((slug) => slug !== 'ladro'),
    giocatori,
    quantita,
  )
  const opzioniPrimaCarta = disponibili.filter((slug) => slug !== carta2)
  const opzioniSecondaCarta = disponibili.filter((slug) => slug !== carta1)

  if (usato) {
    return <p>Il Ladro ha già scelto.</p>
  }

  if (!ladro) return null

  const entrambiLupi =
    Boolean(carta1) &&
    Boolean(carta2) &&
    [carta1, carta2].every((slug) => ROLES.find((r) => r.slug === slug)?.fazione === 'lupi')

  function impostaCarta(indice, slug) {
    const scarto = [carta1, carta2]
    scarto[indice] = slug || undefined
    aggiornaGiocatore(ladro.id, { scartoLadro: scarto })
  }

  // la carta non presa dal Ladro resta fuori dal mazzo per il resto della
  // partita (pag. 15): se il Ladro sceglie una delle due, l'altra si scarta;
  // se resta Villico, si scartano entrambe
  function scartaCarta(slug) {
    if (!slug) return
    onCambiaQuantita(slug, Math.max(0, (quantita[slug] ?? 1) - 1))
  }

  function scegli(ruoloSlug) {
    aggiornaGiocatore(ladro.id, {
      ruoloSlug,
      storiaRuoli: [...(ladro.storiaRuoli ?? []), ruoloSlug],
      poteriUsati: [...(ladro.poteriUsati ?? []), POTERE],
    })
    if (ruoloSlug === carta1 || ruoloSlug === carta2) {
      scartaCarta(ruoloSlug === carta1 ? carta2 : carta1)
    } else {
      scartaCarta(carta1)
      scartaCarta(carta2)
    }
  }

  return (
    <div className="azione-ladro">
      <p>Quali due carte sono rimaste fuori dal mazzo, tra quelle non assegnate a nessuno?</p>
      <div className="azione-ladro__scarto">
        <label>
          Prima carta
          <select value={carta1 ?? ''} onChange={(e) => impostaCarta(0, e.target.value)}>
            <option value="">— scegli —</option>
            {opzioniPrimaCarta.map((slug) => (
              <option key={slug} value={slug}>
                {nomeRuolo(slug)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Seconda carta
          <select value={carta2 ?? ''} onChange={(e) => impostaCarta(1, e.target.value)}>
            <option value="">— scegli —</option>
            {opzioniSecondaCarta.map((slug) => (
              <option key={slug} value={slug}>
                {nomeRuolo(slug)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {carta1 && carta2 && (
        <>
          <p>
            Il Ladro guarda le due carte rimaste: {nomeRuolo(carta1)} e {nomeRuolo(carta2)}.
          </p>
          <div className="scelta-giocatore__chips" role="group" aria-label="Cosa sceglie il Ladro">
            <button type="button" className="chip" onClick={() => scegli(carta1)}>
              {nomeRuolo(carta1)}
            </button>
            <button type="button" className="chip" onClick={() => scegli(carta2)}>
              {nomeRuolo(carta2)}
            </button>
            {!entrambiLupi && (
              <button type="button" className="chip" onClick={() => scegli('villico')}>
                Resta Villico
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
