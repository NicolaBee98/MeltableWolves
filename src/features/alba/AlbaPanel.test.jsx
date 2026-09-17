import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlbaPanel } from './AlbaPanel'

test('mostra i giocatori morti nella notte appena conclusa, non quelli di notti precedenti', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, mortoNotte: 2, ruoloSlug: 'villico' },
    { id: '2', nome: 'Marco', vivo: false, mortoNotte: 1, ruoloSlug: 'villico' },
    { id: '3', nome: 'Luca', vivo: true, ruoloSlug: 'villico' },
  ]
  render(<AlbaPanel giocatori={giocatori} round={2} onVaiAlVoto={() => {}} />)

  expect(screen.getByText('Anna')).toBeInTheDocument()
  expect(screen.queryByText('Marco')).not.toBeInTheDocument()
  expect(screen.queryByText('Luca')).not.toBeInTheDocument()
})

test('mostra un messaggio se nessuno è morto questa notte', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico' }]
  render(<AlbaPanel giocatori={giocatori} round={1} onVaiAlVoto={() => {}} />)
  expect(screen.getByText(/nessuno è morto questa notte/i)).toBeInTheDocument()
})

test('mostra gli annunci derivati (es. belati del pastore)', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'pastore' },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'lupo-mannaro' },
  ]
  render(<AlbaPanel giocatori={giocatori} round={1} onVaiAlVoto={() => {}} />)
  expect(screen.getByText('Si sentono dei belati.')).toBeInTheDocument()
})

test('il pulsante Vai al voto chiama onVaiAlVoto', async () => {
  const user = userEvent.setup()
  const onVaiAlVoto = vi.fn()
  render(<AlbaPanel giocatori={[]} round={1} onVaiAlVoto={onVaiAlVoto} />)
  await user.click(screen.getByRole('button', { name: 'Vai al voto' }))
  expect(onVaiAlVoto).toHaveBeenCalled()
})
