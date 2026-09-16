import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneAddolorata } from './AzioneAddolorata'

test('propone lo scambio con la vittima del rogo della notte corrente', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Scambia' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', poteriUsati: ['addolorata-scambio'] })
})

test('mostra un messaggio se nessuno è morto al rogo questa notte', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] }]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)
  expect(screen.getByText(/nessuna vittima al rogo/i)).toBeInTheDocument()
})

test('mostra un messaggio se il potere è già stato usato', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: ['addolorata-scambio'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2 },
  ]
  render(<AzioneAddolorata giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)
  expect(screen.getByText(/già utilizzato/i)).toBeInTheDocument()
})
