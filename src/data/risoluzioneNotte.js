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
