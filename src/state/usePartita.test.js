import { renderHook, act } from '@testing-library/react'
import { usePartita } from './usePartita'

beforeEach(() => {
  localStorage.clear()
})

test('addGiocatore aggiunge un giocatore vivo senza ruolo assegnato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori).toHaveLength(1)
  expect(result.current.giocatori[0]).toMatchObject({
    nome: 'Anna',
    ruoloSlug: undefined,
    vivo: true,
    condizioni: [],
    note: '',
  })
})

test('toggleVivo inverte lo stato vivo/morto del giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.toggleVivo(id)
  })

  expect(result.current.giocatori[0].vivo).toBe(false)
})

test('setCondizioni e setNote aggiornano il giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.setCondizioni(id, ['ipnotizzato'])
    result.current.setNote(id, 'ha votato per Marco')
  })

  expect(result.current.giocatori[0].condizioni).toEqual(['ipnotizzato'])
  expect(result.current.giocatori[0].note).toBe('ha votato per Marco')
})

test('lo stato persiste in localStorage tra due montaggi dell\'hook', () => {
  const { result, unmount } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  unmount()

  const { result: result2 } = renderHook(() => usePartita())
  expect(result2.current.giocatori).toHaveLength(1)
  expect(result2.current.giocatori[0].nome).toBe('Anna')
})

test('addGiocatore inizializza poteriUsati vuoto', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori[0].poteriUsati).toEqual([])
})

test('aggiornaGiocatore applica una patch parziale al giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.aggiornaGiocatore(id, { vivo: false, poteriUsati: ['guaritore-resuscita'] })
  })

  expect(result.current.giocatori[0].vivo).toBe(false)
  expect(result.current.giocatori[0].poteriUsati).toEqual(['guaritore-resuscita'])
})

test('aggiornaGiocatore può assegnare il ruolo a un giocatore già esistente', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.aggiornaGiocatore(id, { ruoloSlug: 'paladino' })
  })

  expect(result.current.giocatori[0].ruoloSlug).toBe('paladino')
})
