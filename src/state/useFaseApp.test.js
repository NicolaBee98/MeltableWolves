import { renderHook, act } from '@testing-library/react'
import { useFaseApp } from './useFaseApp'

beforeEach(() => {
  localStorage.clear()
})

test('fase iniziale è home', () => {
  const { result } = renderHook(() => useFaseApp())
  expect(result.current[0]).toBe('home')
})

test('setFaseApp aggiorna la fase', () => {
  const { result } = renderHook(() => useFaseApp())
  act(() => {
    result.current[1]('notte')
  })
  expect(result.current[0]).toBe('notte')
})

test('la fase persiste in localStorage tra due montaggi', () => {
  const { result, unmount } = renderHook(() => useFaseApp())
  act(() => {
    result.current[1]('giorno')
  })
  unmount()

  const { result: result2 } = renderHook(() => useFaseApp())
  expect(result2.current[0]).toBe('giorno')
})
