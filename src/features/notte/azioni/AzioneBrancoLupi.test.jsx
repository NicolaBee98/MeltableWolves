import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneBrancoLupi } from './AzioneBrancoLupi'
import { usePartita } from '../../../state/usePartita'
import { RUOLI_BRANCO_LUPI } from '../../../data/nightSteps'

test('conferma uccide il bersaglio scelto e marca il branco come già usato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro']} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    vivo: false,
    causaMorte: 'notte',
    mortoNotte: 2,
    mortoDa: 'branco',
  })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { usiNotte: ['branco-lupi-sbrana'] })
})

test('non uccide un bersaglio protetto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto'], note: '' }]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})

test('non permette una seconda vittima nella stessa notte', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: ['branco-lupi-sbrana'] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={() => {}} round={1} ruoli={['lupo-mannaro']} />)

  expect(screen.getByText(/il branco ha già sbranato/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
})

test('la Cortigiana non compare tra i bersagli proposti; il Nano sì (come il Criceto Malvagio, immune ma selezionabile)', () => {
  const giocatori = [
    { id: '1', nome: 'Cora', ruoloSlug: 'cortigiana', vivo: true, condizioni: [] },
    { id: '2', nome: 'Nino', ruoloSlug: 'nano', vivo: true, condizioni: [] },
    { id: '4', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={() => {}} round={1} ruoli={['lupo-mannaro']} />)

  expect(screen.queryByRole('button', { name: 'Cora' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Nino' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})

test('il Criceto Malvagio compare tra i bersagli proposti (il branco lo nota e ci prova), ma sceglierlo non uccide nessuno', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Cric', ruoloSlug: 'criceto-malvagio', vivo: true, condizioni: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={1} ruoli={['lupo-mannaro']} />)

  await user.click(screen.getByRole('button', { name: 'Cric' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('1', expect.objectContaining({ vivo: false }))
  // il potere del branco risulta comunque usato per la notte: "nessuno muore"
  // è un esito valido, non un bersaglio rifiutato
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { usiNotte: ['branco-lupi-sbrana'] })
})

test('il branco stordito dall\'Ubriaco non può cacciare quella notte', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [], brancoStorditoFinoA: 3 },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={() => {}} round={3} ruoli={['lupo-mannaro']} />)

  expect(screen.getByText(/ancora stordito/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
})

test('Berserker sbranato con due lupi alla stessa distanza: il narratore sceglie quale muore', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Bruno', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
    { id: '3', nome: 'Ezio', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro']} />)

  await user.click(screen.getByRole('button', { name: 'Bruno' }))
  expect(aggiornaGiocatore).not.toHaveBeenCalled()
  expect(screen.getByText(/due lupi alla stessa distanza/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ezio' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', expect.objectContaining({ vivo: false }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', expect.objectContaining({ vivo: false }))
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('1', expect.objectContaining({ vivo: false }))
})

test('con il Progenitore vivo e il potere non ancora usato: le chip restano tutte visibili, il pulsante del Progenitore compare sotto una volta scelto un bersaglio', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro-progenitore', vivo: true, condizioni: [], usiNotte: [], poteriUsati: [] },
  ]
  const { rerender } = render(
    <AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro-progenitore']} />,
  )

  // prima di scegliere un bersaglio, niente pulsante del Progenitore
  expect(screen.queryByRole('button', { name: /progenitore/i })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro-progenitore']} />)

  // il click sbrana normalmente: le chip restano, Anna resta visibile e marcata
  expect(giocatori.find((g) => g.id === '1').vivo).toBe(false)
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')

  const trasforma = screen.getByRole('button', { name: 'Il Progenitore trasforma Anna in Lupo Mannaro' })
  await user.click(trasforma)
  rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro-progenitore']} />)

  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('lupo-mannaro')
  expect(giocatori.find((g) => g.id === '1').vivo).toBe(true)
  expect(giocatori.find((g) => g.id === '2').poteriUsati).toEqual(['progenitore-trasforma'])
  // la chip di Anna cambia stile (chip--trasformato), il pulsante diventa "Sbrana normalmente"
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveClass('chip--trasformato')
  expect(screen.getByRole('button', { name: 'Sbrana normalmente' })).toBeInTheDocument()
})

test('scegliere un bersaglio diverso mentre la trasformazione è attiva annulla la trasformazione (torna Lupo Mannaro) e sbrana normalmente il nuovo', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Carlo', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro-progenitore', vivo: true, condizioni: [], usiNotte: [], poteriUsati: [] },
  ]
  const { rerender } = render(
    <AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro-progenitore']} />,
  )
  const rrender = () =>
    rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro-progenitore']} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rrender()
  await user.click(screen.getByRole('button', { name: /progenitore trasforma anna/i }))
  rrender()
  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('lupo-mannaro')

  await user.click(screen.getByRole('button', { name: 'Carlo' }))
  rrender()

  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('villico')
  expect(giocatori.find((g) => g.id === '2').vivo).toBe(false)
  expect(screen.getByRole('button', { name: 'Il Progenitore trasforma Carlo in Lupo Mannaro' })).toBeInTheDocument()
})

test('la schermata di parità del Berserker ha un\'uscita: "Annulla" torna alla scelta del bersaglio', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Bruno', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
    { id: '3', nome: 'Ezio', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro']} />)

  await user.click(screen.getByRole('button', { name: 'Bruno' }))
  await user.click(screen.getByRole('button', { name: /annulla/i }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Bruno' })).toBeInTheDocument()
})

test('col Progenitore, cliccare di nuovo "Sbrana normalmente" torna a sbranare come al solito', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro-progenitore', vivo: true, condizioni: [], usiNotte: [], poteriUsati: [] },
  ]
  const { rerender } = render(
    <AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro-progenitore']} />,
  )
  const rrender = () =>
    rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro-progenitore']} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rrender()
  await user.click(screen.getByRole('button', { name: /progenitore trasforma anna/i }))
  rrender()
  await user.click(screen.getByRole('button', { name: 'Sbrana normalmente' }))
  rrender()

  expect(giocatori.find((g) => g.id === '1').vivo).toBe(false)
  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('villico')
})

test('il Progenitore non ripropone la trasformazione se ha già usato il potere: niente pulsante, si sbrana normalmente', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    {
      id: '2',
      nome: 'Dario',
      ruoloSlug: 'lupo-mannaro-progenitore',
      vivo: true,
      condizioni: [],
      usiNotte: [],
      poteriUsati: ['progenitore-trasforma'],
    },
  ]
  render(
    <AzioneBrancoLupi
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      round={2}
      ruoli={['lupo-mannaro-progenitore']}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', expect.objectContaining({ vivo: false }))
  expect(screen.queryByRole('button', { name: /progenitore/i })).not.toBeInTheDocument()
})

test('senza vendetta, il colpo del branco resta modificabile finché non si preme Avanti: cambiare bersaglio resuscita il precedente e sbrana il nuovo', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Carlo', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  const { rerender } = render(
    <AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />)

  expect(giocatori.find((g) => g.id === '1').vivo).toBe(false)
  // niente messaggio bloccante: il branco può ancora cambiare idea
  expect(screen.queryByText(/il branco ha già sbranato/i)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Carlo' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Carlo' }))
  rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />)

  expect(giocatori.find((g) => g.id === '1').vivo).toBe(true)
  expect(giocatori.find((g) => g.id === '1').causaMorte).toBeUndefined()
  expect(giocatori.find((g) => g.id === '2').vivo).toBe(false)
  // un solo colpo effettivo: usiNotte non raddoppia per la sostituzione
  expect(giocatori.find((g) => g.id === '3').usiNotte).toEqual(['branco-lupi-sbrana'])
})

