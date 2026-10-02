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

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { visitaNotturna: '2' })
})

test('la scelta resta modificabile: la chip già visitata resta premuta e cliccarne un\'altra sposta la visita', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Gina', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], usiNotte: ['cortigiana-visita'], visitaNotturna: '2' },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneCortigiana giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Luca' })).toHaveAttribute('aria-pressed', 'false')

  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { visitaNotturna: '3' })
})

test('cliccando di nuovo il cliente scelto la visita si annulla', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Cora', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '2', usiNotte: ['cortigiana-visita'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneCortigiana giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { visitaNotturna: null })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { usiNotte: [] })
})
