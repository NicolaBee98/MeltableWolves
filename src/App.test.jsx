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

test("l'icona Registro e impostazioni è disponibile già dalla home, prima di iniziare una partita", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  expect(screen.getByRole('dialog', { name: 'Registro e impostazioni' })).toBeInTheDocument()
})

test('"Torna al mazzo" dai giocatori, e "Torna ai giocatori" dalla prima notte (prima di ogni azione), tengono il mazzo e i giocatori intatti', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  await user.click(screen.getByRole('button', { name: /torna al mazzo/i }))
  expect(screen.getByRole('heading', { name: /nel mazzo \(1\)/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /mimo/i })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))

  await user.click(screen.getByRole('button', { name: /torna ai giocatori/i }))
  expect(screen.getByText('Anna')).toBeInTheDocument()
})

test('"← Torna alla Home" dalla composizione del mazzo riporta alla home', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: '← Torna alla Home' }))

  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()
})

test('Nuova Partita porta alla composizione del mazzo, poi ai giocatori, poi alla notte', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  expect(screen.getByRole('heading', { name: /nel mazzo/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByPlaceholderText('Nome giocatore')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('blocca "Inizia la notte" (con motivo visibile) se il numero di giocatori non combacia con i ruoli del mazzo', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByText(/servono 1 giocatori, ce ne sono 0/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Inizia la notte' })).toBeDisabled()

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  expect(screen.queryByText(/servono \d giocatori/i)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Inizia la notte' })).toBeEnabled()

  // anche troppi giocatori bloccano
  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Luca{Enter}')
  expect(screen.getByRole('button', { name: 'Inizia la notte' })).toBeDisabled()
})

test('con il Ladro nel mazzo, il conteggio giocatori attesi è 2 in meno (le due carte extra non sono per nessuno)', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Ladro' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  // mazzo: Ladro + Mimo = 2 ruoli, meno le 2 carte extra del Ladro = 0 attesi
  expect(screen.queryByText(/servono \d giocatori/i)).not.toBeInTheDocument()

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  expect(screen.getByText(/servono 0 giocatori, ce ne sono 1/i)).toBeInTheDocument()
})

test('Borgomastro e Fantasma Onnisciente non contano come giocatori in più nel conteggio atteso', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Borgomastro' }))
  await user.click(screen.getByRole('button', { name: 'Fantasma Onnisciente' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  // mazzo: Mimo + Borgomastro + Fantasma Onnisciente = 3 ruoli, ma i due
  // titoli non aggiungono nessun giocatore: 1 atteso, non 3
  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  expect(screen.queryByText(/servono \d giocatori/i)).not.toBeInTheDocument()
})

test('completare la notte porta alla schermata Alba, poi al voto', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Villico' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  await user.click(screen.getByRole('button', { name: 'Inizia la notte' }))

  await user.click(screen.getByRole('button', { name: "Vai all'alba" }))
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

test('Nuova Partita dalle Impostazioni, confermata, riporta alla Home, azzera il mazzo e tiene i nomi dei giocatori', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
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

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  // il narratore rifà spesso partite con lo stesso gruppo: il nome resta
  // già in lista (con stato azzerato), non va riscritto da capo
  expect(screen.getByText('Anna')).toBeInTheDocument()
})

test('"Elimina tutti i giocatori" (con conferma) svuota la lista, per ripartire con persone diverse', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  expect(screen.getByText('Anna')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Elimina tutti i giocatori' }))
  await user.click(screen.getByRole('button', { name: 'Sì, elimina tutti' }))

  expect(screen.queryByText('Anna')).not.toBeInTheDocument()
})

test('Nuova Partita dalla Home si comporta come dalle Impostazioni: azzera il mazzo ma tiene i nomi dei giocatori', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Mimo' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Anna{Enter}')
  await user.click(screen.getByRole('button', { name: /torna al mazzo/i }))
  await user.click(screen.getByRole('button', { name: /torna alla home/i }))

  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  expect(screen.getByRole('button', { name: 'Mimo' })).not.toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByText('Anna')).toBeInTheDocument()
})
