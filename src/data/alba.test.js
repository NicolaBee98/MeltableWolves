import { annunciAlba } from './alba'

test('annuncia i belati se un pastore vivo ha un lupo come vicino vivo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'pastore', vivo: true },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: true },
  ]
  expect(annunciAlba(giocatori, 1)).toContain('Si sentono dei belati.')
})

test('non annuncia i belati se il vicino del pastore è una Mucca Mannara (non è un lupo)', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'pastore', vivo: true },
    { id: '2', ruoloSlug: 'mucca-mannara', vivo: true },
  ]
  expect(annunciAlba(giocatori, 1)).not.toContain('Si sentono dei belati.')
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

test('annuncia un giocatore tornato in vita questa notte', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, resuscitatoNotte: 2 }]
  expect(annunciAlba(giocatori, 2)).toContain('Anna è stato resuscitato.')
})

test('non annuncia una resurrezione di una notte diversa', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, resuscitatoNotte: 1 }]
  expect(annunciAlba(giocatori, 2)).toEqual([])
})

test('annuncia un giocatore unto dall\'Untore', () => {
  const giocatori = [{ id: '1', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: ['unto'] }]
  expect(annunciAlba(giocatori, 1)).toContain("Marco è stato unto dall'Untore.")
})

test('annuncia un giocatore trasformato in maiale dalla Maga', () => {
  const giocatori = [{ id: '1', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: ['trasformato'] }]
  expect(annunciAlba(giocatori, 1)).toContain('Luca è stato trasformato in maiale dalla Maga.')
})

test('nessun annuncio se non ci sono condizioni particolari', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'villico', vivo: true }]
  expect(annunciAlba(giocatori, 1)).toEqual([])
})

test("L'Antico sbranato di notte emerge all'alba", () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'lantico', condizioni: [], anticoSbranatoNotte: 2 }]
  expect(annunciAlba(giocatori, 2).some((a) => a.includes("L'Antico"))).toBe(true)
  expect(annunciAlba(giocatori, 3)).toEqual([])
})

test('Pastore: belati solo con un lupo del branco vicino, non con la Guardia Mannara', () => {
  const mk = (slug) => [
    { id: '1', vivo: true, ruoloSlug: 'pastore', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: slug, condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  expect(annunciAlba(mk('guardia-mannara'), 1)).not.toContain('Si sentono dei belati.')
  expect(annunciAlba(mk('lupo-mannaro'), 1)).toContain('Si sentono dei belati.')
})

test("l'alba annuncia crepacuore, Mezzosangue trasformato, Apprendista e Figlia che ereditano di notte", () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, causaMorte: 'crepacuore', mortoNotte: 2 },
    { id: '2', nome: 'Bea', vivo: true, ruoloSlug: 'lupo-mannaro', trasformatoNotte: 2 },
    { id: '3', nome: 'Carlo', vivo: true, ruoloSlug: 'veggente', ereditaNotte: 2, ereditaDa: '4' },
    { id: '4', nome: 'Dino', vivo: false, ruoloSlug: 'veggente', causaMorte: 'notte', mortoNotte: 2 },
    { id: '5', nome: 'Eva', vivo: true, ruoloSlug: 'lupo-mannaro', figliaLupoNotte: 2 },
  ]
  const testo = annunciAlba(giocatori, 2).join(' | ')
  expect(testo).toMatch(/Anna è morto\/a di crepacuore/)
  expect(testo).toMatch(/Mezzosangue Bea .* diventa Lupo Mannaro/)
  expect(testo).toMatch(/Carlo si rivela: è l'Apprendista di Dino ed eredita il ruolo di Veggente/)
  expect(testo).toMatch(/Eva è la Figlia dei Lupi/)
  expect(annunciAlba(giocatori, 3)).toEqual([])
})

test('non annuncia unti o trasformati già morti', () => {
  const giocatori = [
    { id: '1', nome: 'Marco', ruoloSlug: 'villico', vivo: false, condizioni: ['unto'] },
    { id: '2', nome: 'Gino', ruoloSlug: 'villico', vivo: false, condizioni: ['trasformato'] },
    { id: '3', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['unto'] },
  ]
  const annunci = annunciAlba(giocatori, 1)
  expect(annunci).toEqual(["Anna è stato unto dall'Untore."])
})
