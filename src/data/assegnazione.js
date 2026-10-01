export function contaAssegnati(giocatori, slug) {
  // conta su "storiaRuoli" (mai sottratto), non su ruoloSlug corrente: un
  // ruolo già assegnato non torna mai "da assegnare", anche se chi lo teneva
  // cambia carta in seguito (es. Addolorata che scambia ruolo col morto)
  return giocatori.filter((g) => {
    // [] (salvataggi vecchi) vale come "nessuna storia": ripiega su ruoloSlug
    const storia = g.storiaRuoli?.length ? g.storiaRuoli : [g.ruoloSlug]
    // il Mimo che copia un ruolo non consuma una carta: la carta è del bersaglio
    if (storia.includes('mimo') && slug !== 'mimo') return false
    return storia.includes(slug)
  }).length
}

export function ruoliAssegnabili(ruoli, giocatori, quantita) {
  return ruoli.filter((slug) => contaAssegnati(giocatori, slug) < (quantita[slug] ?? 1))
}

// Guardia e Guardia Mannara sono la stessa carta agli occhi del narratore
// (pag. 8: "non è noto chi tra le Guardie patteggi per il branco"): si
// scelgono insieme come un unico gruppo ("le tre guardie"), mai indicando
// chi in particolare è la traditrice. Una volta che il gruppo è al completo,
// questa funzione ne sceglie una a caso per l'app (serve comunque un
// ruoloSlug reale per aura/fazione/vittoria), senza mostrarlo da nessuna
// parte al narratore.
// Fisher-Yates: sort(() => random - 0.5) non è uniforme
function mescola(lista) {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function assegnaGuardiaMannaraCasuale(giocatori, aggiornaGiocatore, quantita) {
  const daAssegnare = (quantita['guardia-mannara'] ?? 0) - contaAssegnati(giocatori, 'guardia-mannara')
  if (daAssegnare <= 0) return
  const guardieSenzaTradimento = giocatori.filter((g) => g.ruoloSlug === 'guardia')
  const scelte = mescola(guardieSenzaTradimento).slice(0, daAssegnare)
  for (const g of scelte) {
    aggiornaGiocatore(g.id, {
      ruoloSlug: 'guardia-mannara',
      storiaRuoli: [...(g.storiaRuoli ?? []).filter((s) => s !== 'guardia'), 'guardia-mannara'],
    })
  }
}
