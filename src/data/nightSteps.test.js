import { NIGHT_STEPS, passiNotte } from './nightSteps'

const NESSUN_GIOCATORE = []

test('mazzo senza ruoli con azione notturna non genera passi', () => {
  expect(passiNotte(['villico'], 1, NESSUN_GIOCATORE)).toEqual([])
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

test('cucciolo di lupo mannaro compare nel promemoria potere-passivo e in identifica-branco, non ancora nel branco', () => {
  const ordine = passiNotte(['cucciolo-di-lupo-mannaro'], 1, NESSUN_GIOCATORE).map((p) => p.id)
  expect(ordine).toEqual(['potere-passivo', 'identifica-branco'])
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

test('i passi di solo promemoria non sono assegnabili', () => {
  const potere = NIGHT_STEPS.find((s) => s.id === 'potere-passivo')
  const gesti = NIGHT_STEPS.find((s) => s.id === 'gesti-segreti')
  expect(potere.assegnabile).toBe(false)
  expect(gesti.assegnabile).toBe(false)
})

test('un passo normale non ha assegnabile impostato a false', () => {
  const paladino = NIGHT_STEPS.find((s) => s.id === 'paladino')
  expect(paladino.assegnabile).not.toBe(false)
})

test('salta un passo di ruolo il cui unico titolare è morto e il ruolo è già stato assegnato del tutto', () => {
  const giocatori = [{ id: '1', nome: 'Bruno', ruoloSlug: 'veggente', vivo: false, condizioni: [] }]
  expect(passiNotte(['veggente'], 2, giocatori, { veggente: 1 }).map((p) => p.id)).not.toContain('veggente')
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

test('i passi di solo promemoria restano anche se nessun giocatore ha mai quel ruolo assegnato', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] }]
  expect(passiNotte(['eremita'], 1, giocatori, {}).map((p) => p.id)).toContain('potere-passivo')
})
