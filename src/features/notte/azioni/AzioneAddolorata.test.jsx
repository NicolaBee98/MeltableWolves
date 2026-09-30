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

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', poteriUsati: ['addolorata-scambio'] })
  // la vittima diventa "Addolorata" a sua volta: se resuscitata in seguito,
  // deve avere di nuovo i poteri dell'Addolorata, non quelli del suo vecchio ruolo
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { ruoloSlug: 'addolorata', storiaRuoli: ['veggente', 'addolorata'] })
})

test('se il Mimo sta imitando l\'Addolorata (stesso ruoloSlug), lo scambio si scrive su entrambi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Gino', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '3', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Scambia' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', poteriUsati: ['addolorata-scambio'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { ruoloSlug: 'veggente', poteriUsati: ['addolorata-scambio'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { ruoloSlug: 'addolorata', storiaRuoli: ['addolorata'] })
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
