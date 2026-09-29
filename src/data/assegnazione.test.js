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
