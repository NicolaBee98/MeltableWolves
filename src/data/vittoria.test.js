import { condizioniVittoria } from './vittoria'

test('nessun giocatore vivo: messaggio di fine partita senza vincitori', () => {
  expect(condizioniVittoria([])).toHaveLength(1)
})

test('villaggio vince quando non ci sono più lupi vivi', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '2', vivo: false, ruoloSlug: 'lupo-mannaro', condizioni: [] },
  ]
  expect(condizioniVittoria(giocatori)).toContain('Non ci sono più Lupi Mannari in vita: vince il Villaggio.')
})

test('il villaggio non vince se il Chupacabra è ancora vivo, anche senza lupi', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'chupacabra', condizioni: [] },
  ]
  const messaggi = condizioniVittoria(giocatori)
  expect(messaggi).not.toContain('Non ci sono più Lupi Mannari in vita: vince il Villaggio.')
})

test('i lupi vincono se sono in numero pari o superiore al resto dei vivi', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  expect(condizioniVittoria(giocatori)).toContain(
    'I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.',
  )
})

test('i lupi non vincono se sono in minoranza', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  expect(condizioniVittoria(giocatori)).not.toContain(
    'I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.',
  )
})

test('il Chupacabra vince se rimane l\'ultimo sopravvissuto', () => {
  const giocatori = [{ id: '1', vivo: true, ruoloSlug: 'chupacabra', condizioni: [] }]
  expect(condizioniVittoria(giocatori)).toContain("Il Chupacabra è l'ultimo sopravvissuto: vince lui.")
})

test('il Criceto Malvagio ruba la vittoria ai Lupi Mannari se sono loro a vincere (non "ultimo sopravvissuto": quella condizione non è mai raggiungibile in pratica)', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'criceto-malvagio', condizioni: [] },
  ]
  const messaggi = condizioniVittoria(giocatori)
  expect(messaggi).toContain('Il Criceto Malvagio ruba la vittoria ai Lupi Mannari: vince solo lui.')
  expect(messaggi).not.toContain('I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.')
})

test('senza il Criceto Malvagio, la vittoria dei Lupi Mannari resta quella normale', () => {
  const giocatori = [{ id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] }]
  expect(condizioniVittoria(giocatori)).toContain(
    'I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.',
  )
})

test('il Pifferaio vince quando tutti gli altri vivi sono ipnotizzati', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'pifferaio', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'villico', condizioni: ['ipnotizzato'] },
  ]
  expect(condizioniVittoria(giocatori)).toContain('Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.')
})

test('il Pifferaio non vince se qualcuno non è ipnotizzato', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'pifferaio', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  expect(condizioniVittoria(giocatori)).not.toContain('Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.')
})

test("il Pifferaio vince se rimane l'ultimo sopravvissuto, anche senza aver ipnotizzato nessuno", () => {
  const giocatori = [{ id: '1', vivo: true, ruoloSlug: 'pifferaio', condizioni: [] }]
  const messaggi = condizioniVittoria(giocatori)
  expect(messaggi).toContain("Il Pifferaio è l'ultimo sopravvissuto: vince lui.")
  expect(messaggi).not.toContain('Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.')
})

test('gli innamorati vincono se sono gli unici superstiti', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'villico', condizioni: ['innamorato'] },
    { id: '2', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: ['innamorato'] },
  ]
  expect(condizioniVittoria(giocatori)).toContain('Gli innamorati sono gli unici superstiti: vincono loro.')
})

test('la Mucca Mannara e gli altri "mannari" non cacciano con il branco: contano tra gli abitanti', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: 'cucciolo-di-lupo-mannaro', condizioni: [] },
    { id: '4', vivo: true, ruoloSlug: 'mucca-mannara', condizioni: [] },
    { id: '5', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '6', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '7', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '8', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  // 3 lupi di branco vs 5 "abitanti" (mucca inclusa): non ancora pari
  expect(condizioniVittoria(giocatori)).not.toContain(
    'I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.',
  )
})

