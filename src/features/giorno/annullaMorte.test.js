import { renderHook, act } from '@testing-library/react'
import { usePartita } from '../../state/usePartita'
import { patchAnnullaMorte, annullaMorteCompleta, dichiaraColpo, dichiaraAnticoSbranato } from './annullaMorte'

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

test('patchAnnullaMorte pulisce mortoGiorno e giustiziatoDa (Boia); il Boia non duplica "boia" in storiaRuoli', async () => {
  const { patchAnnullaMorte, dichiaraBoiaGiustizia } = await import('./annullaMorte')
  expect(patchAnnullaMorte({ vivo: false, mortoGiorno: 2, giustiziatoDa: '1' })).toMatchObject({
    vivo: true,
    mortoGiorno: undefined,
    giustiziatoDa: undefined,
  })
  const agg = vi.fn()
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'boia', storiaRuoli: ['mimo', 'boia'] },
    { id: '2', vivo: true, ruoloSlug: 'villico' },
  ]
  dichiaraBoiaGiustizia('1', '2', giocatori, agg, 2)
  expect(agg).toHaveBeenCalledWith('1', expect.objectContaining({ storiaRuoli: ['mimo', 'boia'] }))
  expect(agg).toHaveBeenCalledWith('2', expect.objectContaining({ mortoDa: 'boia', giustiziatoDa: '1', mortoGiorno: 2 }))
})

test("annullare la morte della vittima del Boia rimette il potere al Boia (non alla vittima)", () => {
  const agg = vi.fn()
  const giocatori = [
    { id: '1', vivo: true, ruoloSlug: 'boia', poteriUsati: ['boia-giustizia', 'altro'] },
    { id: '2', vivo: false, causaMorte: 'colpo', mortoDa: 'boia', giustiziatoDa: '1', mortoGiorno: 2, poteriUsati: [] },
  ]
  annullaMorteCompleta('2', giocatori, agg, undefined)
  expect(agg).toHaveBeenCalledWith('2', expect.objectContaining({ vivo: true, giustiziatoDa: undefined }))
  expect(agg).toHaveBeenCalledWith('1', { poteriUsati: ['altro'] })
})

test('un Boia morto per altra causa che annulla la morte non riottiene il potere già usato; se si è giustiziato da solo sì', () => {
  expect(patchAnnullaMorte({ id: '1', vivo: false, poteriUsati: ['boia-giustizia'] }).poteriUsati).toBeUndefined()
  expect(patchAnnullaMorte({ id: '1', vivo: false, giustiziatoDa: '1', poteriUsati: ['boia-giustizia'] }).poteriUsati).toEqual([])
})

test("annullare Scemo e Alchimista: il Boia non c'entra, tornano il ruolo dello Scemo e l'esplosione dell'Alchimista", () => {
  expect(patchAnnullaMorte({ id: '1', vivo: false, ruoloSlug: 'scemo-del-villaggio', storiaRuoli: ['scemo-del-villaggio'] })).toMatchObject({ ruoloSlug: undefined, storiaRuoli: [] })
  expect(patchAnnullaMorte({ id: '2', vivo: false, causaMorte: 'rogo', mortoNotte: 2, poteriUsati: ['alchimista-esplosione'] })).toMatchObject({
    vivo: true,
    mortoNotte: undefined,
    poteriUsati: [],
  })
})

test("la prima vita dell'Antico consumata di giorno (Boia, Alchimista, unzione: dichiaraColpo) maledice il villaggio", () => {
  const agg = vi.fn()
  dichiaraColpo('1', [{ id: '1', ruoloSlug: 'lantico', storiaRuoli: ['lantico'] }], agg, 3, { mortoDa: 'boia' })
  expect(agg).toHaveBeenCalledWith('1', expect.objectContaining({ ruoloSlug: 'villico', villaggioMaledettoFinoA: 3 }))
})

test("Antico ignoto morto di giorno che si rivela dopo: maledice; morto di notte no", () => {
  const agg = vi.fn()
  dichiaraAnticoSbranato('1', [{ id: '1', vivo: false, causaMorte: 'colpo', mortoGiorno: 3 }], agg)
  expect(agg).toHaveBeenLastCalledWith('1', expect.objectContaining({ villaggioMaledettoFinoA: 3, ruoloSlug: 'villico' }))
  dichiaraAnticoSbranato('2', [{ id: '2', vivo: false, causaMorte: 'notte', mortoNotte: 2 }], agg)
  expect(agg.mock.lastCall[1].villaggioMaledettoFinoA).toBeUndefined()
})

test("annullare la morte dell'amante disfa il crepacuore sull'Antico e la maledizione (catena dello stato reale)", () => {
  localStorage.setItem(
    'meltable-wolves-partita',
    JSON.stringify([
      { id: '1', nome: 'Anna', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['2'], poteriUsati: [], usiNotte: [], storiaRuoli: [] },
      { id: '2', nome: 'Gigi', vivo: true, ruoloSlug: 'lantico', condizioni: ['innamorato'], innamoratiCon: ['1'], poteriUsati: [], usiNotte: [], storiaRuoli: ['lantico'] },
    ]),
  )
  const { result } = renderHook(() => usePartita())
  act(() => result.current.aggiornaGiocatore('1', { vivo: false, causaMorte: 'rogo', mortoNotte: 3 }))
  expect(result.current.giocatori[1]).toMatchObject({ vivo: true, ruoloSlug: 'villico', villaggioMaledettoFinoA: 3 })
  act(() => annullaMorteCompleta('1', result.current.giocatori, result.current.aggiornaGiocatore, result.current.annullaMorte))
  expect(result.current.giocatori[1]).toMatchObject({ ruoloSlug: 'lantico' })
  expect(result.current.giocatori[1].villaggioMaledettoFinoA).toBeUndefined()
  localStorage.clear()
})

test('dichiaraBoiaGiustizia non duplica il potere già segnato', async () => {
  const { dichiaraBoiaGiustizia } = await import('./annullaMorte')
  const giocatori = [
    { id: '1', ruoloSlug: 'boia', poteriUsati: ['boia-giustizia'], vivo: true },
    { id: '2', vivo: true },
  ]
  const agg = vi.fn()
  dichiaraBoiaGiustizia('1', '2', giocatori, agg, 2)
  expect(agg.mock.calls[0][1].poteriUsati).toEqual(['boia-giustizia'])
})
