import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneLegame } from './AzioneLegame'

test('conferma stabilisce il legame sul giocatore attore', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneLegame
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoloSlugAttore="apprendista"
      tipoLegame="apprendista"
      etichetta="Chi seguire"
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: { tipo: 'apprendista', targetId: '2' } })
})

test('mostra un messaggio se il legame è già stabilito', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneLegame
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoloSlugAttore="apprendista"
      tipoLegame="apprendista"
      etichetta="Chi seguire"
    />,
  )
  expect(screen.getByText(/legame già stabilito con Marco/i)).toBeInTheDocument()
})

test("non mostra l'attore stesso tra i candidati", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneLegame
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoloSlugAttore="apprendista"
      tipoLegame="apprendista"
      etichetta="Chi seguire"
    />,
  )
  expect(screen.queryByText('Sara')).not.toBeInTheDocument()
})
