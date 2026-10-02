import { render, screen, within } from '@testing-library/react'
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

test('Cartomante: la carta di un bersaglio ignoto si cambia e si deseleziona (torna a ruolo ignoto) senza residui', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Nora', ruoloSlug: 'cartomante', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [], storiaRuoli: [] },
  ]
  const aggiornaGiocatore = (id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  }
  const el = () => (
    <AzioneRivelaRuolo
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      round={2}
      ruoloSlugAttore="cartomante"
      etichettaAttore="Cartomante"
      bersaglio="vivo"
      ruoliSelezionati={['cartomante', 'villico', 'lupo-mannaro']}
      quantita={{ cartomante: 1, villico: 1, 'lupo-mannaro': 1 }}
    />
  )
  const { rerender } = render(el())
  const clic = async (nome) => {
    await user.click(screen.getByRole('button', { name: nome }))
    rerender(el())
  }

  await clic('Marco')
  await clic('Villico')
  expect(giocatori[1]).toMatchObject({ ruoloSlug: 'villico', storiaRuoli: ['villico'] })
  // la carta scelta resta in lista (quantità esaurita) e premuta
  expect(screen.getByRole('button', { name: 'Villico' })).toHaveAttribute('aria-pressed', 'true')

  await clic('Lupo Mannaro')
  expect(giocatori[1]).toMatchObject({ ruoloSlug: 'lupo-mannaro', storiaRuoli: ['lupo-mannaro'] })
  expect(giocatori[0].ultimaIndagine.ruoloRivelato).toBe('lupo-mannaro')
  expect(giocatori[0].usiNotte).toEqual(['cartomante-indagine'])

  await clic('Lupo Mannaro')
  expect(giocatori[1].ruoloSlug).toBeUndefined()
  expect(giocatori[1].storiaRuoli).toEqual([])
  expect(giocatori[0].ultimaIndagine).toBeNull()
  expect(giocatori[0].usiNotte).toEqual([])
})

test('Cartomante: una Guardia con la Mannara nel mazzo chiede quale carta è e memorizza il ruolo reale scambiando con la traditrice scelta dall\'app', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Nora', ruoloSlug: 'cartomante', vivo: true, condizioni: [], usiNotte: [], storiaRuoli: ['cartomante'] },
    { id: '2', nome: 'Gaia', ruoloSlug: 'guardia', vivo: true, condizioni: [], storiaRuoli: ['guardia'] },
    { id: '3', nome: 'Gino', ruoloSlug: 'guardia-mannara', vivo: true, condizioni: [], storiaRuoli: ['guardia-mannara'] },
  ]
  const aggiornaGiocatore = (id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  }
  const el = () => (
    <AzioneRivelaRuolo
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      round={1}
      ruoloSlugAttore="cartomante"
      etichettaAttore="Cartomante"
      bersaglio="vivo"
      ruoliSelezionati={['cartomante', 'guardia', 'guardia-mannara']}
      quantita={{ guardia: 2, 'guardia-mannara': 1 }}
    />
  )
  const { rerender } = render(el())
  await user.click(screen.getByRole('button', { name: 'Gaia' }))
  rerender(el())
  // la carta ha ancora un'incertezza: si chiede quale delle due è
  await user.click(within(screen.getByRole('group', { name: 'Che ruolo era' })).getByRole('button', { name: 'Guardia Mannara' }))
  rerender(el())
  const ruolo = (id) => giocatori.find((g) => g.id === id).ruoloSlug
  expect(ruolo('2')).toBe('guardia-mannara')
  expect(ruolo('3')).toBe('guardia')
  expect(giocatori.find((g) => g.id === '2').guardiaDistinta).toBe(true)
  expect(giocatori.find((g) => g.id === '1').ultimaIndagine.ruoloRivelato).toBe('guardia-mannara')

  // cambiando idea (è una Guardia buona) torna tutto com'era
  await user.click(within(screen.getByRole('group', { name: 'Che ruolo era' })).getByRole('button', { name: 'Guardia' }))
  rerender(el())
  expect(ruolo('2')).toBe('guardia')
  expect(ruolo('3')).toBe('guardia-mannara')
})
