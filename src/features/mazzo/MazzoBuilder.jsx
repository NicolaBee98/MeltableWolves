import { ROLES } from '../../data/roles'
import { validaMazzo } from '../../data/validaMazzo'

const FAZIONI_ORDINE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']
const FAZIONE_LABEL = {
  villaggio: 'Villaggio',
  lupi: 'Lupi',
  indipendente: 'Indipendenti',
  sconosciuto: 'Sconosciuti',
}

export function MazzoBuilder({ numGiocatori, ruoliSelezionati, setNumGiocatori, toggleRuolo }) {
  const avvisi = validaMazzo(ruoliSelezionati, numGiocatori)

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
          {ROLES.filter((ruolo) => ruolo.fazione === fazione).map((ruolo) => (
            <label key={ruolo.slug} className="mazzo-builder__ruolo">
              <input
                type="checkbox"
                checked={ruoliSelezionati.includes(ruolo.slug)}
                onChange={() => toggleRuolo(ruolo.slug)}
              />
              {ruolo.nome}
            </label>
          ))}
        </fieldset>
      ))}
    </section>
  )
}
