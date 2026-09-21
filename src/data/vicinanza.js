export function vicini(giocatori, id) {
  const indice = giocatori.findIndex((g) => g.id === id)
  if (indice === -1) return { sinistra: null, destra: null }

  const sinistra = giocatori[(indice - 1 + giocatori.length) % giocatori.length] ?? null
  const destra = giocatori[(indice + 1) % giocatori.length] ?? null

  return { sinistra, destra }
}

// scansiona i posti a sedere allontanandosi dal giocatore `id` (destra e
// sinistra in parallelo, un passo alla volta) e ritorna il primo che
// soddisfa `predicate`. A parità di distanza vince la destra: caso raro,
// il narratore può comunque correggere a mano.
export function vicinoPiuVicinoChe(giocatori, id, predicate) {
  const indice = giocatori.findIndex((g) => g.id === id)
  if (indice === -1) return null

  const n = giocatori.length
  for (let passo = 1; passo < n; passo++) {
    const destra = giocatori[(indice + passo) % n]
    const sinistra = giocatori[(indice - passo + n) % n]
    if (destra && predicate(destra)) return destra
    if (sinistra && predicate(sinistra)) return sinistra
  }
  return null
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
