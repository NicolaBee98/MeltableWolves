import { risolviLegami, risolviCortigiana } from './risoluzioneNotte'

test('apprendista eredita il ruolo del maestro quando muore', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['1']).toEqual({ ruoloSlug: 'veggente', legame: null })
})

test('cavaliere muore al posto del bersaglio se sbranato di notte', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte', mortoNotte: 3 },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toEqual({ vivo: true, causaMorte: undefined })
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'sacrificio', mortoNotte: 3, legame: null })
})

test('cavaliere si rivela e si immola al posto del bersaglio anche se questo viene messo al rogo', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toEqual({ vivo: true, causaMorte: undefined })
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'sacrificio', mortoNotte: 2, legame: null })
})

test('cavaliere si immola comunque se il bersaglio muore per un\'altra causa (es. morte sul colpo)', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'colpo' },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toBeUndefined()
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'sacrificio', mortoNotte: undefined, legame: null })
})

test('figlia dei lupi diventa lupo mannaro quando il genitore muore', () => {
  const giocatori = [
    { id: '1', nome: 'Elsa', ruoloSlug: 'figlia-dei-lupi', vivo: true, condizioni: [], legame: { tipo: 'figlia-dei-lupi', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['1']).toEqual({ ruoloSlug: 'lupo-mannaro', legame: null })
})

test('nessun effetto se il bersaglio del legame è ancora vivo', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  expect(risolviLegami(giocatori)).toEqual({})
})

test('la cortigiana muore se il cliente scelto è un lupo', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviCortigiana(giocatori)
  expect(patch['1']).toEqual({ vivo: false, visitaNotturna: null })
})

test('la cortigiana muore se il cliente è stato sbranato di notte', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte' },
  ]
  const patch = risolviCortigiana(giocatori)
  expect(patch['1']).toEqual({ vivo: false, visitaNotturna: null })
})

test('la cortigiana sopravvive se il cliente è vivo e non è un lupo', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  const patch = risolviCortigiana(giocatori)
  expect(patch['1']).toEqual({ visitaNotturna: null })
})

test('nessuna patch se la cortigiana non ha visitato nessuno', () => {
  const giocatori = [{ id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [] }]
  expect(risolviCortigiana(giocatori)).toEqual({})
})
