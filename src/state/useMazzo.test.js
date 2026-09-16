import { renderHook, act } from '@testing-library/react'
import { useMazzo } from './useMazzo'

beforeEach(() => {
  localStorage.clear()
})

test('stato iniziale: 8 giocatori, nessun ruolo selezionato', () => {
  const { result } = renderHook(() => useMazzo())

  expect(result.current.numGiocatori).toBe(8)
  expect(result.current.ruoliSelezionati).toEqual([])
  expect(result.current.ruoliInMazzo).toEqual([])
})

test('setNumGiocatori aggiorna il numero di giocatori', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setNumGiocatori(12)
  })

  expect(result.current.numGiocatori).toBe(12)
})

test('toggleRuolo aggiunge e rimuove uno slug da ruoliSelezionati e ruoliInMazzo', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.toggleRuolo('villico')
  })
  expect(result.current.ruoliSelezionati).toEqual(['villico'])
  expect(result.current.ruoliInMazzo.map((r) => r.slug)).toEqual(['villico'])

  act(() => {
    result.current.toggleRuolo('villico')
  })
  expect(result.current.ruoliSelezionati).toEqual([])
  expect(result.current.ruoliInMazzo).toEqual([])
})

test('lo stato persiste in localStorage tra due montaggi dell\'hook', () => {
  const { result, unmount } = renderHook(() => useMazzo())

  act(() => {
    result.current.setNumGiocatori(10)
    result.current.toggleRuolo('lupo-mannaro')
  })
  unmount()

  const { result: result2 } = renderHook(() => useMazzo())
  expect(result2.current.numGiocatori).toBe(10)
  expect(result2.current.ruoliSelezionati).toEqual(['lupo-mannaro'])
})
