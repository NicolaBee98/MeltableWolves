import { ROLES } from './roles'

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
      if (target.causaMorte === 'notte') {
        patch[target.id] = { vivo: true }
      }
      patch[attore.id] = { vivo: false, legame: null }
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
  const clienteELupo = clienteFazione === 'lupi'
  const clienteMortoDiNotte = !cliente.vivo && cliente.causaMorte === 'notte'

  if (clienteELupo || clienteMortoDiNotte) {
    return { [cortigiana.id]: { vivo: false, visitaNotturna: null } }
  }

  return { [cortigiana.id]: { visitaNotturna: null } }
}
