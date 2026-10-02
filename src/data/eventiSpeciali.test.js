import {
  rivelazioneContestualeDisponibile,
  bardoDisponibile,
  galloDisponibile,
  borgomastroDisponibile,
  RUOLI_NON_CARTA_SEGRETA,
  candidatiRivelazione,
} from './eventiSpeciali'

test('RUOLI_NON_CARTA_SEGRETA copre Fantasma Onnisciente, Suocera, Borgomastro e i 4 ruoli con un evento tutto loro (mai una carta segreta assegnabile da Mimo/Cartomante)', () => {
  expect(RUOLI_NON_CARTA_SEGRETA).toEqual(
    expect.arrayContaining([
      'fantasma-onnisciente',
      'suocera',
      'borgomastro',
      'alchimista',
      'boia',
      'scemo-del-villaggio',
      'innocente',
    ]),
  )
  expect(RUOLI_NON_CARTA_SEGRETA).toHaveLength(7)
})

test('rivelazioneContestualeDisponibile è vero solo se nel mazzo e non ancora rivelato/usato (la sua identità non è mai assegnata in anticipo)', () => {
  expect(rivelazioneContestualeDisponibile('boia', [], [], {})).toBe(false)
  expect(rivelazioneContestualeDisponibile('boia', ['boia'], [], { boia: 1 })).toBe(true)
  expect(
    rivelazioneContestualeDisponibile('boia', ['boia'], [{ id: '1', ruoloSlug: 'boia', storiaRuoli: ['boia'] }], {
      boia: 1,
    }),
  ).toBe(false)

  expect(rivelazioneContestualeDisponibile('alchimista', [], [], {})).toBe(false)
  expect(rivelazioneContestualeDisponibile('alchimista', ['alchimista'], [], { alchimista: 1 })).toBe(true)
  expect(
    rivelazioneContestualeDisponibile(
      'alchimista',
      ['alchimista'],
      [{ id: '1', ruoloSlug: 'alchimista', storiaRuoli: ['alchimista'] }],
      { alchimista: 1 },
    ),
  ).toBe(false)

  // l'Innocente segue lo stesso schema: un pulsante tutto suo, non passa
  // dal generico "Rivelazione personaggio" (vedi ruoliRivelabili sopra)
  expect(rivelazioneContestualeDisponibile('innocente', [], [], {})).toBe(false)
  expect(rivelazioneContestualeDisponibile('innocente', ['innocente'], [], { innocente: 1 })).toBe(true)
  expect(
    rivelazioneContestualeDisponibile(
      'innocente',
      ['innocente'],
      [{ id: '1', ruoloSlug: 'innocente', storiaRuoli: ['innocente'] }],
      { innocente: 1 },
    ),
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

test('borgomastroDisponibile è vero se il ruolo è nel mazzo e nessuno è già Borgomastro in vita', () => {
  expect(borgomastroDisponibile(['borgomastro'], [])).toBe(true)
  expect(borgomastroDisponibile(['villico'], [])).toBe(false)
})

test('borgomastroDisponibile è falso se un Borgomastro è già in carica e vivo', () => {
  const giocatori = [{ id: '1', eBorgomastro: true, vivo: true }]
  expect(borgomastroDisponibile(['borgomastro'], giocatori)).toBe(false)
})

test('borgomastroDisponibile torna vero se il Borgomastro in carica è morto (va rieletto)', () => {
  const giocatori = [{ id: '1', eBorgomastro: true, vivo: false }]
  expect(borgomastroDisponibile(['borgomastro'], giocatori)).toBe(true)
})

test('il Mimo-Boia è un attore a sé accanto al titolare ancora ignoto, finché non ha giustiziato', () => {
  const titolare = { id: '1', vivo: true }
  const mimo = { id: '2', vivo: true, ruoloSlug: 'boia', legame: { tipo: 'mimo', targetId: '1' }, storiaRuoli: ['mimo', 'boia'] }
  const args = ['boia', ['boia'], [titolare, mimo], { boia: 1 }]
  expect(candidatiRivelazione(...args).map((g) => g.id)).toEqual(['1', '2'])
  const usato = { ...mimo, poteriUsati: ['boia-giustizia'] }
  expect(candidatiRivelazione('boia', ['boia'], [titolare, usato], { boia: 1 }).map((g) => g.id)).toEqual(['1'])
})

test('Bardo: con Bardo e Mimo-Bardo la notte salta due volte (un uso a testa)', () => {
  const a = { id: '1', vivo: true, ruoloSlug: 'bardo', poteriUsati: ['bardo-salta-notte'] }
  const b = { id: '2', vivo: true, ruoloSlug: 'bardo' }
  expect(bardoDisponibile([a, b])).toBe(true)
  expect(bardoDisponibile([a, { ...b, poteriUsati: ['bardo-salta-notte'] }])).toBe(false)
})
