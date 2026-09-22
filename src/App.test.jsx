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
  expect(screen.getByRole('heading', { name: /nel mazzo/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Continua' }))
  expect(screen.getByPlaceholderText('Nome giocatore')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('mostra un avviso non bloccante se il numero di giocatori non combacia con i ruoli del mazzo', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Continua' }))

  expect(screen.getByText(/hai 0 giocatori per 1 ruoli/i)).toBeInTheDocument()

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  expect(screen.queryByText(/hai \d giocatori per \d ruoli/i)).not.toBeInTheDocument()
})

test('completare la notte porta alla schermata Alba, poi al voto', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Continua' }))
  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))
  expect(screen.getByRole('heading', { name: 'Alba' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Vai al voto' }))
  expect(screen.getByRole('button', { name: 'Ricomincia votazione' })).toBeInTheDocument()
})

test("l'icona Registro e impostazioni apre il popup, di default sulle impostazioni", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Log partita' }))
  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})

test('Nuova Partita dalle Impostazioni, confermata, riporta alla Home e azzera lo stato della partita', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Continua' }))
  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  expect(screen.getByText('Anna')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Sì, ricomincia' }))

  expect(screen.queryByRole('heading', { name: /nel mazzo/i })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  expect(screen.getByRole('heading', { name: /nel mazzo/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mimo' })).not.toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Continua' }))
  expect(screen.queryByText('Anna')).not.toBeInTheDocument()
})
