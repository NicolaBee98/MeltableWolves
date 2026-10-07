import { ROLES, eLupo } from './roles'
import { conRuolo } from './assegnazione'

// applica una mappa {id: patch} (come quelle ritornate da risolviLegami/
// risolviCortigiana) a una lista di giocatori, senza richiamare
// aggiornaGiocatore per ogni voce: usata dove serve un unico aggiornamento
// di stato atomico invece di una serie di setState separati.
export function applicaPatchMap(giocatori, patchMap) {
  return giocatori.map((g) => (patchMap[g.id] ? { ...g, ...patchMap[g.id] } : g))
}

// il Mimo ha `legame` occupato dal legame con chi imita: un eventuale legame
// del ruolo copiato (Apprendista, Cavaliere, Figlia dei Lupi) sta in `legameMimo`
const CAMPI_LEGAME = ['legame', 'legameMimo']
export const LEGAMI_PRIMA_NOTTE = ['apprendista', 'cavaliere', 'figlia-dei-lupi']
export const MARCATORE_LEGAME_EREDITATO = 'legame-ereditato'

// Patch di chi prende la carta di `morto` (l'Apprendista dal maestro, l'Addolorata
// dalla vittima del rogo). I poteri "una volta per partita" già usati passano come
// usati. Il legame scelto la prima notte (maestro/protetto/genitore) passa solo se
// `conLegame` e se `morto` non l'aveva ancora attivato (legame ancora presente verso
// uno vivo, diverso da chi eredita): altrimenti l'erede ha un ruolo "scarico" (legame
// vuoto, marcatore `legame-ereditato`). Il Sacerdote non ha legame: nessun marcatore.
export function patchEredita(giocatori, erede, campo, morto, { conLegame = false } = {}) {
  const slug = morto.ruoloSlug
  const legameMorto = [morto.legame, morto.legameMimo].find((l) => l?.tipo === slug)
  const bersaglio = legameMorto && giocatori.find((g) => g.id === legameMorto.targetId)
  const legameVivo = conLegame && bersaglio?.vivo && bersaglio.id !== erede.id
  const usati = [...(morto.poteriUsati ?? []), ...(LEGAMI_PRIMA_NOTTE.includes(slug) && !legameVivo ? [MARCATORE_LEGAME_EREDITATO] : [])]
  return {
    ruoloSlug: slug,
    storiaRuoli: conRuolo(erede.storiaRuoli, slug),
    [campo]: legameVivo ? { tipo: slug, targetId: bersaglio.id } : null,
    ...(usati.length ? { poteriUsati: [...new Set([...(erede.poteriUsati ?? []), ...usati])] } : {}),
  }
}

