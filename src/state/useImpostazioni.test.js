import { renderHook, act } from '@testing-library/react'
import { useImpostazioni } from './useImpostazioni'

beforeEach(() => {
  localStorage.clear()
})

test('mostraRuoliInVotazione è false di default (nascosto per sicurezza)', () => {
  const { result } = renderHook(() => useImpostazioni())
  expect(result.current.mostraRuoliInVotazione).toBe(false)
})

test('setMostraRuoliInVotazione aggiorna il flag', () => {
  const { result } = renderHook(() => useImpostazioni())
  act(() => {
    result.current.setMostraRuoliInVotazione(true)
  })
  expect(result.current.mostraRuoliInVotazione).toBe(true)
})

test('il flag persiste in localStorage tra due montaggi', () => {
  const { result, unmount } = renderHook(() => useImpostazioni())
  act(() => {
    result.current.setMostraRuoliInVotazione(true)
  })
  unmount()

  const { result: result2 } = renderHook(() => useImpostazioni())
  expect(result2.current.mostraRuoliInVotazione).toBe(true)
})
