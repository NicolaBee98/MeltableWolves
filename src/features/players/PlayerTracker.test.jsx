import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'

function setup(overrides = {}) {
  const props = {
    giocatori: [],
    addGiocatore: vi.fn(),
    removeGiocatore: vi.fn(),
    ...overrides,
  }
  render(<PlayerTracker {...props} />)
  return props
}

test('aggiungere un giocatore chiama addGiocatore con il nome', async () => {
  const user = userEvent.setup()
  const { addGiocatore } = setup()

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia{Enter}')

  expect(addGiocatore).toHaveBeenCalledWith('Giulia')
})

test('mostra i giocatori esistenti come card, con solo il nome', () => {
  setup({
    giocatori: [{ id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [] }],
  })
  expect(screen.getByText('Marco')).toBeInTheDocument()
})

test('click sul pulsante di rimozione chiama removeGiocatore con id del giocatore', async () => {
  const user = userEvent.setup()
  const { removeGiocatore } = setup({
    giocatori: [{ id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [] }],
  })

  await user.click(screen.getByRole('button', { name: /rimuovi marco/i }))

  expect(removeGiocatore).toHaveBeenCalledWith('1')
})

test('trascinare la maniglia di un giocatore su un altro chiama onRiordina col nuovo ordine', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const onRiordina = vi.fn()
  setup({ giocatori, onRiordina })

  const dataTransfer = { data: {}, setData(k, v) { this.data[k] = v }, getData(k) { return this.data[k] } }
  fireEvent.dragStart(screen.getByRole('button', { name: /trascina per riordinare anna/i }), { dataTransfer })
  fireEvent.drop(screen.getByText('Luca').closest('article'), { dataTransfer })

  expect(onRiordina).toHaveBeenCalledWith([giocatori[1], giocatori[0], giocatori[2]])
})
