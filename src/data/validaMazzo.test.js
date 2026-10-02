import { validaMazzo } from './validaMazzo'

test('mazzo vuoto genera avviso "nessun lupo"', () => {
  expect(validaMazzo({})).toContain('Nessun lupo mannaro nel mazzo.')
})

test('mazzo bilanciato (2 lupi, 8 villici) non genera avvisi', () => {
  const quantita = { 'lupo-mannaro': 2, villico: 8 }
  expect(validaMazzo(quantita)).toEqual([])
})

test('troppe fazioni indipendenti genera avviso dedicato', () => {
  const quantita = {
    'lupo-mannaro': 2,
    chupacabra: 1,
    'criceto-malvagio': 1,
    pifferaio: 1,
    villico: 5,
  }
  const avvisi = validaMazzo(quantita)
  expect(avvisi).toContain('Molte fazioni indipendenti nel mazzo: il regolamento consiglia di non abbondare.')
})

test('troppi ruoli notturni genera avviso dedicato', () => {
  const quantita = { veggente: 1, paladino: 1, strega: 1, guaritore: 1, villico: 1 }
  const avvisi = validaMazzo(quantita)
  expect(avvisi).toContain('Molti ruoli agiscono di notte: le notti potrebbero allungarsi parecchio.')
})

test('Guardia Mannara senza Guardie genera un avviso dedicato', () => {
  const avvisi = validaMazzo({ 'guardia-mannara': 1 })
  expect(avvisi).toContain('Guardia Mannara richiede la presenza delle Guardie nel mazzo.')
})

test('Guardia Mannara con le Guardie presenti non genera l\'avviso dedicato', () => {
  const avvisi = validaMazzo({ 'guardia-mannara': 1, guardia: 2 })
  expect(avvisi).not.toContain('Guardia Mannara richiede la presenza delle Guardie nel mazzo.')
})

test('i ruoli di fazione lupi che non sono lupi (Gallo Mannaro) non contano come lupi', () => {
  expect(validaMazzo({ 'gallo-mannaro': 1, villico: 4 })).toContain('Nessun lupo mannaro nel mazzo.')
})
