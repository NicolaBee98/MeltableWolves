import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('parte dalla home', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()
})

test('Nuova Partita porta alla composizione del mazzo, poi ai giocatori, poi alla notte', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  expect(screen.getByLabelText('Numero giocatori')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Continua' }))
  expect(screen.getByPlaceholderText('Nome giocatore')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('completare la notte porta alla schermata Alba, poi al voto', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByLabelText('Mimo'))
  await user.click(screen.getByRole('button', { name: 'Continua' }))
  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))
  expect(screen.getByRole('heading', { name: 'Alba' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Vai al voto' }))
  expect(screen.getByRole('button', { name: 'Ricomincia votazione' })).toBeInTheDocument()
})

test('il pulsante Registro mostra il log anche a partita in corso', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Registro' }))

  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})
