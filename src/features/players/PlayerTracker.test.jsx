import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'

function setup(overrides = {}) {
  const props = {
    giocatori: [],
    addGiocatore: vi.fn(),
    toggleVivo: vi.fn(),
    setCondizioni: vi.fn(),
    setNote: vi.fn(),
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

test('mostra i giocatori esistenti come card, con ruolo non assegnato se assente', () => {
  setup({
    giocatori: [{ id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [], note: '' }],
  })
  expect(screen.getByText('Marco')).toBeInTheDocument()
  expect(screen.getByText('Ruolo non ancora assegnato')).toBeInTheDocument()
})

test('click sul pulsante stato chiama toggleVivo con id del giocatore', async () => {
  const user = userEvent.setup()
  const { toggleVivo } = setup({
    giocatori: [{ id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [], note: '' }],
  })

  await user.click(screen.getByRole('button', { name: 'Vivo' }))

  expect(toggleVivo).toHaveBeenCalledWith('1')
})
