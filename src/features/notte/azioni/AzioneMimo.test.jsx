import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneMimo } from './AzioneMimo'

test('senza legame propone la scelta del bersaglio da imitare', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  render(<AzioneMimo giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} ruoliSelezionati={['mimo']} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: { tipo: 'mimo', targetId: '2' } })
})

test('con bersaglio scelto ma senza ruolo noto, propone le carte del mazzo (Villico sempre incluso)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  render(
    <AzioneMimo
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['mimo', 'veggente']}
      quantita={{ veggente: 1 }}
    />,
  )

  expect(screen.getByText(/che carta ha davvero Marco/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Veggente' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Villico' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Veggente' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', storiaRuoli: ['veggente'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { ruoloSlug: 'veggente', storiaRuoli: ['veggente'] })
})

test('se il bersaglio ha già un ruolo noto, il Mimo lo assume senza dover chiedere nulla', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true },
  ]
  render(<AzioneMimo giocatori={giocatori} aggiornaGiocatore={() => {}} ruoliSelezionati={['mimo', 'veggente']} />)

  expect(screen.getByText(/il mimo imita marco: ha assunto il ruolo di veggente/i)).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
