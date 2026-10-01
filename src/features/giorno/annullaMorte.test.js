import { patchAnnullaMorte, annullaMorteCompleta } from './annullaMorte'

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
