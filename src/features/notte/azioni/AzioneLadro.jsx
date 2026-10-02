import { useState } from 'react'
import { eLupo, nomeRuolo } from '../../../data/roles'
import { ruoliAssegnabili } from '../../../data/assegnazione'

const POTERE = 'ladro-scelta'

// Il mazzo fisico ha due carte in più quando c'è il Ladro (pag. 15): quali
// due ruoli siano non si decide componendo il mazzo, ma qui, quando tocca al
// Ladro guardarle. Le due carte candidate si tengono sul giocatore stesso
// (non in uno stato locale del componente) così sopravvivono a "Indietro" e
// a un refresh come qualunque altra scelta di notte.
export function AzioneLadro({ giocatori, aggiornaGiocatore, ruoliSelezionati = [], quantita = {}, onCambiaQuantita = () => {} }) {
  // il Ladro (e chi lo sta imitando) non si trova più cercando
  // ruoloSlug==='ladro' una volta scelto (la scelta CAMBIA proprio quel
  // ruoloSlug): chi ha già scelto si riconosce da POTERE + storiaRuoli. Si
  // ricalcola a ogni render (non catturato al montaggio): se il narratore
  // sposta la carta da P a Q nello stesso passo, gli attori seguono.
  const attori = giocatori.filter(
    (g) => g.ruoloSlug === 'ladro' || ((g.poteriUsati ?? []).includes(POTERE) && (g.storiaRuoli ?? []).includes('ladro')),
  )
  const ladro = attori[0]
  const [giaUsatoAllIngresso] = useState(() => (ladro?.poteriUsati ?? []).includes(POTERE))
  const usato = (ladro?.poteriUsati ?? []).includes(POTERE)
  const [carta1, carta2] = ladro?.scartoLadro ?? []
  // solo carte non ancora in mano a nessuno ("tra quelle non assegnate a
  // nessuno", come dice il testo sotto): altrimenti si potrebbe scartare la
  // carta di un giocatore che la tiene già fisicamente (es. il bersaglio del
  // Mimo, assegnato un passo prima). Le due carte già scelte restano sempre
  // tra le opzioni: scartandole la quantità scende e non risulterebbero più
  // "disponibili", ma i select devono continuare a mostrarle.
  const disponibili = [
    ...new Set([
      ...ruoliAssegnabili(
        // il Borgomastro è una condizione data a un giocatore a voce (voto
        // doppio), non una carta fisica del mazzo: mai tra le carte rimaste
        ruoliSelezionati.filter((slug) => slug !== 'ladro' && slug !== 'borgomastro'),
        giocatori,
        quantita,
      ),
      ...[carta1, carta2].filter(Boolean),
    ]),
  ]
  const opzioniPrimaCarta = disponibili.filter((slug) => slug !== carta2)
  const opzioniSecondaCarta = disponibili.filter((slug) => slug !== carta1)

  if (giaUsatoAllIngresso) {
    return <p>Il Ladro ha già scelto.</p>
  }

  if (!ladro) return null

  // la regola "entrambe Lupi Mannari: deve scambiare" vale solo per i lupi
  // veri (eLupo), non per Gallo/Mucca/Sciacallo
  const entrambiLupi = Boolean(carta1) && Boolean(carta2) && eLupo(carta1) && eLupo(carta2)

  // la carta non presa dal Ladro resta fuori dal mazzo per il resto della
  // partita (pag. 15): se il Ladro sceglie una delle due, l'altra si scarta;
  // se resta Villico, si scartano entrambe.
  const scartate = (scelta) => (scelta === carta1 ? [carta2] : scelta === carta2 ? [carta1] : [carta1, carta2])

  // la scelta resta modificabile finché non si preme "Avanti": un'unica
  // funzione annulla la scelta precedente (identità, storiaRuoli, poteriUsati,
  // carte scartate rimesse nel mazzo) e applica la nuova; `nuova` null =
  // deselezione, si torna a "non ha scelto". Se il Mimo imita il Ladro (stesso
  // ruoloSlug, vedi AzioneMimo.jsx) la scelta va scritta su ENTRAMBI (attori).
  // `scarto`: nuove carte candidate, se si sta cambiando anche quelle.
  function imposta(nuova, scarto) {
    const precedente = usato ? ladro.ruoloSlug : null

    attori.forEach((g) => {
      const storia = (g.storiaRuoli ?? []).filter((s) => s !== precedente)
      const poteri = (g.poteriUsati ?? []).filter((p) => p !== POTERE)
      aggiornaGiocatore(g.id, {
        ...(scarto ? { scartoLadro: scarto } : {}),
        ...(nuova
          ? { ruoloSlug: nuova, storiaRuoli: [...storia, nuova], poteriUsati: [...poteri, POTERE] }
          : { ruoloSlug: 'ladro', storiaRuoli: storia, poteriUsati: poteri }),
      })
    })

    // quantità nette: la stessa carta rimessa e riscartata non cambia nulla
    const delta = {}
    const somma = (slug, n) => slug && (delta[slug] = (delta[slug] ?? 0) + n)
    if (precedente) scartate(precedente).forEach((s) => somma(s, +1))
    if (nuova) scartate(nuova).forEach((s) => somma(s, -1))
    for (const [slug, n] of Object.entries(delta)) {
      if (n) onCambiaQuantita(slug, Math.max(0, (quantita[slug] ?? 1) + n))
    }
  }

  // cambiando una carta di scarto dopo la scelta, questa decade: si annulla
  // (le quantità tornano com'erano) e il Ladro sceglie di nuovo
  function impostaCarta(indice, slug) {
    const scarto = [carta1, carta2]
    scarto[indice] = slug || undefined
    if (usato) imposta(null, scarto)
    else attori.forEach((g) => aggiornaGiocatore(g.id, { scartoLadro: scarto }))
  }

  // click sulla scelta già fatta: la deseleziona
  function scegli(ruoloSlug) {
    imposta(usato && ruoloSlug === ladro.ruoloSlug ? null : ruoloSlug)
  }

  return (
    <div className="azione-ladro">
      <p>Quali due carte sono rimaste fuori dal mazzo, tra quelle non assegnate a nessuno?</p>
      <div className="azione-ladro__scarto">
        <label>
          <span>Prima carta</span>
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
          <span>Seconda carta</span>
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
            <button
              type="button"
              className="chip"
              aria-pressed={usato && ladro.ruoloSlug === carta1}
              onClick={() => scegli(carta1)}
            >
              {nomeRuolo(carta1)}
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={usato && ladro.ruoloSlug === carta2}
              onClick={() => scegli(carta2)}
            >
              {nomeRuolo(carta2)}
            </button>
            {!entrambiLupi && (
              <button
                type="button"
                className="chip"
                aria-pressed={usato && ladro.ruoloSlug === 'villico'}
                onClick={() => scegli('villico')}
              >
                Resta Villico
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
