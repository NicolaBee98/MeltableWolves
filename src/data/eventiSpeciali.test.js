import {
  rivelazioneContestualeDisponibile,
  bardoDisponibile,
  galloDisponibile,
  borgomastroDisponibile,
  RUOLI_NON_CARTA_SEGRETA,
  candidatiRivelazione,
  conPotereDisponibile,
  conseguenzeMorte,
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

test('Bardo con Mimo: disponibile se almeno un titolare è vivo e almeno uno non ha usato il potere (regola letterale)', () => {
  const usato = ['bardo-salta-notte']
  const g = (vivo, poteriUsati) => ({ id: String(Math.random()), ruoloSlug: 'bardo', vivo, poteriUsati })
  // Bardo ha usato ed è morto, Mimo-Bardo vivo non ha usato
  expect(bardoDisponibile([g(false, usato), g(true, [])])).toBe(true)
  // Bardo non ha usato ed è morto, Mimo-Bardo vivo ha usato: la regola letterale dice disponibile
  const morto = g(false, [])
  expect(bardoDisponibile([morto, g(true, usato)])).toBe(true)
  // l'uso si segna sul morto non usato, perché non c'è un vivo non usato
  expect(conPotereDisponibile([morto, g(true, usato)], 'bardo', 'bardo-salta-notte')).toBe(morto)
  // entrambi hanno usato, oppure nessuno è vivo
  expect(bardoDisponibile([g(true, usato), g(true, usato)])).toBe(false)
  expect(bardoDisponibile([g(false, []), g(false, [])])).toBe(false)
  // con due non usati si segna il primo vivo
  const a = g(false, [])
  const b = g(true, [])
  expect(conPotereDisponibile([a, b], 'bardo', 'bardo-salta-notte')).toBe(b)
})

test('conseguenzeMorte ricorda crepacuore (più coppie), legami, Antico, Alchimista e vendetta del Cucciolo', () => {
  const gs = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['2', '3'] },
    { id: '2', nome: 'Bea', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['1'] },
    { id: '3', nome: 'Carlo', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['1'] },
    { id: '5', nome: 'Elio', vivo: true, condizioni: [], ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: '1' } },
    { id: '6', nome: 'Fio', vivo: true, condizioni: [], ruoloSlug: 'cucciolo-di-lupo-mannaro' },
    { id: '7', nome: 'Gigi', vivo: true, condizioni: [], ruoloSlug: 'lantico', legame: null },
    { id: '8', nome: 'Ugo', vivo: true, condizioni: [], ruoloSlug: 'alchimista' },
  ]
  expect(conseguenzeMorte(gs, '1')).toEqual([
    'Morirà anche Bea (crepacuore).',
    'Morirà anche Carlo (crepacuore).',
    "L'Apprendista Elio erediterà il suo ruolo.",
  ])
  expect(conseguenzeMorte(gs, '6')[0]).toMatch(/Vendetta del Cucciolo/)
  expect(conseguenzeMorte(gs, '7')[0]).toMatch(/Antico sopravvive/)
  expect(conseguenzeMorte(gs, '8')[0]).toMatch(/Alchimista esplode/)
  // al passato l'esplosione la riepiloga l'evento: nessuna riga
  expect(conseguenzeMorte(gs, '8', true)).toEqual([])
  // catena tra coppie: Bea -> Anna -> Carlo, e l'Apprendista di Anna eredita
  expect(conseguenzeMorte(gs, '2')).toEqual([
    'Morirà anche Anna (crepacuore).',
    'Morirà anche Carlo (crepacuore).',
    "L'Apprendista Elio erediterà il suo ruolo.",
  ])
  // a morte avvenuta resta solo chi è già morto di crepacuore
  const dopo = gs.map((g) => (g.id === '1' ? { ...g, vivo: false } : g.id === '2' ? { ...g, vivo: false, causaMorte: 'crepacuore' } : g))
  expect(conseguenzeMorte(dopo, '1')).toEqual(['È morto anche Bea (crepacuore).'])
})

test('conseguenzeMorte: se il Cavaliere salva il bersaglio non elenca crepacuore/eredità/Figlia/vendetta, ma quelle della morte del Cavaliere', () => {
  const gs = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['2'], ruoloSlug: 'cucciolo-di-lupo-mannaro' },
    { id: '2', nome: 'Bea', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['1'] },
    { id: '3', nome: 'Dino', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['4'], ruoloSlug: 'cavaliere', legame: { tipo: 'cavaliere', targetId: '1' } },
    { id: '4', nome: 'Edo', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['3'] },
    { id: '5', nome: 'Elio', vivo: true, condizioni: [], ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: '3' } },
    { id: '6', nome: 'Fia', vivo: true, condizioni: [], ruoloSlug: 'figlia-dei-lupi', legame: { tipo: 'figlia-dei-lupi', targetId: '1' } },
  ]
  expect(conseguenzeMorte(gs, '1')).toEqual([
    'Il Cavaliere Dino lo protegge: si immola al suo posto.',
    'Morirà anche Edo (crepacuore).',
    "L'Apprendista Elio erediterà il suo ruolo.",
  ])
  expect(conseguenzeMorte(gs, '1', true)[0]).toBe('Il Cavaliere Dino si è immolato al posto di Anna: Anna sopravvive.')
})

test('conseguenzeMorte: seconda generazione (vendetta del Cucciolo morto di crepacuore) e Antico che sopravvive al crepacuore o alla sua prima vita', () => {
  const gs = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['2'] },
    { id: '2', nome: 'Cuc', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['1'], ruoloSlug: 'cucciolo-di-lupo-mannaro' },
  ]
  expect(conseguenzeMorte(gs, '1', true)).toEqual([
    'È morto anche Cuc (crepacuore).',
    'Vendetta del Cucciolo: i lupi sbraneranno due persone la prossima notte.',
  ])
  const antico = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['2'] },
    { id: '2', nome: 'Gigi', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['1'], ruoloSlug: 'lantico' },
    { id: '3', nome: 'Elio', vivo: true, condizioni: [], ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: '2' } },
  ]
  expect(conseguenzeMorte(antico, '1')).toEqual([expect.stringMatching(/Gigi sopravvive al crepacuore/)])
  // l'Antico alla prima vita: nessuna eredità dell'Apprendista (si svela solo alla seconda morte)
  expect(conseguenzeMorte(antico, '2')).toEqual([expect.stringMatching(/Antico sopravvive/)])
})

test('candidatiRivelazione include chi ha già il ruolo (Ladro, Apprendista) finché non ha usato il potere', () => {
  const dalLadro = { id: '1', nome: 'A', vivo: true, ruoloSlug: 'boia', poteriUsati: [] }
  const usato = { id: '2', nome: 'B', vivo: true, ruoloSlug: 'boia', poteriUsati: ['boia-giustizia'] }
  expect(candidatiRivelazione('boia', ['boia'], [dalLadro, usato], { boia: 1 }).map((g) => g.id)).toEqual(['1'])
})
