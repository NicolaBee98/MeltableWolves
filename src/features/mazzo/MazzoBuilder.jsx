import { useState } from 'react'
import { ROLES } from '../../data/roles'
import { validaMazzo } from '../../data/validaMazzo'
import { RuoloIcona } from '../../components/RuoloIcona'
import { iconaPath } from '../../data/assetRuoli'

const FAZIONI_ORDINE = ['villaggio', 'lupi', 'indipendente', 'sconosciuto']
const FAZIONE_LABEL = {
  villaggio: 'Villaggio',
  lupi: 'Lupi',
  indipendente: 'Indipendenti',
  // "sconosciuto" durante la scelta del mazzo: sono sia ruoli il cui esito
  // è ignoto all'inizio (Ladro, Mimo) sia voltagabbana (Mezzosangue, Figlia
  // dei Lupi), "Variabili" descrive meglio entrambi i casi
  sconosciuto: 'Variabili',
}
const FAZIONE_ICONA = {
  villaggio: iconaPath('icona_fazione_villaggio'),
  lupi: iconaPath('icona_fazione_branco'),
  indipendente: iconaPath('icona_fazione_indipendente'),
  sconosciuto: iconaPath('icona_ruolo_sconosciuto_cerchiato'),
}
// ruoli "infiniti": la chip disponibile resta sempre cliccabile per
// aggiungerne un'altra unità, invece di sparire dopo il primo click
const RUOLI_INFINITI = ['villico', 'lupo-mannaro']
// non sono carte distribuite come le altre all'inizio (il Borgomastro è un
// titolo per elezione, il Fantasma Onnisciente si riceve solo alla morte,
// vedi RUOLI_RIVELAZIONE_GIORNO/RUOLI_RIVELAZIONE_ALLA_MORTE): la chip si
// distingue con un colore diverso per non farli sembrare carte "normali"
const RUOLI_NON_CARTA_DISTRIBUITA = ['borgomastro', 'fantasma-onnisciente']
// durata dell'animazione di dissolvenza di una chip che lascia i
// "disponibili" perché appena aggiunta al mazzo (vedi .chip--uscendo)
const DURATA_USCITA_MS = 200

