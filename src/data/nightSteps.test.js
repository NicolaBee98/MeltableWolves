import { NIGHT_STEPS, passiNotte, notteBloccata, villaggioMaledetto, ruoliAttivi } from './nightSteps'

const NESSUN_GIOCATORE = []

test('un mazzo di soli Villici non genera alcun passo notturno (si assegna da solo in automatico, non è mai un passo manuale)', () => {
  const passi = passiNotte(['villico'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(passi).toEqual([])
})

test('il passo "assegna-restanti" non esiste più: il Villico era l\'unico ruolo rimasto senza uno step dedicato, e non va mai mostrato (si assegna da solo)', () => {
  expect(NIGHT_STEPS.find((s) => s.id === 'assegna-restanti')).toBeUndefined()
})

test('mimo compare solo alla notte 1', () => {
  const passiNotte1 = passiNotte(['mimo'], 1, NESSUN_GIOCATORE)
  const passiNotte2 = passiNotte(['mimo'], 2, NESSUN_GIOCATORE)

  expect(passiNotte1.map((p) => p.id)).toContain('mimo')
  expect(passiNotte2.map((p) => p.id)).not.toContain('mimo')
})

test('paladino compare a ogni notte', () => {
  expect(passiNotte(['paladino'], 1, NESSUN_GIOCATORE).map((p) => p.id)).toContain('paladino')
  expect(passiNotte(['paladino'], 5, NESSUN_GIOCATORE).map((p) => p.id)).toContain('paladino')
})

test('senza lupi ancora identificati, la prima notte propone il passo dedicato "lupo-mannaro" per assegnarli, non ancora "branco-lupi"', () => {
  const passi = passiNotte(['lupo-mannaro'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(passi).toContain('lupo-mannaro')
  expect(passi).not.toContain('branco-lupi')
})

test('una volta identificato un lupo vivo, "branco-lupi" compare: è lì che il branco si riconosce E sceglie la vittima, nello stesso passo', () => {
  const giocatori = [{ id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] }]
  const passi = passiNotte(['lupo-mannaro'], 1, giocatori, { 'lupo-mannaro': 1 }).map((p) => p.id)
  expect(passi).toContain('branco-lupi')
})

test('"branco-lupi" continua a comparire anche dalla notte 2', () => {
  const giocatori = [{ id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] }]
  const passi = passiNotte(['lupo-mannaro'], 2, giocatori, { 'lupo-mannaro': 1 }).map((p) => p.id)
  expect(passi).toContain('branco-lupi')
})

test('"identifica-branco" non esiste più: il branco si riconosce direttamente nel passo "branco-lupi", non in un passo separato prima', () => {
  expect(NIGHT_STEPS.find((s) => s.id === 'identifica-branco')).toBeUndefined()
})

test("rispetta l'ordine del regolamento tra le categorie", () => {
  const ruoli = ['fattucchiera', 'veggente', 'strega']
  const ordine = passiNotte(ruoli, 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['fattucchiera', 'veggente', 'strega'])
})

test("bardo e gallo mannaro vengono prima di branco-lupi (ordine libretto: poteri non mortali prima di quelli mortali)", () => {
  const giocatori = [{ id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] }]
  const ruoli = ['lupo-mannaro', 'bardo', 'gallo-mannaro']
  const ordine = passiNotte(ruoli, 1, giocatori, { 'lupo-mannaro': 1 }).map((p) => p.id)
  expect(ordine).toEqual(['lupo-mannaro', 'bardo', 'gallo-mannaro', 'branco-lupi'])
})

test('cucciolo di lupo mannaro ha un passo dedicato tra i poteri passivi, prima che il branco si riconosca collettivamente in branco-lupi', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [], storiaRuoli: ['cucciolo-di-lupo-mannaro'] },
  ]
  const ordine = passiNotte(['cucciolo-di-lupo-mannaro'], 1, giocatori).map((p) => p.id)
  expect(ordine).toEqual(['cucciolo-di-lupo-mannaro', 'branco-lupi'])
})

test('"branco-lupi" non mostra mai un selettore per assegnare un ruolo: ogni membro del branco ha già il proprio passo dedicato prima, qui si sceglie solo la vittima', () => {
  const brancoLupi = NIGHT_STEPS.find((s) => s.id === 'branco-lupi')
  expect(brancoLupi.assegnabile).toBe(false)
})

