import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Votazione } from './Votazione'
import { GiornoPanel } from './GiornoPanel'
import { usePartita } from '../../state/usePartita'

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
    onAnticoRivelazione: vi.fn(),
    onRivelazione: vi.fn(),
    onBoiaGiustizia: vi.fn(),
    onAlchimistaEsplode: vi.fn(),
    onScemoSbaglia: vi.fn(),
    onMorteUnzione: vi.fn(),
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
  expect(screen.getByText(/vittima designata/i)).toBeInTheDocument()
  expect(screen.getByText('Anna', { selector: '.votazione__nome-designato' })).toBeInTheDocument()

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

test('un designato di ruolo ancora ignoto può rivelarsi Spilungone o L\'Antico al momento del rogo, senza doverlo assegnare prima da Eventi speciali', async () => {
  const user = userEvent.setup()
  const giocatoriSenzaRuoloNoto = [
    { id: '1', nome: 'Anna', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  const { onRogo, onAnticoRivelazione } = setup({
    giocatori: giocatoriSenzaRuoloNoto,
    voti: { 1: 2 },
    fase: 'esito',
    ruoliSelezionati: ['spilungone', 'lantico'],
    quantita: { spilungone: 1, lantico: 1 },
  })

  expect(screen.getByRole('button', { name: 'Si rivela: è lo Spilungone' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: "Si rivela: è L'Antico" }))
  // conferma esplicita: il primo click non applica nulla
  expect(onAnticoRivelazione).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  // non onRivelazione + onAnticoRivelazione separati: due aggiornaGiocatore
  // in sequenza sulla stessa persona si perderebbero a vicenda lo
  // storiaRuoli (vedi GiornoPanel.dichiaraAnticoRivelazione), quindi è
  // quest'ultimo da solo a registrare anche il 'lantico' mai assegnato prima
  expect(onAnticoRivelazione).toHaveBeenCalledWith('1')
  expect(onRogo).not.toHaveBeenCalled()
  expect(screen.getByText(/anna rivela la propria carta: è l'antico/i)).toBeInTheDocument()
})

test('non propone la rivelazione di Spilungone/L\'Antico se il designato ha già un ruolo noto diverso', () => {
  const giocatoriConRuoloNoto = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  setup({
    giocatori: giocatoriConRuoloNoto,
    voti: { 1: 2 },
    fase: 'esito',
    ruoliSelezionati: ['spilungone'],
    quantita: { spilungone: 1 },
  })
  expect(screen.queryByRole('button', { name: 'Si rivela: è lo Spilungone' })).not.toBeInTheDocument()
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
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

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

test("un designato di ruolo ignoto può rivelarsi l'Alchimista al rogo: chiede poi chi trascina con sé nell'esplosione", async () => {
  const user = userEvent.setup()
  const giocatoriConAlchimista = [
    { id: '1', nome: 'Anna', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
    { id: '3', nome: 'Luca', vivo: true },
  ]
  const { onRogo, onAlchimistaEsplode } = setup({
    giocatori: giocatoriConAlchimista,
    voti: { 1: 2 },
    fase: 'esito',
    candidatiEsito: ['1'],
    ruoliSelezionati: ['alchimista'],
    quantita: { alchimista: 1 },
  })

  await user.click(screen.getByRole('button', { name: "Si rivela: è l'Alchimista" }))
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(onAlchimistaEsplode).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onRogo).not.toHaveBeenCalled()
  expect(onAlchimistaEsplode).toHaveBeenCalledWith('1', '2')
  expect(screen.getByText(/anna rivela la propria carta: è l'alchimista/i)).toBeInTheDocument()
  expect(screen.getByText(/trascina con sé marco/i)).toBeInTheDocument()
})

test("il calcolo dell'esito usa i candidati congelati, non i giocatori vivi correnti (evita lo spareggio fantasma dopo il rogo)", () => {
  const giocatoriDopoRogo = [
    { id: '1', nome: 'Anna', vivo: false },
    { id: '2', nome: 'Marco', vivo: true },
    { id: '3', nome: 'Luca', vivo: false },
  ]
  setup({ giocatori: giocatoriDopoRogo, voti: { 1: 2 }, fase: 'esito', candidatiEsito: ['1', '2'] })

  expect(screen.getByText(/vittima designata/i)).toBeInTheDocument()
  expect(screen.getByText('Anna', { selector: '.votazione__nome-designato' })).toBeInTheDocument()
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

test('in fase esito, se il rogo determina una condizione di vittoria, mostra il messaggio e "Concludi partita"', async () => {
  const user = userEvent.setup()
  const giocatoriDopoRogo = [
    { id: '1', nome: 'Anna', vivo: false, ruoloSlug: 'lupo-mannaro', condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  const onConcludiPartita = vi.fn()
  setup({ giocatori: giocatoriDopoRogo, voti: { 1: 2 }, fase: 'esito', onConcludiPartita })

  expect(screen.getByText(/vince il villaggio/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Concludi partita' }))
  await user.click(screen.getByRole('button', { name: 'Sì, concludi' }))
  expect(onConcludiPartita).toHaveBeenCalled()
})

test('in fase esito con più massimi mostra lo spareggio con le chip dei candidati', () => {
  setup({ voti: { 1: 2, 2: 2 }, fase: 'esito' })
  expect(screen.getByText(/spareggio tra: anna, marco/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test('in fase esito, nello spareggio la chip resta selezionabile/cambiabile: serve "Dichiara morte sul rogo" per confermare', async () => {
  const user = userEvent.setup()
  const { onRogo } = setup({ voti: { 1: 2, 2: 2 }, fase: 'esito' })

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(onRogo).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')

  // si può cambiare idea prima di confermare
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'false')

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(onRogo).toHaveBeenCalledWith('1')
})

test('in fase esito il pulsante Torna al voto chiama tornaAlVoto', async () => {
  const user = userEvent.setup()
  const { tornaAlVoto } = setup({ voti: { 1: 2 }, fase: 'esito' })
  await user.click(screen.getByRole('button', { name: 'Torna al voto' }))
  expect(tornaAlVoto).toHaveBeenCalled()
})

test("in fase esito è sempre presente l'icona Eventi speciali se il mazzo prevede il Borgomastro", async () => {
  const user = userEvent.setup()
  setup({ voti: { 1: 2 }, fase: 'esito', ruoliSelezionati: ['borgomastro'] })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.getByRole('button', { name: 'Elezione Borgomastro' })).toBeInTheDocument()
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
  setup({ ruoliSelezionati: ['borgomastro'] })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.getByRole('button', { name: 'Elezione Borgomastro' })).toBeInTheDocument()
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

test("mostra un'icona per il Fantasma Onnisciente nella sezione Morti", () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, condizioni: [], eFantasmaOnnisciente: true },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  setup({ giocatori })
  expect(screen.getByAltText('Fantasma Onnisciente')).toBeInTheDocument()
})

test('mostra un\'icona per il Borgomastro, promemoria per il voto doppio', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [], eBorgomastro: true },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  setup({ giocatori })
  expect(screen.getByAltText(/voto vale doppio/i)).toBeInTheDocument()
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

test('in fase voto, se la partita è già finita mostra il banner di vittoria e "Concludi partita"', async () => {
  const user = userEvent.setup()
  const onConcludiPartita = vi.fn()
  setup({
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico' },
      { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'villico' },
    ],
    onConcludiPartita,
  })
  expect(screen.getByText(/vince il Villaggio/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Concludi partita' }))
  await user.click(screen.getByRole('button', { name: 'Sì, concludi' }))
  expect(onConcludiPartita).toHaveBeenCalled()
})

test('"Ricomincia votazione" chiede conferma prima di azzerare i voti', async () => {
  const user = userEvent.setup()
  const { ricominciaVotazione } = setup()
  await user.click(screen.getByRole('button', { name: 'Ricomincia votazione' }))
  expect(ricominciaVotazione).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Sì, ricomincia' }))
  expect(ricominciaVotazione).toHaveBeenCalled()
})

test('nello spareggio il narratore può sorteggiare tra i candidati (uscita dallo stallo)', async () => {
  const user = userEvent.setup()
  setup({ fase: 'esito', voti: { 1: 2, 2: 2 }, candidatiEsito: ['1', '2'] })
  await user.click(screen.getByRole('button', { name: 'Sorteggia tra i candidati' }))
  expect(screen.getByRole('button', { name: 'Dichiara morte sul rogo' })).toBeInTheDocument()
})

test('Cavaliere immolato al rogo: esito confermato con messaggio chiaro e "È notte", il designato sopravvive', () => {
  setup({
    fase: 'esito',
    round: 2,
    voti: { 1: 3 },
    candidatiEsito: ['1', '2'],
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true },
      { id: '2', nome: 'Marco', vivo: true },
      { id: '3', nome: 'Luca', vivo: false, causaMorte: 'sacrificio', sacrificioRogoRound: 2 },
    ],
  })
  expect(screen.getByText(/Luca si sacrifica al posto di Anna: Anna sopravvive/)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Dichiara morte sul rogo' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'È notte nel villaggio' })).toBeInTheDocument()
})

test("L'Antico sopravvissuto risulta confermato anche dopo un reload (dedotto da villaggioMaledettoFinoA)", () => {
  setup({
    fase: 'esito',
    round: 2,
    voti: { 1: 3 },
    candidatiEsito: ['1', '2'],
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', villaggioMaledettoFinoA: 2 },
      { id: '2', nome: 'Marco', vivo: true },
    ],
  })
  expect(screen.getByText(/è L'Antico, ma sopravvive/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'È notte nel villaggio' })).toBeInTheDocument()
})

test('"Torna al voto" azzera il designato dello spareggio', async () => {
  const user = userEvent.setup()
  const tornaAlVoto = vi.fn()
  setup({ fase: 'esito', voti: { 1: 2, 2: 2 }, candidatiEsito: ['1', '2'], tornaAlVoto })
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  expect(screen.getByRole('button', { name: 'Dichiara morte sul rogo' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Torna al voto' }))
  expect(tornaAlVoto).toHaveBeenCalled()
})

test("L'Antico già sbranato di notte muore al rogo come un Villico qualunque, senza rivelazione", async () => {
  const user = userEvent.setup()
  const { onRogo, onAnticoRivelazione } = setup({
    fase: 'esito',
    voti: { 1: 2 },
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'lantico', anticoSbranatoNotte: 1 },
      { id: '2', nome: 'Marco', vivo: true },
    ],
  })
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(onRogo).toHaveBeenCalledWith('1')
  expect(onAnticoRivelazione).not.toHaveBeenCalled()
})

test("L'Antico sbranato e rivelato all'alba (ora Villico, storiaRuoli con 'lantico') muore davvero al rogo, senza rivelarsi né maledire", async () => {
  const user = userEvent.setup()
  const { onRogo, onAnticoRivelazione } = setup({
    fase: 'esito',
    round: 1,
    voti: { 1: 2 },
    ruoliSelezionati: ['lantico'],
    quantita: { lantico: 1 },
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', storiaRuoli: ['lantico', 'villico'], anticoSbranatoNotte: 1 },
      { id: '2', nome: 'Marco', vivo: true },
    ],
  })
  expect(screen.queryByRole('button', { name: "Si rivela: è L'Antico" })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(onRogo).toHaveBeenCalledWith('1')
  expect(onAnticoRivelazione).not.toHaveBeenCalled()
})

test("L'Antico rivelato (ora Villico, storiaRuoli con 'lantico') mantiene l'icona-testa dell'Antico; un Villico qualsiasi no", () => {
  setup({
    mostraRuoli: true,
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', storiaRuoli: ['lantico', 'villico'] },
      { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'villico', storiaRuoli: ['villico'] },
    ],
  })
  expect(screen.getByAltText("L'Antico")).toBeInTheDocument()
  expect(screen.getAllByAltText('Villico')).toHaveLength(1)
})

test("l'esito del rogo ricorda il crepacuore del partner del designato prima di confermare", () => {
  setup({
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['2'] },
      { id: '2', nome: 'Marco', vivo: true, condizioni: ['innamorato'], innamoratiCon: ['1'] },
    ],
    voti: { 1: 2 },
    fase: 'esito',
    candidatiEsito: ['1', '2'],
  })

  expect(screen.getByText('Morirà anche Marco (crepacuore).')).toBeInTheDocument()
})

test('Cavaliere al rogo end-to-end: si sacrifica, compare "È notte", un secondo click non può uccidere il protetto', async () => {
  localStorage.setItem(
    'meltable-wolves-partita',
    JSON.stringify([
      { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico' },
      { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'villico' },
      { id: '3', nome: 'Luca', vivo: true, ruoloSlug: 'cavaliere', legame: { tipo: 'cavaliere', targetId: '1' } },
    ]),
  )
  function Giorno() {
    const p = usePartita()
    return (
      <GiornoPanel
        giocatori={p.giocatori}
        voti={{ 1: 3 }}
        fase="esito"
        candidatiEsito={['1', '2', '3']}
        aggiornaGiocatore={p.aggiornaGiocatore}
        annullaMorte={p.annullaMorte}
        ruoliSelezionati={['cavaliere']}
        quantita={{}}
        round={2}
        onProsegui={() => {}}
      />
    )
  }
  const user = userEvent.setup()
  render(<Giorno />)
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(screen.getByText(/Il Cavaliere Luca si sacrifica al posto di Anna: Anna sopravvive/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'È notte nel villaggio' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Dichiara morte sul rogo' })).not.toBeInTheDocument()
  localStorage.clear()
})

test('dopo la conferma del rogo resta il riepilogo delle conseguenze (Figlia dei Lupi, crepacuore)', async () => {
  localStorage.setItem(
    'meltable-wolves-partita',
    JSON.stringify([
      { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', condizioni: ['innamorato'], innamoratiCon: ['4'] },
      { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'villico' },
      { id: '3', nome: 'Fiamma', vivo: true, ruoloSlug: 'figlia-dei-lupi', legame: { tipo: 'figlia-dei-lupi', targetId: '1' } },
      { id: '4', nome: 'Bruno', vivo: true, ruoloSlug: 'villico', condizioni: ['innamorato'], innamoratiCon: ['1'] },
    ]),
  )
  function Giorno() {
    const p = usePartita()
    return (
      <GiornoPanel
        giocatori={p.giocatori}
        voti={{ 1: 3 }}
        fase="esito"
        candidatiEsito={['1', '2']}
        aggiornaGiocatore={p.aggiornaGiocatore}
        annullaMorte={p.annullaMorte}
        ruoliSelezionati={[]}
        quantita={{}}
        round={2}
        onProsegui={() => {}}
      />
    )
  }
  const user = userEvent.setup()
  render(<Giorno />)
  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  expect(screen.getByText('La Figlia dei Lupi Fiamma è diventata Lupo Mannaro.')).toBeInTheDocument()
  expect(screen.getByText('È morto anche Bruno (crepacuore).')).toBeInTheDocument()
  localStorage.clear()
})

test('plurale corretto dei voti: "1 voto", "0 voti", "2 voti"', () => {
  setup({
    voti: { 1: 1, 2: 2 },
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true },
      { id: '2', nome: 'Marco', vivo: true },
      { id: '3', nome: 'Luca', vivo: true },
    ],
  })
  expect(screen.getByText('1 voto')).toBeInTheDocument()
  expect(screen.getByText('2 voti')).toBeInTheDocument()
  expect(screen.getByText('0 voti')).toBeInTheDocument()
})

test("Alchimista che trascina chi ha una Figlia dei Lupi legata: dopo il Conferma resta il riepilogo della conseguenza", async () => {
  const user = userEvent.setup()
  setup({
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true },
      { id: '2', nome: 'Marco', vivo: true },
      { id: '3', nome: 'Bea', vivo: true, ruoloSlug: 'figlia-dei-lupi', legame: { tipo: 'figlia-dei-lupi', targetId: '2' } },
    ],
    voti: { 1: 2 },
    fase: 'esito',
    candidatiEsito: ['1'],
    ruoliSelezionati: ['alchimista'],
    quantita: { alchimista: 1 },
  })
  await user.click(screen.getByRole('button', { name: "Si rivela: è l'Alchimista" }))
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(screen.getByText(/Bea è diventata Lupo Mannaro/)).toBeInTheDocument()
})

test('dopo il primo rogo ricorda di assegnare il Fantasma Onnisciente, finché nessuno lo ha', () => {
  const g = [
    { id: '1', nome: 'Anna', vivo: false, causaMorte: 'rogo' },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  const props = { giocatori: g, voti: { 1: 2 }, fase: 'esito', candidatiEsito: ['1'], ruoliSelezionati: ['fantasma-onnisciente'] }
  setup(props)
  expect(screen.getByText(/Assegna la carta del Fantasma Onnisciente al primo morto/)).toBeInTheDocument()
})

test('sorteggio dello spareggio: mostra "Sorteggiato: X"', async () => {
  const user = userEvent.setup()
  setup({
    giocatori: [
      { id: '1', nome: 'Anna', vivo: true },
      { id: '2', nome: 'Marco', vivo: true },
    ],
    voti: { 1: 2, 2: 2 },
    fase: 'esito',
    candidatiEsito: ['1', '2'],
  })
  await user.click(screen.getByRole('button', { name: 'Sorteggia tra i candidati' }))
  expect(screen.getByText(/^Sorteggiato: (Anna|Marco)$/)).toBeInTheDocument()
})

test('l\'ex-Antico è mostrato "(Villico, ex Antico)" con i nomi dei ruoli attivi', () => {
  setup({
    giocatori: [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', storiaRuoli: ['lantico', 'villico'] }],
    mostraRuoli: true,
    mostraNomeRuolo: true,
  })
  expect(screen.getByText(/Anna \(Villico, ex Antico\)/)).toBeInTheDocument()
})
