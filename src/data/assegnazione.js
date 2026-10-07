// il Mimo che copia un ruolo (storiaRuoli con 'mimo' ma ruolo corrente
// diverso) è un giocatore IN PIÙ rispetto alla quantità del mazzo: non occupa
// un posto dei titolari di quella carta
export function eMimoCopiante(g) {
  return g.ruoloSlug !== 'mimo' && ((g.storiaRuoli ?? []).includes('mimo') || g.legame?.tipo === 'mimo')
}

// aggiunge un ruolo alla storia senza duplicati (storiaRuoli è un insieme ordinato
// di carte avute: un duplicato farebbe contare due volte la stessa carta)
export function conRuolo(storia, slug) {
  const s = storia ?? []
  return slug && !s.includes(slug) ? [...s, slug] : s
}

// morto di notte nel round corrente (non al rogo: quello è del giorno prima)
export function mortoStanotte(g, round) {
  return !g.vivo && round !== undefined && g.mortoNotte === round && g.causaMorte !== 'rogo'
}

export function contaAssegnati(giocatori, slug) {
  // conta su "storiaRuoli" (mai sottratto), non su ruoloSlug corrente: un
  // ruolo già assegnato non torna mai "da assegnare", anche se chi lo teneva
  // cambia carta in seguito (es. Addolorata che scambia ruolo col morto)
  return giocatori.filter((g) => {
    // [] (salvataggi vecchi) vale come "nessuna storia": ripiega su ruoloSlug
    const storia = g.storiaRuoli?.length ? g.storiaRuoli : [g.ruoloSlug]
    // il Mimo che copia un ruolo non consuma una carta: la carta è del
    // bersaglio. Contano solo i ruoli fino alla carta Mimo inclusa (chi era
    // Ladro e ha scelto la carta Mimo ha storia [ladro, mimo]: il Ladro conta)
    const i = storia.indexOf('mimo')
    return (i < 0 ? storia : storia.slice(0, i + 1)).includes(slug)
  }).length
}

export function ruoliAssegnabili(ruoli, giocatori, quantita) {
  return ruoli.filter((slug) => contaAssegnati(giocatori, slug) < (quantita[slug] ?? 1))
}

// true se le carte ancora in mazzo e non assegnate sono tutte e sole Villici:
// allora ogni giocatore con ruolo ignoto ("?") è sicuramente un Villico e la
// UI può mostrarlo come tale (solo visualizzazione, ruoloSlug non cambia)
export function ignotiSonoVillici(giocatori, quantita) {
  const residui = Object.entries(quantita)
    .map(([slug, n]) => [slug, n - contaAssegnati(giocatori, slug)])
    .filter(([, resto]) => resto > 0)
  return residui.length > 0 && residui.every(([slug]) => slug === 'villico')
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
  // il Mimo che copia la Guardia non è una carta Guardia: mai traditrice
  // (se copia esplicitamente 'guardia-mannara' lo è già, con quello slug)
  const guardieSenzaTradimento = giocatori.filter((g) => g.ruoloSlug === 'guardia' && !eMimoCopiante(g))
  const scelte = mescola(guardieSenzaTradimento).slice(0, daAssegnare)
  for (const g of scelte) {
    aggiornaGiocatore(g.id, {
      ruoloSlug: 'guardia-mannara',
      storiaRuoli: [...(g.storiaRuoli ?? []).filter((s) => s !== 'guardia'), 'guardia-mannara'],
    })
  }
}

// Guardia/Guardia Mannara: l'app sceglie a caso la traditrice (vedi sopra), ma
// finché nessuno ha visto la carta vera quel giocatore ha ancora un grado di
// incertezza. La Cartomante la vede: `guardiaDistinta` segna chi è già stato
// chiarito. Il Mimo che copia una Guardia non è una carta Guardia.
export function guardiaIncerta(g, ruoliSelezionati, quantita) {
  return (
    (g.ruoloSlug === 'guardia' || g.ruoloSlug === 'guardia-mannara') &&
    !g.guardiaDistinta &&
    !eMimoCopiante(g) &&
    ruoliSelezionati.includes('guardia-mannara') &&
    (quantita['guardia-mannara'] ?? 1) > 0
  )
}

// La carta di `targetId` è `slug` (guardia o guardia-mannara): se l'app l'aveva
// assegnata diversamente, scambia con un'altra guardia non ancora chiarita
// (quella che l'app aveva scelto per `slug`). Ritorna {id: patch}.
export function distinguiGuardia(giocatori, targetId, slug) {
  const target = giocatori.find((g) => g.id === targetId)
  const scambia = (g, nuovo) => ({
    ruoloSlug: nuovo,
    storiaRuoli: (g.storiaRuoli ?? []).map((s) => (s === g.ruoloSlug ? nuovo : s)),
  })
  const patch = { [targetId]: { ...scambia(target, slug), guardiaDistinta: true } }
  if (target.ruoloSlug !== slug) {
    const altro = giocatori.find((g) => g.id !== targetId && g.ruoloSlug === slug && !g.guardiaDistinta && !eMimoCopiante(g))
    if (altro) patch[altro.id] = scambia(altro, target.ruoloSlug)
  }
  return patch
}
