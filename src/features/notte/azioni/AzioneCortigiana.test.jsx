import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneCortigiana } from './AzioneCortigiana'

test('conferma imposta la visita notturna sulla cortigiana', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneCortigiana giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { visitaNotturna: '2' })
})

test('non permette una seconda visita nella stessa notte', () => {
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], usiNotte: ['cortigiana-visita'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneCortigiana giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/potere già utilizzato questa notte/i)).toBeInTheDocument()
})
