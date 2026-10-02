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

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: { tipo: 'apprendista', targetId: '2' } })
})

test('col legame già stabilito, le chip restano visibili e modificabili (principio "editabile finché non premi Avanti"): quella del bersaglio scelto è marcata attiva', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '3', nome: 'Elena', ruoloSlug: 'villico', vivo: true, condizioni: [] },
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
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Elena' })).toHaveAttribute('aria-pressed', 'false')

  await user.click(screen.getByRole('button', { name: 'Elena' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: { tipo: 'apprendista', targetId: '3' } })
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

test('cliccando di nuovo il bersaglio del legame lo annulla', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
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
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: undefined })
})
