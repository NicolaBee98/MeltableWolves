import { risolviLegami } from './risoluzioneNotte'

test('apprendista eredita il ruolo del maestro quando muore', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['1']).toEqual({ ruoloSlug: 'veggente', legame: null })
})

test('cavaliere muore al posto del bersaglio se ucciso di notte', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte' },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toEqual({ vivo: true })
  expect(patch['1']).toEqual({ vivo: false, legame: null })
})

test('cavaliere si immola se il bersaglio muore senza essere sbranato di notte', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toBeUndefined()
  expect(patch['1']).toEqual({ vivo: false, legame: null })
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
