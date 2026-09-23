import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GiornoPanel } from './GiornoPanel'

function setup(overrides = {}) {
  const props = {
    giocatori: [{ id: '1', nome: 'Anna', vivo: true }],
    voti: { 1: 2 },
    fase: 'esito',
    candidatiEsito: ['1'],
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    vaiAEsito: vi.fn(),
    tornaAlVoto: vi.fn(),
    aggiornaGiocatore: vi.fn(),
    ruoliSelezionati: [],
    quantita: {},
    round: 3,
    onProsegui: vi.fn(),
    ...overrides,
  }
  render(<GiornoPanel {...props} />)
  return props
}

test('lo Scemo del Villaggio sbaglia la rima: si rivela e muore sul colpo nello stesso momento', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup({
    ruoliSelezionati: ['scemo-del-villaggio'],
    quantita: { 'scemo-del-villaggio': 1 },
  })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Lo Scemo del Villaggio sbaglia la rima' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ruoloSlug: 'scemo-del-villaggio',
    storiaRuoli: ['scemo-del-villaggio'],
    vivo: false,
    causaMorte: 'colpo',
  })
})

test('morte per unzione uccide l\'Unto e propaga la condizione ai vicini vivi', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: ['unto'] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const { aggiornaGiocatore } = setup({ giocatori, candidatiEsito: ['1'] })

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Morte per unzione' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'colpo' })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['unto'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { condizioni: ['unto'] })
})

test('dichiarare morte sul rogo (un solo click) chiama aggiornaGiocatore con causaMorte:rogo e la notte corrente', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'rogo', mortoNotte: 3 })
})

test("L'Antico designato al rogo sopravvive come Villico e maledice la notte successiva", async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup({
    giocatori: [{ id: '1', nome: 'Anna', ruoloSlug: 'lantico', vivo: true, storiaRuoli: ['lantico'] }],
  })

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ruoloSlug: 'villico',
    storiaRuoli: ['lantico', 'villico'],
    notteBloccataFinoA: 3,
  })
})

test('il pulsante "È notte nel villaggio" compare solo dopo che il rogo è confermato, e chiama onProsegui', async () => {
  const user = userEvent.setup()
  const { onProsegui } = setup({ giocatori: [{ id: '1', nome: 'Anna', vivo: false }] })

  const prosegui = screen.getByRole('button', { name: "È notte nel villaggio" })
  await user.click(prosegui)
  expect(onProsegui).toHaveBeenCalled()
})

test('la prop mostraRuoli passa a Votazione: con mostraRuoli mostra icona di ruolo', () => {
  setup({
    fase: 'voto',
    giocatori: [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'lupo-mannaro' }],
    mostraRuoli: true,
  })
  expect(screen.getByRole('img', { name: 'Lupo Mannaro' })).toBeInTheDocument()
})
