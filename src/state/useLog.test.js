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

test('di notte i cambiamenti non si registrano da soli (anteprime), solo con confermaLog', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })

  const morto = [{ ...vivo[0], vivo: false }]
  rerender({ giocatori: morto, round: 1 })
  expect(result.current.eventi).toEqual([])

  // anteprima annullata (Indietro): nessun falso evento di resurrezione
  rerender({ giocatori: vivo, round: 1 })
  act(() => result.current.confermaLog())
  expect(result.current.eventi).toEqual([])

  rerender({ giocatori: morto, round: 1 })
  act(() => result.current.confermaLog())
  expect(result.current.eventi).toEqual([{ round: 1, fase: 'notte', messaggio: 'Anna è morto/a' }])
  // già confermato: nessun doppione
  act(() => result.current.confermaLog())
  expect(result.current.eventi).toHaveLength(1)
})

test('l\'ingresso nell\'alba conferma gli ultimi cambiamenti della notte (round della notte)', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round, fase }) => useLog(giocatori, round, fase), {
    initialProps: { giocatori: vivo, round: 1, fase: 'notte' },
  })

  rerender({ giocatori: [{ ...vivo[0], vivo: false, causaMorte: 'notte' }], round: 2, fase: 'alba' })

  expect(result.current.eventi).toEqual([{ round: 1, fase: 'notte', messaggio: 'Anna è morto/a di notte' }])
})

test('il riferimento confermato persiste dopo un refresh a metà notte', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { rerender, unmount } = renderHook(({ giocatori }) => useLog(giocatori, 1), { initialProps: { giocatori: vivo } })
  rerender({ giocatori: [{ ...vivo[0], vivo: false }] })
  unmount()

  // dopo il refresh i giocatori caricati contengono l'anteprima non confermata
  const { result } = renderHook(() => useLog([{ ...vivo[0], vivo: false }], 1))
  act(() => result.current.confermaLog())
  expect(result.current.eventi).toEqual([{ round: 1, fase: 'notte', messaggio: 'Anna è morto/a' }])
})

test('di giorno round e fase si etichettano col giorno (round-1), non con la notte successiva', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, fase }) => useLog(giocatori, 3, fase), {
    initialProps: { giocatori: vivo, fase: 'giorno' },
  })
  rerender({ giocatori: [{ ...vivo[0], vivo: false, causaMorte: 'rogo' }], fase: 'giorno' })

  expect(result.current.eventi).toEqual([{ round: 2, fase: 'rogo', messaggio: 'Anna è morto/a al rogo' }])
})

test('lo stato persiste in localStorage tra due montaggi', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result: r1, rerender, unmount } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: vivo, round: 1 },
  })
  const morto = [{ ...vivo[0], vivo: false }]
  rerender({ giocatori: morto, round: 1 })
  act(() => r1.current.confermaLog())
  unmount()

  const { result: result2 } = renderHook(() => useLog(morto, 1))
  expect(result2.current.eventi).toEqual([{ round: 1, fase: 'notte', messaggio: 'Anna è morto/a' }])
})

test('la fase passata all\'hook marca gli eventi rilevati (es. "giorno" per un rogo)', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result, rerender } = renderHook(({ giocatori, round, fase }) => useLog(giocatori, round, fase), {
    initialProps: { giocatori: vivo, round: 2, fase: 'giorno' },
  })

  const morto = [{ ...vivo[0], vivo: false, causaMorte: 'colpo' }]
  rerender({ giocatori: morto, round: 2, fase: 'giorno' })

  expect(result.current.eventi).toEqual([{ round: 1, fase: 'giorno', messaggio: 'Anna è morto/a sul colpo' }])
})

test('aggiungiEvento aggiunge una voce manuale al log, con la fase corrente dell\'hook', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 4))

  act(() => {
    result.current.aggiungiEvento('Si sentono dei belati.')
  })

  expect(result.current.eventi).toEqual([{ round: 4, fase: 'notte', messaggio: 'Si sentono dei belati.' }])
})

test('aggiungiEvento accetta una fase esplicita, per registrare in anticipo un annuncio di una fase diversa da quella corrente', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const { result } = renderHook(() => useLog(giocatori, 4, 'notte'))

  act(() => {
    result.current.aggiungiEvento('Il villaggio si sveglia.', 'alba')
  })

  expect(result.current.eventi).toEqual([{ round: 4, fase: 'alba', messaggio: 'Il villaggio si sveglia.' }])
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

test('resetLog non fa ricomparire eventi quando coincide con l\'azzeramento di giocatori/round (Nuova Partita)', () => {
  const morto = [{ id: '1', nome: 'Anna', vivo: false, condizioni: ['protetto'], ruoloSlug: 'veggente' }]
  const { result, rerender } = renderHook(({ giocatori, round }) => useLog(giocatori, round), {
    initialProps: { giocatori: morto, round: 3 },
  })

  act(() => {
    result.current.resetLog()
  })
  // Nuova Partita: stessi id/nomi, tutto il resto azzerato, nello stesso
  // batch del resetLog (come fa nuovaPartita in App.jsx)
  const azzerato = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: undefined }]
  rerender({ giocatori: azzerato, round: 1 })

  expect(result.current.eventi).toEqual([])
})

test('Avanti-Indietro-Avanti non duplica le voci: annullaLogPasso toglie quelle del passo (anche aggiungiEvento)', () => {
  const vivo = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'villico' }]
  const morto = [{ ...vivo[0], vivo: false }]
  const { result, rerender } = renderHook(({ giocatori }) => useLog(giocatori, 1), { initialProps: { giocatori: vivo } })

  const avanti = () => {
    rerender({ giocatori: morto })
    act(() => {
      result.current.confermaLog('1-lupi')
      result.current.aggiungiEvento('Il branco sbrana Anna')
    })
  }
  avanti()
  expect(result.current.eventi).toHaveLength(2)

  // Indietro: lo stato torna a prima e il prossimo confronto è soppresso
  act(() => {
    result.current.annullaLogPasso('1-lupi')
    result.current.sopprimiProssimoConfronto()
  })
  rerender({ giocatori: vivo })
  expect(result.current.eventi).toEqual([])

  avanti()
  expect(result.current.eventi.map((e) => e.messaggio)).toEqual(['Anna è morto/a', 'Il branco sbrana Anna'])
})
