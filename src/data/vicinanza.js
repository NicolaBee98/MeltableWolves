export function vicini(giocatori, id) {
  const indice = giocatori.findIndex((g) => g.id === id)
  if (indice === -1) return { sinistra: null, destra: null }

  const sinistra = giocatori[(indice - 1 + giocatori.length) % giocatori.length] ?? null
  const destra = giocatori[(indice + 1) % giocatori.length] ?? null

  return { sinistra, destra }
}

export function viciniVivi(giocatori, id) {
  const indice = giocatori.findIndex((g) => g.id === id)
  if (indice === -1) return { sinistra: null, destra: null }

  const n = giocatori.length

  function trovaVivo(direzione) {
    for (let passo = 1; passo < n; passo++) {
      const posizione = (((indice + direzione * passo) % n) + n) % n
      const candidato = giocatori[posizione]
      if (candidato.vivo) return candidato
    }
    return null
  }

  return { sinistra: trovaVivo(-1), destra: trovaVivo(1) }
}
