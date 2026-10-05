import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneResuscita } from './AzioneResuscita'

test("resuscita il bersaglio morto e marca il potere come usato sull'attore", async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], note: '', poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], note: '' },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
      round={2}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  // non torna in vita subito: solo il marcatore, la resurrezione è dell'alba
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { resuscitaAllAlba: 2 })
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.objectContaining({ vivo: true }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['guaritore-resuscita'] })
})

test('mostra un messaggio se il potere è già stato usato', () => {
  const giocatori = [
    {
      id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], note: '',
      poteriUsati: ['guaritore-resuscita'],
    },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], note: '' },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
    />,
  )
  expect(screen.getByText(/già utilizzato/i)).toBeInTheDocument()
})

test('il Guaritore morto compare tra i propri candidati (può resuscitare se stesso)', () => {
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: false, condizioni: [], note: '', poteriUsati: [] },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
    />,
  )
  expect(screen.getByRole('button', { name: 'Guaritore' })).toBeInTheDocument()
})

test('lo Sciacallo Mannaro morto compare tra i propri candidati (può resuscitare se stesso)', () => {
  const giocatori = [
    { id: '1', nome: 'Sciacallo', ruoloSlug: 'sciacallo-mannaro', vivo: false, condizioni: [], note: '', poteriUsati: [] },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      potereSlug="sciacallo-mannaro-resuscita"
      ruoloSlugAttore="sciacallo-mannaro"
    />,
  )
  expect(screen.getByRole('button', { name: 'Sciacallo' })).toBeInTheDocument()
})

test('mostra solo i giocatori morti come candidati', () => {
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], note: '', poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
    />,
  )
  expect(screen.queryByText('Anna')).not.toBeInTheDocument()
})

test('cambiare bersaglio sposta il marcatore senza toccare vivo (nessuna catena di morte rilanciata)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte', mortoNotte: 1 },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
      round={2}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { resuscitaAllAlba: undefined })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { resuscitaAllAlba: 2 })
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ vivo: expect.anything() }))
})

test('cliccare di nuovo il bersaglio lo deseleziona: il marcatore si toglie e il potere si rilascia', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte', mortoNotte: 1 },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
      round={2}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'false')
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { resuscitaAllAlba: undefined })
  expect(aggiornaGiocatore).toHaveBeenLastCalledWith('1', { poteriUsati: [] })
})

test('i morti di questa notte non sono candidati (solo morti dei giorni/notti precedenti, rogo del giorno prima incluso)', () => {
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Anna', vivo: false, causaMorte: 'notte', mortoNotte: 3, condizioni: [] },
    { id: '3', nome: 'Bruno', vivo: false, causaMorte: 'notte', mortoNotte: 2, condizioni: [] },
    { id: '4', nome: 'Carla', vivo: false, causaMorte: 'rogo', mortoNotte: 3, condizioni: [] },
  ]
  render(<AzioneResuscita giocatori={giocatori} aggiornaGiocatore={() => {}} potereSlug="guaritore-resuscita" ruoloSlugAttore="guaritore" round={3} />)
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Bruno' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Carla' })).toBeInTheDocument()
})
