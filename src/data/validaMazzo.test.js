import { validaMazzo } from './validaMazzo'

test('mazzo vuoto genera avviso di conteggio e avviso nessun lupo', () => {
  const avvisi = validaMazzo([], 8)
  expect(avvisi).toContain('Hai selezionato 0 ruoli per 8 giocatori.')
  expect(avvisi).toContain('Nessun lupo mannaro nel mazzo.')
})

test('mazzo bilanciato (10 giocatori, 2 lupi, 8 villici) non genera avvisi', () => {
  const ruoli = [
    'lupo-mannaro', 'lupo-mannaro',
    'villico', 'villico', 'villico', 'villico',
    'villico', 'villico', 'villico', 'villico',
  ]
  expect(validaMazzo(ruoli, 10)).toEqual([])
})

test('troppe fazioni indipendenti genera avviso dedicato', () => {
  const ruoli = [
    'lupo-mannaro', 'lupo-mannaro',
    'chupacabra', 'criceto-malvagio', 'pifferaio',
    'villico', 'villico', 'villico', 'villico', 'villico',
  ]
  const avvisi = validaMazzo(ruoli, 10)
  expect(avvisi).toContain('Molte fazioni indipendenti nel mazzo: il regolamento consiglia di non abbondare.')
})

test('troppi ruoli notturni genera avviso dedicato', () => {
  const ruoli = ['veggente', 'paladino', 'strega', 'guaritore', 'villico']
  const avvisi = validaMazzo(ruoli, 5)
  expect(avvisi).toContain('Molti ruoli agiscono di notte: le notti potrebbero allungarsi parecchio.')
})
