import {
  aggiungiCondizionePatch,
  uccidiPatch,
  resuscitaPatch,
  liberaPartnerDi,
  usatoStanotte,
  segnaUsoStanotte,
  applicaCrepacuore,
  rimuoviAccecamentoSeMortoPolpo,
  risolviAttaccoBranco,
  daRipulireCambioNotte,
  maturaCucciolo,
  attivaVendettaCucciolo,
  berserkerLupiCandidati,
  propagaUnzione,
  aggiornaTuttiConRuolo,
  avvisiColpo,
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

test("uccidiPatch: L'Antico non muore di notte, sopravvive col flag anticoSbranatoNotte (non si converte in silenzio)", () => {
  expect(uccidiPatch({ ruoloSlug: 'lantico', condizioni: [], storiaRuoli: ['lantico'] }, 3)).toEqual({
    vivo: true,
    anticoSbranatoNotte: 3,
  })
})

test("uccidiPatch: L'Antico già sbranato una volta muore alla seconda", () => {
  expect(uccidiPatch({ ruoloSlug: 'lantico', condizioni: [], anticoSbranatoNotte: 2 }, 3)).toMatchObject({ vivo: false })
})

test("uccidiPatch: L'Antico protetto non consuma la sua prima vita (il morso non ha effetto)", () => {
  expect(uccidiPatch({ ruoloSlug: 'lantico', condizioni: ['protetto'] }, 3)).toBeNull()
})

test('resuscitaPatch riporta in vita un giocatore morto e marca la notte della resurrezione', () => {
  expect(resuscitaPatch({ vivo: false, condizioni: [] }, 3)).toEqual({
    vivo: true,
    causaMorte: undefined,
    mortoNotte: undefined,
    mortoDa: undefined,
    visitaNotturna: null,
    condizioni: ['resuscitato'],
    innamoratiCon: [],
    resuscitatoNotte: 3,
  })
})

test('resuscitaPatch non duplica "resuscitato"', () => {
  expect(resuscitaPatch({ vivo: false, condizioni: ['resuscitato'] }, 3).condizioni).toEqual(['resuscitato'])
})

test('crepacuore per una morte sul colpo di giorno (Boia) eredita mortoGiorno, per l\'annuncio', () => {
  const giocatori = [
    { id: '1', vivo: false, causaMorte: 'colpo', mortoDa: 'boia', mortoGiorno: 3, condizioni: ['innamorato'] },
    { id: '2', vivo: true, condizioni: ['innamorato'] },
  ]
  expect(applicaCrepacuore(giocatori, '1')[1]).toMatchObject({ vivo: false, causaMorte: 'crepacuore', mortoGiorno: 3 })
})

test('Mezzosangue protetto non viene morso: resta mezzosangue', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'mezzosangue', vivo: true, condizioni: ['protetto'], storiaRuoli: ['mezzosangue'] }]
  expect(risolviAttaccoBranco(giocatori, '1', 1, [])).toEqual({})
})

test('crepacuore per un rogo non eredita mortoNotte (niente riannuncio come morto notturno)', () => {
  const giocatori = [
    { id: '1', vivo: false, causaMorte: 'rogo', mortoNotte: 2, condizioni: ['innamorato'] },
    { id: '2', vivo: true, condizioni: ['innamorato'] },
  ]
  expect(applicaCrepacuore(giocatori, '1')[1]).toMatchObject({ vivo: false, causaMorte: 'crepacuore', mortoNotte: undefined })
})

test('resuscitaPatch: l\'Alchimista si ricarica (passiva alla morte), senza toccare altri poteri', () => {
  const patch = resuscitaPatch({ vivo: false, condizioni: [], poteriUsati: ['alchimista-esplosione', 'alchimista-esplosione', 'altro'] }, 3)
  expect(patch.poteriUsati).toEqual(['altro'])
})

test('resuscitaPatch: il resuscitato non è più innamorato', () => {
  const patch = resuscitaPatch({ vivo: false, condizioni: ['innamorato', 'protetto'], innamoratiCon: ['b'] }, 3)
  expect(patch.condizioni).toEqual(['protetto', 'resuscitato'])
  expect(patch.innamoratiCon).toEqual([])
})

