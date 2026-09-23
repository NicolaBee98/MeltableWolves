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

  for (const attore of giocatori) {
    if (!attore.legame) continue
    const target = giocatori.find((g) => g.id === attore.legame.targetId)
    if (!target || target.vivo) continue

    if (attore.legame.tipo === 'apprendista') {
      patch[attore.id] = { ruoloSlug: target.ruoloSlug, legame: null }
    }

    if (attore.legame.tipo === 'cavaliere') {
      // "Se questa persona viene sbranata di notte il Cavaliere muore al suo
      // posto; se invece viene messa al rogo di giorno il Cavaliere rivela
      // la propria carta immolandosi al suo posto" (pag. 11): in entrambi i
      // casi il bersaglio sopravvive. causaMorte del bersaglio va ripulita,
      // altrimenti resterebbe segnato come "morto al rogo" pur essendo vivo
      // (es. per l'Addolorata, che cerca la vittima del rogo tramite quel campo).
      if (target.causaMorte === 'notte' || target.causaMorte === 'rogo') {
        patch[target.id] = { vivo: true, causaMorte: undefined }
      }
      patch[attore.id] = { vivo: false, causaMorte: 'sacrificio', mortoNotte: target.mortoNotte, legame: null }
    }

    if (attore.legame.tipo === 'figlia-dei-lupi') {
      patch[attore.id] = { ruoloSlug: 'lupo-mannaro', legame: null }
    }
  }

  return patch
}

export function risolviCortigiana(giocatori) {
  const cortigiana = giocatori.find((g) => g.ruoloSlug === 'cortigiana')
  if (!cortigiana || !cortigiana.vivo || !cortigiana.visitaNotturna) return {}

  const cliente = giocatori.find((g) => g.id === cortigiana.visitaNotturna)
  if (!cliente) return { [cortigiana.id]: { visitaNotturna: null } }

  const clienteFazione = ROLES.find((r) => r.slug === cliente.ruoloSlug)?.fazione
  // muore se visita direttamente un Lupo Mannaro o il Chupacabra, oppure se
  // il cliente viene sbranato dal branco o ucciso dal Chupacabra quella
  // stessa notte — non se il cliente muore per la pozione mortale della
  // Strega o per qualunque altra causa (mortoDa distingue il "come", vedi
  // uccidiPatch in effettiNotte.js)
  const clientePericoloso = clienteFazione === 'lupi' || cliente.ruoloSlug === 'chupacabra'
  const clienteSbranato = !cliente.vivo && (cliente.mortoDa === 'branco' || cliente.mortoDa === 'chupacabra')

  if (clientePericoloso || clienteSbranato) {
    return { [cortigiana.id]: { vivo: false, visitaNotturna: null } }
  }

  return { [cortigiana.id]: { visitaNotturna: null } }
}
