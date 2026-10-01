import { ROLES } from './roles'

// applica una mappa {id: patch} (come quelle ritornate da risolviLegami/
// risolviCortigiana) a una lista di giocatori, senza richiamare
// aggiornaGiocatore per ogni voce: usata dove serve un unico aggiornamento
// di stato atomico invece di una serie di setState separati.
export function applicaPatchMap(giocatori, patchMap) {
  return giocatori.map((g) => (patchMap[g.id] ? { ...g, ...patchMap[g.id] } : g))
}

export function risolviLegami(giocatori) {
  const patch = {}

  // il Cavaliere va risolto prima: se salva X, un Apprendista legato a X non
  // deve ereditarne il ruolo (X è tornato vivo)
  const salvati = new Set()
  for (const attore of giocatori) {
    if (!attore.vivo || attore.legame?.tipo !== 'cavaliere') continue
    const target = giocatori.find((g) => g.id === attore.legame.targetId)
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
      legame: null,
    }
  }

  for (const attore of giocatori) {
    if (!attore.vivo || !attore.legame || attore.legame.tipo === 'cavaliere') continue
    const target = giocatori.find((g) => g.id === attore.legame.targetId)
    if (!target || target.vivo || salvati.has(target.id)) continue

    // maestro con ruolo ancora sconosciuto: l'apprendista resta legato e aspetta
    if (attore.legame.tipo === 'apprendista' && target.ruoloSlug) {
      patch[attore.id] = { ruoloSlug: target.ruoloSlug, legame: null }
    }

    if (attore.legame.tipo === 'figlia-dei-lupi') {
      patch[attore.id] = { ruoloSlug: 'lupo-mannaro', legame: null }
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

    const clienteFazione = ROLES.find((r) => r.slug === cliente.ruoloSlug)?.fazione
    // muore se visita direttamente un Lupo Mannaro o il Chupacabra, oppure se
    // il cliente viene sbranato dal branco o ucciso dal Chupacabra quella
    // stessa notte — non se il cliente muore per la pozione mortale della
    // Strega o per qualunque altra causa (mortoDa distingue il "come", vedi
    // uccidiPatch in effettiNotte.js)
    const clientePericoloso = clienteFazione === 'lupi' || cliente.ruoloSlug === 'chupacabra'
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
