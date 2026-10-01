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

  expect(aggiornaGiocatore).toHaveBeenCalledWith(
    '2',
    expect.objectContaining({ vivo: true, condizioni: ['resuscitato'], resuscitatoNotte: 2 }),
  )
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

test('cambiare bersaglio annulla la resurrezione reimpostando lo stato (impostaGiocatori), senza rilanciare la catena di una nuova morte', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const impostaGiocatori = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Guaritore', ruoloSlug: 'guaritore', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [], causaMorte: 'notte', mortoNotte: 2 },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  render(
    <AzioneResuscita
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      impostaGiocatori={impostaGiocatori}
      potereSlug="guaritore-resuscita"
      ruoloSlugAttore="guaritore"
      round={2}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.objectContaining({ vivo: false }))
  const ripristinati = impostaGiocatori.mock.calls[0][0]
  const anna = ripristinati.find((g) => g.id === '2')
  expect(anna.vivo).toBe(false)
  expect(anna.causaMorte).toBe('notte')
  expect(anna.condizioni).toEqual([])
})
