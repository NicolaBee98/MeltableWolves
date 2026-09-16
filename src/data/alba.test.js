import { annunciAlba } from './alba'

test('annuncia i belati se un pastore vivo ha un lupo come vicino vivo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'pastore', vivo: true },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: true },
  ]
  expect(annunciAlba(giocatori, 1)).toContain('Si sentono dei belati.')
})

test('non annuncia i belati se il pastore non ha lupi vicini', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'pastore', vivo: true },
    { id: '2', ruoloSlug: 'villico', vivo: true },
  ]
  expect(annunciAlba(giocatori, 1)).not.toContain('Si sentono dei belati.')
})

test("annuncia il messaggio dell'ambasciatore se vivo e il veggente ha percepito aura benevola questa notte", () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'ambasciatore', vivo: true },
    { id: '2', ruoloSlug: 'veggente', vivo: true, ultimaIndagine: { targetId: '1', esito: 'benevola', notte: 2 } },
  ]
  expect(annunciAlba(giocatori, 2)).toContain("È arrivato un messaggio dall'ambasciatore.")
})

test("non annuncia il messaggio dell'ambasciatore se è morto", () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'ambasciatore', vivo: false },
    { id: '2', ruoloSlug: 'veggente', vivo: true, ultimaIndagine: { targetId: '1', esito: 'benevola', notte: 2 } },
  ]
  expect(annunciAlba(giocatori, 2)).not.toContain("È arrivato un messaggio dall'ambasciatore.")
})

test("non annuncia il messaggio dell'ambasciatore se l'indagine è di una notte diversa", () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'ambasciatore', vivo: true },
    { id: '2', ruoloSlug: 'veggente', vivo: true, ultimaIndagine: { targetId: '1', esito: 'benevola', notte: 1 } },
  ]
  expect(annunciAlba(giocatori, 2)).not.toContain("È arrivato un messaggio dall'ambasciatore.")
})

test('nessun annuncio se non ci sono condizioni particolari', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'villico', vivo: true }]
  expect(annunciAlba(giocatori, 1)).toEqual([])
})