test('la Suocera non è considerata viva per le condizioni di vittoria', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'suocera', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'chupacabra', condizioni: [] },
  ]
  // senza la Suocera nel conteggio, il Chupacabra risulta l'unico vivo
  expect(condizioniVittoria(giocatori)).toContain("Il Chupacabra è l'ultimo sopravvissuto: vince lui.")
})

test('con la Suocera ancora nel mazzo e non rivelata, conta comunque -1 tra gli abitanti (nascosta tra i vivi)', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '4', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '5', vivo: true, condizioni: [] }, // "?" non ancora assegnato: potrebbe essere la Suocera
  ]
  // senza l'aggiustamento: 2 lupi vs 3 abitanti, non pari. Con la Suocera
  // nascosta tolta dal conteggio: 2 lupi vs 2 abitanti, pari: vincono i lupi
  expect(condizioniVittoria(giocatori, { suocera: 1 })).toContain(
    'I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.',
  )
  expect(condizioniVittoria(giocatori, { suocera: 0 })).not.toContain(
    'I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.',
  )
})

test('se il Ladro ha scartato la carta della Suocera (quantita.suocera azzerata), non conta più come nascosta', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '4', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '5', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  // 2 lupi vs 3 abitanti: senza la Suocera nascosta (scartata dal Ladro)
  // resta 3, non pari
  expect(condizioniVittoria(giocatori, { suocera: 0 })).not.toContain(
    'I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.',
  )
})

test('una volta rivelata (morta), la Suocera conta come qualsiasi altro morto: nessun -1 aggiuntivo', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '4', vivo: false, ruoloSlug: 'suocera', condizioni: [] },
  ]
  // 2 lupi vs 1 abitante vivo (la Suocera morta non conta comunque, ma non
  // va tolto un ulteriore -1 "fantasma" visto che ormai è nota)
  expect(condizioniVittoria(giocatori, { suocera: 1 })).toContain(
    'I Lupi Mannari sono in numero pari o superiore al resto del villaggio: vincono loro.',
  )
})

test('nessun vivo: la partita termina senza vincitori', () => {
  const giocatori = [{ id: '1', vivo: false, ruoloSlug: 'villico', condizioni: [] }]
  expect(condizioniVittoria(giocatori)).toEqual(['Non è rimasto nessun giocatore in vita: la partita termina senza vincitori.'])
})

test('Suocera nascosta non impedisce "ultimo sopravvissuto" del Chupacabra', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'chupacabra', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: undefined, condizioni: [] },
    { id: '3', vivo: false, ruoloSlug: 'villico', condizioni: [] },
  ]
  expect(condizioniVittoria(giocatori, { suocera: 1 })).toContain("Il Chupacabra è l'ultimo sopravvissuto: vince lui.")
})

test('Suocera nascosta non impedisce la vittoria del Pifferaio', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'pifferaio', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'villico', condizioni: ['ipnotizzato'] },
    { id: '3', vivo: true, ruoloSlug: undefined, condizioni: [] },
  ]
  expect(condizioniVittoria(giocatori, { suocera: 1 })).toContain('Il Pifferaio ha ipnotizzato tutti i giocatori in vita: vince lui.')
})

test('Chupacabra e Mimo-Chupacabra ultimi due sopravvissuti: vincono insieme', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'chupacabra', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'chupacabra', vivo: true, condizioni: [], storiaRuoli: ['mimo', 'chupacabra'] },
    { id: '3', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  expect(condizioniVittoria(giocatori).join(' ')).toMatch(/ultimi due sopravvissuti/)
})

test('due innamorati di coppie diverse non vincono come superstiti', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'villico', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['3'] },
    { id: '2', ruoloSlug: 'villico', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['4'] },
    { id: '3', ruoloSlug: 'villico', vivo: false, condizioni: ['innamorato'] },
  ]
  expect(condizioniVittoria(giocatori).join(' ')).not.toMatch(/innamorati/i)
})

