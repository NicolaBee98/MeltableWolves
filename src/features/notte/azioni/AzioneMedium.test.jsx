import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneMedium } from './AzioneMedium'

test('senza variante, rivela il ruolo esatto del defunto interrogato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'medium', vivo: true, condizioni: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  render(<AzioneMedium giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} varianteMedium={false} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ultimaIndagine: { targetId: '2', ruoloRivelato: 'veggente', notte: 2 },
  })
})

test('con la variante attiva, percepisce solo l\'aura del defunto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'medium', vivo: true, condizioni: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'lupo-mannaro', vivo: false, condizioni: [] },
  ]
  render(<AzioneMedium giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} varianteMedium={true} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 2 },
  })
})
