import { condizioniVittoria } from './vittoria'

test('nessun messaggio se non ci sono giocatori vivi', () => {
  expect(condizioniVittoria([])).toEqual([])
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

test('il Criceto Malvagio vince se rimane l\'ultimo sopravvissuto', () => {
  const giocatori = [{ id: '1', vivo: true, ruoloSlug: 'criceto-malvagio', condizioni: [] }]
  expect(condizioniVittoria(giocatori)).toContain("Il Criceto Malvagio è l'ultimo sopravvissuto: vince lui.")
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

test('gli innamorati vincono se sono gli unici superstiti', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'villico', condizioni: ['innamorato'] },
    { id: '2', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: ['innamorato'] },
  ]
  expect(condizioniVittoria(giocatori)).toContain('Gli innamorati sono gli unici superstiti: vincono loro.')
})

test('la Suocera non è considerata viva per le condizioni di vittoria', () => {
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'suocera', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'chupacabra', condizioni: [] },
  ]
  // senza la Suocera nel conteggio, il Chupacabra risulta l'unico vivo
  expect(condizioniVittoria(giocatori)).toContain("Il Chupacabra è l'ultimo sopravvissuto: vince lui.")
})