test('Ambasciatore e Berserker hanno un passo dedicato di identificazione, come gli altri ruoli a potere passivo', () => {
  const ordine = passiNotte(['ambasciatore', 'berserker'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['ambasciatore', 'berserker'])
})

test('la Nonna ha un passo dedicato prima che il branco si riconosca in branco-lupi (niente selettore di ruolo in mezzo ai Lupi generici)', () => {
  const giocatori = [{ id: '1', nome: 'Nonna', ruoloSlug: 'nonna', vivo: true, condizioni: [], storiaRuoli: ['nonna'] }]
  const ordine = passiNotte(['nonna'], 1, giocatori).map((p) => p.id)
  expect(ordine).toEqual(['nonna', 'branco-lupi'])
})

test('capobranco e progenitore hanno anch\'essi un passo dedicato prima che il branco si riconosca', () => {
  const giocatori = [
    { id: '1', nome: 'Marco', ruoloSlug: 'lupo-mannaro-capobranco', vivo: true, condizioni: [], storiaRuoli: ['lupo-mannaro-capobranco'] },
  ]
  const ordine = passiNotte(
    ['lupo-mannaro-capobranco', 'lupo-mannaro-progenitore'],
    1,
    giocatori,
  ).map((p) => p.id)
  expect(ordine).toEqual(['lupo-mannaro-capobranco', 'lupo-mannaro-progenitore', 'branco-lupi'])
})

test('il Lupo Mannaro "generico" ha un passo dedicato tutto suo, prima che il branco si riconosca collettivamente', () => {
  const ordine = passiNotte(['lupo-mannaro'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['lupo-mannaro'])

  const giocatori = [{ id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], storiaRuoli: ['lupo-mannaro'] }]
  const ordineDopo = passiNotte(['lupo-mannaro'], 1, giocatori, { 'lupo-mannaro': 1 }).map((p) => p.id)
  expect(ordineDopo).toEqual(['lupo-mannaro', 'branco-lupi'])
})

test('una volta che tutto il branco è già assegnato, "branco-lupi" (dove il branco si riconosce e sceglie la vittima) non propone alcun selettore di ruolo', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [], storiaRuoli: ['cucciolo-di-lupo-mannaro'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro-capobranco', vivo: true, condizioni: [], storiaRuoli: ['lupo-mannaro-capobranco'] },
    { id: '3', nome: 'Elena', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], storiaRuoli: ['lupo-mannaro'] },
  ]
  const mazzo = ['cucciolo-di-lupo-mannaro', 'lupo-mannaro-capobranco', 'lupo-mannaro']
  const ordine = passiNotte(mazzo, 1, giocatori, { 'lupo-mannaro': 1 }).map((p) => p.id)
  expect(ordine).toEqual(['cucciolo-di-lupo-mannaro', 'lupo-mannaro-capobranco', 'lupo-mannaro', 'branco-lupi'])

  const brancoLupi = NIGHT_STEPS.find((s) => s.id === 'branco-lupi')
  expect(brancoLupi.assegnabile).toBe(false)
})

test('i ruoli con potere passivo rimasti (es. eremita) hanno un passo individuale assegnabile', () => {
  const passi = passiNotte(['eremita'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(passi).toContain('eremita')
})

test('il passo "innamorati" compare solo se un giocatore ha la condizione innamorato', () => {
  const giocatoriSenzaCondizione = [
    { id: '1', nome: 'Anna', ruoloSlug: 'sacerdote', vivo: true, condizioni: [], note: '' },
  ]
  const giocatoriConCondizione = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['innamorato'], note: '' },
  ]

  expect(passiNotte(['sacerdote'], 1, giocatoriSenzaCondizione).map((p) => p.id)).not.toContain('innamorati')
  expect(passiNotte(['villico'], 1, giocatoriConCondizione).map((p) => p.id)).toContain('innamorati')
})

test('i passi individuali dei ruoli a potere passivo sono assegnabili come gli altri', () => {
  const eremita = NIGHT_STEPS.find((s) => s.id === 'eremita')
  const bardo = NIGHT_STEPS.find((s) => s.id === 'bardo')
  expect(eremita.assegnabile).not.toBe(false)
  expect(bardo.assegnabile).not.toBe(false)
})

test('un passo normale non ha assegnabile impostato a false', () => {
  const paladino = NIGHT_STEPS.find((s) => s.id === 'paladino')
  expect(paladino.assegnabile).not.toBe(false)
})

