import { renderHook, act } from '@testing-library/react'
import { useLog } from './useLog'

beforeEach(() => {
  localStorage.clear()
})

test('nessun evento al primo montaggio', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 1))
  expect(result.current.eventi).toEqual([])
})

test('rileva un cambiamento tra due render successivi', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })

  const morto = [{ ...vivo[0], vivo: false }]
  rerender({ giocatori: morto, round: 1 })

  expect(result.current.eventi).toEqual([{ round: 1, fase: 'notte', messaggio: 'Anna è morto/a' }])
})

test('lo stato persiste in localStorage tra due montaggi', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { rerender, unmount } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })
  const morto = [{ ...vivo[0], vivo: false }]
  rerender({ giocatori: morto, round: 1 })
  unmount()

  const { result: result2 } = renderHook(() => useLog(morto, 1))
  expect(result2.current.eventi).toEqual([{ round: 1, fase: 'notte', messaggio: 'Anna è morto/a' }])
})

test('un cambiamento ai giocatori che coincide con l\'incremento del round viene attribuito al round appena concluso', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: ['protetto'], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })

  const senzaProtezione = [{ ...vivo[0], condizioni: [] }]
  rerender({ giocatori: senzaProtezione, round: 2 })

  expect(result.current.eventi).toEqual([{ round: 1, fase: 'notte', messaggio: 'Anna ha perso la condizione "protetto"' }])
})

test('la fase passata all\'hook marca gli eventi rilevati (es. "giorno" per un rogo)', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round, fase }) => useLog(giocatori, round, fase), {
    initialProps: { giocatori: vivo, round: 1, fase: 'giorno' },
  })

  const morto = [{ ...vivo[0], vivo: false, causaMorte: 'colpo' }]
  rerender({ giocatori: morto, round: 1, fase: 'giorno' })

  expect(result.current.eventi).toEqual([{ round: 1, fase: 'giorno', messaggio: 'Anna è morto/a sul colpo' }])
})

test('aggiungiEvento aggiunge una voce manuale al log, con la fase corrente dell\'hook', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 4))

  act(() => {
    result.current.aggiungiEvento('Si sentono dei belati.')
  })

  expect(result.current.eventi).toEqual([{ round: 4, fase: 'notte', messaggio: 'Si sentono dei belati.' }])
})

test('aggiungiEvento accetta una fase esplicita, per registrare in anticipo un annuncio di una fase diversa da quella corrente', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 4, 'notte'))

  act(() => {
    result.current.aggiungiEvento('Il villaggio si sveglia.', 'alba')
  })

  expect(result.current.eventi).toEqual([{ round: 4, fase: 'alba', messaggio: 'Il villaggio si sveglia.' }])
})

test('resetLog svuota gli eventi registrati', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 1))

  act(() => {
    result.current.aggiungiEvento('Si sentono dei belati.')
  })
  act(() => {
    result.current.resetLog()
  })

  expect(result.current.eventi).toEqual([])
})

test('resetLog non fa ricomparire eventi quando coincide con l\'azzeramento di giocatori/round (Nuova Partita)', () => {
  const morto = [{ id: '1', nome: 'Anna', vivo: false, condizioni: ['protetto'], ruoloSlug: 'veggente' }]
  const { result, rerender } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: morto, round: 3 },
  })

  act(() => {
    result.current.resetLog()
  })
  // Nuova Partita: stessi id/nomi, tutto il resto azzerato, nello stesso
  // batch del resetLog (come fa nuovaPartita in App.jsx)
  const azzerato = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: undefined }]
  rerender({ giocatori: azzerato, round: 1 })

  expect(result.current.eventi).toEqual([])
})