test('con la vendetta del Cucciolo attiva il branco può sbranare due vittime nella stessa notte', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Carlo', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [], vendettaCucciolo: true },
  ]
  const { rerender } = render(
    <AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />)

  // dopo la prima vittima il branco può ancora scegliere (vendetta: 2 vittime)
  expect(screen.getByRole('button', { name: 'Carlo' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Carlo' }))
  rerender(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} ruoli={['lupo-mannaro']} />)

  expect(screen.getByText(/il branco ha già sbranato/i)).toBeInTheDocument()
  expect(giocatori.find((g) => g.id === '1').vivo).toBe(false)
  expect(giocatori.find((g) => g.id === '2').vivo).toBe(false)
  expect(giocatori.find((g) => g.id === '3').vendettaCucciolo).toBe(false)
})

test('feedback quando il morso non ha effetto: protetto, Criceto Malvagio e Nano', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto'] },
    { id: '2', nome: 'Cri', ruoloSlug: 'criceto-malvagio', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '4', nome: 'Nino', ruoloSlug: 'nano', vivo: true, condizioni: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} ruoli={['lupo-mannaro']} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  expect(screen.getByText(/il morso non ha effetto su anna: è protetto/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Cri' }))
  expect(screen.getByText(/il morso non ha effetto su cri: il criceto malvagio/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Nino' }))
  expect(screen.getByText(/il morso non ha effetto su nino: il nano non può essere sbranato/i)).toBeInTheDocument()
})

test('cambiare bersaglio annulla la morte con annullaMorte (catena inclusa), non con un semplice vivo:true', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const annullaMorte = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(
    <AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} annullaMorte={annullaMorte} round={2} ruoli={['lupo-mannaro']} />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(annullaMorte).toHaveBeenCalledWith('1')
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('1', expect.objectContaining({ vivo: true }))
})

test('vendetta del Cucciolo: indicatore delle due vittime, la seconda non annulla la prima, messaggio finale al plurale', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [], vendettaCucciolo: true },
  ]
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const annullaMorte = vi.fn()
  const props = () => ({ giocatori, aggiornaGiocatore, annullaMorte, round: 2, ruoli: ['lupo-mannaro'] })
  const { rerender } = render(<AzioneBrancoLupi {...props()} />)

  expect(screen.getByText(/vendetta del cucciolo.*vittima 1 di 2/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rerender(<AzioneBrancoLupi {...props()} />)
  expect(screen.getByText(/vittima 2 di 2/i)).toBeInTheDocument()
  // la prima vittima (definitiva) resta evidenziata mentre si sceglie la seconda
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'false')

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  rerender(<AzioneBrancoLupi {...props()} />)

  expect(annullaMorte).not.toHaveBeenCalled()
  expect(screen.getByText(/ha già sbranato le sue vittime/i)).toBeInTheDocument()
})

