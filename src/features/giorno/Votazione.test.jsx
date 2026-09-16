import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Votazione } from './Votazione'

const giocatori = [
  { id: '1', nome: 'Anna', vivo: true },
  { id: '2', nome: 'Marco', vivo: true },
  { id: '3', nome: 'Luca', vivo: false },
]

function setup(overrides = {}) {
  const props = {
    giocatori,
    voti: {},
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    onRogo: vi.fn(),
    ...overrides,
  }
  render(<Votazione {...props} />)
  return props
}

test('mostra un pulsante per ogni giocatore vivo, non per i morti', () => {
  setup()
  expect(screen.getByText('Anna')).toBeInTheDocument()
  expect(screen.getByText('Marco')).toBeInTheDocument()
  expect(screen.queryByText('Luca')).not.toBeInTheDocument()
})

test("+1 chiama incrementaVoto con l'id del giocatore", async () => {
  const user = userEvent.setup()
  const { incrementaVoto } = setup()
  await user.click(screen.getAllByRole('button', { name: '+1' })[0])
  expect(incrementaVoto).toHaveBeenCalledWith('1')
})

test("-1 chiama decrementaVoto con l'id del giocatore", async () => {
  const user = userEvent.setup()
  const { decrementaVoto } = setup()
  await user.click(screen.getAllByRole('button', { name: '-1' })[0])
  expect(decrementaVoto).toHaveBeenCalledWith('1')
})

test("mostra la vittima designata quando c'è un solo massimo", () => {
  setup({ voti: { 1: 2, 2: 1 } })
  expect(screen.getByText(/vittima designata: anna/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Dichiara morte sul rogo' })).toBeInTheDocument()
})

test('mostra lo spareggio quando ci sono più massimi', () => {
  setup({ voti: { 1: 2, 2: 2 } })
  expect(screen.getByText(/spareggio tra: anna, marco/i)).toBeInTheDocument()
})

test("il pulsante rogo chiama onRogo con l'id del vincitore", async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2 } })
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(onRogo).toHaveBeenCalledWith('1')
})
