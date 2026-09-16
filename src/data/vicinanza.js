export function vicini(giocatori, id) {
  const indice = giocatori.findIndex((g) => g.id === id)
  if (indice === -1) return { sinistra: null, destra: null }

  const sinistra = giocatori[(indice - 1 + giocatori.length) % giocatori.length] ?? null
  const destra = giocatori[(indice + 1) % giocatori.length] ?? null

  return { sinistra, destra }
}
