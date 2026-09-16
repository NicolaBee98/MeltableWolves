export function contaAssegnati(giocatori, slug) {
  return giocatori.filter((g) => g.ruoloSlug === slug).length
}

export function ruoliAssegnabili(ruoli, giocatori, quantita) {
  return ruoli.filter((slug) => contaAssegnati(giocatori, slug) < (quantita[slug] ?? 1))
}