export function MazzoBuilder({ quantita, setQuantita }) {
  const [uscenti, setUscenti] = useState(() => new Set())
  const avvisi = validaMazzo(quantita)
  const guardiePresenti = (quantita.guardia ?? 0) > 0
  const ladroPresente = (quantita.ladro ?? 0) > 0
  const ruoliNelMazzo = ROLES.filter((ruolo) => (quantita[ruolo.slug] ?? 0) > 0)
  const totaleRuoli = ruoliNelMazzo.reduce((somma, ruolo) => somma + (quantita[ruolo.slug] ?? 0), 0)

  // il ruolo resta visibile (ma disabilitato, in dissolvenza) tra i
  // "disponibili" ancora per la durata dell'animazione, invece di sparire
  // di scatto nello stesso istante in cui passa a "Nel mazzo"
  function selezionaConDissolvenza(slug, aggiorna) {
    aggiorna()
    setUscenti((prev) => new Set(prev).add(slug))
    setTimeout(() => {
      setUscenti((prev) => {
        if (!prev.has(slug)) return prev
        const next = new Set(prev)
        next.delete(slug)
        return next
      })
    }, DURATA_USCITA_MS)
  }

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
        slug: ruolo.slug,
        etichetta: `${ruolo.nome} ${i + 1}`,
        onRimuovi: () => setQuantita(ruolo.slug, valore - 1),
      }))
    }

    if (ruolo.slug === 'guardia') {
      return Array.from({ length: valore }, (_, i) => ({
        key: `guardia-${i}`,
        slug: 'guardia',
        etichetta: `Guardia ${i + 1}`,
        onRimuovi: () => toggleGuardie(2),
      }))
    }

    return [{ key: ruolo.slug, slug: ruolo.slug, etichetta: ruolo.nome, onRimuovi: () => setQuantita(ruolo.slug, 0) }]
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
                <button
                  key={chip.key}
                  type="button"
                  className={`chip${
                    RUOLI_NON_CARTA_DISTRIBUITA.includes(chip.slug)
                      ? ' chip--non-distribuita'
                      : ` chip--fazione-${ruolo.fazione}`
                  }`}
                  aria-pressed="true"
                  onClick={chip.onRimuovi}
                >
                  <RuoloIcona slug={chip.slug} size={20} />
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
        <p className="mazzo-builder__nota-ladro">
          ℹ️ Il Ladro richiede due carte in più nel mazzo fisico (pag. 15): sceglierai quali durante il suo turno,
          la prima notte.
        </p>
      )}

      {((quantita.borgomastro ?? 0) > 0 || (quantita['fantasma-onnisciente'] ?? 0) > 0) && (
        <p className="mazzo-builder__nota-ladro">
          ℹ️ Borgomastro e Fantasma Onnisciente fanno parte del conteggio qui sopra ma non sono ruoli in più per i
          giocatori: nella schermata giocatori non vengono contati{ladroPresente && ' (come le 2 carte extra del Ladro)'}.
        </p>
      )}

      {FAZIONI_ORDINE.map((fazione) => {
        const disponibili = ROLES.filter(
          (ruolo) =>
            ruolo.fazione === fazione &&
            (RUOLI_INFINITI.includes(ruolo.slug) || (quantita[ruolo.slug] ?? 0) === 0 || uscenti.has(ruolo.slug)),
        )
        if (disponibili.length === 0) return null

        return (
          <fieldset key={fazione}>
            <legend>
              {FAZIONE_ICONA[fazione] && (
                <img src={FAZIONE_ICONA[fazione]} alt="" aria-hidden="true" className="mazzo-builder__icona-fazione" />
              )}
              {FAZIONE_LABEL[fazione]}
            </legend>
            <div className="scelta-giocatore__chips" role="group" aria-label={`${FAZIONE_LABEL[fazione]} disponibili`}>
              {disponibili.map((ruolo) => {
                // i ruoli "infiniti" restano sempre tra i disponibili (si
                // può cliccarli di nuovo subito per aggiungerne un'altra
                // copia): niente dissolvenza in uscita per loro, non escono
                // mai davvero dalla lista
                const inUscita = !RUOLI_INFINITI.includes(ruolo.slug) && uscenti.has(ruolo.slug)
                // i colori per fazione (vedi .chip--fazione-* in index.css)
                // si vedono solo nel box "Nel mazzo": tra i disponibili le
                // chip restano tutte bianche, il colore è un'informazione
                // sulla composizione del mazzo, non sul catalogo dei ruoli
                const classe = `chip${inUscita ? ' chip--uscendo' : ''}`

                if (RUOLI_INFINITI.includes(ruolo.slug)) {
                  const valoreInfinito = quantita[ruolo.slug] ?? 0
                  return (
                    <button
                      key={ruolo.slug}
                      type="button"
                      className="chip"
                      onClick={() => setQuantita(ruolo.slug, valoreInfinito + 1)}
                    >
                      <RuoloIcona slug={ruolo.slug} size={22} />
                      {ruolo.nome}
                    </button>
                  )
                }

                if (ruolo.slug === 'guardia-mannara') {
                  return (
                    <button
                      key={ruolo.slug}
                      type="button"
                      className={classe}
                      disabled={!guardiePresenti || inUscita}
                      onClick={() => selezionaConDissolvenza(ruolo.slug, () => setQuantita(ruolo.slug, 1))}
                    >
                      <RuoloIcona slug={ruolo.slug} size={22} />
                      {ruolo.nome}
                      {!guardiePresenti && ' (richiede le Guardie)'}
                    </button>
                  )
                }

                if (ruolo.slug === 'guardia') {
                  return (
                    <button
                      key={ruolo.slug}
                      type="button"
                      className={classe}
                      disabled={inUscita}
                      onClick={() => selezionaConDissolvenza('guardia', () => toggleGuardie(0))}
                    >
                      <RuoloIcona slug={ruolo.slug} size={22} />
                      Guardie
                    </button>
                  )
                }

                const valore = quantita[ruolo.slug] ?? 0
                return (
                  <button
                    key={ruolo.slug}
                    type="button"
                    className={classe}
                    disabled={inUscita}
                    onClick={() => selezionaConDissolvenza(ruolo.slug, () => setQuantita(ruolo.slug, valore + 1))}
                  >
                    <RuoloIcona slug={ruolo.slug} size={22} />
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
