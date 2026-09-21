import { ROLES } from '../../data/roles'
import { validaMazzo } from '../../data/validaMazzo'

const FAZIONI_ORDINE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']
const FAZIONE_LABEL = {
  villaggio: 'Villaggio',
  lupi: 'Lupi',
  indipendente: 'Indipendenti',
  sconosciuto: 'Sconosciuti',
}
// ruoli "infiniti": la chip disponibile resta sempre cliccabile per
// aggiungerne un'altra unità, invece di sparire dopo il primo click
const RUOLI_INFINITI = ['villico', 'lupo-mannaro']

export function MazzoBuilder({ quantita, setQuantita }) {
  const avvisi = validaMazzo(quantita)
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

  // per i ruoli infiniti e per la Guardia (coppia fissa) ogni unità nel
  // mazzo compare come una chip numerata a sé, invece di un unico stepper
  function chipsNelMazzoPer(ruolo) {
    const valore = quantita[ruolo.slug] ?? 0

    if (RUOLI_INFINITI.includes(ruolo.slug)) {
      return Array.from({ length: valore }, (_, i) => ({
        key: `${ruolo.slug}-${i}`,
        etichetta: `${ruolo.nome} ${i + 1}`,
        onRimuovi: () => setQuantita(ruolo.slug, valore - 1),
      }))
    }

    if (ruolo.slug === 'guardia') {
      return Array.from({ length: valore }, (_, i) => ({
        key: `guardia-${i}`,
        etichetta: `Guardia ${i + 1}`,
        onRimuovi: () => toggleGuardie(2),
      }))
    }

    return [{ key: ruolo.slug, etichetta: ruolo.nome, onRimuovi: () => setQuantita(ruolo.slug, 0) }]
  }

  return (
    <section className="mazzo-builder">
      <div className="mazzo-builder__nel-mazzo">
        <h3>Nel mazzo ({totaleRuoli})</h3>
        {ruoliNelMazzo.length === 0 ? (
          <p className="mazzo-builder__vuoto">Nessuna carta selezionata.</p>
        ) : (
          <div className="scelta-giocatore__chips" role="group" aria-label="Ruoli nel mazzo">
            {ruoliNelMazzo.flatMap((ruolo) =>
              chipsNelMazzoPer(ruolo).map((chip) => (
                <button key={chip.key} type="button" className="chip" aria-pressed="true" onClick={chip.onRimuovi}>
                  {chip.etichetta} ✕
                </button>
              )),
            )}
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
        const disponibili = ROLES.filter(
          (ruolo) =>
            ruolo.fazione === fazione &&
            (RUOLI_INFINITI.includes(ruolo.slug) || (quantita[ruolo.slug] ?? 0) === 0),
        )
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

                if (ruolo.slug === 'guardia') {
                  return (
                    <button key={ruolo.slug} type="button" className="chip" onClick={() => toggleGuardie(0)}>
                      Guardie
                    </button>
                  )
                }

                const valore = quantita[ruolo.slug] ?? 0
                return (
                  <button
                    key={ruolo.slug}
                    type="button"
                    className="chip"
                    onClick={() => setQuantita(ruolo.slug, valore + 1)}
                  >
                    {ruolo.nome}
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
