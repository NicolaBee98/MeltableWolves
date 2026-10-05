import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneAddolorata } from './AzioneAddolorata'

test('propone lo scambio con la vittima del rogo della notte corrente: è un vero scambio, anche la vittima diventa Addolorata', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2, storiaRuoli: ['veggente'] },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Scambia' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', storiaRuoli: ['veggente'], poteriUsati: ['addolorata-scambio'] })
  // la vittima diventa "Addolorata" a sua volta: se resuscitata in seguito,
  // deve avere di nuovo i poteri dell'Addolorata, non quelli del suo vecchio ruolo
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { ruoloSlug: 'addolorata', storiaRuoli: ['veggente', 'addolorata'] })
})

test('titolare e Mimo-Addolorata sono indipendenti: scambia solo chi preme, il Mimo ottiene un Villico, il ruolo non passa a due persone', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Gino', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '3', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const { rerender } = render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)
  const ridisegna = () => rerender(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  // scambia la titolare (Sara): il Mimo resta Addolorata, Marco diventa Addolorata
  await user.click(screen.getAllByRole('button', { name: 'Scambia' })[1])
  ridisegna()
  expect(giocatori.find((g) => g.id === '2').ruoloSlug).toBe('veggente')
  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('addolorata')
  expect(giocatori.find((g) => g.id === '3').ruoloSlug).toBe('addolorata')

  // il Mimo non può prendere lo stesso ruolo: è già passato alla titolare
  expect(screen.getByText(/già stato scambiato da un'altra Addolorata/)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Scambia' })).not.toBeInTheDocument()
})

test('il Mimo-Addolorata che scambia ottiene il ruolo della vittima, che diventa un Villico senza poteri', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Gino', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [], storiaRuoli: ['mimo', 'addolorata'], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '3', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2, storiaRuoli: ['veggente'] },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Scambia' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', storiaRuoli: ['mimo', 'addolorata', 'veggente'], poteriUsati: ['addolorata-scambio'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { ruoloSlug: 'villico', storiaRuoli: ['veggente', 'villico'] })
})

test('mostra un messaggio se nessuno è morto al rogo questa notte', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] }]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)
  expect(screen.getByText(/nessuna vittima al rogo/i)).toBeInTheDocument()
})

test('lo scambio resta modificabile finché non si preme Avanti: un secondo click lo annulla', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2, storiaRuoli: ['veggente'] },
  ]
  const { rerender } = render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  rerender(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('veggente')
  expect(giocatori.find((g) => g.id === '2').ruoloSlug).toBe('addolorata')
  const bottone = screen.getByRole('button', { name: 'Annulla scambio' })
  expect(bottone).toHaveAttribute('aria-pressed', 'true')

  await user.click(bottone)
  rerender(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('addolorata')
  expect(giocatori.find((g) => g.id === '1').poteriUsati).toEqual([])
  expect(giocatori.find((g) => g.id === '2').ruoloSlug).toBe('veggente')
  expect(giocatori.find((g) => g.id === '2').storiaRuoli).toEqual(['veggente'])
  expect(screen.getByRole('button', { name: 'Scambia' })).toBeInTheDocument()
})

test('mostra un messaggio se il potere è già stato usato', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: ['addolorata-scambio'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)
  expect(screen.getByText(/già utilizzato/i)).toBeInTheDocument()
})

// scenari di eredità: Addolorata Sara scambia con la vittima del rogo Marco
function scambiaCon(vittima, extra = [], props = {}) {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [], storiaRuoli: ['addolorata'] },
    { id: '2', nome: 'Marco', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2, storiaRuoli: [vittima.ruoloSlug], ...vittima },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    ...extra,
  ]
  const aggiornaGiocatore = vi.fn()
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} {...props} />)
  return aggiornaGiocatore
}

test.each([
  ['apprendista', { tipo: 'apprendista', targetId: '3' }],
  ['cavaliere', { tipo: 'cavaliere', targetId: '3' }],
  ['figlia-dei-lupi', { tipo: 'figlia-dei-lupi', targetId: '3' }],
])('eredita le scelte attiva: %s non ancora attivato passa il legame all\'Addolorata', async (ruoloSlug, legame) => {
  const user = userEvent.setup()
  const agg = scambiaCon({ ruoloSlug, legame })
  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  const patch = agg.mock.calls.find(([id]) => id === '1')[1]
  expect(patch).toMatchObject({ ruoloSlug, legame })
  expect(patch.poteriUsati).toEqual(['addolorata-scambio'])
  // la vittima non tiene il vecchio legame
  expect(agg).toHaveBeenCalledWith('2', expect.objectContaining({ ruoloSlug: 'addolorata', legame: null }))
})

