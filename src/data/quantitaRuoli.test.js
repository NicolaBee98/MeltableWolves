import { maxQuantita } from './quantitaRuoli'

test('villico ha un massimo di 12', () => {
  expect(maxQuantita('villico')).toBe(12)
})

test('lupo mannaro ha un massimo di 5', () => {
  expect(maxQuantita('lupo-mannaro')).toBe(5)
})

test('guardia ha un massimo di 2 (va inserita in coppia)', () => {
  expect(maxQuantita('guardia')).toBe(2)
})

test('un ruolo non elencato ha un massimo di 1', () => {
  expect(maxQuantita('paladino')).toBe(1)
})
