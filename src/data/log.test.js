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

const base = { vivo: true, condizioni: [], poteriUsati: [], storiaRuoli: [] }

test('Mimo che copia il Ladro: "imita" il Ladro (non il ruolo finale) e poi la scelta del Ladro', () => {
  const ladro = { ...base, id: '2', nome: 'Marco', ruoloSlug: 'ladro' }
  const mimo = { ...base, id: '1', nome: 'Sara', ruoloSlug: 'mimo', storiaRuoli: ['mimo'] }
  const dopoMimo = {
    ...mimo,
    ruoloSlug: 'veggente',
    storiaRuoli: ['mimo', 'ladro', 'veggente'],
    poteriUsati: ['ladro-scelta'],
    scartoLadro: ['veggente', 'boia'],
    legame: { tipo: 'mimo', targetId: '2' },
  }
  const messaggi = rilevaEventi([mimo, ladro], [dopoMimo, ladro], 1, 'notte').map((e) => e.messaggio)
  expect(messaggi).toContain('Il Mimo Sara imita Ladro (Marco)')
  // il Mimo sceglie tra le carte rimaste: non scarta nulla
  expect(messaggi).toContain('Sara (Mimo del Ladro) sceglie Veggente')
})

test('Mimo del Ladro prima del Ladro nell\'elenco dei giocatori: la voce del Ladro viene comunque per prima', () => {
  const ladro = { ...base, id: '2', nome: 'Marco', ruoloSlug: 'ladro', storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'boia'] }
  const mimo = { ...base, id: '1', nome: 'Sara', ruoloSlug: 'ladro', storiaRuoli: ['mimo', 'ladro'], legame: { tipo: 'mimo', targetId: '2' } }
  const dopoLadro = { ...ladro, ruoloSlug: 'veggente', storiaRuoli: ['ladro', 'veggente'], poteriUsati: ['ladro-scelta'] }
  const dopoMimo = { ...mimo, ruoloSlug: 'boia', storiaRuoli: ['mimo', 'ladro', 'boia'], poteriUsati: ['ladro-scelta'], scartoLadro: ['veggente', 'boia'] }
  expect(rilevaEventi([mimo, ladro], [dopoMimo, dopoLadro], 1, 'notte').map((e) => e.messaggio)).toEqual([
    'Il Ladro Marco sceglie Veggente: scarta Boia',
    'Sara (Mimo del Ladro) sceglie Boia',
  ])
})

test('Ladro: voce con la carta scelta e quelle scartate, senza "ha assunto il ruolo"', () => {
  const prima = { ...base, id: '1', nome: 'Anna', ruoloSlug: 'ladro', storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'boia'] }
  const dopo = { ...prima, ruoloSlug: 'boia', storiaRuoli: ['ladro', 'boia'], poteriUsati: ['ladro-scelta'] }
  expect(rilevaEventi([prima], [dopo], 1, 'notte').map((e) => e.messaggio)).toEqual([
    'Il Ladro Anna sceglie Boia: scarta Veggente',
  ])
  const villico = { ...dopo, ruoloSlug: 'villico' }
  expect(rilevaEventi([prima], [villico], 1, 'notte')[0].messaggio).toBe(
    'Il Ladro Anna sceglie di restare Villico: scarta Veggente e Boia',
  )
})

test('Bardo e Gallo: voce al gesto', () => {
  const prima = { ...base, id: '1', nome: 'Anna', ruoloSlug: 'bardo' }
  expect(rilevaEventi([prima], [{ ...prima, poteriUsati: ['bardo-salta-notte'] }], 1, 'giorno')[0].messaggio).toMatch(/Bardo.*salta/)
  expect(rilevaEventi([prima], [{ ...prima, poteriUsati: ['gallo-salta-giorno'] }], 1, 'alba')[0].messaggio).toMatch(/Gallo.*salta/)
})

