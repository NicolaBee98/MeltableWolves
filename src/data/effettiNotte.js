export function aggiungiCondizionePatch(giocatore, condizione) {
  if (giocatore.condizioni.includes(condizione)) return null
  return { condizioni: [...giocatore.condizioni, condizione] }
}

export function uccidiPatch(giocatore) {
  if (giocatore.condizioni.includes('protetto')) return null
  return { vivo: false, causaMorte: 'notte' }
}

export function resuscitaPatch(giocatore) {
  if (giocatore.vivo) return null
  return { vivo: true, condizioni: [...giocatore.condizioni, 'resuscitato'] }
}
