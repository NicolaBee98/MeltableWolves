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
    onAnnullaMorte: vi.fn(),
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

test('un pulsante di chiusura fisso è sempre presente nel popup, e premere Esc chiude riportando il focus all\'icona', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true }]
  setup({ giocatori, ruoliSelezionati: ['borgomastro'] })

  const icona = screen.getByRole('button', { name: /eventi speciali/i })
  await user.click(icona)
  expect(document.querySelector('.eventi-speciali__chiudi')).toBeInTheDocument()

  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(icona).toHaveFocus()
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
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onScemoSbaglia).toHaveBeenCalledWith('1')
})

test('Lo Scemo del Villaggio non è proposto se già assegnato (già sbagliato una volta)', async () => {
  const user = userEvent.setup()
  setup({
    giocatori: [{ id: '1', nome: 'Anna', vivo: false, ruoloSlug: 'scemo-del-villaggio', storiaRuoli: ['scemo-del-villaggio'] }],
    ruoliSelezionati: ['scemo-del-villaggio'],
    quantita: { 'scemo-del-villaggio': 1 },
  })
  // il menu resta disponibile per "Annulla morte giocatore" (Anna è morta),
  // ma non propone più di rivelare lo Scemo del Villaggio
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Lo Scemo del Villaggio sbaglia la rima' })).not.toBeInTheDocument()
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

  // scelta consequenziale (una morte): serve un "Conferma" esplicito, non
  // basta il click sulla chip
  const conferma = screen.getByRole('button', { name: 'Conferma' })
  expect(conferma).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  expect(onMorteUnzione).not.toHaveBeenCalled()
  expect(conferma).not.toBeDisabled()

  await user.click(conferma)
  expect(onMorteUnzione).toHaveBeenCalledWith('1')
})

test('Morte per unzione non è proposta se nessuno è unto', async () => {
  const user = userEvent.setup()
  setup({ giocatori: [{ id: '1', nome: 'Anna', vivo: true, condizioni: [] }], ruoliSelezionati: ['borgomastro'] })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Morte per unzione' })).not.toBeInTheDocument()
})

test('L\'Innocente si rivela: propone solo i giocatori senza ruolo noto, richiede conferma', async () => {
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

  // l'Innocente ha un evento tutto suo, non passa dal generico "Rivelazione
  // personaggio" (evita il doppio passaggio per un'unica opzione disponibile)
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: "L'Innocente si rivela" }))
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument() // ha già un ruolo noto
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onRivelazione).toHaveBeenCalledWith('innocente', '2')
})

test("Spilungone e L'Antico non hanno una voce generica di rivelazione fuori dall'alba (si rivelano dal rogo/alla morte)", async () => {
  const user = userEvent.setup()
  setup({
    giocatori: [{ id: '1', nome: 'Anna', vivo: true }],
    ruoliSelezionati: ['spilungone', 'lantico'],
    quantita: { spilungone: 1, lantico: 1 },
    contesto: 'esito',
  })
  expect(screen.queryByRole('button', { name: /eventi speciali/i })).not.toBeInTheDocument()
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
  expect(onBoiaGiustizia).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

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
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onBoiaGiustizia).toHaveBeenCalledWith('1', '1')
})

test('"Chi è il Boia" propone solo i giocatori senza ruolo ancora noto, non tutti i vivi', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Ivo', vivo: true },
    { id: '2', nome: 'Anna', ruoloSlug: 'veggente', vivo: true },
  ]
  setup({ giocatori, ruoliSelezionati: ['boia'], quantita: { boia: 1 } })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Il Boia giustizia' }))

  expect(screen.getByRole('button', { name: 'Ivo' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
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
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

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
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onFantasmaOnnisciente).toHaveBeenCalledWith('1')
})

test('Assegna il Fantasma Onnisciente non è più proposto una volta che qualcuno lo tiene già', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], eFantasmaOnnisciente: true }]
  setup({ giocatori, ruoliSelezionati: ['fantasma-onnisciente'], contesto: 'esito' })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Assegna il Fantasma Onnisciente' })).not.toBeInTheDocument()
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
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onSuoceraRivelazione).toHaveBeenCalledWith('1')
})

test('La Suocera si rivela non è più proposta una volta che qualcuno l\'ha già rivelata', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: false, condizioni: [], ruoloSlug: 'suocera' }]
  setup({ giocatori, ruoliSelezionati: ['suocera'], contesto: 'esito' })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'La Suocera si rivela' })).not.toBeInTheDocument()
})

test('Annulla morte giocatore propone tutti i morti (qualunque ruolo), in qualunque contesto, e chiama onAnnullaMorte', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: false, condizioni: [], ruoloSlug: 'villico' },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const { onAnnullaMorte } = setup({ giocatori, contesto: 'alba' })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Annulla morte giocatore' }))
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Luca' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(onAnnullaMorte).toHaveBeenCalledWith('2')
})

test('senza nessun morto, "Annulla morte giocatore" non compare nel menu', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [] }]
  setup({ giocatori, ruoliSelezionati: ['borgomastro'], contesto: 'alba' })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Annulla morte giocatore' })).not.toBeInTheDocument()
})

test('Elezione Borgomastro è proposta in entrambi i contesti se il ruolo è nel mazzo', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true }]
  const { onElezioneBorgomastro } = setup({ giocatori, ruoliSelezionati: ['borgomastro'], contesto: 'alba' })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Elezione Borgomastro' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onElezioneBorgomastro).toHaveBeenCalledWith('1')
})

test("L'Antico si rivela (alba) propone solo i morti della notte appena conclusa con ruolo ignoto: non vivi, non morti di notti vecchie, non morti al rogo", async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Tizio', vivo: false, causaMorte: 'notte', mortoNotte: 2 },
    { id: '2', nome: 'Caio', vivo: false, causaMorte: 'rogo', mortoNotte: 2 },
    { id: '3', nome: 'Sempronio', vivo: true },
    { id: '4', nome: 'Mevio', vivo: false, causaMorte: 'notte', mortoNotte: 1 },
  ]
  const { onRivelazione } = setup({ giocatori, round: 2, contesto: 'alba', ruoliSelezionati: ['lantico'], quantita: { lantico: 1 } })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: "L'Antico si rivela" }))
  for (const nome of ['Caio', 'Sempronio', 'Mevio']) {
    expect(screen.queryByRole('button', { name: nome })).not.toBeInTheDocument()
  }
  await user.click(screen.getByRole('button', { name: 'Tizio' }))
  await user.click(screen.getByRole('button', { name: /conferma/i }))
  expect(onRivelazione).toHaveBeenCalledWith('lantico', '1')
})

test("L'Alchimista esplode (esito) propone come attore solo il condannato di oggi (candidatiRogo)", async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  setup({ giocatori, candidatiRogo: ['2'], ruoliSelezionati: ['alchimista'], quantita: { alchimista: 1 } })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: "L'Alchimista esplode" }))
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})
