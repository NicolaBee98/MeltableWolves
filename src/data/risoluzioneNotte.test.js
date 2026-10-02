import { risolviLegami, risolviCortigiana } from './risoluzioneNotte'

test('apprendista eredita il ruolo del maestro quando muore', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['1']).toEqual({ ruoloSlug: 'veggente', legame: null })
})

test('apprendista che eredita un Guaritore/Sciacallo già usato riceve la carta senza potere; se non usato, lo può usare', () => {
  for (const [ruolo, potere] of [['guaritore', 'guaritore-resuscita'], ['sciacallo-mannaro', 'sciacallo-mannaro-resuscita']]) {
    const mk = (poteriUsati) => [
      { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], poteriUsati: [], legame: { tipo: 'apprendista', targetId: '2' } },
      { id: '2', nome: 'Marco', ruoloSlug: ruolo, vivo: false, condizioni: [], poteriUsati },
    ]
    expect(risolviLegami(mk([potere]))['1'].poteriUsati).toEqual([potere])
    expect(risolviLegami(mk([]))['1'].poteriUsati).toBeUndefined()
  }
})

test('cavaliere muore al posto del bersaglio se sbranato di notte', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte', mortoNotte: 3 },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toEqual({ vivo: true, causaMorte: undefined })
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'sacrificio', mortoNotte: 3, legame: null })
})

test('cavaliere si rivela e si immola al posto del bersaglio anche se questo viene messo al rogo', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toEqual({ vivo: true, causaMorte: undefined })
  // al rogo il sacrificio non porta mortoNotte: non va riannunciato all'alba dopo
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'sacrificio', mortoNotte: undefined, legame: null })
})

test('cavaliere salva il bersaglio da qualunque causa di morte (es. morte sul colpo)', () => {
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'colpo' },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toMatchObject({ vivo: true })
  expect(patch['1']).toMatchObject({ vivo: false, causaMorte: 'sacrificio' })
})

test('figlia dei lupi diventa lupo mannaro quando il genitore muore', () => {
  const giocatori = [
    { id: '1', nome: 'Elsa', ruoloSlug: 'figlia-dei-lupi', vivo: true, condizioni: [], legame: { tipo: 'figlia-dei-lupi', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['1']).toEqual({ ruoloSlug: 'lupo-mannaro', legame: null })
})

test('nessun effetto se il bersaglio del legame è ancora vivo', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  expect(risolviLegami(giocatori)).toEqual({})
})

test('la cortigiana muore se il cliente scelto è un lupo', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviCortigiana(giocatori, 4)
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'notte', mortoNotte: 4, visitaNotturna: null })
})

test('la cortigiana sopravvive se il cliente è un Gallo Mannaro (non è un lupo)', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Marco', ruoloSlug: 'gallo-mannaro', vivo: true, condizioni: [] },
  ]
  expect(risolviCortigiana(giocatori, 4)['1']).toEqual({ visitaNotturna: null })
})

test('la cortigiana muore se il cliente è stato sbranato dal branco', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte', mortoDa: 'branco' },
  ]
  const patch = risolviCortigiana(giocatori, 4)
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'notte', mortoNotte: 4, visitaNotturna: null })
})

test('la cortigiana muore se il cliente è stato ucciso dal Chupacabra', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte', mortoDa: 'chupacabra' },
  ]
  const patch = risolviCortigiana(giocatori, 4)
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'notte', mortoNotte: 4, visitaNotturna: null })
})

test('la cortigiana muore se visita direttamente il Chupacabra', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Gino', ruoloSlug: 'chupacabra', vivo: true, condizioni: [] },
  ]
  const patch = risolviCortigiana(giocatori, 4)
  expect(patch['1']).toEqual({ vivo: false, causaMorte: 'notte', mortoNotte: 4, visitaNotturna: null })
})

test('la cortigiana sopravvive se il cliente muore per la pozione mortale della Strega, non sbranato', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte' },
  ]
  const patch = risolviCortigiana(giocatori)
  expect(patch['1']).toEqual({ visitaNotturna: null })
})

test('la cortigiana sopravvive se il cliente è vivo e non è un lupo', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  const patch = risolviCortigiana(giocatori)
  expect(patch['1']).toEqual({ visitaNotturna: null })
})

test('nessuna patch se la cortigiana non ha visitato nessuno', () => {
  const giocatori = [{ id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [] }]
  expect(risolviCortigiana(giocatori)).toEqual({})
})

const base = { vivo: true, condizioni: [] }

test('legami: un attore morto non risolve il proprio legame', () => {
  const giocatori = [
    { ...base, id: '1', vivo: false, ruoloSlug: 'cavaliere', legame: { tipo: 'cavaliere', targetId: '2' } },
    { ...base, id: '2', vivo: false, ruoloSlug: 'veggente', causaMorte: 'notte' },
  ]
  expect(risolviLegami(giocatori)).toEqual({})
})

