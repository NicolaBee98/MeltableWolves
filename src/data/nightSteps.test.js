import { NIGHT_STEPS, passiNotte, notteBloccata, ruoliAttivi, RUOLI_RIVELAZIONE_GIORNO } from './nightSteps'
import { ruoliAssegnabili } from './assegnazione'

const NESSUN_GIOCATORE = []

test('un mazzo di soli ruoli senza azione notturna (es. Villico) genera comunque il passo per assegnarli (altrimenti non verrebbero mai assegnati a nessuno)', () => {
  const passi = passiNotte(['villico'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(passi).toEqual(['assegna-restanti'])
})

test('il passo "assegna-restanti" copre i ruoli senza uno step dedicato e senza rivelazione diurna/alla morte', () => {
  const restanti = NIGHT_STEPS.find((s) => s.id === 'assegna-restanti')
  expect(restanti.ruoli).toContain('villico')
  expect(restanti.ruoli).toContain('mezzosangue')
  // Ambasciatore e Berserker hanno ora un passo dedicato (come Eremita, Nano...)
  expect(restanti.ruoli).not.toContain('ambasciatore')
  expect(restanti.ruoli).not.toContain('berserker')
  // Fantasma Onnisciente e Suocera restano "?" fino alla morte (evento dedicato)
  expect(restanti.ruoli).not.toContain('fantasma-onnisciente')
  expect(restanti.ruoli).not.toContain('suocera')
  expect(restanti.ruoli).not.toContain('veggente') // ha già un passo dedicato
  for (const slug of RUOLI_RIVELAZIONE_GIORNO) {
    expect(restanti.ruoli).not.toContain(slug) // si assegnano dal menu Eventi speciali, non di notte
  }
})

test('"assegna-restanti" compare solo alla prima notte', () => {
  expect(passiNotte(['villico'], 2, NESSUN_GIOCATORE)).toEqual([])
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

test('senza lupi ancora identificati, la prima notte propone solo "identifica-branco", non "branco-lupi"', () => {
  const passi = passiNotte(['lupo-mannaro'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(passi).toContain('identifica-branco')
  expect(passi).not.toContain('branco-lupi')
})

test('una volta identificato un lupo vivo, "branco-lupi" compare per la caccia', () => {
  const giocatori = [{ id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] }]
  expect(passiNotte(['lupo-mannaro'], 1, giocatori, { 'lupo-mannaro': 1 }).map((p) => p.id)).toContain('branco-lupi')
})

test('"identifica-branco" compare solo alla prima notte, "branco-lupi" continua a comparire', () => {
  const giocatori = [{ id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] }]
  const passi = passiNotte(['lupo-mannaro'], 2, giocatori, { 'lupo-mannaro': 1 }).map((p) => p.id)
  expect(passi).not.toContain('identifica-branco')
  expect(passi).toContain('branco-lupi')
})

test("rispetta l'ordine del regolamento tra le categorie", () => {
  const ruoli = ['fattucchiera', 'veggente', 'strega']
  const ordine = passiNotte(ruoli, 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['fattucchiera', 'veggente', 'strega'])
})

test("identifica-branco viene prima dei gesti segreti di Bardo/Gallo Mannaro (ordine libretto pag. 27)", () => {
  const ruoli = ['lupo-mannaro', 'bardo', 'gallo-mannaro']
  const ordine = passiNotte(ruoli, 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['identifica-branco', 'bardo', 'gallo-mannaro'])
})

test('cucciolo di lupo mannaro ha un passo dedicato tra i poteri passivi, prima che il branco si riconosca collettivamente', () => {
  const ordine = passiNotte(['cucciolo-di-lupo-mannaro'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['cucciolo-di-lupo-mannaro', 'identifica-branco'])
})

test('Ambasciatore e Berserker hanno un passo dedicato di identificazione, come gli altri ruoli a potere passivo', () => {
  const ordine = passiNotte(['ambasciatore', 'berserker'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['ambasciatore', 'berserker'])
})

test('la Nonna ha un passo dedicato prima che il branco si riconosca (niente selettore di ruolo in mezzo ai Lupi generici)', () => {
  const ordine = passiNotte(['nonna'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['nonna', 'identifica-branco'])
})

test('capobranco e progenitore hanno anch\'essi un passo dedicato prima che il branco si riconosca', () => {
  const ordine = passiNotte(
    ['lupo-mannaro-capobranco', 'lupo-mannaro-progenitore'],
    1,
    NESSUN_GIOCATORE,
  ).map((p) => p.id)
  expect(ordine).toEqual(['lupo-mannaro-capobranco', 'lupo-mannaro-progenitore', 'identifica-branco'])
})

test('una volta che cucciolo e capobranco sono già assegnati, i loro passi individuali restano (titolare vivo) accanto a "il branco si riconosce"', () => {
  const giocatori = [
    {
      id: '1',
      nome: 'Sara',
      ruoloSlug: 'cucciolo-di-lupo-mannaro',
      vivo: true,
      condizioni: [],
      storiaRuoli: ['cucciolo-di-lupo-mannaro'],
    },
    {
      id: '2',
      nome: 'Marco',
      ruoloSlug: 'lupo-mannaro-capobranco',
      vivo: true,
      condizioni: [],
      storiaRuoli: ['lupo-mannaro-capobranco'],
    },
  ]
  const ordine = passiNotte(
    ['cucciolo-di-lupo-mannaro', 'lupo-mannaro-capobranco', 'lupo-mannaro'],
    1,
    giocatori,
    { 'lupo-mannaro': 1 },
  ).map((p) => p.id)
  expect(ordine).toEqual(['cucciolo-di-lupo-mannaro', 'lupo-mannaro-capobranco', 'identifica-branco', 'branco-lupi'])

  // il passo "il branco si riconosce" non ripropone più cucciolo/capobranco
  // tra le carte da assegnare: restano solo i lupi generici
  const mazzo = ['cucciolo-di-lupo-mannaro', 'lupo-mannaro-capobranco', 'lupo-mannaro']
  const identificaBranco = NIGHT_STEPS.find((s) => s.id === 'identifica-branco')
  const assegnabili = ruoliAssegnabili(
    identificaBranco.ruoli.filter((slug) => mazzo.includes(slug)),
    giocatori,
    { 'lupo-mannaro': 1 },
  )
  expect(assegnabili).toEqual(['lupo-mannaro'])
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