test('Sacerdote: una voce per coppia; legami scelti; Apprendista e Figlia alla rivelazione', () => {
  const a = { ...base, id: '1', nome: 'Anna', ruoloSlug: 'villico' }
  const b = { ...base, id: '2', nome: 'Bea', ruoloSlug: 'villico' }
  const coppia = [
    { ...a, condizioni: ['innamorato'], innamoratiCon: ['2'] },
    { ...b, condizioni: ['innamorato'], innamoratiCon: ['1'] },
  ]
  expect(rilevaEventi([a, b], coppia, 1, 'notte').map((e) => e.messaggio)).toEqual([
    'Il Sacerdote unisce Anna e Bea: sono innamorati',
  ])

  const cav = { ...a, ruoloSlug: 'cavaliere' }
  expect(rilevaEventi([cav, b], [{ ...cav, legame: { tipo: 'cavaliere', targetId: '2' } }, b], 1, 'notte')[0].messaggio).toBe(
    'Il Cavaliere Anna sceglie di proteggere Bea',
  )

  const app = { ...a, ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: '2' } }
  expect(rilevaEventi([app, b], [{ ...app, ruoloSlug: 'veggente', legame: null }, b], 2, 'giorno').map((e) => e.messaggio)).toEqual([
    'Anna (Apprendista) eredita il ruolo di Veggente dal maestro Bea',
  ])
  const figlia = { ...a, ruoloSlug: 'figlia-dei-lupi', legame: { tipo: 'figlia-dei-lupi', targetId: '2' } }
  expect(rilevaEventi([figlia, b], [{ ...figlia, ruoloSlug: 'lupo-mannaro', legame: null }, b], 2, 'giorno')[0].messaggio).toMatch(
    /Figlia dei Lupi.*Lupo Mannaro/,
  )
})

test('morti sul colpo con causa: Boia, esplosione, rima sbagliata', () => {
  const prima = { ...base, id: '1', nome: 'Anna', ruoloSlug: 'villico' }
  const muore = (mortoDa) => rilevaEventi([prima], [{ ...prima, vivo: false, causaMorte: 'colpo', mortoDa }], 1, 'giorno')[0].messaggio
  expect(muore('boia')).toBe('Anna è morto/a: giustiziato/a dal Boia')
  expect(muore('alchimista')).toMatch(/esplosione/)
  expect(muore('scemo')).toMatch(/rima/)
})

test('registro: Boia con chi ha giustiziato, Borgomastro morto, Antico che sopravvive, resurrezione unica', () => {
  const base = [
    { id: '1', nome: 'G07', vivo: true, ruoloSlug: 'boia', condizioni: [] },
    { id: '2', nome: 'G12', vivo: true, ruoloSlug: 'villico', condizioni: [], eBorgomastro: true },
    { id: '3', nome: 'Ugo', vivo: false, causaMorte: 'notte', condizioni: [] },
    { id: '4', nome: 'Rita', vivo: false, causaMorte: 'notte', condizioni: [] },
  ]
  const dopo = base.map((g) =>
    g.id === '2' ? { ...g, vivo: false, causaMorte: 'colpo', mortoDa: 'boia', giustiziatoDa: '1' }
    : g.id === '3' ? { ...g, vivo: true, ruoloSlug: 'villico', storiaRuoli: ['lantico', 'villico'] }
    : g.id === '4' ? { ...g, vivo: true, condizioni: ['resuscitato'] } : g)
  const m = rilevaEventi(base, dopo, 1, 'giorno').map((e) => e.messaggio)
  expect(m).toContain('Il Boia G07 giustizia G12')
  expect(m.some((x) => /G12 era il Borgomastro/.test(x))).toBe(true)
  expect(m.join('|')).not.toMatch(/Ugo è tornato/)
  expect(m.some((x) => /Ugo.*perde la prima vita e sopravvive/.test(x))).toBe(true)
  expect(m).toContain('Rita è stato/a resuscitato/a')
  expect(m.join('|')).not.toMatch(/condizione "resuscitato"|Rita è tornato/)
})

test('registro: crepacuore e Mezzosangue notturni non sono doppi (ci sono gli annunci dell\'alba), il Gallo è del giorno, scelta di resurrezione', () => {
  const base = [
    { id: '1', nome: 'Ada', vivo: true, ruoloSlug: 'mezzosangue', condizioni: [] },
    { id: '2', nome: 'Bo', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '3', nome: 'Gio', vivo: false, ruoloSlug: 'villico', condizioni: [] },
    { id: '4', nome: 'Gua', vivo: true, ruoloSlug: 'guaritore', condizioni: [], poteriUsati: [] },
  ]
  const notte = base.map((g) =>
    g.id === '1' ? { ...g, ruoloSlug: 'lupo-mannaro', trasformatoNotte: 1 }
    : g.id === '2' ? { ...g, vivo: false, causaMorte: 'crepacuore', mortoNotte: 1 }
    : g.id === '3' ? { ...g, resuscitaAllAlba: 1 }
    : { ...g, poteriUsati: ['guaritore-resuscita'] })
  const m = rilevaEventi(base, notte, 1, 'notte').map((e) => e.messaggio)
  expect(m.join('|')).not.toMatch(/crepacuore|assunto il ruolo/)
  expect(m).toContain('Il Guaritore Gua sceglie di resuscitare Gio')
  const gallo = rilevaEventi(base, [{ ...base[0], poteriUsati: ['gallo-salta-giorno'] }, ...base.slice(1)], 1, 'alba')
  expect(gallo[0].fase).toBe('giorno')
})
