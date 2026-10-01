import { ROLES, eLupo } from './roles'

// La Suocera non è considerata in vita per le condizioni di vittoria (lo
// dichiara esplicitamente il suo testoRegole in roles.js)
function contaComeVivo(giocatore) {
  return giocatore.vivo && giocatore.ruoloSlug !== 'suocera'
}

export function condizioniVittoria(giocatori, quantita = {}) {
  const vivi = giocatori.filter(contaComeVivo)
  const messaggi = []

  if (vivi.length === 0) {
    messaggi.push('Non è rimasto nessun giocatore in vita: la partita termina senza vincitori.')
    return messaggi
  }

  // La Suocera resta "?" per tutta la partita finché non muore (vedi
  // nightSteps.js): finché nessuno l'ha ancora rivelata l'app non sa CHI
  // sia tra i vivi, quindi non può escluderla da `vivi` una per una — ma
  // se la sua carta è ancora nel mazzo (quantita.suocera > 0: 0 se il
  // Ladro l'ha scartata, vedi AzioneLadro) è comunque viva e nascosta tra
  // gli abitanti, e va tolta dal conteggio degli abitanti per il pareggio
  // lupi/villaggio. Una volta rivelata (sempre alla morte) conta come
  // qualsiasi altro morto: non serve più questo aggiustamento.
  const suoceraNascosta = (quantita.suocera ?? 0) > 0 && !giocatori.some((g) => g.ruoloSlug === 'suocera')

  // per le condizioni di vittoria contano solo i membri che cacciano con il
  // branco (Lupo, Capobranco, Cucciolo, Nonna, Progenitore): gli altri
  // "mannari" (Mucca, Sciacallo, Gallo, Guardia Mannara, Veggente Mannaro,
  // Polpo) hanno fazione 'lupi' in roles.js ma non fanno numero qui, contano
  // tra il resto del villaggio
  const lupiVivi = vivi.filter((g) => eLupo(g.ruoloSlug))
  const abitanti = vivi.length - lupiVivi.length - (suoceraNascosta ? 1 : 0)
  const chupacabraVivo = vivi.some((g) => g.ruoloSlug === 'chupacabra')
  // la Suocera nascosta (ruolo mai rivelato) non è un giocatore "vero" per
  // "ultimo sopravvissuto" e Pifferaio: è l'unico vivo senza ruoloSlug
  const viviVeri = suoceraNascosta ? vivi.filter((g) => g.ruoloSlug) : vivi
  const pifferaioVivo = vivi.some((g) => g.ruoloSlug === 'pifferaio')
  const cricetoVivo = vivi.some((g) => g.ruoloSlug === 'criceto-malvagio')

  // viviVeri.length > 1: col solo Pifferaio rimasto in vita vale già la
  // condizione "ultimo sopravvissuto" qui sotto, per non duplicare l'annuncio
  if (
    pifferaioVivo &&
    viviVeri.length > 1 &&
    viviVeri.every((g) => g.ruoloSlug === 'pifferaio' || (g.condizioni ?? []).includes('ipnotizzato'))
  ) {
    messaggi.push('Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.')
  }

  if (viviVeri.length === 1) {
    const ultimo = ROLES.find((r) => r.slug === viviVeri[0].ruoloSlug)
    if (ultimo?.vinceUltimoSopravvissuto) messaggi.push(`Il ${ultimo.nome} è l'ultimo sopravvissuto: vince lui.`)
  }

  if (viviVeri.length === 2 && viviVeri.every((g) => (g.condizioni ?? []).includes('innamorato'))) {
    messaggi.push('Gli innamorati sono gli unici superstiti: vincono loro.')
  }

  // il Chupacabra impedisce la vittoria del villaggio finché è in vita
  if (lupiVivi.length === 0 && !chupacabraVivo) {
    messaggi.push('Non ci sono più Lupi Mannari in vita: vince il Villaggio.')
  }

  if (lupiVivi.length > 0 && lupiVivi.length >= abitanti) {
    // "Se i Lupi Mannari vincono, il Criceto Malvagio gli ruba la vittoria
    // diventando l'unico vincitore" (roles.js): non è un alleato dei lupi,
    // quindi non vince CON loro, vince AL POSTO loro
    if (cricetoVivo) {
      messaggi.push('Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui.')
    } else {
      messaggi.push('I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.')
    }
  }

  return messaggi
}
