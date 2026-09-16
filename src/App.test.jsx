import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('renders app heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /meltable wolves/i })).toBeInTheDocument()
})

test('parte sulla scheda Mazzo e permette di passare a Giocatori', async () => {
  const user = userEvent.setup()
  render(<App />)

  expect(screen.getByLabelText('Numero giocatori')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Giocatori' }))

  expect(screen.getByText(/seleziona almeno un ruolo/i)).toBeInTheDocument()
})
