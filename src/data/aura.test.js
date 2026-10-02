import { auraDi } from './aura'

test('i ruoli della lista aura malvagia ritornano malvagia', () => {
  expect(auraDi('lupo-mannaro')).toBe('malvagia')
  expect(auraDi('chupacabra')).toBe('malvagia')
  expect(auraDi('eremita')).toBe('malvagia')
})

test('la nonna ha aura benevola nonostante sia un lupo', () => {
  expect(auraDi('nonna')).toBe('benevola')
})

test('un ruolo qualsiasi non elencato ha aura benevola', () => {
  expect(auraDi('paladino')).toBe('benevola')
  expect(auraDi('villico')).toBe('benevola')
})

test('la Guardia Mannara ha aura benevola per tutti (anche il Mimo che la copia, che ha lo stesso ruoloSlug)', () => {
  expect(auraDi('guardia-mannara')).toBe('benevola')
})