test('liberaPartnerDi: il partner vivo perde l\'innamoramento, salvo altri partner', () => {
  const lista = [
    { id: 'a', vivo: true, condizioni: [] },
    { id: 'b', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['a'] },
    { id: 'c', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['a', 'd'] },
  ]
  const r = liberaPartnerDi(lista, 'a', ['b', 'c'])
  expect(r[1]).toMatchObject({ condizioni: [], innamoratiCon: [] })
  expect(r[2]).toMatchObject({ condizioni: ['innamorato'], innamoratiCon: ['d'] })
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

test('risolviAttaccoBranco: a parità di distanza tra due lupi, senza una scelta esplicita nessuno muore per la vendetta', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
    { id: '3', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviAttaccoBranco(giocatori, '2', 4, RUOLI_BRANCO)
  expect(Object.keys(patch)).toEqual(['2'])
})

test('risolviAttaccoBranco: a parità di distanza, uccide il lupo scelto dal narratore', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
    { id: '3', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviAttaccoBranco(giocatori, '2', 4, RUOLI_BRANCO, '3')
  expect(patch['3']).toMatchObject({ vivo: false })
  expect(patch['1']).toBeUndefined()
})

test('berserkerLupiCandidati ritorna entrambi i lupi a parità di distanza', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
    { id: '3', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  expect(berserkerLupiCandidati(giocatori, '2').map((g) => g.id).sort()).toEqual(['1', '3'])
})

test('berserkerLupiCandidati non considera lupo un Gallo Mannaro', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'gallo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
  ]
  expect(berserkerLupiCandidati(giocatori, '2')).toEqual([])
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

test('risolviAttaccoBranco: il Cucciolo sbranato dal branco muore normalmente (la vendetta scatta altrove, vedi attivaVendettaCucciolo)', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const patch = risolviAttaccoBranco(giocatori, '1', 3, RUOLI_BRANCO)
  expect(patch['1']).toMatchObject({ vivo: false })
  expect(patch['2']).toBeUndefined()
})

test('attivaVendettaCucciolo fa scattare la vendetta sul branco anche se il Cucciolo muore per un\'altra causa (rogo, Strega, Chupacabra)', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: false, condizioni: [] },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const risultato = attivaVendettaCucciolo(giocatori, '1', RUOLI_BRANCO)
  expect(risultato.find((g) => g.id === '2').vendettaCucciolo).toBe(true)
})

test('attivaVendettaCucciolo non fa nulla se il morto non è il Cucciolo', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'villico', vivo: false, condizioni: [] },
    { id: '2', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  expect(attivaVendettaCucciolo(giocatori, '1', RUOLI_BRANCO)).toBe(giocatori)
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

test('maturaCucciolo non fa nulla se il morto non è un lupo (nemmeno un Gallo Mannaro, di fazione lupi)', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  expect(maturaCucciolo(giocatori, '2')).toBe(giocatori)
  giocatori[1].ruoloSlug = 'gallo-mannaro'
  expect(maturaCucciolo(giocatori, '2')).toBe(giocatori)
})

test('maturaCucciolo non fa nulla se il morto è il Cucciolo stesso', () => {
  const giocatori = [{ id: '1', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: false, condizioni: [] }]
  const risultato = maturaCucciolo(giocatori, '1')
  expect(risultato.find((g) => g.id === '1').ruoloSlug).toBe('cucciolo-di-lupo-mannaro')
})

test('propagaUnzione aggiunge la condizione "unto" ai due vicini vivi più prossimi', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const patch = propagaUnzione(giocatori, '2')
  expect(patch['1']).toEqual({ condizioni: ['unto'] })
  expect(patch['3']).toEqual({ condizioni: ['unto'] })
})

test('propagaUnzione salta chi ha già la condizione "unto"', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: ['unto'] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const patch = propagaUnzione(giocatori, '2')
  expect(patch['1']).toBeUndefined()
  expect(patch['3']).toEqual({ condizioni: ['unto'] })
})

test('propagaUnzione con un solo vicino vivo (2 giocatori) propaga una sola volta', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  const patch = propagaUnzione(giocatori, '2')
  expect(Object.keys(patch)).toEqual(['1'])
})

test('propagaUnzione ritorna una mappa vuota senza altri giocatori vivi (1 solo giocatore)', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [] }]
  expect(propagaUnzione(giocatori, '1')).toEqual({})
})

test('aggiornaTuttiConRuolo applica lo stesso patch a tutti i giocatori con quel ruoloSlug', () => {
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', ruoloSlug: 'veggente', condizioni: [] },
    { id: '2', ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '3', ruoloSlug: 'veggente', condizioni: [] },
  ]
  aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'veggente', { note: 'ok' })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { note: 'ok' })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { note: 'ok' })
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.anything())
})

test('aggiornaTuttiConRuolo accetta una funzione (giocatore) => patch per campi che vanno uniti per-persona', () => {
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', ruoloSlug: 'inquisitore', poteriUsati: ['a'] },
    { id: '3', ruoloSlug: 'inquisitore', poteriUsati: ['b'] },
  ]
  aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'inquisitore', (g) => ({ poteriUsati: [...g.poteriUsati, 'x'] }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['a', 'x'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { poteriUsati: ['b', 'x'] })
})