export function risolviLegami(giocatori) {
  const patch = {}

  // il Cavaliere va risolto prima: se salva X, un Apprendista legato a X non
  // deve ereditarne il ruolo (X è tornato vivo)
  const salvati = new Set()
  for (const attore of giocatori) {
    for (const campo of CAMPI_LEGAME) {
      if (!attore.vivo || attore[campo]?.tipo !== 'cavaliere') continue
      const target = giocatori.find((g) => g.id === attore[campo].targetId)
      if (!target || target.vivo) continue
      // "Se questa persona viene sbranata di notte il Cavaliere muore al suo
      // posto; se invece viene messa al rogo di giorno il Cavaliere rivela la
      // propria carta immolandosi al suo posto" (pag. 11): salva da QUALSIASI
      // causa di morte (Strega e Chupacabra inclusi). causaMorte va ripulita,
      // altrimenti resterebbe "morto al rogo" pur essendo vivo (Addolorata).
      // Se il bersaglio è stato bruciato, il sacrificio non deve comparire
      // come morte "notturna" (mortoNotte del rogo coinciderebbe con il round
      // dell'Alba successiva): mortoNotte resta quindi undefined.
      salvati.add(target.id)
      patch[target.id] = {
        vivo: true,
        causaMorte: undefined,
        mortoNotte: undefined,
        mortoDa: undefined,
        mortoGiorno: undefined,
        giustiziatoDa: undefined,
      }
      patch[attore.id] = {
        vivo: false,
        causaMorte: 'sacrificio',
        mortoNotte: target.causaMorte === 'rogo' ? undefined : target.mortoNotte,
        // marcatore del sacrificio al rogo (round del rogo): la UI del giorno
        // lo riconosce da qui, dato che mortoNotte resta undefined
        // (anche per una morte sul colpo di giorno: round = mortoGiorno; `sacrificioDa`
        // distingue rogo e colpo, per l'Addolorata che scambia solo con le vittime del rogo)
        sacrificioRogoRound: target.causaMorte === 'rogo' ? target.mortoNotte : target.causaMorte === 'colpo' ? target.mortoGiorno : undefined,
        sacrificioDa: target.causaMorte,
        [campo]: null,
      }
    }
  }

  for (const attore of giocatori) {
    for (const campo of CAMPI_LEGAME) {
      const legame = attore[campo]
      if (!attore.vivo || !legame || legame.tipo === 'cavaliere' || legame.tipo === 'mimo') continue
      const target = giocatori.find((g) => g.id === legame.targetId)
      if (!target || target.vivo || salvati.has(target.id)) continue

      // L'Antico morto con la prima vita ancora intera (es. crepacuore) non lascia
      // nulla: l'Apprendista si svela solo alla morte vera, sempre come Villico
      const primaVitaAntico = target.ruoloSlug === 'lantico' && target.anticoSbranatoNotte === undefined
      if (legame.tipo === 'apprendista' && target.ruoloSlug && !primaVitaAntico) {
        // l'Apprendista scambia la carta: i poteri già usati dal maestro (pozioni
        // della Strega, resurrezione di Guaritore/Sciacallo...) restano usati.
        // Un Cavaliere morto senza sacrificarsi ha ancora il legame: l'erede
        // protegge la stessa persona; altrimenti (e per Figlia/Apprendista) il
        // legame è già "scarico" (marcatore `legame-ereditato`)
        patch[attore.id] = {
          ...patch[attore.id],
          ...patchEredita(giocatori, attore, campo, target, { conLegame: target.ruoloSlug === 'cavaliere' }),
          // marcatore per l'annuncio dell'alba (vedi annunciAlba): vale solo
          // per una morte notturna, il rogo non ha un "round dell'alba"
          ...(target.causaMorte !== 'rogo' && target.mortoNotte !== undefined
            ? { ereditaNotte: target.mortoNotte, ereditaDa: target.id }
            : {}),
        }
      }

      // maestro morto con ruolo ancora ignoto (es. Scemo, Boia, Suocera): l'Apprendista
      // si rivela e prende la carta del maestro, che resta ignota per tutti (anche per
      // l'app) finché non viene rivelata (evento speciale sul suo nuovo titolare)
      if (legame.tipo === 'apprendista' && !target.ruoloSlug) {
        patch[attore.id] = {
          ...patch[attore.id],
          [campo]: null,
          // ha la carta ignota del maestro: per l'app il suo ruolo resta ignoto
          ruoloSlug: undefined,
          apprendistaRivelatoDa: target.id,
          ...(target.causaMorte !== 'rogo' && target.mortoNotte !== undefined
            ? { ereditaNotte: target.mortoNotte, ereditaDa: target.id, ereditaIgnota: true }
            : {}),
        }
      }

      if (legame.tipo === 'figlia-dei-lupi') {
        patch[attore.id] = {
          ...patch[attore.id],
          ruoloSlug: 'lupo-mannaro',
          storiaRuoli: conRuolo(attore.storiaRuoli, 'lupo-mannaro'),
          [campo]: null,
          ...(target.causaMorte !== 'rogo' && target.mortoNotte !== undefined ? { figliaLupoNotte: target.mortoNotte } : {}),
        }
      }
    }
  }

  return patch
}

// Con il Mimo più Cortigiane possono condividere lo stesso slug: ognuna
// viene risolta col proprio cliente. Ritorna una mappa {id: patch}.
export function risolviCortigiana(giocatori, round) {
  const patch = {}
  for (const cortigiana of giocatori.filter((g) => g.ruoloSlug === 'cortigiana' && g.vivo && g.visitaNotturna)) {
    const cliente = giocatori.find((g) => g.id === cortigiana.visitaNotturna)
    if (!cliente) {
      patch[cortigiana.id] = { visitaNotturna: null }
      continue
    }

    // muore se visita direttamente un Lupo Mannaro o il Chupacabra, oppure se
    // il cliente viene sbranato dal branco o ucciso dal Chupacabra quella
    // stessa notte — non se il cliente muore per la pozione mortale della
    // Strega o per qualunque altra causa (mortoDa distingue il "come", vedi
    // uccidiPatch in effettiNotte.js)
    // la Figlia dei Lupi diventa lupo all'alba: se il genitore è morto questa notte
    // (figliaLupoNotte) la Cortigiana in visita la trova ancora abitante
    const diventataStanotte = cliente.figliaLupoNotte === round
    const clientePericoloso = (eLupo(cliente.ruoloSlug) && !diventataStanotte) || cliente.ruoloSlug === 'chupacabra'
    const clienteSbranato = !cliente.vivo && (cliente.mortoDa === 'branco' || cliente.mortoDa === 'chupacabra')
    // è protetta solo se lo è il CLIENTE (Paladino o pozione vitale): la
    // protezione sulla Cortigiana stessa non conta, non è in casa
    const clienteProtetto = (cliente.condizioni ?? []).includes('protetto')

    if ((clientePericoloso || clienteSbranato) && !clienteProtetto) {
      // causaMorte/mortoNotte come qualunque altra morte notturna (vedi
      // uccidiPatch): senza, l'Alba non la riconoscerebbe mai come morta
      // quella notte (CAUSE_MORTE_NOTTURNE in AlbaPanel.jsx filtra su
      // mortoNotte === round) e il narratore non la vedrebbe mai annunciata
      patch[cortigiana.id] = { vivo: false, causaMorte: 'notte', mortoNotte: round, visitaNotturna: null }
    } else {
      patch[cortigiana.id] = { visitaNotturna: null }
    }
  }
  return patch
}
