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

test('Cartomante: indagando un bersaglio senza ruolo ancora noto, chiede quale ruolo mostra la carta e lo assegna', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Nora', ruoloSlug: 'cartomante', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [], storiaRuoli: [] },
  ]
  render(
    <AzioneRivelaRuolo
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      round={2}
      ruoloSlugAttore="cartomante"
      etichettaAttore="Cartomante"
      bersaglio="vivo"
      ruoliSelezionati={['cartomante', 'villico']}
      quantita={{ cartomante: 1, villico: 5 }}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(screen.getByText(/ancora sconosciuta/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Villico' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { ruoloSlug: 'villico', storiaRuoli: ['villico'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ultimaIndagine: { targetId: '2', ruoloRivelato: 'villico', notte: 2 },
  })
})

test('Cartomante: scelto un bersaglio ignoto, "Annulla" torna alla scelta del bersaglio senza toccare i giocatori', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Nora', ruoloSlug: 'cartomante', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [], storiaRuoli: [] },
  ]
  render(
    <AzioneRivelaRuolo
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      round={2}
      ruoloSlugAttore="cartomante"
      etichettaAttore="Cartomante"
      bersaglio="vivo"
      ruoliSelezionati={['cartomante', 'villico']}
      quantita={{ cartomante: 1, villico: 5 }}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(screen.getByText(/ancora sconosciuta/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /annulla/i }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test('Cartomante: la carta di un bersaglio ignoto non può mai essere Fantasma Onnisciente, Suocera, Borgomastro, o un ruolo con un evento tutto suo (Alchimista/Boia/Scemo del Villaggio/Innocente) — non sono mai carte in mano dall\'inizio', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Nora', ruoloSlug: 'cartomante', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [], storiaRuoli: [] },
  ]
  render(
    <AzioneRivelaRuolo
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      round={2}
      ruoloSlugAttore="cartomante"
      etichettaAttore="Cartomante"
      bersaglio="vivo"
      ruoliSelezionati={[
        'cartomante',
        'villico',
        'fantasma-onnisciente',
        'suocera',
        'borgomastro',
        'alchimista',
        'boia',
        'scemo-del-villaggio',
        'innocente',
      ]}
      quantita={{
        cartomante: 1,
        villico: 5,
        'fantasma-onnisciente': 1,
        suocera: 1,
        borgomastro: 1,
        alchimista: 1,
        boia: 1,
        'scemo-del-villaggio': 1,
        innocente: 1,
      }}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(screen.queryByRole('button', { name: 'Fantasma Onnisciente' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Suocera' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Borgomastro' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Alchimista' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Boia' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Scemo del Villaggio' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Innocente' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Villico' })).toBeInTheDocument()
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
