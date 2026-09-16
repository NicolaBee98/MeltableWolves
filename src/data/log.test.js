import { rilevaEventi } from './log'

test('rileva una morte e ne include la causa se nota', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico', causaMorte: 'rogo' }]
  expect(rilevaEventi(precedenti, correnti, 2)).toEqual([{ round: 2, messaggio: 'Anna è morto/a al rogo' }])
})

test('rileva una morte senza causa nota', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(precedenti, correnti, 2)).toEqual([{ round: 2, messaggio: 'Anna è morto/a' }])
})

test('rileva una resurrezione', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(precedenti, correnti, 3)).toEqual([{ round: 3, messaggio: 'Anna è tornato/a in vita' }])
})

test('rileva una condizione ottenuta e una persa', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: ['inibito'], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: ['unto'], ruoloSlug: 'villico' }]
  const eventi = rilevaEventi(precedenti, correnti, 1)
  expect(eventi).toContainEqual({ round: 1, messaggio: 'Anna ha ottenuto la condizione "unto"' })
  expect(eventi).toContainEqual({ round: 1, messaggio: 'Anna ha perso la condizione "inibito"' })
})

test('rileva un cambio di ruolo', () => {
  const precedenti = [{ id: '1', nome: 'Sara', vivo: true, condizioni: [], ruoloSlug: 'apprendista' }]
  const correnti = [{ id: '1', nome: 'Sara', vivo: true, condizioni: [], ruoloSlug: 'veggente' }]
  expect(rilevaEventi(precedenti, correnti, 2)).toEqual([{ round: 2, messaggio: 'Sara ha assunto il ruolo di veggente' }])
})

test('nessun evento se nulla è cambiato', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(giocatori, giocatori, 1)).toEqual([])
})

test('ignora i giocatori nuovi (non presenti prima)', () => {
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi([], correnti, 1)).toEqual([])
})
