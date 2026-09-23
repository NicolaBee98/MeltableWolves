import { fazioneDi } from './roles'
import { RUOLI_BRANCO_LUPI } from './nightSteps'

// La Suocera non è considerata in vita per le condizioni di vittoria (lo
// dichiara esplicitamente il suo testoRegole in roles.js)
function contaComeVivo(giocatore) {
  return giocatore.vivo && giocatore.ruoloSlug !== 'suocera'
}

export function condizioniVittoria(giocatori) {
  const vivi = giocatori.filter(contaComeVivo)
  const messaggi = []

  if (vivi.length === 0) return messaggi

  // per le condizioni di vittoria contano solo i membri che cacciano con il
  // branco (Lupo, Capobranco, Cucciolo, Nonna, Progenitore): gli altri
  // "mannari" (Mucca, Sciacallo, Gallo, Guardia Mannara, Veggente Mannaro,
  // Polpo) hanno fazione 'lupi' in roles.js ma non fanno numero qui, contano
  // tra il resto del villaggio
  const lupiVivi = vivi.filter((g) => RUOLI_BRANCO_LUPI.includes(g.ruoloSlug))
  const chupacabraVivo = vivi.some((g) => g.ruoloSlug === 'chupacabra')
  const pifferaioVivo = vivi.some((g) => g.ruoloSlug === 'pifferaio')

  // vivi.length > 1: col solo Pifferaio rimasto in vita vale già la
  // condizione "ultimo sopravvissuto" qui sotto, per non duplicare l'annuncio
  if (
    pifferaioVivo &&
    vivi.length > 1 &&
    vivi.every((g) => g.ruoloSlug === 'pifferaio' || (g.condizioni ?? []).includes('ipnotizzato'))
  ) {
    messaggi.push('Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.')
  }

  if (vivi.length === 1) {
    const ultimo = vivi[0]
    if (ultimo.ruoloSlug === 'chupacabra') messaggi.push("Il Chupacabra è l'ultimo sopravvissuto: vince lui.")
    if (ultimo.ruoloSlug === 'criceto-malvagio') messaggi.push("Il Criceto Malvagio è l'ultimo sopravvissuto: vince lui.")
    if (ultimo.ruoloSlug === 'pifferaio') messaggi.push("Il Pifferaio è l'ultimo sopravvissuto: vince lui.")
  }

  if (vivi.length === 2 && vivi.every((g) => (g.condizioni ?? []).includes('innamorato'))) {
    messaggi.push('Gli innamorati sono gli unici superstiti: vincono loro.')
  }

  // il Chupacabra impedisce la vittoria del villaggio finché è in vita
  if (lupiVivi.length === 0 && !chupacabraVivo) {
    messaggi.push('Non ci sono più Lupi Mannari in vita: vince il Villaggio.')
  }

  if (lupiVivi.length > 0 && lupiVivi.length >= vivi.length - lupiVivi.length) {
    messaggi.push('I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.')
  }

  return messaggi
}
