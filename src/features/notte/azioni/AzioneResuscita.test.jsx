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
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { vivo: true, condizioni: ['resuscitato'] })
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
