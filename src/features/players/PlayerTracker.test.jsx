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

  // jsdom non ha elementFromPoint: il "punto" è la card di Luca
  document.elementFromPoint = vi.fn(() => screen.getByText('Luca'))
  const maniglia = screen.getByRole('button', { name: 'Trascina per spostare Anna' })
  fireEvent.pointerDown(maniglia, { pointerId: 1 })
  fireEvent.pointerMove(maniglia, { pointerId: 1, clientX: 5, clientY: 300 })
  expect(screen.getByText('Luca').closest('article')).toHaveClass('player-card--rilascio-dopo')
  fireEvent.pointerUp(maniglia, { pointerId: 1 })

  expect(onRiordina).toHaveBeenCalledWith([giocatori[1], giocatori[2], giocatori[0]])
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

test('salendo il giocatore finisce prima del bersaglio, e non ci sono frecce ▲/▼', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  const onRiordina = vi.fn()
  setup({ giocatori, onRiordina })
  expect(screen.queryByRole('button', { name: /Sposta/ })).not.toBeInTheDocument()
  document.elementFromPoint = vi.fn(() => screen.getByText('Anna'))
  const maniglia = screen.getByRole('button', { name: 'Trascina per spostare Marco' })
  fireEvent.pointerDown(maniglia, { pointerId: 1 })
  fireEvent.pointerMove(maniglia, { pointerId: 1 })
  fireEvent.pointerUp(maniglia, { pointerId: 1 })
  expect(onRiordina).toHaveBeenCalledWith([giocatori[1], giocatori[0]])
})

test('il trascinamento non avvia l\'eliminazione', () => {
  const { removeGiocatore } = setup({ giocatori: [{ id: '1', nome: 'Marco', vivo: true, condizioni: [] }] })
  fireEvent.pointerDown(screen.getByRole('button', { name: /Trascina per spostare Marco/ }), { pointerId: 1 })
  expect(screen.getByRole('button', { name: /tieni premuto per rimuovere marco/i }).querySelector('.player-card__elimina-riempimento').style.width).toBe('0%')
  expect(removeGiocatore).not.toHaveBeenCalled()
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
