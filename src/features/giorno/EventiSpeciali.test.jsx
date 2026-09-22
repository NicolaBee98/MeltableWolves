import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventiSpeciali } from './EventiSpeciali'

function setup(overrides = {}) {
  const props = {
    giocatori: [],
    ruoliSelezionati: [],
    quantita: {},
    contesto: 'esito',
    onMorteImprovvisa: vi.fn(),
    onRivelazione: vi.fn(),
    onBoiaGiustizia: vi.fn(),
    onAlchimistaEsplode: vi.fn(),
    onBardoSaltaNotte: vi.fn(),
    onGalloSaltaGiorno: vi.fn(),
    onElezioneBorgomastro: vi.fn(),
    ...overrides,
  }
  render(<EventiSpeciali {...props} />)
  return props
}

test('senza nessun evento disponibile non mostra nulla (contesto alba, mazzo senza ruoli speciali)', () => {
  setup({ contesto: 'alba' })
  expect(screen.queryByRole('button', { name: /eventi speciali/i })).not.toBeInTheDocument()
})

test('in voto/esito la Morte improvvisa resta sempre disponibile anche a mazzo vuoto', () => {
  setup({ contesto: 'voto' })
  expect(screen.getByRole('button', { name: /eventi speciali/i })).toBeInTheDocument()
})

test('in voto/esito la Morte improvvisa è sempre proposta', async () => {
  const user = userEvent.setup()
  const { onMorteImprovvisa } = setup({ giocatori: [{ id: '1', nome: 'Anna', vivo: true }] })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Morte improvvisa' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onMorteImprovvisa).toHaveBeenCalledWith('1')
})

test('la Rivelazione personaggio propone solo i ruoli a scoperta diurna nel mazzo, poi solo i giocatori senza ruolo noto', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico' },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: undefined },
  ]
  const { onRivelazione } = setup({ giocatori, ruoliSelezionati: ['boia', 'villico'], quantita: { boia: 1, villico: 1 } })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Rivelazione personaggio' }))
  expect(screen.getByRole('button', { name: 'Boia' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Boia' }))
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument() // ha già un ruolo noto
  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(onRivelazione).toHaveBeenCalledWith('boia', '2')
})

test('Il Boia giustizia compare solo quando il Boia è già assegnato, vivo e non ha ancora usato il potere', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'boia', vivo: true, poteriUsati: [] },
    { id: '2', nome: 'Anna', vivo: true },
  ]
  const { onBoiaGiustizia } = setup({ giocatori })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Il Boia giustizia' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onBoiaGiustizia).toHaveBeenCalledWith('2')
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
  setup({ giocatori, contesto: 'voto' })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Il Bardo salta la notte' })).not.toBeInTheDocument()
})

test('Il Gallo Mannaro salta il giorno è proposto solo in contesto alba', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Ivo', ruoloSlug: 'gallo-mannaro', vivo: true, poteriUsati: [] }]
  setup({ giocatori, contesto: 'esito' })
  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  expect(screen.queryByRole('button', { name: 'Il Gallo Mannaro salta il giorno' })).not.toBeInTheDocument()

  const { onGalloSaltaGiorno } = setup({ giocatori, contesto: 'alba' })
  await user.click(screen.getAllByRole('button', { name: /eventi speciali/i })[1])
  await user.click(screen.getByRole('button', { name: 'Il Gallo Mannaro salta il giorno' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onGalloSaltaGiorno).toHaveBeenCalled()
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
