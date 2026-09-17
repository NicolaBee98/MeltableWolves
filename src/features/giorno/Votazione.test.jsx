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
    fase: 'voto',
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    vaiAEsito: vi.fn(),
    tornaAlVoto: vi.fn(),
    onRogo: vi.fn(),
    onMorteImprovvisa: vi.fn(),
    onProsegui: vi.fn(),
    ...overrides,
  }
  render(<Votazione {...props} />)
  return props
}

test('in fase voto mostra un pulsante per ogni giocatore vivo, non per i morti', () => {
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

test("senza un massimo di voti non mostra il pulsante per andare all'esito", () => {
  setup()
  expect(screen.queryByRole('button', { name: /vai all.esito/i })).not.toBeInTheDocument()
})

test("con un massimo di voti il pulsante per andare all'esito chiama vaiAEsito", async () => {
  const user = userEvent.setup()
  const { vaiAEsito } = setup({ voti: { 1: 2 } })
  await user.click(screen.getByRole('button', { name: /vai all.esito/i }))
  expect(vaiAEsito).toHaveBeenCalled()
})

test('in fase esito con un solo massimo mostra la vittima designata e dichiara il rogo', async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2 }, fase: 'esito' })
  expect(screen.getByText(/vittima designata: anna/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(onRogo).toHaveBeenCalledWith('1')
})

test('in fase esito con più massimi mostra lo spareggio', () => {
  setup({ voti: { 1: 2, 2: 2 }, fase: 'esito' })
  expect(screen.getByText(/spareggio tra: anna, marco/i)).toBeInTheDocument()
})

test('in fase esito il pulsante Torna al voto chiama tornaAlVoto', async () => {
  const user = userEvent.setup()
  const { tornaAlVoto } = setup({ voti: { 1: 2 }, fase: 'esito' })
  await user.click(screen.getByRole('button', { name: 'Torna al voto' }))
  expect(tornaAlVoto).toHaveBeenCalled()
})

test("in fase esito è sempre presente l'icona Morte improvvisa", () => {
  setup({ voti: { 1: 2 }, fase: 'esito' })
  expect(screen.getByRole('button', { name: /morte improvvisa/i })).toBeInTheDocument()
})

test('in fase esito il pulsante Prosegui alla notte chiama onProsegui', async () => {
  const user = userEvent.setup()
  const { onProsegui } = setup({ voti: { 1: 2 }, fase: 'esito' })
  await user.click(screen.getByRole('button', { name: 'Prosegui alla notte' }))
  expect(onProsegui).toHaveBeenCalled()
})
