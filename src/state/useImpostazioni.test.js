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

test('variantiFaccia è true di default e mostraNomeRuolo false di default, entrambi persistono', () => {
  const { result, unmount } = renderHook(() => useImpostazioni())
  expect(result.current.variantiFaccia).toBe(true)
  expect(result.current.mostraNomeRuolo).toBe(false)

  act(() => {
    result.current.setVariantiFaccia(false)
    result.current.setMostraNomeRuolo(true)
  })
  unmount()

  const { result: result2 } = renderHook(() => useImpostazioni())
  expect(result2.current.variantiFaccia).toBe(false)
  expect(result2.current.mostraNomeRuolo).toBe(true)
})

test('promemoriaRuoliMorti è true di default e persiste', () => {
  const { result, unmount } = renderHook(() => useImpostazioni())
  expect(result.current.promemoriaRuoliMorti).toBe(true)

  act(() => {
    result.current.setPromemoriaRuoliMorti(false)
  })
  unmount()

  const { result: result2 } = renderHook(() => useImpostazioni())
  expect(result2.current.promemoriaRuoliMorti).toBe(false)
})

test('addolorataEreditaScelte è true di default e persiste quando disattivata', () => {
  const { result, unmount } = renderHook(() => useImpostazioni())
  expect(result.current.addolorataEreditaScelte).toBe(true)
  act(() => {
    result.current.setAddolorataEreditaScelte(false)
  })
  unmount()
  const { result: result2 } = renderHook(() => useImpostazioni())
  expect(result2.current.addolorataEreditaScelte).toBe(false)
})
