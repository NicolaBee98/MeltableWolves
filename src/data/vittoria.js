import { ROLES } from './roles'

function fazioneDi(giocatore) {
  return ROLES.find((r) => r.slug === giocatore.ruoloSlug)?.fazione
}

// La Suocera non è considerata in vita per le condizioni di vittoria (lo
// dichiara esplicitamente il suo testoRegole in roles.js)
function contaComeVivo(giocatore) {
  return giocatore.vivo && giocatore.ruoloSlug !== 'suocera'
}

export function condizioniVittoria(giocatori) {
  const vivi = giocatori.filter(contaComeVivo)
  const messaggi = []

  if (vivi.length === 0) return messaggi

  const lupiVivi = vivi.filter((g) => fazioneDi(g) === 'lupi')
  const chupacabraVivo = vivi.some((g) => g.ruoloSlug === 'chupacabra')
  const pifferaioVivo = vivi.some((g) => g.ruoloSlug === 'pifferaio')

  if (pifferaioVivo && vivi.every((g) => g.ruoloSlug === 'pifferaio' || (g.condizioni ?? []).includes('ipnotizzato'))) {
    messaggi.push('Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.')
  }

  if (vivi.length === 1) {
    const ultimo = vivi[0]
    if (ultimo.ruoloSlug === 'chupacabra') messaggi.push("Il Chupacabra è l'ultimo sopravvissuto: vince lui.")
    if (ultimo.ruoloSlug === 'criceto-malvagio') messaggi.push("Il Criceto Malvagio è l'ultimo sopravvissuto: vince lui.")
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