test('Cartomante, Inquisitore, Medium e Veggente Mannaro sono passi di tipo azione (hanno un componente interattivo)', () => {
  for (const id of ['cartomante', 'inquisitore', 'medium', 'veggente-mannaro']) {
    expect(NIGHT_STEPS.find((s) => s.id === id).tipo).toBe('azione')
  }
})

test('salta un passo di ruolo il cui unico titolare è morto e il ruolo è già stato assegnato del tutto', () => {
  const giocatori = [{ id: '1', nome: 'Bruno', ruoloSlug: 'veggente', vivo: false, condizioni: [] }]
  expect(passiNotte(['veggente'], 2, giocatori, { veggente: 1 }).map((p) => p.id)).not.toContain('veggente')
})

test('con promemoriaRuoliMorti attivo, un passo azione col titolare morto resta comunque nell\'elenco', () => {
  const giocatori = [{ id: '1', nome: 'Bruno', ruoloSlug: 'veggente', vivo: false, condizioni: [] }]
  expect(
    passiNotte(['veggente'], 2, giocatori, { veggente: 1 }, { promemoriaRuoliMorti: true }).map((p) => p.id),
  ).toContain('veggente')
})

test('con promemoriaRuoliMorti attivo, un passo informativo col titolare morto resta comunque escluso', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'eremita', vivo: false, condizioni: [] }]
  expect(
    passiNotte(['eremita'], 2, giocatori, { eremita: 1 }, { promemoriaRuoliMorti: true }).map((p) => p.id),
  ).not.toContain('eremita')
})

test('"branco-lupi" sparisce quando tutti i lupi identificati sono morti', () => {
  const giocatori = [{ id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: false, condizioni: [] }]
  expect(
    passiNotte(['lupo-mannaro'], 2, giocatori, { 'lupo-mannaro': 2 }).map((p) => p.id),
  ).not.toContain('branco-lupi')
})

test('mostra ancora il passo se il titolare è vivo anche a mazzo già completo', () => {
  const giocatori = [{ id: '1', nome: 'Bruno', ruoloSlug: 'veggente', vivo: true, condizioni: [] }]
  expect(passiNotte(['veggente'], 2, giocatori, { veggente: 1 }).map((p) => p.id)).toContain('veggente')
})

test('il passo individuale di un ruolo a potere passivo sparisce una volta assegnato e morto il titolare', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'eremita', vivo: false, condizioni: [] }]
  expect(passiNotte(['eremita'], 2, giocatori, { eremita: 1 }).map((p) => p.id)).not.toContain('eremita')
})

test('notteBloccata è vera se un giocatore ha notteBloccataFinoA uguale al round corrente', () => {
  const giocatori = [{ id: '1', notteBloccataFinoA: 3 }]
  expect(notteBloccata(giocatori, 3)).toBe(true)
  expect(notteBloccata(giocatori, 4)).toBe(false)
})

test('la maledizione de L\'Antico blocca solo i passi con ruoli "buoni" (villaggio), i lupi e gli indipendenti continuano ad agire', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [], villaggioMaledettoFinoA: 3 },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', ruoloSlug: 'chupacabra', vivo: true, condizioni: [] },
  ]
  const passi = passiNotte(['veggente', 'lupo-mannaro', 'chupacabra'], 3, giocatori, {
    veggente: 1,
    'lupo-mannaro': 1,
    chupacabra: 1,
  }).map((p) => p.id)
  expect(villaggioMaledetto(giocatori, 3)).toBe(true)
  expect(passi).not.toContain('veggente')
  expect(passi).toContain('branco-lupi')
  expect(passi).toContain('chupacabra')
})


test('ruoliAttivi include i ruoli del mazzo e quelli che un giocatore ha assunto pur non essendo nel mazzo (Ladro)', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] }]
  expect(ruoliAttivi(['ladro'], giocatori)).toEqual(['ladro', 'veggente'])
})

test('ruoliAttivi non duplica un ruolo già nel mazzo', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] }]
  expect(ruoliAttivi(['veggente'], giocatori)).toEqual(['veggente'])
})

test('con quel ruolo esteso, il passo notturno del Veggente adottato dal Ladro compare davvero', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] }]
  const attivi = ruoliAttivi(['ladro'], giocatori)
  const passi = passiNotte(attivi, 1, giocatori, { ladro: 1 }).map((p) => p.id)
  expect(passi).toContain('veggente')
})
