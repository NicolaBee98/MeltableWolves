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

  expect(result.current.eventi).toEqual([{ round: 1, messaggio: 'Anna è morto/a' }])
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
  expect(result2.current.eventi).toEqual([{ round: 1, messaggio: 'Anna è morto/a' }])
})

test('un cambiamento ai giocatori che coincide con l\'incremento del round viene attribuito al round appena concluso', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: ['protetto'], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })

  const senzaProtezione = [{ ...vivo[0], condizioni: [] }]
  rerender({ giocatori: senzaProtezione, round: 2 })

  expect(result.current.eventi).toEqual([{ round: 1, messaggio: 'Anna ha perso la condizione "protetto"' }])
})

test('aggiungiEvento aggiunge una voce manuale al log', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 4))

  act(() => {
    result.current.aggiungiEvento('Si sentono dei belati.')
  })

  expect(result.current.eventi).toEqual([{ round: 4, messaggio: 'Si sentono dei belati.' }])
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
