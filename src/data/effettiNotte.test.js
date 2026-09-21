import {
  aggiungiCondizionePatch,
  uccidiPatch,
  resuscitaPatch,
  usatoStanotte,
  segnaUsoStanotte,
  applicaCrepacuore,
  rimuoviAccecamentoSeMortoPolpo,
  risolviAttaccoBranco,
  daRipulireCambioNotte,
  maturaCucciolo,
} from './effettiNotte'

const RUOLI_BRANCO = ['lupo-mannaro', 'cucciolo-di-lupo-mannaro']

test('aggiungiCondizionePatch aggiunge la condizione se non presente', () => {
  const giocatore = { condizioni: [] }
  expect(aggiungiCondizionePatch(giocatore, 'unto')).toEqual({ condizioni: ['unto'] })
})

test('aggiungiCondizionePatch ritorna null se la condizione è già presente', () => {
  const giocatore = { condizioni: ['unto'] }
  expect(aggiungiCondizionePatch(giocatore, 'unto')).toBeNull()
})

test('uccidiPatch ritorna vivo:false, causaMorte:notte e la notte corrente se il giocatore non è protetto', () => {
  expect(uccidiPatch({ condizioni: [] }, 3)).toEqual({ vivo: false, causaMorte: 'notte', mortoNotte: 3 })
})

test('uccidiPatch ritorna null se il giocatore è protetto', () => {
  expect(uccidiPatch({ condizioni: ['protetto'] }, 3)).toBeNull()
})

test("uccidiPatch: L'Antico non muore di notte, sopravvive e diventa Villico (prima vita)", () => {
  expect(uccidiPatch({ ruoloSlug: 'lantico', condizioni: [], storiaRuoli: ['lantico'] }, 3)).toEqual({
    vivo: true,
    ruoloSlug: 'villico',
    storiaRuoli: ['lantico', 'villico'],
  })
})

test("uccidiPatch: L'Antico protetto non consuma la sua prima vita (il morso non ha effetto)", () => {
  expect(uccidiPatch({ ruoloSlug: 'lantico', condizioni: ['protetto'] }, 3)).toBeNull()
})

test('resuscitaPatch riporta in vita un giocatore morto e marca la notte della resurrezione', () => {
  expect(resuscitaPatch({ vivo: false, condizioni: [] }, 3)).toEqual({
    vivo: true,
    condizioni: ['resuscitato'],
    resuscitatoNotte: 3,
  })
})

test('resuscitaPatch ritorna null se il giocatore è già vivo', () => {
  expect(resuscitaPatch({ vivo: true, condizioni: [] }, 3)).toBeNull()
})

test('uccidiPatch con ignoraProtezione uccide anche un giocatore protetto (es. pozione mortale della Strega)', () => {
  expect(uccidiPatch({ condizioni: ['protetto'] }, 3, { ignoraProtezione: true })).toEqual({
    vivo: false,
    causaMorte: 'notte',
    mortoNotte: 3,
  })
})

test('usatoStanotte è false se nessuno dei ruoli indicati ha usato il potere', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'paladino', usiNotte: [] }]
  expect(usatoStanotte(giocatori, ['paladino'], 'paladino')).toBe(false)
})

test('segnaUsoStanotte marca il potere usato sui giocatori con uno dei ruoli indicati', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro', usiNotte: [] },
    { id: '2', ruoloSlug: 'villico', usiNotte: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  segnaUsoStanotte(giocatori, aggiornaGiocatore, ['lupo-mannaro'], 'branco-lupi-sbrana')

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { usiNotte: ['branco-lupi-sbrana'] })
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.anything())
})

test('usatoStanotte diventa true dopo segnaUsoStanotte sullo stesso array aggiornato', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'veggente', usiNotte: ['veggente-indagine'] }]
  expect(usatoStanotte(giocatori, ['veggente'], 'veggente-indagine')).toBe(true)
})

test('applicaCrepacuore uccide anche il partner innamorato ancora vivo, ereditando il round del lutto scatenante', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, condizioni: ['innamorato'], mortoNotte: 2 },
    { id: '2', nome: 'Marco', vivo: true, condizioni: ['innamorato'] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const risultato = applicaCrepacuore(giocatori, '1')

  expect(risultato.find((g) => g.id === '2')).toMatchObject({ vivo: false, causaMorte: 'crepacuore', mortoNotte: 2 })
  expect(risultato.find((g) => g.id === '3')).toMatchObject({ vivo: true })
})

test('applicaCrepacuore non fa nulla se il morto non è innamorato', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: ['innamorato'] },
  ]
  expect(applicaCrepacuore(giocatori, '1')).toBe(giocatori)
})

test('daRipulireCambioNotte rimuove "unto" e "trasformato" dai giocatori che le hanno', () => {
  const giocatori = [
    { id: '1', condizioni: ['unto'] },
    { id: '2', condizioni: ['trasformato', 'protetto'] },
    { id: '3', condizioni: ['protetto'] },
  ]
  expect(daRipulireCambioNotte(giocatori)).toEqual([
    { id: '1', condizioni: [] },
    { id: '2', condizioni: ['protetto'] },
  ])
})

