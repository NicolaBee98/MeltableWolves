import { aggiungiCondizionePatch, uccidiPatch, resuscitaPatch } from './effettiNotte'

test('aggiungiCondizionePatch aggiunge la condizione se non presente', () => {
  const giocatore = { condizioni: [] }
  expect(aggiungiCondizionePatch(giocatore, 'unto')).toEqual({ condizioni: ['unto'] })
})

test('aggiungiCondizionePatch ritorna null se la condizione è già presente', () => {
  const giocatore = { condizioni: ['unto'] }
  expect(aggiungiCondizionePatch(giocatore, 'unto')).toBeNull()
})

test('uccidiPatch ritorna vivo:false e causaMorte:notte se il giocatore non è protetto', () => {
  expect(uccidiPatch({ condizioni: [] })).toEqual({ vivo: false, causaMorte: 'notte' })
})

test('uccidiPatch ritorna null se il giocatore è protetto', () => {
  expect(uccidiPatch({ condizioni: ['protetto'] })).toBeNull()
})

test('resuscitaPatch riporta in vita un giocatore morto', () => {
  expect(resuscitaPatch({ vivo: false, condizioni: [] })).toEqual({ vivo: true, condizioni: ['resuscitato'] })
})

test('resuscitaPatch ritorna null se il giocatore è già vivo', () => {
  expect(resuscitaPatch({ vivo: true, condizioni: [] })).toBeNull()
})
