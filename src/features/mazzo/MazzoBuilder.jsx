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
  const ruoliNelMazzo = ROLES.filter((ruolo) => (quantita[ruolo.slug] ?? 0) > 0)
  const totaleRuoli = ruoliNelMazzo.reduce((somma, ruolo) => somma + (quantita[ruolo.slug] ?? 0), 0)

  function toggleGuardie(valoreAttuale) {
    if (valoreAttuale === 2) {
      setQuantita('guardia', 0)
      setQuantita('guardia-mannara', 0)
    } else {
      setQuantita('guardia', 2)
    }
  }

  function etichettaRuolo(ruolo) {
    return ruolo.slug === 'guardia' ? `${ruolo.nome} (coppia)` : ruolo.nome
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

      <div className="mazzo-builder__nel-mazzo">
        <h3>Nel mazzo ({totaleRuoli})</h3>
        {ruoliNelMazzo.length === 0 ? (
          <p className="mazzo-builder__vuoto">Nessuna carta selezionata.</p>
        ) : (
          <div className="scelta-giocatore__chips" role="group" aria-label="Ruoli nel mazzo">
            {ruoliNelMazzo.map((ruolo) => {
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

              return (
                <button
                  key={ruolo.slug}
                  type="button"
                  className="chip"
                  aria-pressed="true"
                  onClick={() => (ruolo.slug === 'guardia' ? toggleGuardie(2) : setQuantita(ruolo.slug, 0))}
                >
                  {etichettaRuolo(ruolo)} ✕
                </button>
              )
            })}
          </div>
        )}
      </div>

      {avvisi.length > 0 && (
        <ul className="mazzo-builder__avvisi">
          {avvisi.map((avviso) => (
            <li key={avviso}>{avviso}</li>
          ))}
        </ul>
      )}

      {FAZIONI_ORDINE.map((fazione) => {
        const disponibili = ROLES.filter((ruolo) => ruolo.fazione === fazione && (quantita[ruolo.slug] ?? 0) === 0)
        if (disponibili.length === 0) return null

        return (
          <fieldset key={fazione}>
            <legend>{FAZIONE_LABEL[fazione]}</legend>
            <div className="scelta-giocatore__chips" role="group" aria-label={`${FAZIONE_LABEL[fazione]} disponibili`}>
              {disponibili.map((ruolo) => {
                if (ruolo.slug === 'guardia-mannara') {
                  return (
                    <button
                      key={ruolo.slug}
                      type="button"
                      className="chip"
                      disabled={!guardiePresenti}
                      onClick={() => setQuantita(ruolo.slug, 1)}
                    >
                      {ruolo.nome}
                      {!guardiePresenti && ' (richiede le Guardie)'}
                    </button>
                  )
                }

                return (
                  <button
                    key={ruolo.slug}
                    type="button"
                    className="chip"
                    onClick={() => (ruolo.slug === 'guardia' ? toggleGuardie(0) : setQuantita(ruolo.slug, 1))}
                  >
                    {etichettaRuolo(ruolo)}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </section>
  )
}
