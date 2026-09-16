import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'

beforeEach(() => {
  localStorage.clear()
})

test('aggiungere un giocatore lo mostra subito nella lista', async () => {
  const user = userEvent.setup()
  render(<PlayerTracker />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(screen.getByText('Giulia')).toBeInTheDocument()
})

test('cambiare stato vivo/morto aggiorna la card', async () => {
  const user = userEvent.setup()
  render(<PlayerTracker />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))
  await user.click(screen.getByRole('button', { name: /vivo/i }))

  expect(screen.getByRole('button', { name: 'Morto' })).toBeInTheDocument()
})
