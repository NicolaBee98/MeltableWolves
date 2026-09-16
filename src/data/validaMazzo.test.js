import { validaMazzo } from './validaMazzo'

test('mazzo vuoto genera avviso di conteggio e avviso nessun lupo', () => {
  const avvisi = validaMazzo({}, 8)
  expect(avvisi).toContain('Hai selezionato 0 ruoli per 8 giocatori.')
  expect(avvisi).toContain('Nessun lupo mannaro nel mazzo.')
})

test('mazzo bilanciato (10 giocatori, 2 lupi, 8 villici) non genera avvisi', () => {
  const quantita = { 'lupo-mannaro': 2, villico: 8 }
  expect(validaMazzo(quantita, 10)).toEqual([])
})

test('troppe fazioni indipendenti genera avviso dedicato', () => {
  const quantita = {
    'lupo-mannaro': 2,
    chupacabra: 1,
    'criceto-malvagio': 1,
    pifferaio: 1,
    villico: 5,
  }
  const avvisi = validaMazzo(quantita, 10)
  expect(avvisi).toContain('Molte fazioni indipendenti nel mazzo: il regolamento consiglia di non abbondare.')
})

test('troppi ruoli notturni genera avviso dedicato', () => {
  const quantita = { veggente: 1, paladino: 1, strega: 1, guaritore: 1, villico: 1 }
  const avvisi = validaMazzo(quantita, 5)
  expect(avvisi).toContain('Molti ruoli agiscono di notte: le notti potrebbero allungarsi parecchio.')
})

test('conta le quantità multiple nel totale ruoli', () => {
  const avvisi = validaMazzo({ villico: 3 }, 3)
  expect(avvisi).not.toContain('Hai selezionato 1 ruoli per 3 giocatori.')
  expect(avvisi).toContain('Nessun lupo mannaro nel mazzo.')
})
