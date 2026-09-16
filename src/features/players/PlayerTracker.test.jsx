import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerTracker } from './PlayerTracker'
import { ROLES } from '../../data/roles'

function setup(overrides = {}) {
  const props = {
    ruoliDisponibili: ROLES,
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

test('senza ruoli disponibili mostra un messaggio invece del form', () => {
  setup({ ruoliDisponibili: [] })
  expect(screen.getByText(/seleziona almeno un ruolo/i)).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Nome giocatore')).not.toBeInTheDocument()
})

test('aggiungere un giocatore chiama addGiocatore con nome e ruolo', async () => {
  const user = userEvent.setup()
  const { addGiocatore } = setup()

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(addGiocatore).toHaveBeenCalledWith('Giulia', ROLES[0].slug)
})

test('mostra i giocatori esistenti come card', () => {
  setup({
    giocatori: [
      { id: '1', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [], note: '' },
    ],
  })
  expect(screen.getByText('Marco')).toBeInTheDocument()
})

test('click sul pulsante stato chiama toggleVivo con id del giocatore', async () => {
  const user = userEvent.setup()
  const { toggleVivo } = setup({
    giocatori: [
      { id: '1', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [], note: '' },
    ],
  })

  await user.click(screen.getByRole('button', { name: 'Vivo' }))

  expect(toggleVivo).toHaveBeenCalledWith('1')
})