test('un solo banner: Pifferaio solo, Pifferaio con ipnotizzati, innamorati soli, Criceto solo non fanno vincere anche il Villaggio', () => {
  const v = (id, ruoloSlug, condizioni = [], extra = {}) => ({ id, vivo: true, ruoloSlug, condizioni, ...extra })
  const casi = [
    [[v('1', 'pifferaio')], /Pifferaio è l'ultimo/],
    [[v('1', 'pifferaio'), v('2', 'villico', ['ipnotizzato'])], /Pifferaio ha ipnotizzato/],
    [[v('1', 'villico', ['innamorato']), v('2', 'villico', ['innamorato'])], /innamorati/],
    [[v('1', 'lupo-mannaro', ['innamorato']), v('2', 'villico', ['innamorato'])], /innamorati/],
    [[v('1', 'criceto-malvagio')], /Criceto Malvagio è l'ultimo/],
    [[v('1', 'criceto-malvagio'), v('2', 'criceto-malvagio')], /Criceto Malvagio e Mimo-Criceto Malvagio/],
    [[v('1', 'chupacabra')], /Chupacabra è l'ultimo/],
  ]
  for (const [giocatori, atteso] of casi) {
    const messaggi = condizioniVittoria(giocatori)
    expect(messaggi).toHaveLength(1)
    expect(messaggi[0]).toMatch(atteso)
  }
})

test('Mucca Mannara: conta tra gli abitanti, non tra i lupi, e vince con loro nel banner', () => {
  const v = (id, ruoloSlug) => ({ id, vivo: true, ruoloSlug, condizioni: [] })
  // 1 lupo vs Mucca: abitanti (1) <= lupi (1) -> vincono Lupi e Mucca
  expect(condizioniVittoria([v('1', 'lupo-mannaro'), v('2', 'mucca-mannara')]).join(' ')).toMatch(/vincono i Lupi e la Mucca Mannara/)
  // 1 lupo vs Mucca + villico: la Mucca è un abitante, i lupi non vincono
  expect(condizioniVittoria([v('1', 'lupo-mannaro'), v('2', 'mucca-mannara'), v('3', 'villico')])).toEqual([])
  // Mucca morta: banner normale
  const morta = { ...v('2', 'mucca-mannara'), vivo: false }
  expect(condizioniVittoria([v('1', 'lupo-mannaro'), morta]).join(' ')).not.toMatch(/Mucca/)
})

test('un lupo contro il Chupacabra: vincono i Lupi', () => {
  const v = (id, ruoloSlug) => ({ id, vivo: true, ruoloSlug, condizioni: [] })
  expect(condizioniVittoria([v('1', 'lupo-mannaro'), v('2', 'chupacabra')]).join(' ')).toMatch(/vincono loro/)
})

test('Capobranco + Mimo-Capobranco ultimi: vincono i capibranco (lupi), non "il Mimo che lo imita"', () => {
  const v = (id) => ({ id, vivo: true, ruoloSlug: 'lupo-mannaro-capobranco', condizioni: [] })
  const m = condizioniVittoria([v('1'), v('2')])
  expect(m).toHaveLength(1)
  expect(m[0]).toMatch(/Capobranco e il Mimo-Capobranco.*Lupi/)
})

test('banner Chupacabra + Mimo: formula neutra', () => {
  const v = (id) => ({ id, vivo: true, ruoloSlug: 'chupacabra', condizioni: [] })
  expect(condizioniVittoria([v('1'), v('2')]).join(' ')).not.toMatch(/che lo imita/)
})

test('Mimo-Suocera vivo conta come abitante; la Suocera titolare nascosta resta -1', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'suocera', storiaRuoli: ['mimo', 'suocera'], condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: undefined, condizioni: [] },
  ]
  // abitanti: Mimo-Suocera (1) + la Suocera nascosta (-1) + ignoto (1) -> 1 abitante, 1 lupo: vincono i lupi
  expect(condizioniVittoria(giocatori, { suocera: 1 }).join(' ')).toMatch(/Lupi Mannari/)
})
