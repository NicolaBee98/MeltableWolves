import { ROLES, eLupo } from './roles'
import { eMimoCopiante } from './assegnazione'

// La Suocera non è considerata in vita per le condizioni di vittoria (lo
// dichiara esplicitamente il suo testoRegole in roles.js)
function contaComeVivo(giocatore) {
  return giocatore.vivo && (giocatore.ruoloSlug !== 'suocera' || eMimoCopiante(giocatore))
}

export function condizioniVittoria(giocatori, quantita = {}) {
  const vivi = giocatori.filter(contaComeVivo)
  // vittorie "speciali" (Pifferaio, ultimo sopravvissuto, team del Mimo,
  // innamorati): escludono quelle di villaggio/lupi, mai due banner insieme
  const speciali = []
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
  const suoceraNascosta = (quantita.suocera ?? 0) > 0 && !giocatori.some((g) => g.ruoloSlug === 'suocera' && !eMimoCopiante(g))

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
    speciali.push('Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.')
  }

  if (viviVeri.length === 1) {
    const ultimo = ROLES.find((r) => r.slug === viviVeri[0].ruoloSlug)
    if (ultimo?.vinceUltimoSopravvissuto || ultimo?.slug === 'criceto-malvagio') speciali.push(`Il ${ultimo.nome} è l'ultimo sopravvissuto: vince lui.`)
  }

  // Chupacabra e Mimo-Chupacabra (stesso slug) vincono formando un team se sono
  // gli ultimi due sopravvissuti. Il Pifferaio ha già il suo annuncio sopra
  // (due Pifferai = nessun non ipnotizzato).
  if (viviVeri.length === 2 && viviVeri[0].ruoloSlug === viviVeri[1].ruoloSlug && viviVeri[0].ruoloSlug !== 'pifferaio') {
    const squadra = ROLES.find((r) => r.slug === viviVeri[0].ruoloSlug)
    if (squadra?.vinceUltimoSopravvissuto || squadra?.slug === 'criceto-malvagio') {
      speciali.push(`${squadra.nome} e Mimo-${squadra.nome} sono gli ultimi due sopravvissuti: vincono insieme.`)
    }
  }

  // due innamorati superstiti vincono solo se sono la stessa coppia (con più
  // coppie, due innamorati di coppie diverse non bastano)
  const [a, b] = viviVeri
  const stessaCoppia = (x, y) => !x.innamoratiCon?.length || x.innamoratiCon.includes(y.id)
  if (
    viviVeri.length === 2 &&
    viviVeri.every((g) => (g.condizioni ?? []).includes('innamorato')) &&
    stessaCoppia(a, b) &&
    stessaCoppia(b, a)
  ) {
    speciali.push('Gli innamorati sono gli unici superstiti: vincono loro.')
  }

  if (speciali.length > 0) return speciali

  // il Chupacabra impedisce la vittoria del villaggio finché è in vita
  if (lupiVivi.length === 0 && !chupacabraVivo) {
    messaggi.push('Non ci sono più Lupi Mannari in vita: vince il Villaggio.')
  }

  if (lupiVivi.length > 0 && lupiVivi.length >= abitanti) {
    // "Se i Lupi Mannari vincono, il Criceto Malvagio gli ruba la vittoria
    // diventando l'unico vincitore" (roles.js): non è un alleato dei lupi,
    // quindi non vince CON loro, vince AL POSTO loro
    if (cricetoVivo) {
      // con il Mimo-Criceto i criceti sono due: vincono insieme
      const nCriceti = vivi.filter((g) => g.ruoloSlug === 'criceto-malvagio').length
      messaggi.push(
        nCriceti > 1
          ? 'I Criceti Malvagi (con il Mimo) rubano la vittoria ai Lupi Mannari: vincono solo loro.'
          : 'Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui.',
      )
    } else if (abitanti <= 0 && lupiVivi.length > 1 && lupiVivi.every((g) => g.ruoloSlug === 'lupo-mannaro-capobranco')) {
      // Capobranco + Mimo-Capobranco ultimi rimasti: vincono i capibranco (cioè i lupi)
      messaggi.push('Il Capobranco e il Mimo-Capobranco sono gli ultimi rimasti: vincono i Lupi Mannari.')
    } else if (vivi.some((g) => g.ruoloSlug === 'mucca-mannara')) {
      // la Mucca non caccia e conta tra gli abitanti, ma "vince assieme ai lupi" (roles.js)
      messaggi.push('I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono i Lupi Mannari e i loro alleati.')
    } else {
      messaggi.push('I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.')
    }
  }

  return messaggi
}
