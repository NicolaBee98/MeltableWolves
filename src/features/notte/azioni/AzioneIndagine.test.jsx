import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneIndagine } from './AzioneIndagine'

test('indagare un bersaglio con aura malvagia registra esito malvagia', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 3 } })
})

test('indagare un bersaglio con aura benevola registra esito benevola', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'paladino', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={1} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 1 } })
})

test('un veggente accecato percepisce sempre aura benevola', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: ['accecato'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 2 } })
})

test('non permette di indagare una seconda volta nella stessa notte, evitando di sovrascrivere l\'esito', async () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [], usiNotte: ['veggente-indagine'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)

  expect(screen.getByText(/potere già utilizzato questa notte/i)).toBeInTheDocument()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})
