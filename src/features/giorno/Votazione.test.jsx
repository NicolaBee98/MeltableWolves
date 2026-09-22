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
    onAnticoRivelazione: vi.fn(),
    onRivelazione: vi.fn(),
    onBoiaGiustizia: vi.fn(),
    onAlchimistaEsplode: vi.fn(),
    onBardoSaltaNotte: vi.fn(),
    onElezioneBorgomastro: vi.fn(),
    ruoliSelezionati: [],
    quantita: {},
    onProsegui: vi.fn(),
    ...overrides,
  }
  render(<Votazione {...props} />)
  return props
}

test('in fase voto mostra un pulsante per ogni giocatore vivo, non per i morti (che compaiono invece nella sezione Morti)', () => {
  setup()
  expect(screen.getByText('Anna')).toBeInTheDocument()
  expect(screen.getByText('Marco')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Luca' })).not.toBeInTheDocument()
})

test('la sezione Morti elenca tutti i giocatori morti della partita', () => {
  setup()
  expect(screen.getByRole('heading', { name: 'Morti' })).toBeInTheDocument()
  expect(screen.getByText('Luca')).toBeInTheDocument()
})

test('senza morti non mostra la sezione Morti', () => {
  setup({ giocatori: [{ id: '1', nome: 'Anna', vivo: true }] })
  expect(screen.queryByRole('heading', { name: 'Morti' })).not.toBeInTheDocument()
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

test('in fase esito con un solo massimo mostra la vittima designata; un click dichiara il rogo (nessuna conferma ridondante)', async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2 }, fase: 'esito' })
  expect(screen.getByText(/vittima designata: anna/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(onRogo).toHaveBeenCalledWith('1')
})

test('lo Spilungone designato al rogo si rivela e non muore', async () => {
  const user = userEvent.setup()
  const giocatoriConSpilungone = [
    { id: '1', nome: 'Anna', ruoloSlug: 'spilungone', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  const { onRogo, onProsegui } = setup({ giocatori: giocatoriConSpilungone, voti: { 1: 2 }, fase: 'esito' })

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(onRogo).not.toHaveBeenCalled()
  expect(screen.getByText(/anna rivela la propria carta: è lo spilungone/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Torna al voto' })).not.toBeInTheDocument()

  const prosegui = screen.getByRole('button', { name: "È notte nel villaggio" })
  await user.click(prosegui)
  expect(onProsegui).toHaveBeenCalled()
})

test('lo Spilungone scelto nello spareggio si rivela e non muore', async () => {
  const user = userEvent.setup()
  const giocatoriConSpilungone = [
    { id: '1', nome: 'Anna', ruoloSlug: 'spilungone', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  const { onRogo } = setup({
    giocatori: giocatoriConSpilungone,
    voti: { 1: 2, 2: 2 },
    fase: 'esito',
    candidatiEsito: ['1', '2'],
  })

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onRogo).not.toHaveBeenCalled()
  expect(screen.getByText(/anna rivela la propria carta: è lo spilungone/i)).toBeInTheDocument()
})

test("L'Antico designato al rogo si rivela, sopravvive e chiama onAnticoRivelazione", async () => {
  const user = userEvent.setup()
  const giocatoriConAntico = [
    { id: '1', nome: 'Anna', ruoloSlug: 'lantico', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  const { onRogo, onAnticoRivelazione, onProsegui } = setup({
    giocatori: giocatoriConAntico,
    voti: { 1: 2 },
    fase: 'esito',
  })

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(onRogo).not.toHaveBeenCalled()
  expect(onAnticoRivelazione).toHaveBeenCalledWith('1')
  expect(screen.getByText(/anna rivela la propria carta: è l'antico/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Torna al voto' })).not.toBeInTheDocument()

  const prosegui = screen.getByRole('button', { name: "È notte nel villaggio" })
  await user.click(prosegui)
  expect(onProsegui).toHaveBeenCalled()
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

test('in fase esito, prima della conferma, "È notte nel villaggio" non compare ancora', () => {
  setup({ voti: { 1: 2 }, fase: 'esito' })
  expect(screen.queryByRole('button', { name: "È notte nel villaggio" })).not.toBeInTheDocument()
})

test('in fase esito, dopo la conferma del rogo, compare "È notte nel villaggio"', async () => {
  const user = userEvent.setup()
  const giocatoriDopoRogo = [
    { id: '1', nome: 'Anna', vivo: false },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  const { onProsegui } = setup({ giocatori: giocatoriDopoRogo, voti: { 1: 2 }, fase: 'esito' })

  const prosegui = screen.getByRole('button', { name: "È notte nel villaggio" })
  await user.click(prosegui)
  expect(onProsegui).toHaveBeenCalled()
})

test('in fase esito con più massimi mostra lo spareggio con le chip dei candidati', () => {
  setup({ voti: { 1: 2, 2: 2 }, fase: 'esito' })
  expect(screen.getByText(/spareggio tra: anna, marco/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test('in fase esito, selezionare chi muore nello spareggio dichiara subito il rogo su quel giocatore', async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2, 2: 2 }, fase: 'esito' })

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(onRogo).toHaveBeenCalledWith('2')
})

test('in fase esito il pulsante Torna al voto chiama tornaAlVoto', async () => {
  const user = userEvent.setup()
  const { tornaAlVoto } = setup({ voti: { 1: 2 }, fase: 'esito' })
  await user.click(screen.getByRole('button', { name: 'Torna al voto' }))
  expect(tornaAlVoto).toHaveBeenCalled()
})

test("in fase esito è sempre presente l'icona Eventi speciali, con la Morte improvvisa nel menu", async () => {
  const user = userEvent.setup()
  setup({ voti: { 1: 2 }, fase: 'esito' })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.getByRole('button', { name: 'Morte improvvisa' })).toBeInTheDocument()
})

test("in fase esito, una volta che la morte è confermata, 'Torna al voto' non c'è più (niente doppio rogo lo stesso giorno)", () => {
  const giocatoriDopoRogo = [
    { id: '1', nome: 'Anna', vivo: false },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  setup({ giocatori: giocatoriDopoRogo, voti: { 1: 2 }, fase: 'esito' })

  expect(screen.queryByRole('button', { name: 'Torna al voto' })).not.toBeInTheDocument()
})

test("in fase voto è già presente l'icona Eventi speciali (non solo in fase esito)", async () => {
  const user = userEvent.setup()
  setup()
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.getByRole('button', { name: 'Morte improvvisa' })).toBeInTheDocument()
})

test('mostra un\'icona per ogni condizione attiva del giocatore', () => {
  const giocatoriConCondizioni = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: ['unto', 'protetto'] },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  setup({ giocatori: giocatoriConCondizioni })
  expect(screen.getByRole('img', { name: 'Unto' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Protetto' })).toBeInTheDocument()
})

test('senza condizioni non mostra nessuna icona di condizione', () => {
  setup()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

test('senza mostraRuoli (default) non mostra icona di ruolo anche se il giocatore ha un ruolo assegnato', () => {
  const giocatoriConRuolo = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'lupo-mannaro' }]
  setup({ giocatori: giocatoriConRuolo })
  expect(screen.queryByRole('img', { name: 'Lupo Mannaro' })).not.toBeInTheDocument()
})

test('con mostraRuoli attivo mostra icona di ruolo per il giocatore con ruoloSlug', () => {
  const giocatoriConRuolo = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'lupo-mannaro' }]
  setup({ giocatori: giocatoriConRuolo, mostraRuoli: true })
  expect(screen.getByRole('img', { name: 'Lupo Mannaro' })).toBeInTheDocument()
})

test('con mostraRuoli attivo ma ruoloSlug non assegnato mostra il punto interrogativo (ruolo a rivelazione diurna non ancora rivelato)', () => {
  const giocatoriSenzaRuolo = [{ id: '1', nome: 'Anna', vivo: true }]
  setup({ giocatori: giocatoriSenzaRuolo, mostraRuoli: true })
  expect(screen.getByRole('img', { name: 'Ruolo non ancora rivelato' })).toBeInTheDocument()
})
