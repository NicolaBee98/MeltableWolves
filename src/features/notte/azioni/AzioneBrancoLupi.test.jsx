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
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'notte', mortoNotte: 2 })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { usiNotte: ['branco-lupi-sbrana'] })
})

test('non uccide un bersaglio protetto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto'], note: '' }]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})

test('non permette una seconda vittima nella stessa notte', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: ['branco-lupi-sbrana'] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={() => {}} ruoli={['lupo-mannaro']} />)

  expect(screen.getByText(/il branco ha già sbranato/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
})
