import { patchAnnullaMorte, annullaMorteCompleta, dichiaraColpo } from './annullaMorte'

test('riporta in vita e ripulisce causa e notte della morte', () => {
  expect(patchAnnullaMorte({ id: '1', vivo: false })).toEqual({
    vivo: true,
    causaMorte: undefined,
    mortoNotte: undefined,
  })
})

test('ripristina Fantasma Onnisciente, poteri una tantum e rivelazione dello Scemo', () => {
  const patch = patchAnnullaMorte({
    vivo: false,
    eFantasmaOnnisciente: true,
    poteriUsati: ['alchimista-esplosione', 'altro'],
    ruoloSlug: 'scemo-del-villaggio',
    storiaRuoli: ['scemo-del-villaggio'],
  })
  expect(patch).toMatchObject({
    eFantasmaOnnisciente: false,
    poteriUsati: ['altro'],
    ruoloSlug: undefined,
    storiaRuoli: [],
  })
})

test('annullaMorteCompleta usa annullaMorte di usePartita (se c\'è) e poi applica la patch sul giocatore', () => {
  const annullaMorte = vi.fn()
  const aggiornaGiocatore = vi.fn()
  annullaMorteCompleta('1', [{ id: '1', vivo: false, eFantasmaOnnisciente: true }], aggiornaGiocatore, annullaMorte)
  expect(annullaMorte).toHaveBeenCalledWith('1')
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', expect.objectContaining({ vivo: true, eFantasmaOnnisciente: false }))
})

test('dichiaraColpo: un Antico noto sopravvive da Villico (prima vita), un altro muore con mortoGiorno', () => {
  const agg = vi.fn()
  const giocatori = [
    { id: '1', ruoloSlug: 'lantico', storiaRuoli: ['lantico'] },
    { id: '2' },
  ]
  expect(dichiaraColpo('1', giocatori, agg, 3)).toBe(false)
  expect(agg).toHaveBeenCalledWith('1', expect.objectContaining({ ruoloSlug: 'villico', anticoSbranatoNotte: null }))
  expect(dichiaraColpo('2', giocatori, agg, 3)).toBe(true)
  expect(agg).toHaveBeenCalledWith('2', { vivo: false, causaMorte: 'colpo', mortoGiorno: 3 })
})

test('annullare la morte del Mimo-Scemo non gli cancella il ruolo copiato', () => {
  const patch = patchAnnullaMorte({ id: '1', vivo: false, ruoloSlug: 'scemo-del-villaggio', legame: { tipo: 'mimo', targetId: '2' }, storiaRuoli: ['mimo', 'scemo-del-villaggio'] })
  expect(patch.ruoloSlug).toBeUndefined()
  expect('ruoloSlug' in patch).toBe(false)
})
