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
const LEGAMI_PRIMA_NOTTE = ['apprendista', 'cavaliere', 'figlia-dei-lupi']
export const MARCATORE_LEGAME_EREDITATO = 'legame-ereditato'

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
      patch[target.id] = { vivo: true, causaMorte: undefined, mortoNotte: undefined, mortoDa: undefined }
      patch[attore.id] = {
        vivo: false,
        causaMorte: 'sacrificio',
        mortoNotte: target.causaMorte === 'rogo' ? undefined : target.mortoNotte,
        // marcatore del sacrificio al rogo (round del rogo): la UI del giorno
        // lo riconosce da qui, dato che mortoNotte resta undefined
        sacrificioRogoRound: target.causaMorte === 'rogo' ? target.mortoNotte : undefined,
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

      // maestro con ruolo ancora sconosciuto: l'apprendista resta legato e aspetta
      if (legame.tipo === 'apprendista' && target.ruoloSlug) {
        // l'Apprendista scambia la carta: i poteri già usati dal maestro (pozioni
        // della Strega, resurrezione di Guaritore/Sciacallo...) restano usati
        // un Cavaliere/Figlia/Apprendista ereditato ha il legame già "scarico":
        // resta null e il passo non chiede di sceglierlo (marcatore `legame-ereditato`)
        const usati = [...(target.poteriUsati ?? []), ...(LEGAMI_PRIMA_NOTTE.includes(target.ruoloSlug) ? [MARCATORE_LEGAME_EREDITATO] : [])]
        patch[attore.id] = {
          ...patch[attore.id],
          ruoloSlug: target.ruoloSlug,
          storiaRuoli: conRuolo(attore.storiaRuoli, target.ruoloSlug),
          [campo]: null,
          // marcatore per l'annuncio dell'alba (vedi annunciAlba): vale solo
          // per una morte notturna, il rogo non ha un "round dell'alba"
          ...(target.causaMorte !== 'rogo' && target.mortoNotte !== undefined
            ? { ereditaNotte: target.mortoNotte, ereditaDa: target.id }
            : {}),
          ...(usati.length ? { poteriUsati: [...new Set([...(attore.poteriUsati ?? []), ...usati])] } : {}),
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
    const clientePericoloso = eLupo(cliente.ruoloSlug) || cliente.ruoloSlug === 'chupacabra'
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