test("uccidiPatch: L'Antico già rivelato (Villico con storiaRuoli 'lantico', prima vita persa al rogo o di notte) muore davvero", () => {
  const rivelatoAlRogo = { ruoloSlug: 'villico', storiaRuoli: ['lantico', 'villico'], condizioni: [], villaggioMaledettoFinoA: 1 }
  expect(uccidiPatch(rivelatoAlRogo, 2)).toMatchObject({ vivo: false, causaMorte: 'notte' })
})

test('crepacuore con due coppie (Sacerdote e Mimo-Sacerdote): muore solo il partner del morto', () => {
  const g = (id, innamoratiCon) => ({ id, vivo: true, condizioni: ['innamorato'], innamoratiCon })
  const giocatori = [g('a', ['b']), g('b', ['a']), g('c', ['d']), g('d', ['c'])]
  const dopo = applicaCrepacuore(giocatori.map((x) => (x.id === 'a' ? { ...x, vivo: false } : x)), 'a')
  expect(dopo.filter((x) => !x.vivo).map((x) => x.id)).toEqual(['a', 'b'])
})

test('con il Mimo-Cucciolo la vendetta scatta una sola volta anche se muoiono entrambi i Cuccioli', () => {
  const branco = ['lupo-mannaro', 'cucciolo-di-lupo-mannaro']
  let giocatori = [
    { id: '1', vivo: false, ruoloSlug: 'cucciolo-di-lupo-mannaro' },
    { id: '2', vivo: false, ruoloSlug: 'cucciolo-di-lupo-mannaro' },
    { id: '3', vivo: true, ruoloSlug: 'lupo-mannaro' },
  ]
  giocatori = attivaVendettaCucciolo(giocatori, '1', branco)
  giocatori = giocatori.map((x) => (x.id === '3' ? { ...x, vendettaCucciolo: false } : x)) // vendetta consumata
  giocatori = attivaVendettaCucciolo(giocatori, '2', branco)
  expect(giocatori.find((x) => x.id === '3').vendettaCucciolo).toBe(false)
})

test("l'accecamento del Veggente resta finché è vivo un altro Polpo (Mimo-Polpo)", () => {
  const giocatori = [
    { id: '1', vivo: false, ruoloSlug: 'polpo-mannaro', condizioni: [] },
    { id: '2', vivo: true, ruoloSlug: 'polpo-mannaro', condizioni: [] },
    { id: '3', vivo: true, ruoloSlug: 'veggente', condizioni: ['accecato'] },
  ]
  expect(rimuoviAccecamentoSeMortoPolpo(giocatori, '1')).toBe(giocatori)
  const solo = giocatori.map((x) => (x.id === '2' ? { ...x, vivo: false } : x))
  expect(rimuoviAccecamentoSeMortoPolpo(solo, '2')[2].condizioni).toEqual([])
})

describe('avvisiColpo', () => {
  const g = (id, ruoloSlug, extra = {}) => ({ id, nome: `N${id}`, ruoloSlug, vivo: true, condizioni: [], ...extra })

  test('Mezzosangue sbranato: diventa lupo; Cortigiana col cliente sbranato: muore; nessun effetto, nessun avviso', () => {
    const lista = [g('1', 'mezzosangue'), g('2', 'cortigiana', { visitaNotturna: '3' }), g('3', 'villico')]
    const mezzo = risolviAttaccoBranco(lista, '1', 1, ['lupo-mannaro'])
    expect(avvisiColpo(lista, '1', mezzo, 'branco')[0].testo).toMatch(/Mezzosangue.*diventa Lupo Mannaro/)
    const cliente = risolviAttaccoBranco(lista, '3', 1, ['lupo-mannaro'])
    expect(avvisiColpo(lista, '3', cliente, 'branco')[0].log).toMatch(/Cortigiana N2 muore/)
    expect(avvisiColpo(lista, '3', {}, 'branco')).toEqual([])
  })

  test('Cavaliere legato al bersaglio: si immola; lupo mangiato dal Chupacabra: il Cucciolo matura', () => {
    const lista = [g('1', 'villico'), g('2', 'cavaliere', { legame: { tipo: 'cavaliere', targetId: '1' } })]
    const patch = { 1: uccidiPatch(lista[0], 1, { mortoDa: 'branco' }) }
    expect(avvisiColpo(lista, '1', patch, 'branco')[0].testo).toMatch(/Cavaliere si immola al posto di N1/)

    const lupi = [g('1', 'lupo-mannaro'), g('2', 'cucciolo-di-lupo-mannaro')]
    const mangiato = { 1: uccidiPatch(lupi[0], 1, { mortoDa: 'chupacabra' }) }
    expect(avvisiColpo(lupi, '1', mangiato, 'chupacabra')[0].testo).toMatch(/Cucciolo N2 diventa adulto/)
  })
})

