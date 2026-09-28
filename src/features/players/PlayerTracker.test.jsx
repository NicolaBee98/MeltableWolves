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

test('tenere premuto fino al riempimento completo chiama removeGiocatore con id del giocatore', () => {
  const { removeGiocatore } = setup({
    giocatori: [{ id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [] }],
  })

  const bottone = screen.getByRole('button', { name: /tieni premuto per rimuovere marco/i })
  fireEvent.pointerDown(bottone)
  fireEvent.transitionEnd(bottone.querySelector('.player-card__elimina-riempimento'), { propertyName: 'width' })
  fireEvent.animationEnd(bottone.closest('article'))

  expect(removeGiocatore).toHaveBeenCalledWith('1')
})

test('trascinare la card di un giocatore su un altro chiama onRiordina col nuovo ordine', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const onRiordina = vi.fn()
  setup({ giocatori, onRiordina })

  const dataTransfer = { data: {}, setData(k, v) { this.data[k] = v }, getData(k) { return this.data[k] } }
  fireEvent.dragStart(screen.getByText('Anna').closest('article'), { dataTransfer })
  fireEvent.drop(screen.getByText('Luca').closest('article'), { dataTransfer })

  expect(onRiordina).toHaveBeenCalledWith([giocatori[1], giocatori[0], giocatori[2]])
})

test('"Elimina tutti i giocatori" chiede conferma prima di chiamare onEliminaTutti', async () => {
  const user = userEvent.setup()
  const onEliminaTutti = vi.fn()
  setup({
    giocatori: [{ id: '1', nome: 'Marco', vivo: true, condizioni: [] }],
    onEliminaTutti,
  })

  await user.click(screen.getByRole('button', { name: 'Elimina tutti i giocatori' }))
  expect(onEliminaTutti).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'Sì, elimina tutti' }))
  expect(onEliminaTutti).toHaveBeenCalled()
})

test('senza giocatori non mostra "Elimina tutti i giocatori" (niente da eliminare)', () => {
  setup({ giocatori: [], onEliminaTutti: vi.fn() })
  expect(screen.queryByRole('button', { name: 'Elimina tutti i giocatori' })).not.toBeInTheDocument()
})
