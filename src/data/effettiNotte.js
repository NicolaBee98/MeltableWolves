export function aggiungiCondizionePatch(giocatore, condizione) {
  if (giocatore.condizioni.includes(condizione)) return null
  return { condizioni: [...giocatore.condizioni, condizione] }
}

export function uccidiPatch(giocatore, round, { ignoraProtezione = false } = {}) {
  if (!ignoraProtezione && giocatore.condizioni.includes('protetto')) return null
  return { vivo: false, causaMorte: 'notte', mortoNotte: round }
}

export function resuscitaPatch(giocatore) {
  if (giocatore.vivo) return null
  return { vivo: true, condizioni: [...giocatore.condizioni, 'resuscitato'] }
}

export function usatoStanotte(giocatori, ruoli, potereSlug) {
  return giocatori.some((g) => ruoli.includes(g.ruoloSlug) && (g.usiNotte ?? []).includes(potereSlug))
}

export function segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potereSlug) {
  giocatori
    .filter((g) => ruoli.includes(g.ruoloSlug))
    .forEach((g) => aggiornaGiocatore(g.id, { usiNotte: [...(g.usiNotte ?? []), potereSlug] }))
}

// ponytail: assume una sola coppia di innamorati in gioco (nessun partnerId è
// tracciato). Se il narratore ne crea più di una a mano, muoiono tutti insieme
// al primo lutto: da rivedere con un legame per-coppia se servirà davvero.
export function applicaCrepacuore(giocatori, idAppenaMorto) {
  const morto = giocatori.find((g) => g.id === idAppenaMorto)
  if (!morto?.condizioni?.includes('innamorato')) return giocatori

  return giocatori.map((g) =>
    g.id !== idAppenaMorto && g.vivo && g.condizioni.includes('innamorato')
      ? { ...g, vivo: false, causaMorte: 'crepacuore' }
      : g,
  )
}
