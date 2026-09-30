import { useState } from 'react'
import { ROLES, nomeRuolo } from '../../../data/roles'
import { ruoliAssegnabili } from '../../../data/assegnazione'
import { aggiornaTuttiConRuolo } from '../../../data/effettiNotte'

const POTERE = 'ladro-scelta'

// Il mazzo fisico ha due carte in più quando c'è il Ladro (pag. 15): quali
// due ruoli siano non si decide componendo il mazzo, ma qui, quando tocca al
// Ladro guardarle. Le due carte candidate si tengono sul giocatore stesso
// (non in uno stato locale del componente) così sopravvivono a "Indietro" e
// a un refresh come qualunque altra scelta di notte.
export function AzioneLadro({ giocatori, aggiornaGiocatore, ruoliSelezionati = [], quantita = {}, onCambiaQuantita = () => {} }) {
  // il Ladro (e chi lo sta imitando, vedi attori più sotto) non si trova più
  // cercando ruoloSlug==='ladro' una volta scelto (la scelta finale CAMBIA
  // proprio quel ruoloSlug): il gruppo di id si cattura quindi una volta
  // sola, al montaggio di questo passo — non cambia più dopo
  const [ladroIds] = useState(() => giocatori.filter((g) => g.ruoloSlug === 'ladro').map((g) => g.id))
  const ladro = giocatori.find((g) => ladroIds.includes(g.id))
  const [giaUsatoAllIngresso] = useState(() => (ladro?.poteriUsati ?? []).includes(POTERE))
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

  if (giaUsatoAllIngresso) {
    return <p>Il Ladro ha già scelto.</p>
  }

  if (!ladro) return null

  const entrambiLupi =
    Boolean(carta1) &&
    Boolean(carta2) &&
    [carta1, carta2].every((slug) => ROLES.find((r) => r.slug === slug)?.fazione === 'lupi')

  // se il Mimo sta imitando il Ladro (stesso ruoloSlug 'ladro', vedi
  // AzioneMimo.jsx: "si sveglia da solo insieme a lui"), scarto e scelta
  // finale vanno scritti su ENTRAMBI, non solo sul primo trovato —
  // altrimenti il Mimo resterebbe "ladro" per sempre anche dopo che il vero
  // Ladro ha già scelto un'altra identità. Individuati per id (ladroIds),
  // non per ruoloSlug attuale: quello cambia proprio con la scelta.
  const attori = giocatori.filter((g) => ladroIds.includes(g.id))

  function impostaCarta(indice, slug) {
    const scarto = [carta1, carta2]
    scarto[indice] = slug || undefined
    aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'ladro', { scartoLadro: scarto })
  }

  // la carta non presa dal Ladro resta fuori dal mazzo per il resto della
  // partita (pag. 15): se il Ladro sceglie una delle due, l'altra si scarta;
  // se resta Villico, si scartano entrambe. `segno` +1 la rimette nel
  // mazzo (si sta annullando una scelta precedente), -1 la scarta.
  function scartaCarta(slug, segno) {
    if (!slug) return
    onCambiaQuantita(slug, Math.max(0, (quantita[slug] ?? 1) + segno))
  }

  // la scelta resta modificabile finché non si preme "Avanti": scegliendo
  // di nuovo si annulla in un colpo solo (stesso patch) l'identità e lo
  // scarto della scelta precedente, applicando la nuova
  function scegli(ruoloSlug) {
    if (ruoloSlug === ladro.ruoloSlug) return
    const precedente = usato ? ladro.ruoloSlug : null

    attori.forEach((g) => {
      const storiaSenzaPrecedente = precedente ? (g.storiaRuoli ?? []).filter((s) => s !== precedente) : (g.storiaRuoli ?? [])
      aggiornaGiocatore(g.id, {
        ruoloSlug,
        storiaRuoli: [...storiaSenzaPrecedente, ruoloSlug],
        poteriUsati: usato ? g.poteriUsati : [...(g.poteriUsati ?? []), POTERE],
      })
    })

    if (precedente) {
      if (precedente === carta1 || precedente === carta2) {
        scartaCarta(precedente === carta1 ? carta2 : carta1, +1)
      } else {
        scartaCarta(carta1, +1)
        scartaCarta(carta2, +1)
      }
    }
    if (ruoloSlug === carta1 || ruoloSlug === carta2) {
      scartaCarta(ruoloSlug === carta1 ? carta2 : carta1, -1)
    } else {
      scartaCarta(carta1, -1)
      scartaCarta(carta2, -1)
    }
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
