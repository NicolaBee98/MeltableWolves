import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneRivelaRuolo } from './AzioneRivelaRuolo'

test('Cartomante: indagare un vivo registra il suo ruolo e propone solo vivi (esclusa se stessa)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Nora', ruoloSlug: 'cartomante', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  render(
    <AzioneRivelaRuolo
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      round={2}
      ruoloSlugAttore="cartomante"
      etichettaAttore="Cartomante"
      bersaglio="vivo"
    />,
  )

  expect(screen.queryByRole('button', { name: 'Nora' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Luca' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ultimaIndagine: { targetId: '2', ruoloRivelato: 'lupo-mannaro', notte: 2 },
  })
})

test('dopo la conferma la Cartomante mostra subito il ruolo da rivelare', () => {
  const giocatori = [
    {
      id: '1',
      nome: 'Nora',
      ruoloSlug: 'cartomante',
      vivo: true,
      condizioni: [],
      usiNotte: ['cartomante-indagine'],
      ultimaIndagine: { targetId: '2', ruoloRivelato: 'lupo-mannaro', notte: 3 },
    },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneRivelaRuolo
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      round={3}
      ruoloSlugAttore="cartomante"
      etichettaAttore="Cartomante"
      bersaglio="vivo"
    />,
  )
  expect(screen.getByText(/lupo mannaro/i)).toBeInTheDocument()
})

test('Medium: propone solo i giocatori morti come bersaglio', () => {
  const giocatori = [
    { id: '1', nome: 'Sonia', ruoloSlug: 'medium', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  render(
    <AzioneRivelaRuolo
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      round={2}
      ruoloSlugAttore="medium"
      etichettaAttore="Medium"
      bersaglio="morto"
    />,
  )
  expect(screen.queryByRole('button', { name: 'Marco' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Luca' })).toBeInTheDocument()
})
