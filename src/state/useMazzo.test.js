import { renderHook, act } from '@testing-library/react'
import { useMazzo } from './useMazzo'

beforeEach(() => {
  localStorage.clear()
})

test('stato iniziale: nessuna quantità impostata', () => {
  const { result } = renderHook(() => useMazzo())

  expect(result.current.quantita).toEqual({})
  expect(result.current.ruoliInMazzo).toEqual([])
})

test('setQuantita imposta la quantità e aggiorna ruoliInMazzo', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', 5)
  })

  expect(result.current.quantita.villico).toBe(5)
  expect(result.current.ruoliInMazzo.map((r) => r.slug)).toEqual(['villico'])
})

test('setQuantita rimuove il ruolo da ruoliInMazzo se impostata a zero', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', 3)
    result.current.setQuantita('villico', 0)
  })

  expect(result.current.ruoliInMazzo).toEqual([])
})

test('setQuantita rispetta il massimo del ruolo (villico max 12)', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', 20)
  })

  expect(result.current.quantita.villico).toBe(12)
})

test('setQuantita rispetta il massimo di un ruolo unico (default 1)', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('paladino', 5)
  })

  expect(result.current.quantita.paladino).toBe(1)
})

test('setQuantita non scende sotto zero', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', -3)
  })

  expect(result.current.quantita.villico).toBe(0)
})

test('azzerare la Guardia azzera anche la Guardia Mannara nello state', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('guardia', 2)
    result.current.setQuantita('guardia-mannara', 1)
  })
  act(() => {
    result.current.setQuantita('guardia', 0)
  })

  expect(result.current.quantita['guardia-mannara']).toBe(0)
})

test('resetMazzo riporta il mazzo allo stato iniziale', () => {
  const { result } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('villico', 5)
  })
  act(() => {
    result.current.resetMazzo()
  })

  expect(result.current.quantita).toEqual({})
})

test('lo stato persiste in localStorage tra due montaggi', () => {
  const { result, unmount } = renderHook(() => useMazzo())

  act(() => {
    result.current.setQuantita('lupo-mannaro', 2)
  })
  unmount()

  const { result: result2 } = renderHook(() => useMazzo())
  expect(result2.current.quantita['lupo-mannaro']).toBe(2)
})