test('cliccare di nuovo la chip premuta deseleziona il colpo: nessuna vittima e nessun uso residuo', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const annullaMorte = vi.fn((id) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, vivo: true } : g))
  })
  const props = () => ({ giocatori, aggiornaGiocatore, annullaMorte, round: 2, ruoli: ['lupo-mannaro'] })
  const { rerender } = render(<AzioneBrancoLupi {...props()} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rerender(<AzioneBrancoLupi {...props()} />)
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rerender(<AzioneBrancoLupi {...props()} />)

  expect(annullaMorte).toHaveBeenCalledWith('1')
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'false')
  expect(giocatori.find((g) => g.id === '3').usiNotte).toEqual([])
})

// il mock emula la catena: la morte del Cucciolo accende la vendetta sui lupi
function montaVendetta(vendettaIniziale) {
  let giocatori = [
    { id: 'C', nome: 'Cuc', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', nome: 'Carlo', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [], vendettaCucciolo: vendettaIniziale },
  ]
  const aggiornaGiocatore = (id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
    if (id === 'C' && patch.vivo === false) {
      giocatori = giocatori.map((g) => (g.id === '3' ? { ...g, vendettaCucciolo: true } : g))
    }
  }
  const annullaMorte = (id) => {
    giocatori = giocatori.map((g) =>
      g.id === id ? { ...g, vivo: true } : g.id === '3' ? { ...g, vendettaCucciolo: vendettaIniziale } : g,
    )
  }
  const props = () => ({ giocatori, aggiornaGiocatore, annullaMorte, round: 2, ruoli: ['lupo-mannaro'] })
  return { props, get: (id) => giocatori.find((g) => g.id === id) }
}

test('vendetta scattata dal primo morso (Cucciolo): deselezionare la seconda vittima la disfà e riattiva la vendetta', async () => {
  const user = userEvent.setup()
  const m = montaVendetta(false)
  const { rerender } = render(<AzioneBrancoLupi {...m.props()} />)
  const clic = async (nome) => {
    await user.click(screen.getByRole('button', { name: nome }))
    rerender(<AzioneBrancoLupi {...m.props()} />)
  }

  await clic('Cuc')
  await clic('Carlo')
  expect(screen.getByText(/ha già sbranato le sue vittime/i)).toBeInTheDocument()
  expect(m.get('3').vendettaCucciolo).toBe(false)

  await clic('Carlo')
  expect(m.get('2').vivo).toBe(true)
  expect(m.get('3')).toMatchObject({ vendettaCucciolo: true, usiNotte: ['branco-lupi-sbrana'] })
  expect(screen.getByRole('button', { name: 'Cuc' })).toHaveAttribute('aria-pressed', 'true')
})

test('vendetta scattata dal primo morso: deselezionare il Cucciolo spegne la vendetta e porta via anche la seconda vittima', async () => {
  const user = userEvent.setup()
  const m = montaVendetta(false)
  const { rerender } = render(<AzioneBrancoLupi {...m.props()} />)
  const clic = async (nome) => {
    await user.click(screen.getByRole('button', { name: nome }))
    rerender(<AzioneBrancoLupi {...m.props()} />)
  }

  await clic('Cuc')
  await clic('Carlo')
  await clic('Cuc')

  expect(m.get('C').vivo).toBe(true)
  expect(m.get('2').vivo).toBe(true)
  expect(m.get('3')).toMatchObject({ vendettaCucciolo: false, usiNotte: [] })
  expect(screen.queryByText(/vendetta del cucciolo/i)).not.toBeInTheDocument()
})

test('vendetta già attiva: ogni vittima si può cambiare, la prima senza toccare la seconda', async () => {
  const user = userEvent.setup()
  const m = montaVendetta(true)
  const { rerender } = render(<AzioneBrancoLupi {...m.props()} />)
  const clic = async (nome) => {
    await user.click(screen.getByRole('button', { name: nome }))
    rerender(<AzioneBrancoLupi {...m.props()} />)
  }

  await clic('Cuc')
  await clic('Carlo')
  await clic('Cuc')

  expect(m.get('C').vivo).toBe(true)
  expect(m.get('2').vivo).toBe(false)
  expect(screen.getByRole('button', { name: 'Carlo' })).toHaveAttribute('aria-pressed', 'true')
  expect(m.get('3').usiNotte).toEqual(['branco-lupi-sbrana'])
})

// con lo stato reale (usePartita): la vendetta e la morte del Cucciolo si disfano davvero
test('seleziona Cucciolo, deseleziona, sbrana un altro: una sola vittima e nessuna vendetta', async () => {
  const user = userEvent.setup()
  const iniziali = [
    { id: 'C', nome: 'Cuc', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [], poteriUsati: [], usiNotte: [], storiaRuoli: [] },
    { id: '2', nome: 'Carlo', ruoloSlug: 'villico', vivo: true, condizioni: [], poteriUsati: [], usiNotte: [], storiaRuoli: [] },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], poteriUsati: [], usiNotte: [], storiaRuoli: [] },
    { id: '4', nome: 'Elia', ruoloSlug: 'villico', vivo: true, condizioni: [], poteriUsati: [], usiNotte: [], storiaRuoli: [] },
  ]
  let stato
  function Prova() {
    stato = usePartita()
    return <AzioneBrancoLupi {...props(stato)} />
  }
  const props = (s) => ({
    giocatori: s.giocatori,
    aggiornaGiocatore: s.aggiornaGiocatore,
    annullaMorte: s.annullaMorte,
    round: 2,
    ruoli: RUOLI_BRANCO_LUPI,
  })
  localStorage.setItem('meltable-wolves-partita', JSON.stringify(iniziali))
  // StrictMode come in main.jsx: gli updater di setState girano due volte
  render(
    <StrictMode>
      <Prova />
    </StrictMode>,
  )

  await user.click(screen.getByRole('button', { name: 'Cuc' }))
  await user.click(screen.getByRole('button', { name: 'Cuc' }))
  expect(stato.giocatori.every((g) => g.vivo)).toBe(true)
  expect(stato.giocatori.some((g) => g.vendettaCucciolo)).toBe(false)
  expect(screen.queryByText(/vendetta del cucciolo/i)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Carlo' }))
  await user.click(screen.getByRole('button', { name: 'Elia' }))
  expect(stato.giocatori.filter((g) => !g.vivo).map((g) => g.id)).toEqual(['4'])
  localStorage.clear()
})
