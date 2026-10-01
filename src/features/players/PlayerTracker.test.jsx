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
  expect(screen.getByRole('heading', { name: 'Giocatori (1)' })).toBeInTheDocument()
})

test('senza giocatori mostra un titolo di sezione e un messaggio esplicito (come Mazzo)', () => {
  setup({ giocatori: [] })
  expect(screen.getByRole('heading', { name: 'Giocatori (0)' })).toBeInTheDocument()
  expect(screen.getByText(/nessun giocatore aggiunto/i)).toBeInTheDocument()
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

  // il passo di conferma finale (irreversibile) è segnalato in rosso, come
  // le altre azioni distruttive dell'app
  const conferma = screen.getByRole('button', { name: 'Sì, elimina tutti' })
  expect(conferma).toHaveClass('player-tracker__conferma-cta')

  await user.click(conferma)
  expect(onEliminaTutti).toHaveBeenCalled()
})

test('senza giocatori non mostra "Elimina tutti i giocatori" (niente da eliminare)', () => {
  setup({ giocatori: [], onEliminaTutti: vi.fn() })
  expect(screen.queryByRole('button', { name: 'Elimina tutti i giocatori' })).not.toBeInTheDocument()
})

test('le frecce ▲/▼ riordinano i giocatori (alternativa al drag su touch)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  const onRiordina = vi.fn()
  setup({ giocatori, onRiordina })
  await user.click(screen.getByRole('button', { name: 'Sposta Anna giù' }))
  expect(onRiordina).toHaveBeenCalledWith([giocatori[1], giocatori[0]])
})

test('a partita avviata aggiungere un giocatore chiede conferma', async () => {
  const user = userEvent.setup()
  const { addGiocatore } = setup({ partitaAvviata: true })
  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Giulia{Enter}')
  expect(addGiocatore).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Sì, procedi' }))
  expect(addGiocatore).toHaveBeenCalledWith('Giulia')
})

test('a partita avviata rimuovere un giocatore chiede conferma e annullando non rimuove', () => {
  const { removeGiocatore } = setup({
    partitaAvviata: true,
    giocatori: [{ id: '1', nome: 'Marco', vivo: true, condizioni: [] }],
  })
  const bottone = screen.getByRole('button', { name: /tieni premuto per rimuovere marco/i })
  fireEvent.pointerDown(bottone)
  fireEvent.transitionEnd(bottone.querySelector('.player-card__elimina-riempimento'), { propertyName: 'width' })
  fireEvent.animationEnd(bottone.closest('article'))
  expect(removeGiocatore).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Annulla' }))
  expect(screen.getByRole('button', { name: /tieni premuto per rimuovere marco/i })).toBeInTheDocument()
  expect(removeGiocatore).not.toHaveBeenCalled()
})
