import { vicini, viciniVivi, vicinoPiuVicinoChe, viciniPiuViciniChe } from './vicinanza'

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

test('viciniVivi trova i vicini vivi più prossimi saltando i morti', () => {
  const giocatori = [
    { id: '1', vivo: false },
    { id: '2', vivo: true },
    { id: '3', vivo: false },
    { id: '4', vivo: true },
    { id: '5', vivo: false },
  ]
  expect(viciniVivi(giocatori, '5')).toEqual({ sinistra: giocatori[3], destra: giocatori[1] })
})

test('viciniVivi ritorna il vicino immediato se è vivo', () => {
  const giocatori = [{ id: '1', vivo: true }, { id: '2', vivo: true }, { id: '3', vivo: true }]
  expect(viciniVivi(giocatori, '2')).toEqual({ sinistra: giocatori[0], destra: giocatori[2] })
})

test('viciniVivi ritorna null se non ci sono altri giocatori vivi', () => {
  const giocatori = [{ id: '1', vivo: true }, { id: '2', vivo: false }]
  expect(viciniVivi(giocatori, '1')).toEqual({ sinistra: null, destra: null })
})

test('viciniVivi ritorna null per un id non presente', () => {
  const giocatori = [{ id: '1', vivo: true }]
  expect(viciniVivi(giocatori, 'x')).toEqual({ sinistra: null, destra: null })
})

test('vicinoPiuVicinoChe trova il primo che soddisfa il predicato scansionando in entrambe le direzioni', () => {
  const giocatori = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }]
  // partendo da '1': destra a distanza 1 è '2', sinistra a distanza 1 è '5'
  expect(vicinoPiuVicinoChe(giocatori, '1', (g) => g.id === '5')).toEqual({ id: '5' })
})

test('vicinoPiuVicinoChe a parità di distanza preferisce la destra', () => {
  const giocatori = [{ id: '1', match: false }, { id: '2', match: true }, { id: '3' }, { id: '4', match: true }]
  expect(vicinoPiuVicinoChe(giocatori, '3', (g) => g.match)).toEqual({ id: '4', match: true })
})

test('vicinoPiuVicinoChe ritorna null se nessuno soddisfa il predicato', () => {
  const giocatori = [{ id: '1' }, { id: '2' }]
  expect(vicinoPiuVicinoChe(giocatori, '1', () => false)).toBeNull()
})

test('vicinoPiuVicinoChe ritorna null per un id non presente', () => {
  const giocatori = [{ id: '1' }]
  expect(vicinoPiuVicinoChe(giocatori, 'x', () => true)).toBeNull()
})

test('viciniPiuViciniChe ritorna un solo candidato quando non c\'è parità', () => {
  const giocatori = [{ id: '1', match: false }, { id: '2', match: true }, { id: '3' }, { id: '4' }]
  expect(viciniPiuViciniChe(giocatori, '1', (g) => g.match)).toEqual([{ id: '2', match: true }])
})

test('viciniPiuViciniChe ritorna entrambi i candidati a parità di distanza', () => {
  const giocatori = [{ id: '1', match: true }, { id: '2' }, { id: '3', match: true }, { id: '4' }]
  expect(viciniPiuViciniChe(giocatori, '2', (g) => g.match).map((g) => g.id).sort()).toEqual(['1', '3'])
})

test('viciniPiuViciniChe ritorna array vuoto se nessuno soddisfa il predicato', () => {
  const giocatori = [{ id: '1' }, { id: '2' }]
  expect(viciniPiuViciniChe(giocatori, '1', () => false)).toEqual([])
})
