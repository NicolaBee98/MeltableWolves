import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneBrancoLupi } from './AzioneBrancoLupi'

test('conferma uccide il bersaglio scelto e marca il branco come già usato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro']} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    vivo: false,
    causaMorte: 'notte',
    mortoNotte: 2,
    mortoDa: 'branco',
  })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { usiNotte: ['branco-lupi-sbrana'] })
})

test('non uccide un bersaglio protetto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto'], note: '' }]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})

test('non permette una seconda vittima nella stessa notte', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: ['branco-lupi-sbrana'] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={() => {}} round={1} ruoli={['lupo-mannaro']} />)

  expect(screen.getByText(/il branco ha già sbranato/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
})

test('Cortigiana, Nano e Criceto Malvagio non compaiono tra i bersagli proposti (immuni al branco)', () => {
  const giocatori = [
    { id: '1', nome: 'Cora', ruoloSlug: 'cortigiana', vivo: true, condizioni: [] },
    { id: '2', nome: 'Nino', ruoloSlug: 'nano', vivo: true, condizioni: [] },
    { id: '3', nome: 'Cric', ruoloSlug: 'criceto-malvagio', vivo: true, condizioni: [] },
    { id: '4', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={() => {}} round={1} ruoli={['lupo-mannaro']} />)

  expect(screen.queryByRole('button', { name: 'Cora' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Nino' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Cric' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})

test('il branco stordito dall\'Ubriaco non può cacciare quella notte', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [], brancoStorditoFinoA: 3 },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={() => {}} round={3} ruoli={['lupo-mannaro']} />)

  expect(screen.getByText(/ancora stordito/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
})

test('Berserker sbranato con due lupi alla stessa distanza: il narratore sceglie quale muore', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Bruno', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
    { id: '3', nome: 'Ezio', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro']} />)

  await user.click(screen.getByRole('button', { name: 'Bruno' }))
  expect(aggiornaGiocatore).not.toHaveBeenCalled()
  expect(screen.getByText(/due lupi alla stessa distanza/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ezio' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', expect.objectContaining({ vivo: false }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', expect.objectContaining({ vivo: false }))
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('1', expect.objectContaining({ vivo: false }))
})

test('con la vendetta del Cucciolo attiva il branco può sbranare due vittime nella stessa notte', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Carlo', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [], vendettaCucciolo: true },
  ]
  const { rerender } = render(
    <AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />)

  // dopo la prima vittima il branco può ancora scegliere (vendetta: 2 vittime)
  expect(screen.getByRole('button', { name: 'Carlo' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Carlo' }))
  rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />)

  expect(screen.getByText(/il branco ha già sbranato/i)).toBeInTheDocument()
  expect(giocatori.find((g) => g.id === '1').vivo).toBe(false)
  expect(giocatori.find((g) => g.id === '2').vivo).toBe(false)
  expect(giocatori.find((g) => g.id === '3').vendettaCucciolo).toBe(false)
})
