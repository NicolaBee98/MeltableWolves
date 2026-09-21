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
  })
})

test('removeGiocatore rimuove il giocatore indicato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
    result.current.addGiocatore('Marco')
  })
  const id = result.current.giocatori[0].id

  act(() => {
    result.current.removeGiocatore(id)
  })

  expect(result.current.giocatori).toHaveLength(1)
  expect(result.current.giocatori[0].nome).toBe('Marco')
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

test('resetPartita svuota la lista dei giocatori', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })
  act(() => {
    result.current.resetPartita()
  })

  expect(result.current.giocatori).toEqual([])
})

test('addGiocatore inizializza poteriUsati vuoto', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori[0].poteriUsati).toEqual([])
})

test('addGiocatore inizializza storiaRuoli vuoto', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
  })

  expect(result.current.giocatori[0].storiaRuoli).toEqual([])
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

test('aggiornaGiocatore(vivo:false) fa morire di crepacuore anche il partner innamorato', () => {
  const { result } = renderHook(() => usePartita())

  act(() => {
    result.current.addGiocatore('Anna')
    result.current.addGiocatore('Marco')
  })
  const [anna, marco] = result.current.giocatori

  act(() => {
    result.current.aggiornaGiocatore(anna.id, { condizioni: ['innamorato'] })
    result.current.aggiornaGiocatore(marco.id, { condizioni: ['innamorato'] })
  })

  act(() => {
    result.current.aggiornaGiocatore(anna.id, { vivo: false, causaMorte: 'rogo' })
  })

  const marcoDopo = result.current.giocatori.find((g) => g.id === marco.id)
  expect(marcoDopo).toMatchObject({ vivo: false, causaMorte: 'crepacuore' })
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
