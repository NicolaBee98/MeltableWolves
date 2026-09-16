import { ROLES } from '../../data/roles'
import { validaMazzo } from '../../data/validaMazzo'

const FAZIONI_ORDINE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']
const FAZIONE_LABEL = {
  villaggio: 'Villaggio',
  lupi: 'Lupi',
  indipendente: 'Indipendenti',
  sconosciuto: 'Sconosciuti',
}
const RUOLI_A_QUANTITA = ['villico', 'lupo-mannaro']

export function MazzoBuilder({ numGiocatori, quantita, setNumGiocatori, setQuantita }) {
  const avvisi = validaMazzo(quantita, numGiocatori)
  const guardiePresenti = (quantita.guardia ?? 0) > 0

  function toggleGuardie(valoreAttuale) {
    if (valoreAttuale === 2) {
      setQuantita('guardia', 0)
      setQuantita('guardia-mannara', 0)
    } else {
      setQuantita('guardia', 2)
    }
  }

  return (
    <section className="mazzo-builder">
      <label htmlFor="numero-giocatori">Numero giocatori</label>
      <input
        id="numero-giocatori"
        type="number"
        min="1"
        value={numGiocatori}
        onChange={(event) => setNumGiocatori(Number(event.target.value))}
      />

      {avvisi.length > 0 && (
        <ul className="mazzo-builder__avvisi">
          {avvisi.map((avviso) => (
            <li key={avviso}>{avviso}</li>
          ))}
        </ul>
      )}

      {FAZIONI_ORDINE.map((fazione) => (
        <fieldset key={fazione}>
          <legend>{FAZIONE_LABEL[fazione]}</legend>
          {ROLES.filter((ruolo) => ruolo.fazione === fazione).map((ruolo) => {
            const valore = quantita[ruolo.slug] ?? 0

            if (RUOLI_A_QUANTITA.includes(ruolo.slug)) {
              return (
                <div key={ruolo.slug} className="mazzo-builder__stepper">
                  <span>{ruolo.nome}</span>
                  <button type="button" onClick={() => setQuantita(ruolo.slug, valore - 1)} disabled={valore === 0}>
                    -
                  </button>
                  <span>{valore}</span>
                  <button type="button" onClick={() => setQuantita(ruolo.slug, valore + 1)}>
                    +
                  </button>
                </div>
              )
            }

            if (ruolo.slug === 'guardia') {
              return (
                <label key={ruolo.slug} className="mazzo-builder__ruolo">
                  <input type="checkbox" checked={valore === 2} onChange={() => toggleGuardie(valore)} />
                  {ruolo.nome} (coppia)
                </label>
              )
            }

            if (ruolo.slug === 'guardia-mannara') {
              return (
                <label key={ruolo.slug} className="mazzo-builder__ruolo">
                  <input
                    type="checkbox"
                    checked={valore > 0}
                    disabled={!guardiePresenti}
                    onChange={() => setQuantita(ruolo.slug, valore > 0 ? 0 : 1)}
                  />
                  {ruolo.nome}
                  {!guardiePresenti && ' (richiede le Guardie)'}
                </label>
              )
            }

            return (
              <label key={ruolo.slug} className="mazzo-builder__ruolo">
                <input
                  type="checkbox"
                  checked={valore > 0}
                  onChange={() => setQuantita(ruolo.slug, valore > 0 ? 0 : 1)}
                />
                {ruolo.nome}
              </label>
            )
          })}
        </fieldset>
      ))}
    </section>
  )
}
