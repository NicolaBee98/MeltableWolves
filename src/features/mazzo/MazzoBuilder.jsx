import { ROLES } from '../../data/roles'
import { validaMazzo } from '../../data/validaMazzo'
import { maxQuantita } from '../../data/quantitaRuoli'

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

export function MazzoBuilder({ quantita, setQuantita, scartoLadro = [], setScartoLadro = () => {} }) {
  const avvisi = validaMazzo(quantita)
  const guardiePresenti = (quantita.guardia ?? 0) > 0
  const ladroPresente = (quantita.ladro ?? 0) > 0
  const ruoliNelMazzo = ROLES.filter((ruolo) => (quantita[ruolo.slug] ?? 0) > 0)
  const totaleRuoli = ruoliNelMazzo.reduce((somma, ruolo) => somma + (quantita[ruolo.slug] ?? 0), 0)
  // carte ancora "coperte" da poter scegliere come scarto per il Ladro: non
  // già al massimo di copie disponibili nel mazzo reale (pag. 15: sono due
  // carte fisiche in più, non possono duplicare una carta a copia unica
  // già usata)
  const ruoliScartabili = ROLES.filter((ruolo) => (quantita[ruolo.slug] ?? 0) < maxQuantita(ruolo.slug))

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

      {ladroPresente && (
        <fieldset className="mazzo-builder__scarto-ladro">
          <legend>Carte di scarto per il Ladro (pag. 15: due carte in più, non assegnate a nessuno)</legend>
          {[0, 1].map((indice) => (
            <label key={indice}>
              Carta {indice + 1}
              <select value={scartoLadro[indice] ?? ''} onChange={(e) => setScartoLadro(indice, e.target.value)}>
                <option value="">— nessuna —</option>
                {ruoliScartabili.map((ruolo) => (
                  <option key={ruolo.slug} value={ruolo.slug}>
                    {ruolo.nome}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </fieldset>
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
