import { rilevaEventi } from './log'

test('rileva una morte e ne include la causa se nota', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico', causaMorte: 'rogo' }]
  expect(rilevaEventi(precedenti, correnti, 2, 'giorno')).toEqual([
    { round: 2, fase: 'rogo', messaggio: 'Anna è morto/a al rogo' },
  ])
})

test('una morte al rogo è sempre fase "rogo", indipendentemente dalla fase passata', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico', causaMorte: 'rogo' }]
  expect(rilevaEventi(precedenti, correnti, 2, 'notte')[0].fase).toBe('rogo')
})

test('una morte non al rogo prende la fase passata dal chiamante', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico', causaMorte: 'notte' }]
  expect(rilevaEventi(precedenti, correnti, 2, 'notte')[0].fase).toBe('notte')
})

test('rileva una morte senza causa nota', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(precedenti, correnti, 2, 'notte')).toEqual([
    { round: 2, fase: 'notte', messaggio: 'Anna è morto/a' },
  ])
})

test('rileva una resurrezione', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(precedenti, correnti, 3, 'notte')).toEqual([
    { round: 3, fase: 'notte', messaggio: 'Anna è tornato/a in vita' },
  ])
})

test('rileva una condizione ottenuta e una persa', () => {
  const precedenti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: ['inibito'], ruoloSlug: 'villico' }]
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: ['unto'], ruoloSlug: 'villico' }]
  const eventi = rilevaEventi(precedenti, correnti, 1, 'notte')
  expect(eventi).toContainEqual({ round: 1, fase: 'notte', messaggio: 'Anna ha ottenuto la condizione "unto"' })
  expect(eventi).toContainEqual({ round: 1, fase: 'notte', messaggio: 'Anna ha perso la condizione "inibito"' })
})

test('rileva un cambio di ruolo', () => {
  const precedenti = [{ id: '1', nome: 'Sara', vivo: true, condizioni: [], ruoloSlug: 'apprendista' }]
  const correnti = [{ id: '1', nome: 'Sara', vivo: true, condizioni: [], ruoloSlug: 'veggente' }]
  expect(rilevaEventi(precedenti, correnti, 2, 'notte')).toEqual([
    { round: 2, fase: 'notte', messaggio: 'Sara ha assunto il ruolo di Veggente' },
  ])
})

test('nessun evento se nulla è cambiato', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi(giocatori, giocatori, 1, 'notte')).toEqual([])
})

test('ignora i giocatori nuovi (non presenti prima)', () => {
  const correnti = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  expect(rilevaEventi([], correnti, 1, 'notte')).toEqual([])
})

test('log: la Guardia Mannara non viene mai rivelata e la prima assegnazione non è un evento', () => {
  const g = (ruoloSlug) => [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug }]
  expect(rilevaEventi(g(undefined), g('guardia-mannara'), 1, 'notte')).toEqual([])
  expect(rilevaEventi(g('guardia'), g('guardia-mannara'), 1, 'notte')).toEqual([])
  expect(rilevaEventi(g('villico'), g('veggente'), 1, 'notte')[0].messaggio).toBe('Anna ha assunto il ruolo di Veggente')
})

test('il Mimo che sceglie chi imitare: "Il Mimo Sara imita Veggente (Marco)", poi i suoi eventi portano "(Mimo)"', () => {
  const marco = { id: '2', nome: 'Marco', vivo: true, condizioni: [], ruoloSlug: 'veggente' }
  const mimo = { id: '1', nome: 'Sara', vivo: true, condizioni: [], ruoloSlug: 'mimo', storiaRuoli: ['mimo'] }
  const copia = { ...mimo, ruoloSlug: 'veggente', legame: { tipo: 'mimo', targetId: '2' } }
  expect(rilevaEventi([mimo, marco], [copia, marco], 1, 'notte')).toEqual([
    { round: 1, fase: 'notte', messaggio: 'Il Mimo Sara imita Veggente (Marco)' },
  ])
  expect(rilevaEventi([copia, marco], [{ ...copia, vivo: false, causaMorte: 'rogo' }, marco], 2, 'giorno')[0].messaggio).toBe(
    'Sara (Mimo) è morto/a al rogo',
  )
})

test('rivelazioni diurne, Antico, Borgomastro e Fantasma entrano nel registro; di notte (Ladro) no', () => {
  const p = { id: '1', nome: 'Anna', vivo: true, condizioni: [], storiaRuoli: [] }
  const msgs = (c, fase) => rilevaEventi([p], [{ ...p, ...c }], 2, fase).map((e) => e.messaggio)
  expect(msgs({ ruoloSlug: 'innocente', storiaRuoli: ['innocente'] }, 'giorno')).toEqual(['Anna si è rivelato/a: è Innocente'])
  expect(msgs({ ruoloSlug: 'boia', storiaRuoli: ['boia'] }, 'notte')).toEqual([])
  expect(msgs({ ruoloSlug: 'villico', storiaRuoli: ['lantico', 'villico'] }, 'giorno')[0]).toMatch(/L'Antico/)
  expect(msgs({ eBorgomastro: true }, 'alba')).toEqual(['Anna è stato/a eletto/a Borgomastro'])
  expect(msgs({ eFantasmaOnnisciente: true }, 'giorno')).toEqual(['Anna riceve la carta del Fantasma Onnisciente'])
})
