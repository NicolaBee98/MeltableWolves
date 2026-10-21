import { eLupo, nomeRuolo } from '../../../data/roles'
import { ruoliAssegnabili, contaAssegnati, eMimoCopiante, conRuolo } from '../../../data/assegnazione'

const POTERE = 'ladro-scelta'

// il Ladro che non ha scelto (Avanti senza scelta) può solo restare Villico
export const ladroDaScegliere = (g) =>
  g.ruoloSlug === 'ladro' && !eMimoCopiante(g) && !(g.poteriUsati ?? []).includes(POTERE)
export const ladroDeveScambiare = (g) => {
  const [a, b] = g.scartoLadro ?? []
  return Boolean(a) && Boolean(b) && eLupo(a) && eLupo(b)
}

// "Resta Villico" fatto da Avanti: stesse conseguenze del chip (ruolo, storia,
// potere usato, due carte scartate dal mazzo); senza le due carte nessuno scarto
export function ladroRestaVillico(g, quantita, aggiornaGiocatore, onCambiaQuantita) {
  aggiornaGiocatore(g.id, {
    ruoloSlug: 'villico',
    storiaRuoli: conRuolo(g.storiaRuoli, 'villico'),
    poteriUsati: [...(g.poteriUsati ?? []), POTERE],
  })
  const [a, b] = g.scartoLadro ?? []
  if (!a || !b) return
  for (const slug of new Set([a, b])) {
    const n = a === b ? 2 : 1
    onCambiaQuantita(slug, Math.max(0, (quantita[slug] ?? 1) - n))
  }
}

