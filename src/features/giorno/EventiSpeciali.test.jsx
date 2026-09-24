import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventiSpeciali } from './EventiSpeciali'

function setup(overrides = {}) {
  const props = {
    giocatori: [],
    ruoliSelezionati: [],
    quantita: {},
    contesto: 'esito',
    onRivelazione: vi.fn(),
    onBoiaGiustizia: vi.fn(),
    onAlchimistaEsplode: vi.fn(),
    onScemoSbaglia: vi.fn(),
    onMorteUnzione: vi.fn(),
    onBardoSaltaNotte: vi.fn(),
    onGalloSaltaGiorno: vi.fn(),
    onElezioneBorgomastro: vi.fn(),
    onFantasmaOnnisciente: vi.fn(),
    onSuoceraRivelazione: vi.fn(),
    ...overrides,
  }
  render(<EventiSpeciali {...props} />)
  return props
}

test('senza nessun evento disponibile non mostra nulla (contesto alba, mazzo senza ruoli speciali)', () => {
  setup({ contesto: 'alba' })
  expect(screen.queryByRole('button', { name: /eventi speciali/i })).not.toBeInTheDocument()
})

test('senza Scemo del Villaggio nel mazzo e nessuno Unto, in voto/esito l\'icona non compare (a mazzo vuoto)', () => {
  setup({ contesto: 'voto' })
  expect(screen.queryByRole('button', { name: /eventi speciali/i })).not.toBeInTheDocument()
})

test('Lo Scemo del Villaggio sbaglia la rima: si rivela e muore nello stesso momento', async () => {
  const user = userEvent.setup()
  const { onScemoSbaglia } = setup({
    giocatori: [{ id: '1', nome: 'Anna', vivo: true }],
    ruoliSelezionati: ['scemo-del-villaggio'],
    quantita: { 'scemo-del-villaggio': 1 },
  })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Lo Scemo del Villaggio sbaglia la rima' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onScemoSbaglia).toHaveBeenCalledWith('1')
})

test('Lo Scemo del Villaggio non è proposto se già assegnato (già sbagliato una volta)', () => {
  setup({
    giocatori: [{ id: '1', nome: 'Anna', vivo: false, ruoloSlug: 'scemo-del-villaggio', storiaRuoli: ['scemo-del-villaggio'] }],
    ruoliSelezionati: ['scemo-del-villaggio'],
    quantita: { 'scemo-del-villaggio': 1 },
  })
  expect(screen.queryByRole('button', { name: /eventi speciali/i })).not.toBeInTheDocument()
})

test('Morte per unzione propone solo i vivi con la condizione "unto" e la propaga ai vicini vivi', async () => {
  const user = userEvent.setup()
  const { onMorteUnzione } = setup({
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true, condizioni: ['unto'] },
      { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    ],
  })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Morte per unzione' }))
  expect(screen.queryByRole('button', { name: 'Marco' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onMorteUnzione).toHaveBeenCalledWith('1')
})

test('Morte per unzione non è proposta se nessuno è unto', async () => {
  const user = userEvent.setup()
  setup({ giocatori: [{ id: '1', nome: 'Anna', vivo: true, condizioni: [] }], ruoliSelezionati: ['borgomastro'] })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Morte per unzione' })).not.toBeInTheDocument()
})

test('la Rivelazione personaggio propone solo i ruoli a scoperta diurna nel mazzo, poi solo i giocatori senza ruolo noto', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico' },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: undefined },
  ]
  const { onRivelazione } = setup({
    giocatori,
    ruoliSelezionati: ['innocente', 'villico'],
    quantita: { innocente: 1, villico: 1 },
  })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Rivelazione personaggio' }))
  expect(screen.getByRole('button', { name: 'Innocente' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Innocente' }))
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument() // ha già un ruolo noto
  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(onRivelazione).toHaveBeenCalledWith('innocente', '2')
})

test("la Rivelazione personaggio non propone Boia/Alchimista: si rivelano solo dal loro evento dedicato", async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true }]
  setup({
    giocatori,
    ruoliSelezionati: ['boia', 'alchimista', 'innocente'],
    quantita: { boia: 1, alchimista: 1, innocente: 1 },
  })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Rivelazione personaggio' }))

  expect(screen.queryByRole('button', { name: 'Boia' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Alchimista' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Innocente' })).toBeInTheDocument()
})

test('Il Boia giustizia chiede prima chi è il Boia, poi chi giustizia, senza bisogno di una rivelazione preventiva', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Ivo', vivo: true },
    { id: '2', nome: 'Anna', vivo: true },
  ]
  const { onBoiaGiustizia } = setup({ giocatori, ruoliSelezionati: ['boia'], quantita: { boia: 1 } })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Il Boia giustizia' }))
  expect(screen.getByText('Chi è il Boia')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ivo' }))
  expect(screen.getByText('Chi giustizia il Boia')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onBoiaGiustizia).toHaveBeenCalledWith('1', '2')
})

