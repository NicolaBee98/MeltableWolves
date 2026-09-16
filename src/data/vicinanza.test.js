import { vicini } from './vicinanza'

test('ritorna il vicino di sinistra e destra nel mezzo del cerchio', () => {
  const giocatori = [{ id: '1' }, { id: '2' }, { id: '3' }]
  expect(vicini(giocatori, '2')).toEqual({ sinistra: { id: '1' }, destra: { id: '3' } })
})

test("il primo giocatore ha come vicino di sinistra l'ultimo (cerchio)", () => {
  const giocatori = [{ id: '1' }, { id: '2' }, { id: '3' }]
  expect(vicini(giocatori, '1')).toEqual({ sinistra: { id: '3' }, destra: { id: '2' } })
})

test("l'ultimo giocatore ha come vicino di destra il primo (cerchio)", () => {
  const giocatori = [{ id: '1' }, { id: '2' }, { id: '3' }]
  expect(vicini(giocatori, '3')).toEqual({ sinistra: { id: '2' }, destra: { id: '1' } })
})

test('ritorna null per un id non presente', () => {
  const giocatori = [{ id: '1' }, { id: '2' }]
  expect(vicini(giocatori, 'x')).toEqual({ sinistra: null, destra: null })
})