// una chip per carta (doppioni una volta sola); il Villico è "Resta Villico"
function ChipsCarte({ etichetta, carte, scelta, onScegli }) {
  return (
    <div className="scelta-giocatore__chips" role="group" aria-label={etichetta}>
      {[...new Set(carte)].map((slug) => (
        <button key={slug} type="button" className="chip" aria-pressed={scelta === slug} onClick={() => onScegli(slug)}>
          {slug === 'villico' ? 'Resta Villico' : nomeRuolo(slug)}
        </button>
      ))}
    </div>
  )
}

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
  // il Ladro vero sceglie per primo; il Mimo che lo imita (se c'è) subito
  // dopo, tra le carte rimaste
  const ladro = attori.find((g) => !eMimoCopiante(g)) ?? attori[0]
  // solo un Mimo che imita davvero il Ladro (non un secondo Ladro, né nessuno)
  const mimo = attori.find((g) => g !== ladro && eMimoCopiante(g) && g.legame?.tipo === 'mimo' && g.legame.targetId === ladro?.id)
  const haScelto = (g) => (g?.poteriUsati ?? []).includes(POTERE)
  const usato = haScelto(ladro)
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
        // Borgomastro e Fantasma Onnisciente non sono carte fisiche del mazzo (il
        // primo è un voto doppio dato a voce, il secondo si prende da un morto):
        // mai tra le carte rimaste. La Suocera invece è una carta vera
        ruoliSelezionati.filter((slug) => !['ladro', 'borgomastro', 'fantasma-onnisciente'].includes(slug)),
        giocatori,
        quantita,
      ),
      ...[carta1, carta2].filter(Boolean),
    ]),
  ]
  // le due carte possono essere dello stesso ruolo (es. due Lupi), se il mazzo
  // ne ha ancora due da assegnare o se è già così
  const puoRipetersi = (slug) =>
    carta1 === carta2 || (quantita[slug] ?? 1) - contaAssegnati(giocatori, slug) >= 2
  const opzioniCarta = (altra) => disponibili.filter((slug) => slug !== altra || puoRipetersi(slug))

  if (!ladro) return null

  // la regola "entrambe Lupi Mannari: deve scambiare" vale solo per i lupi
  // veri (eLupo), non per Gallo/Mucca/Sciacallo
  const entrambiLupi = ladroDeveScambiare(ladro)

  // la carta non presa dal Ladro resta fuori dal mazzo per il resto della
  // partita (pag. 15): se il Ladro sceglie una delle due, l'altra si scarta;
  // se resta Villico, si scartano entrambe.
  const scartate = (scelta) => (scelta === carta1 ? [carta2] : scelta === carta2 ? [carta1] : [carta1, carta2])

  // scrive la scelta di UN attore, annullando la sua precedente (identità,
  // storiaRuoli, poteriUsati); `nuova` null = deselezione, torna a "non ha
  // scelto". `scarto`: nuove carte candidate, se si sta cambiando anche quelle.
  function scrivi(g, nuova, scarto) {
    const precedente = haScelto(g) ? g.ruoloSlug : null
    const storia = (g.storiaRuoli ?? []).filter((s) => s !== precedente)
    const poteri = (g.poteriUsati ?? []).filter((p) => p !== POTERE)
    aggiornaGiocatore(g.id, {
      ...(scarto ? { scartoLadro: scarto } : {}),
      ...(nuova
        ? { ruoloSlug: nuova, storiaRuoli: conRuolo(storia, nuova), poteriUsati: [...poteri, POTERE] }
        : { ruoloSlug: 'ladro', storiaRuoli: storia, poteriUsati: poteri }),
    })
  }

  // la scelta resta modificabile finché non si preme "Avanti": annulla la
  // scelta precedente del Ladro e applica la nuova, rimettendo nel mazzo le
  // carte scartate prima. Se cambia la scelta del Ladro, quella del Mimo
  // (fatta tra le carte che restavano) decade e va rifatta.
  function imposta(nuova, scarto) {
    const precedente = usato ? ladro.ruoloSlug : null

    attori.forEach((g) => scrivi(g, g === ladro ? nuova : null, scarto))

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

  // il Mimo che imita il Ladro scambia la propria carta con una di quelle
  // rimaste dopo il Ladro (una sola, o entrambe se il Ladro resta Villico).
  // Quella carta è già fuori dal mazzo (scartata nel conto del Ladro): il
  // Mimo la copia, non la occupa
  function scegliMimo(ruoloSlug) {
    scrivi(mimo, haScelto(mimo) && ruoloSlug === mimo.ruoloSlug ? null : ruoloSlug)
  }
  const rimaste = usato ? scartate(ladro.ruoloSlug) : []

  return (
    <div className="azione-ladro">
      <p>Quali due carte sono rimaste fuori dal mazzo, tra quelle non assegnate a nessuno?</p>
      <div className="azione-ladro__scarto">
        {[
          ['Prima carta', carta1, carta2],
          ['Seconda carta', carta2, carta1],
        ].map(([etichetta, carta, altra], indice) => (
          <label key={etichetta}>
            <span>{etichetta}</span>
            <select value={carta ?? ''} onChange={(e) => impostaCarta(indice, e.target.value)}>
              <option value="">— scegli —</option>
              {opzioniCarta(altra).map((slug) => (
                <option key={slug} value={slug}>
                  {nomeRuolo(slug)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {carta1 && carta2 && (
        <>
          <p>
            Il Ladro guarda le due carte rimaste: {nomeRuolo(carta1)} e {nomeRuolo(carta2)}.
          </p>
          <ChipsCarte
            etichetta="Cosa sceglie il Ladro"
            carte={[carta1, carta2, ...(entrambiLupi ? [] : ['villico'])]}
            scelta={usato && ladro.ruoloSlug}
            onScegli={scegli}
          />
        </>
      )}

      {mimo && usato && (
        <>
          <p>Ora sceglie {mimo.nome} (Mimo, imita il Ladro), tra le carte rimaste.</p>
          <ChipsCarte
            etichetta="Cosa sceglie il Mimo"
            carte={[...rimaste, 'villico']}
            scelta={haScelto(mimo) && mimo.ruoloSlug}
            onScegli={scegliMimo}
          />
        </>
      )}
    </div>
  )
}
