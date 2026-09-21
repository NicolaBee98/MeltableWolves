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
    candidatiEsito: ['1', '2'],
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

test("con un massimo di voti il pulsante per andare all'esito chiama vaiAEsito con i candidati vivi", async () => {
  const user = userEvent.setup()
  const { vaiAEsito } = setup({ voti: { 1: 2 } })
  await user.click(screen.getByRole('button', { name: /vai all.esito/i }))
  expect(vaiAEsito).toHaveBeenCalledWith(['1', '2'])
})

test('in fase esito con un solo massimo mostra la vittima designata; conferma e dichiara il rogo', async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2 }, fase: 'esito' })
  expect(screen.getByText(/vittima designata: anna/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(screen.getByText(/confermi che anna è morto/i)).toBeInTheDocument()
  expect(onRogo).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'Sì, è morto' }))
  expect(onRogo).toHaveBeenCalledWith('1')
})

test('in fase esito la conferma del rogo si può annullare senza dichiarare la morte', async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2 }, fase: 'esito' })

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  await user.click(screen.getByRole('button', { name: 'Annulla' }))

  expect(onRogo).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Dichiara morte sul rogo' })).toBeInTheDocument()
})

test("il calcolo dell'esito usa i candidati congelati, non i giocatori vivi correnti (evita lo spareggio fantasma dopo il rogo)", () => {
  const giocatoriDopoRogo = [
    { id: '1', nome: 'Anna', vivo: false },
    { id: '2', nome: 'Marco', vivo: true },
    { id: '3', nome: 'Luca', vivo: false },
  ]
  setup({ giocatori: giocatoriDopoRogo, voti: { 1: 2 }, fase: 'esito', candidatiEsito: ['1', '2'] })

  expect(screen.getByText(/vittima designata: anna/i)).toBeInTheDocument()
  expect(screen.queryByText(/spareggio/i)).not.toBeInTheDocument()
})

test('in fase esito, prima della conferma, "Prosegui alla notte" è disabilitato', () => {
  setup({ voti: { 1: 2 }, fase: 'esito' })
  expect(screen.getByRole('button', { name: 'Prosegui alla notte' })).toBeDisabled()
})

test('in fase esito, dopo la conferma del rogo, "Prosegui alla notte" si abilita', async () => {
  const user = userEvent.setup()
  const giocatoriDopoRogo = [
    { id: '1', nome: 'Anna', vivo: false },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  const { onProsegui } = setup({ giocatori: giocatoriDopoRogo, voti: { 1: 2 }, fase: 'esito' })

  expect(screen.getByRole('button', { name: 'Prosegui alla notte' })).not.toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Prosegui alla notte' }))
  expect(onProsegui).toHaveBeenCalled()
})

test('in fase esito con più massimi mostra lo spareggio con le chip dei candidati', () => {
  setup({ voti: { 1: 2, 2: 2 }, fase: 'esito' })
  expect(screen.getByText(/spareggio tra: anna, marco/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test('in fase esito, selezionare chi muore nello spareggio e confermare dichiara il rogo su quel giocatore', async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2, 2: 2 }, fase: 'esito' })

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(screen.getByText(/confermi che marco è morto/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Sì, è morto' }))
  expect(onRogo).toHaveBeenCalledWith('2')
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
