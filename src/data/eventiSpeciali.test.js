import {
  ruoliRivelabili,
  boiaDisponibile,
  alchimistaDisponibile,
  bardoDisponibile,
  galloDisponibile,
  borgomastroDisponibile,
} from './eventiSpeciali'

test('ruoliRivelabili propone i ruoli a rivelazione diurna presenti nel mazzo e non ancora assegnati', () => {
  expect(ruoliRivelabili(['boia', 'spilungone'], [], { boia: 1, spilungone: 1 })).toEqual(['boia', 'spilungone'])
})

test('ruoliRivelabili esclude il Borgomastro (ha il suo evento dedicato)', () => {
  expect(ruoliRivelabili(['borgomastro'], [], { borgomastro: 1 })).toEqual([])
})

test('ruoliRivelabili esclude un ruolo già assegnato del tutto', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'boia', storiaRuoli: ['boia'] }]
  expect(ruoliRivelabili(['boia'], giocatori, { boia: 1 })).toEqual([])
})

test('boiaDisponibile è vero solo se il Boia è assegnato, vivo e non ha ancora usato il potere', () => {
  expect(boiaDisponibile([])).toBe(false)
  expect(boiaDisponibile([{ id: '1', ruoloSlug: 'boia', vivo: true, poteriUsati: [] }])).toBe(true)
  expect(boiaDisponibile([{ id: '1', ruoloSlug: 'boia', vivo: false, poteriUsati: [] }])).toBe(false)
  expect(boiaDisponibile([{ id: '1', ruoloSlug: 'boia', vivo: true, poteriUsati: ['boia-giustizia'] }])).toBe(false)
})

test("alchimistaDisponibile è vero solo se morto al rogo e non ha ancora usato il potere", () => {
  expect(alchimistaDisponibile([])).toBe(false)
  expect(
    alchimistaDisponibile([{ id: '1', ruoloSlug: 'alchimista', vivo: false, causaMorte: 'rogo', poteriUsati: [] }]),
  ).toBe(true)
  expect(
    alchimistaDisponibile([{ id: '1', ruoloSlug: 'alchimista', vivo: true, causaMorte: null, poteriUsati: [] }]),
  ).toBe(false)
  expect(
    alchimistaDisponibile([{ id: '1', ruoloSlug: 'alchimista', vivo: false, causaMorte: 'notte', poteriUsati: [] }]),
  ).toBe(false)
  expect(
    alchimistaDisponibile([
      { id: '1', ruoloSlug: 'alchimista', vivo: false, causaMorte: 'rogo', poteriUsati: ['alchimista-esplosione'] },
    ]),
  ).toBe(false)
})

test('bardoDisponibile è vero solo se il Bardo è vivo e non ha ancora usato il potere', () => {
  expect(bardoDisponibile([{ id: '1', ruoloSlug: 'bardo', vivo: true, poteriUsati: [] }])).toBe(true)
  expect(bardoDisponibile([{ id: '1', ruoloSlug: 'bardo', vivo: true, poteriUsati: ['bardo-salta-notte'] }])).toBe(false)
})

test('galloDisponibile è vero solo se il Gallo Mannaro è vivo e non ha ancora usato il potere', () => {
  expect(galloDisponibile([{ id: '1', ruoloSlug: 'gallo-mannaro', vivo: true, poteriUsati: [] }])).toBe(true)
  expect(
    galloDisponibile([{ id: '1', ruoloSlug: 'gallo-mannaro', vivo: true, poteriUsati: ['gallo-salta-giorno'] }]),
  ).toBe(false)
})

test('borgomastroDisponibile è vero se il ruolo è nel mazzo', () => {
  expect(borgomastroDisponibile(['borgomastro'])).toBe(true)
  expect(borgomastroDisponibile(['villico'])).toBe(false)
})
