export function contaAssegnati(giocatori, slug) {
  // conta su "storiaRuoli" (mai sottratto), non su ruoloSlug corrente: un
  // ruolo già assegnato non torna mai "da assegnare", anche se chi lo teneva
  // cambia carta in seguito (es. Addolorata che scambia ruolo col morto)
  return giocatori.filter((g) => (g.storiaRuoli ?? [g.ruoloSlug]).includes(slug)).length
}

export function ruoliAssegnabili(ruoli, giocatori, quantita) {
  return ruoli.filter((slug) => contaAssegnati(giocatori, slug) < (quantita[slug] ?? 1))
}
