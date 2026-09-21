import { ROLES } from '../../../data/roles'

function nomeRuolo(slug) {
  return ROLES.find((r) => r.slug === slug)?.nome ?? slug
}

const POTERE = 'ladro-scelta'

export function AzioneLadro({ giocatori, aggiornaGiocatore, scartoLadro = [] }) {
  const ladro = giocatori.find((g) => g.ruoloSlug === 'ladro')
  const [carta1, carta2] = scartoLadro
  const usato = (ladro?.poteriUsati ?? []).includes(POTERE)
  // "se le due carte rappresentano entrambe Lupi Mannari è necessario
  // scambiare la propria carta" (pag. 15): niente opzione "resta Villico"
  const entrambiLupi =
    Boolean(carta1) &&
    Boolean(carta2) &&
    [carta1, carta2].every((slug) => ROLES.find((r) => r.slug === slug)?.fazione === 'lupi')

  if (usato) {
    return <p>Il Ladro ha già scelto.</p>
  }

  if (!carta1 || !carta2) {
    return <p>Imposta le due carte di scarto del Ladro nella composizione del mazzo prima di iniziare la notte.</p>
  }

  function scegli(ruoloSlug) {
    if (!ladro) return
    aggiornaGiocatore(ladro.id, {
      ruoloSlug,
      storiaRuoli: [...(ladro.storiaRuoli ?? []), ruoloSlug],
      poteriUsati: [...(ladro.poteriUsati ?? []), POTERE],
    })
  }

  return (
    <div className="azione-ladro">
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
    </div>
  )
}
