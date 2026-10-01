import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneInquisitore } from './AzioneInquisitore'

test('interrogare un lupo registra esito positivo, il potere resta disponibile in futuro', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'inquisitore', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneInquisitore giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 2 },
  })
})

test("interrogare inutilmente un'aura benevola marca il potere come perso per sempre", async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'inquisitore', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneInquisitore giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 2 },
    poteriUsati: ['inquisitore-potere-perso'],
  })
})

test('con il potere già perso non propone più nessuna indagine', () => {
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'inquisitore', vivo: true, condizioni: [], poteriUsati: ['inquisitore-potere-perso'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneInquisitore giocatori={giocatori} aggiornaGiocatore={() => {}} round={3} />)

  expect(screen.getByText(/perso il proprio potere/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Marco' })).not.toBeInTheDocument()
})

test("mostra il pulsante Salta: interrogare è un'opzione, non un obbligo", () => {
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'inquisitore', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneInquisitore giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)

  expect(screen.getByRole('button', { name: 'Salta' })).toBeInTheDocument()
})

test('l\'esito malvagio si risponde "sì" (aura malvagia), non "è un lupo": vale anche per Eremita e Chupacabra', () => {
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'inquisitore', vivo: true, condizioni: [], poteriUsati: [], ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 2 } },
    { id: '2', nome: 'Chiara', ruoloSlug: 'chupacabra', vivo: true, condizioni: [] },
  ]
  render(<AzioneInquisitore giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)

  expect(screen.getByText(/rispondi all'inquisitore: sì \(aura malvagia\)/i)).toBeInTheDocument()
  expect(screen.queryByText(/è un lupo/i)).not.toBeInTheDocument()
})