test('Cavaliere salva da qualsiasi causa (es. Strega) e al rogo il sacrificio non ha mortoNotte', () => {
  const giocatori = [
    { ...base, id: '1', ruoloSlug: 'cavaliere', legame: { tipo: 'cavaliere', targetId: '2' } },
    { ...base, id: '2', vivo: false, ruoloSlug: 'veggente', causaMorte: 'rogo', mortoNotte: 2 },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['2']).toMatchObject({ vivo: true })
  expect(patch['1']).toMatchObject({ vivo: false, causaMorte: 'sacrificio', mortoNotte: undefined })
  giocatori[1].causaMorte = 'notte'
  giocatori[1].mortoDa = 'strega'
  expect(risolviLegami(giocatori)['2']).toMatchObject({ vivo: true })
})

test('Cavaliere e Apprendista sullo stesso bersaglio: l\'Apprendista non eredita se il Cavaliere salva', () => {
  const giocatori = [
    { ...base, id: '1', ruoloSlug: 'cavaliere', legame: { tipo: 'cavaliere', targetId: '3' } },
    { ...base, id: '2', ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: '3' } },
    { ...base, id: '3', vivo: false, ruoloSlug: 'veggente', causaMorte: 'notte' },
  ]
  expect(risolviLegami(giocatori)['2']).toBeUndefined()
})

test('Apprendista con maestro senza ruolo noto resta legato', () => {
  const giocatori = [
    { ...base, id: '1', ruoloSlug: 'apprendista', legame: { tipo: 'apprendista', targetId: '2' } },
    { ...base, id: '2', vivo: false },
  ]
  expect(risolviLegami(giocatori)['1']).toBeUndefined()
})

test('Cortigiana con cliente lupo protetto sopravvive; non protetto muore', () => {
  const mk = (condizioni) => [
    { ...base, id: '1', ruoloSlug: 'cortigiana', visitaNotturna: '2', condizioni: ['protetto'] },
    { ...base, id: '2', ruoloSlug: 'lupo-mannaro', condizioni },
  ]
  expect(risolviCortigiana(mk(['protetto']), 1)['1']).toEqual({ visitaNotturna: null })
  expect(risolviCortigiana(mk([]), 1)['1']).toMatchObject({ vivo: false })
})

test('più Cortigiane (Mimo) vengono risolte ognuna col proprio cliente', () => {
  const giocatori = [
    { ...base, id: '1', ruoloSlug: 'cortigiana', visitaNotturna: '3' },
    { ...base, id: '2', ruoloSlug: 'cortigiana', visitaNotturna: '4' },
    { ...base, id: '3', ruoloSlug: 'lupo-mannaro' },
    { ...base, id: '4', ruoloSlug: 'villico' },
  ]
  const patch = risolviCortigiana(giocatori, 1)
  expect(patch['1']).toMatchObject({ vivo: false })
  expect(patch['2']).toEqual({ visitaNotturna: null })
})

test('apprendista copiato dal Mimo (legameMimo): eredita il ruolo senza perdere il legame di imitazione', () => {
  const giocatori = [
    {
      id: '1', nome: 'Mia', ruoloSlug: 'apprendista', vivo: true, condizioni: [],
      legame: { tipo: 'mimo', targetId: '3' }, legameMimo: { tipo: 'apprendista', targetId: '2' },
    },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
    { id: '3', nome: 'Anna', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
  ]
  expect(risolviLegami(giocatori)).toEqual({ 1: { ruoloSlug: 'veggente', legameMimo: null } })
})

test('Apprendista e Mimo-Apprendista con due maestri diversi: ognuno eredita il ruolo del proprio maestro', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '3' } },
    {
      id: '2', ruoloSlug: 'apprendista', vivo: true, condizioni: [],
      legame: { tipo: 'mimo', targetId: '1' }, legameMimo: { tipo: 'apprendista', targetId: '4' },
    },
    { id: '3', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
    { id: '4', ruoloSlug: 'paladino', vivo: true, condizioni: [] },
  ]
  const patch = risolviLegami(giocatori)
  expect(patch['1']).toMatchObject({ ruoloSlug: 'veggente' })
  expect(patch['2']).toBeUndefined() // il suo maestro è ancora vivo
})

test("l'Apprendista con maestro Mimo che copia il Veggente diventa Veggente, non Mimo", () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', ruoloSlug: 'veggente', vivo: false, condizioni: [], storiaRuoli: ['mimo', 'veggente'], legame: { tipo: 'mimo', targetId: '3' } },
  ]
  expect(risolviLegami(giocatori)['1'].ruoloSlug).toBe('veggente')
})

test('Cortigiana e Mimo-Cortigiana con lo stesso cliente sbranato muoiono entrambe', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '3' },
    { id: '2', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '3' },
    { id: '3', ruoloSlug: 'villico', vivo: false, condizioni: [], mortoDa: 'branco' },
  ]
  const patch = risolviCortigiana(giocatori, 2)
  expect(patch['1'].vivo).toBe(false)
  expect(patch['2'].vivo).toBe(false)
})
