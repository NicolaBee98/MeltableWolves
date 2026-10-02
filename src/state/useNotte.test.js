import { renderHook, act } from '@testing-library/react'
import { useNotte } from './useNotte'

beforeEach(() => {
  localStorage.clear()
})

test('stato iniziale: notte 1, passo 0', () => {
  const { result } = renderHook(() => useNotte())
  expect(result.current.round).toBe(1)
  expect(result.current.stepIndex).toBe(0)
})

test('avanti incrementa stepIndex senza superare il totale passi', () => {
  const { result } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(2)
  })
  expect(result.current.stepIndex).toBe(1)

  act(() => {
    result.current.avanti(2)
  })
  expect(result.current.stepIndex).toBe(1)
})

test('indietro decrementa stepIndex senza scendere sotto zero', () => {
  const { result } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(3)
    result.current.avanti(3)
  })
  expect(result.current.stepIndex).toBe(2)

  act(() => {
    result.current.indietro()
    result.current.indietro()
    result.current.indietro()
  })
  expect(result.current.stepIndex).toBe(0)
})

test('nuovaNotte incrementa round e azzera stepIndex', () => {
  const { result } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(3)
    result.current.nuovaNotte()
  })

  expect(result.current.round).toBe(2)
  expect(result.current.stepIndex).toBe(0)
})

test('lo stato persiste in localStorage tra due montaggi dell\'hook', () => {
  const { result, unmount } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(3)
  })
  unmount()

  const { result: result2 } = renderHook(() => useNotte())
  expect(result2.current.stepIndex).toBe(1)
})

test('resetNotte riporta round 1 e passo 0', () => {
  const { result } = renderHook(() => useNotte())

  act(() => {
    result.current.avanti(3)
    result.current.nuovaNotte()
  })
  act(() => {
    result.current.resetNotte()
  })

  expect(result.current.round).toBe(1)
  expect(result.current.stepIndex).toBe(0)
})

test('stato salvato corrotto: ripiega sullo stato iniziale', () => {
  localStorage.setItem('meltable-wolves-notte', JSON.stringify({ round: 'x' }))
  const { result } = renderHook(() => useNotte())
  expect(result.current.round).toBe(1)
  expect(result.current.stepIndex).toBe(0)
})