test('risolviAttaccoBranco: il Berserker protetto non viene morso e non muore nessuno', () => {
  const giocatori = [
    { id: '1', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', ruoloSlug: 'berserker', vivo: true, condizioni: ['protetto'] },
  ]
  expect(risolviAttaccoBranco(giocatori, '2', 4, RUOLI_BRANCO)).toEqual({})
})

// L'Antico (alla prima vita) partner di chi muore: sopravvive; di giorno maledice il villaggio
describe("applicaCrepacuore e L'Antico", () => {
  const antico = { id: '2', nome: 'Gigi', vivo: true, ruoloSlug: 'lantico', storiaRuoli: ['lantico'], condizioni: ['innamorato'], innamoratiCon: ['1'] }
  const amante = (morte) => ({ id: '1', nome: 'Anna', vivo: false, condizioni: ['innamorato'], innamoratiCon: ['2'], ...morte })
  const dopo = (morte) => applicaCrepacuore([amante(morte), antico], '1').find((g) => g.id === '2')

  test.each([
    ['rogo', { causaMorte: 'rogo', mortoNotte: 3 }],
    ['unzione', { causaMorte: 'colpo', mortoDa: 'unzione', mortoGiorno: 3 }],
    ['Boia', { causaMorte: 'colpo', mortoDa: 'boia', mortoGiorno: 3 }],
    ['Alchimista', { causaMorte: 'colpo', mortoDa: 'alchimista', mortoGiorno: 3 }],
  ])('amante morto di giorno (%s): resta vivo da Villico e maledice il villaggio', (_, morte) => {
    expect(dopo(morte)).toMatchObject({ vivo: true, ruoloSlug: 'villico', anticoSbranatoNotte: null, villaggioMaledettoFinoA: 3 })
  })

  test('amante morto di notte: sopravvive (flag come per il morso) ma non maledice', () => {
    const g = dopo({ causaMorte: 'notte', mortoNotte: 2 })
    expect(g).toMatchObject({ vivo: true, ruoloSlug: 'lantico', anticoSbranatoNotte: 2 })
    expect(g.villaggioMaledettoFinoA).toBeUndefined()
  })

  test("il partner normale muore e il lutto di una morte diurna resta 'di giorno' (mortoGiorno)", () => {
    const partner = { id: '2', nome: 'Bea', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['1'] }
    const g = applicaCrepacuore([amante({ causaMorte: 'colpo', mortoDa: 'boia', mortoGiorno: 3 }), partner], '1')[1]
    expect(g).toMatchObject({ vivo: false, causaMorte: 'crepacuore', mortoGiorno: 3 })
    expect(g.mortoNotte).toBeUndefined()
  })
})

test.each(['nano', 'criceto-malvagio'])('%s non muore di notte: uccidiPatch (Strega, Chupacabra, Berserker...) non ha effetto, nemmeno ignorando la protezione', (ruoloSlug) => {
  const g = { id: '1', ruoloSlug, vivo: true, condizioni: [] }
  expect(uccidiPatch(g, 2)).toBeNull()
  expect(uccidiPatch(g, 2, { ignoraProtezione: true, mortoDa: 'strega' })).toBeNull()
})

test.each(['nano', 'criceto-malvagio'])('crepacuore: %s non muore per un lutto notturno, ma sì per uno diurno (Boia)', (ruoloSlug) => {
  const lista = (morto) => [
    { id: '1', vivo: false, condizioni: ['innamorato'], ...morto },
    { id: '2', ruoloSlug, vivo: true, condizioni: ['innamorato'] },
  ]
  expect(applicaCrepacuore(lista({ causaMorte: 'notte', mortoNotte: 2, mortoDa: 'branco' }), '1')[1].vivo).toBe(true)
  expect(applicaCrepacuore(lista({ causaMorte: 'colpo', mortoDa: 'boia', mortoGiorno: 3 }), '1')[1].vivo).toBe(false)
})

test('uccidiPatch: la pozione mortale della Strega registra mortoDa', () => {
  expect(uccidiPatch({ ruoloSlug: 'villico', condizioni: [] }, 2, { ignoraProtezione: true, mortoDa: 'strega' })).toMatchObject({ mortoDa: 'strega' })
})