test('Il Boia giustizia: "Annulla" chiude il popup senza dichiarare nulla (niente vicolo cieco)', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Ivo', vivo: true }]
  const { onBoiaGiustizia } = setup({ giocatori, ruoliSelezionati: ['boia'], quantita: { boia: 1 } })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Il Boia giustizia' }))
  await user.click(screen.getByRole('button', { name: 'Annulla' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(onBoiaGiustizia).not.toHaveBeenCalled()
})

test('il Boia può giustiziare se stesso: resta tra i candidati del secondo passo (caso limite ammesso)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Ivo', vivo: true },
    { id: '2', nome: 'Anna', vivo: true },
  ]
  const { onBoiaGiustizia } = setup({ giocatori, ruoliSelezionati: ['boia'], quantita: { boia: 1 } })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Il Boia giustizia' }))
  await user.click(screen.getByRole('button', { name: 'Ivo' }))
  expect(screen.getByRole('button', { name: 'Ivo' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ivo' }))

  expect(onBoiaGiustizia).toHaveBeenCalledWith('1', '1')
})

test("L'Alchimista esplode chiede prima chi è l'Alchimista, poi chi trascina con sé, sempre tra i vivi", async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Ivo', vivo: true },
    { id: '2', nome: 'Anna', vivo: true },
  ]
  const { onAlchimistaEsplode } = setup({ giocatori, ruoliSelezionati: ['alchimista'], quantita: { alchimista: 1 } })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: "L'Alchimista esplode" }))
  expect(screen.getByText("Chi è l'Alchimista")).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ivo' }))
  expect(screen.getByText("Chi trascina con sé l'Alchimista")).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Ivo' })).not.toBeInTheDocument() // non può trascinare sé stesso

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onAlchimistaEsplode).toHaveBeenCalledWith('1', '2')
})

test('Il Bardo salta la notte è proposto solo in esito (dopo un rogo) e richiede conferma esplicita', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Ivo', ruoloSlug: 'bardo', vivo: true, poteriUsati: [] }]
  const { onBardoSaltaNotte } = setup({ giocatori, contesto: 'esito' })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Il Bardo salta la notte' }))
  expect(onBardoSaltaNotte).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onBardoSaltaNotte).toHaveBeenCalled()
})

test('Il Bardo salta la notte NON è proposto durante il voto, prima di un rogo (nessuna via d\'uscita verso la notte)', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Ivo', ruoloSlug: 'bardo', vivo: true, poteriUsati: [] }]
  setup({ giocatori, contesto: 'voto', ruoliSelezionati: ['borgomastro'] })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Il Bardo salta la notte' })).not.toBeInTheDocument()
})

test('Il Gallo Mannaro salta il giorno è proposto solo in contesto alba', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Ivo', ruoloSlug: 'gallo-mannaro', vivo: true, poteriUsati: [] }]
  setup({ giocatori, contesto: 'esito', ruoliSelezionati: ['borgomastro'] })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Il Gallo Mannaro salta il giorno' })).not.toBeInTheDocument()

  const { onGalloSaltaGiorno } = setup({ giocatori, contesto: 'alba' })
  await user.click(screen.getAllByRole('button', { name: /eventi speciali/i })[1])
  await user.click(screen.getByRole('button', { name: 'Il Gallo Mannaro salta il giorno' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onGalloSaltaGiorno).toHaveBeenCalled()
})

test('Assegna il Fantasma Onnisciente propone solo i giocatori morti, una sola volta per partita', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  const { onFantasmaOnnisciente } = setup({
    giocatori,
    ruoliSelezionati: ['fantasma-onnisciente'],
    contesto: 'esito',
  })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Assegna il Fantasma Onnisciente' }))
  expect(screen.queryByRole('button', { name: 'Marco' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onFantasmaOnnisciente).toHaveBeenCalledWith('1')
})

test('Assegna il Fantasma Onnisciente non è più proposto una volta che qualcuno lo tiene già', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], eFantasmaOnnisciente: true }]
  setup({ giocatori, ruoliSelezionati: ['fantasma-onnisciente'], contesto: 'esito' })
  expect(screen.queryByRole('button', { name: /eventi speciali/i })).not.toBeInTheDocument()
})

test('La Suocera si rivela propone solo i morti di identità ancora ignota, in qualunque contesto (anche alba)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: false, condizioni: [], ruoloSlug: 'villico' },
  ]
  const { onSuoceraRivelazione } = setup({
    giocatori,
    ruoliSelezionati: ['suocera'],
    contesto: 'alba',
  })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'La Suocera si rivela' }))
  expect(screen.queryByRole('button', { name: 'Marco' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onSuoceraRivelazione).toHaveBeenCalledWith('1')
})

test('La Suocera si rivela non è più proposta una volta che qualcuno l\'ha già rivelata', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'suocera' }]
  setup({ giocatori, ruoliSelezionati: ['suocera'], contesto: 'esito' })
  expect(screen.queryByRole('button', { name: /eventi speciali/i })).not.toBeInTheDocument()
})

test('Elezione Borgomastro è proposta in entrambi i contesti se il ruolo è nel mazzo', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true }]
  const { onElezioneBorgomastro } = setup({ giocatori, ruoliSelezionati: ['borgomastro'], contesto: 'alba' })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Elezione Borgomastro' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onElezioneBorgomastro).toHaveBeenCalledWith('1')
})
