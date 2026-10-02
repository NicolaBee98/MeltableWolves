import { contaAssegnati, ruoliAssegnabili, assegnaGuardiaMannaraCasuale } from './assegnazione'

test('contaAssegnati conta i giocatori con quel ruolo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro' },
    { id: '2', ruoloSlug: 'lupo-mannaro' },
    { id: '3', ruoloSlug: 'paladino' },
  ]
  expect(contaAssegnati(giocatori, 'lupo-mannaro')).toBe(2)
  expect(contaAssegnati(giocatori, 'paladino')).toBe(1)
  expect(contaAssegnati(giocatori, 'veggente')).toBe(0)
})

test('contaAssegnati resta a 1 anche se il giocatore ha poi cambiato ruoloSlug (es. Addolorata che scambia carta)', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'veggente', storiaRuoli: ['addolorata', 'veggente'] }]
  expect(contaAssegnati(giocatori, 'addolorata')).toBe(1)
})

test('ruoliAssegnabili esclude i ruoli già al completo rispetto alla quantità nel mazzo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro' },
    { id: '2', ruoloSlug: 'lupo-mannaro' },
  ]
  const quantita = { 'lupo-mannaro': 2, nonna: 1 }
  expect(ruoliAssegnabili(['lupo-mannaro', 'nonna'], giocatori, quantita)).toEqual(['nonna'])
})

test('un ruolo senza quantità nel mazzo ha capacità di default 1', () => {
  expect(ruoliAssegnabili(['paladino'], [], {})).toEqual(['paladino'])

  const giocatoriConPaladino = [{ id: '1', ruoloSlug: 'paladino' }]
  expect(ruoliAssegnabili(['paladino'], giocatoriConPaladino, {})).toEqual([])
})

test('assegnaGuardiaMannaraCasuale sceglie esattamente una delle Guardie come traditrice, senza toccare le altre', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'guardia', storiaRuoli: ['guardia'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'guardia', storiaRuoli: ['guardia'] },
    { id: '3', nome: 'Luca', ruoloSlug: 'guardia', storiaRuoli: ['guardia'] },
  ]
  const aggiornaGiocatore = vi.fn()
  assegnaGuardiaMannaraCasuale(giocatori, aggiornaGiocatore, { guardia: 2, 'guardia-mannara': 1 })

  expect(aggiornaGiocatore).toHaveBeenCalledTimes(1)
  const [id, patch] = aggiornaGiocatore.mock.calls[0]
  expect(['1', '2', '3']).toContain(id)
  expect(patch).toEqual({ ruoloSlug: 'guardia-mannara', storiaRuoli: ['guardia-mannara'] })
})

test('assegnaGuardiaMannaraCasuale non fa nulla se il mazzo non prevede la Guardia Mannara', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'guardia', storiaRuoli: ['guardia'] }]
  const aggiornaGiocatore = vi.fn()
  assegnaGuardiaMannaraCasuale(giocatori, aggiornaGiocatore, { guardia: 2 })
  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})

test('assegnaGuardiaMannaraCasuale non fa nulla se è già stata scelta', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'guardia-mannara', storiaRuoli: ['guardia-mannara'] },
    { id: '2', ruoloSlug: 'guardia', storiaRuoli: ['guardia'] },
  ]
  const aggiornaGiocatore = vi.fn()
  assegnaGuardiaMannaraCasuale(giocatori, aggiornaGiocatore, { guardia: 2, 'guardia-mannara': 1 })
  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})

test('contaAssegnati: il Mimo che copia un ruolo non lo conta due volte', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro', storiaRuoli: ['lupo-mannaro'] },
    { id: '2', ruoloSlug: 'lupo-mannaro', storiaRuoli: ['mimo', 'lupo-mannaro'] },
  ]
  expect(contaAssegnati(giocatori, 'lupo-mannaro')).toBe(1)
  expect(contaAssegnati(giocatori, 'mimo')).toBe(1)
})

test('contaAssegnati: storiaRuoli [] (salvataggi vecchi) ripiega su ruoloSlug', () => {
  expect(contaAssegnati([{ id: '1', ruoloSlug: 'paladino', storiaRuoli: [] }], 'paladino')).toBe(1)
})

test('assegnaGuardiaMannaraCasuale non sceglie mai il Mimo che copia la Guardia', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'guardia', storiaRuoli: ['mimo', 'guardia'], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', ruoloSlug: 'guardia', storiaRuoli: ['guardia'] },
  ]
  for (let i = 0; i < 20; i++) {
    const aggiornaGiocatore = vi.fn()
    assegnaGuardiaMannaraCasuale(giocatori, aggiornaGiocatore, { guardia: 1, 'guardia-mannara': 1 })
    expect(aggiornaGiocatore).toHaveBeenCalledTimes(1)
    expect(aggiornaGiocatore.mock.calls[0][0]).toBe('2')
  }
})

test('contaAssegnati: chi era Ladro e ha scelto la carta Mimo conta ancora come Ladro e come Mimo', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'mimo', storiaRuoli: ['ladro', 'mimo'] }]
  expect(contaAssegnati(giocatori, 'ladro')).toBe(1)
  expect(contaAssegnati(giocatori, 'mimo')).toBe(1)
})
