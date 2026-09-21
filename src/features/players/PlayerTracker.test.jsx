import { render, screen } from '@testing-library/react'
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
