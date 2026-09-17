import { renderHook, act } from '@testing-library/react'
import { useVotazione } from './useVotazione'

beforeEach(() => {
  localStorage.clear()
})

test('stato iniziale: nessun voto', () => {
  const { result } = renderHook(() => useVotazione())
  expect(result.current.voti).toEqual({})
})

test('incrementaVoto aumenta il conteggio di un candidato', () => {
  const { result } = renderHook(() => useVotazione())

  act(() => {
    result.current.incrementaVoto('1')
    result.current.incrementaVoto('1')
  })

  expect(result.current.voti['1']).toBe(2)
})

test('decrementaVoto non scende sotto zero', () => {
  const { result } = renderHook(() => useVotazione())

  act(() => {
    result.current.decrementaVoto('1')
  })

  expect(result.current.voti['1']).toBe(0)
})

test('ricominciaVotazione azzera tutti i voti', () => {
  const { result } = renderHook(() => useVotazione())

  act(() => {
    result.current.incrementaVoto('1')
    result.current.ricominciaVotazione()
  })

  expect(result.current.voti).toEqual({})
})

test('lo stato persiste in localStorage tra due montaggi', () => {
  const { result, unmount } = renderHook(() => useVotazione())

  act(() => {
    result.current.incrementaVoto('1')
  })
  unmount()

  const { result: result2 } = renderHook(() => useVotazione())
  expect(result2.current.voti['1']).toBe(1)
})

test('fase iniziale è voto', () => {
  const { result } = renderHook(() => useVotazione())
  expect(result.current.fase).toBe('voto')
})

test('vaiAEsito passa la fase a esito', () => {
  const { result } = renderHook(() => useVotazione())
  act(() => {
    result.current.vaiAEsito()
  })
  expect(result.current.fase).toBe('esito')
})

test('tornaAlVoto riporta la fase a voto', () => {
  const { result } = renderHook(() => useVotazione())
  act(() => {
    result.current.vaiAEsito()
    result.current.tornaAlVoto()
  })
  expect(result.current.fase).toBe('voto')
})

test('ricominciaVotazione riporta la fase a voto', () => {
  const { result } = renderHook(() => useVotazione())
  act(() => {
    result.current.vaiAEsito()
    result.current.ricominciaVotazione()
  })
  expect(result.current.fase).toBe('voto')
})
