import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'
import { ROLES } from '../../data/roles'

beforeEach(() => {
  localStorage.clear()
})

test('senza ruoli disponibili mostra un messaggio invece del form', () => {
  render(<PlayerTracker ruoliDisponibili={[]} />)
  expect(screen.getByText(/seleziona almeno un ruolo/i)).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Nome giocatore')).not.toBeInTheDocument()
})

test('aggiungere un giocatore lo mostra subito nella lista', async () => {
  const user = userEvent.setup()
  render(<PlayerTracker ruoliDisponibili={ROLES} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(screen.getByText('Giulia')).toBeInTheDocument()
})

test('cambiare stato vivo/morto aggiorna la card', async () => {
  const user = userEvent.setup()
  render(<PlayerTracker ruoliDisponibili={ROLES} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))
  await user.click(screen.getByRole('button', { name: /vivo/i }))

  expect(screen.getByRole('button', { name: 'Morto' })).toBeInTheDocument()
})