test('rimuoviAccecamentoSeMortoPolpo rimuove "accecato" dal Veggente quando il Polpo Mannaro muore', () => {
  const giocatori = [
    { id: '1', nome: 'Elena', ruoloSlug: 'veggente', vivo: true, condizioni: ['accecato'] },
    { id: '2', nome: 'Polpo', ruoloSlug: 'polpo-mannaro', vivo: false, condizioni: [] },
  ]
  const risultato = rimuoviAccecamentoSeMortoPolpo(giocatori, '2')
  expect(risultato.find((g) => g.id === '1').condizioni).not.toContain('accecato')
})

test('rimuoviAccecamentoSeMortoPolpo non fa nulla se il morto non è il Polpo Mannaro', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'veggente', vivo: true, condizioni: ['accecato'] }]
  expect(rimuoviAccecamentoSeMortoPolpo(giocatori, '1')).toBe(giocatori)
})

test('risolviAttaccoBranco: la Cortigiana è immune al bersaglio diretto dei lupi', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'cortigiana', vivo: true, condizioni: [] }]
  expect(risolviAttaccoBranco(giocatori, '1', 2, RUOLI_BRANCO)).toEqual({})
})

test('risolviAttaccoBranco: il Nano è immune ai lupi di notte', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'nano', vivo: true, condizioni: [] }]
  expect(risolviAttaccoBranco(giocatori, '1', 2, RUOLI_BRANCO)).toEqual({})
})

test('risolviAttaccoBranco: il Criceto Malvagio è immune ai lupi di notte', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'criceto-malvagio', vivo: true, condizioni: [] }]
  expect(risolviAttaccoBranco(giocatori, '1', 2, RUOLI_BRANCO)).toEqual({})
})

test('risolviAttaccoBranco: il Mezzosangue sbranato diventa Lupo Mannaro invece di morire', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'mezzosangue', vivo: true, condizioni: [], storiaRuoli: ['mezzosangue'] }]
  const patch = risolviAttaccoBranco(giocatori, '1', 2, RUOLI_BRANCO)
  expect(patch['1']).toMatchObject({ ruoloSlug: 'lupo-mannaro' })
  expect(patch['1'].storiaRuoli).toContain('lupo-mannaro')
})

test('risolviAttaccoBranco: il Berserker sbranato uccide il lupo vivo più vicino a sé', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
    { id: '3', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviAttaccoBranco(giocatori, '2', 4, RUOLI_BRANCO)
  expect(patch['2']).toMatchObject({ vivo: false })
  expect(patch['3']).toMatchObject({ vivo: false, causaMorte: 'notte', mortoNotte: 4 })
})

test('risolviAttaccoBranco: se non ci sono lupi vivi vicini, il Berserker muore senza altre conseguenze', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'berserker', vivo: true, condizioni: [] }]
  const patch = risolviAttaccoBranco(giocatori, '1', 4, RUOLI_BRANCO)
  expect(Object.keys(patch)).toEqual(['1'])
})

test("risolviAttaccoBranco: l'Ubriaco sbranato stordisce il branco la notte successiva", () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'ubriaco', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviAttaccoBranco(giocatori, '1', 3, RUOLI_BRANCO)
  expect(patch['2']).toEqual({ brancoStorditoFinoA: 4 })
})

test('risolviAttaccoBranco: il Cucciolo ucciso fa scattare la vendetta doppia sul branco', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviAttaccoBranco(giocatori, '1', 3, RUOLI_BRANCO)
  expect(patch['2']).toEqual({ vendettaCucciolo: true })
})

test('risolviAttaccoBranco: un bersaglio protetto non muore e non genera reazioni', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'ubriaco', vivo: true, condizioni: ['protetto'] }]
  expect(risolviAttaccoBranco(giocatori, '1', 3, RUOLI_BRANCO)).toEqual({})
})

test('maturaCucciolo trasforma il Cucciolo in Lupo Mannaro semplice quando muore un altro lupo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [], storiaRuoli: ['cucciolo-di-lupo-mannaro'] },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: false, condizioni: [] },
  ]
  const risultato = maturaCucciolo(giocatori, '2')
  expect(risultato.find((g) => g.id === '1')).toMatchObject({ ruoloSlug: 'lupo-mannaro' })
  expect(risultato.find((g) => g.id === '1').storiaRuoli).toContain('lupo-mannaro')
})

test('maturaCucciolo non fa nulla se il morto non è di fazione lupi', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  expect(maturaCucciolo(giocatori, '2')).toBe(giocatori)
})

test('maturaCucciolo non fa nulla se il morto è il Cucciolo stesso', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: false, condizioni: [] }]
  const risultato = maturaCucciolo(giocatori, '1')
  expect(risultato.find((g) => g.id === '1').ruoloSlug).toBe('cucciolo-di-lupo-mannaro')
})