test.each(['apprendista', 'cavaliere', 'figlia-dei-lupi'])(
  'eredita le scelte DISATTIVA: %s arriva "scarico" (legame vuoto, marcatore legame-ereditato)',
  async (ruoloSlug) => {
    const user = userEvent.setup()
    const agg = scambiaCon({ ruoloSlug, legame: { tipo: ruoloSlug, targetId: '3' } }, [], { ereditaScelte: false })
    await user.click(screen.getByRole('button', { name: 'Scambia' }))
    const patch = agg.mock.calls.find(([id]) => id === '1')[1]
    expect(patch).toMatchObject({ ruoloSlug, legame: null })
    expect(patch.poteriUsati).toEqual(['legame-ereditato', 'addolorata-scambio'])
  },
)

test('il Sacerdote non passa nessuna coppia: l\'Addolorata prende il ruolo senza legami e gli innamorati restano intatti', async () => {
  const user = userEvent.setup()
  const agg = scambiaCon({ ruoloSlug: 'sacerdote', condizioni: ['innamorato'], innamoratiCon: ['3'] })
  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  const patch = agg.mock.calls.find(([id]) => id === '1')[1]
  expect(patch).toEqual({ ruoloSlug: 'sacerdote', storiaRuoli: ['addolorata', 'sacerdote'], poteriUsati: ['addolorata-scambio'] })
  expect(agg.mock.calls.some(([id]) => id === '3')).toBe(false)
})

test('poteri una volta per partita già usati dal morto (Boia, Strega) passano come usati', async () => {
  const user = userEvent.setup()
  const agg = scambiaCon({ ruoloSlug: 'strega', poteriUsati: ['strega-pozione-vitale'] })
  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  expect(agg.mock.calls.find(([id]) => id === '1')[1].poteriUsati).toEqual(['strega-pozione-vitale', 'addolorata-scambio'])
})

test('il Cavaliere immolato al rogo vale come vittima: l\'Addolorata eredita un Cavaliere scarico, anche con le scelte attive', async () => {
  const user = userEvent.setup()
  const agg = scambiaCon({ ruoloSlug: 'cavaliere', causaMorte: 'sacrificio', sacrificioDa: 'rogo', mortoNotte: undefined, sacrificioRogoRound: 2, legame: null })
  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  const patch = agg.mock.calls.find(([id]) => id === '1')[1]
  expect(patch).toMatchObject({ ruoloSlug: 'cavaliere', legame: null })
  expect(patch.poteriUsati).toEqual(['legame-ereditato', 'addolorata-scambio'])
})

test('vittima di ruolo ignoto: l\'Addolorata diventa Villico (mai senza ruolo) e il registro lo mostra come cambio di ruolo', async () => {
  const user = userEvent.setup()
  const agg = scambiaCon({ ruoloSlug: undefined, storiaRuoli: [] })
  expect(screen.getByText(/è ignoto: chi scambia diventa Villico/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  expect(agg.mock.calls.find(([id]) => id === '1')[1]).toMatchObject({ ruoloSlug: 'villico', storiaRuoli: ['addolorata', 'villico'] })
  expect(agg).toHaveBeenCalledWith('2', expect.objectContaining({ ruoloSlug: 'addolorata' }))
})

test('lo scambio con legame si annulla ripristinando legami e storia di entrambi', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [], storiaRuoli: ['addolorata'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'cavaliere', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2, storiaRuoli: ['cavaliere'], legame: { tipo: 'cavaliere', targetId: '3' } },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  const aggiornaGiocatore = (id, patch) => { giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g)) }
  const { rerender } = render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)
  const ridisegna = () => rerender(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)
  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  ridisegna()
  expect(giocatori[0].legame).toEqual({ tipo: 'cavaliere', targetId: '3' })
  expect(giocatori[1].legame).toBeNull()
  await user.click(screen.getByRole('button', { name: 'Annulla scambio' }))
  expect(giocatori[0]).toMatchObject({ ruoloSlug: 'addolorata', poteriUsati: [], storiaRuoli: ['addolorata'] })
  expect(giocatori[1]).toMatchObject({ ruoloSlug: 'cavaliere', legame: { tipo: 'cavaliere', targetId: '3' }, storiaRuoli: ['cavaliere'] })
})

test('la vittima con storiaRuoli vuota (ruolo ereditato/assegnato senza storia) riceve comunque il ruolo precedente nella storia', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)
  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { ruoloSlug: 'addolorata', storiaRuoli: ['veggente', 'addolorata'] })
})
