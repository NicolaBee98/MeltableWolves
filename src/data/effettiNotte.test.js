import {
  aggiungiCondizionePatch,
  uccidiPatch,
  resuscitaPatch,
  usatoStanotte,
  segnaUsoStanotte,
  applicaCrepacuore,
} from './effettiNotte'

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

test('resuscitaPatch riporta in vita un giocatore morto', () => {
  expect(resuscitaPatch({ vivo: false, condizioni: [] })).toEqual({ vivo: true, condizioni: ['resuscitato'] })
})

test('resuscitaPatch ritorna null se il giocatore è già vivo', () => {
  expect(resuscitaPatch({ vivo: true, condizioni: [] })).toBeNull()
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

test('applicaCrepacuore uccide anche il partner innamorato ancora vivo', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, condizioni: ['innamorato'] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: ['innamorato'] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const risultato = applicaCrepacuore(giocatori, '1')

  expect(risultato.find((g) => g.id === '2')).toMatchObject({ vivo: false, causaMorte: 'crepacuore' })
  expect(risultato.find((g) => g.id === '3')).toMatchObject({ vivo: true })
})

test('applicaCrepacuore non fa nulla se il morto non è innamorato', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: ['innamorato'] },
  ]
  expect(applicaCrepacuore(giocatori, '1')).toBe(giocatori)
})
