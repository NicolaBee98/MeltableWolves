import { StrictMode, useState } from 'react'
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

// la parità del Berserker è scritta sui giocatori: serve uno stato reale
function BrancoConStato({ iniziali, onAggiorna }) {
  const [giocatori, setGiocatori] = useState(iniziali)
  return (
    <AzioneBrancoLupi
      giocatori={giocatori}
      aggiornaGiocatore={(id, patch) => {
        onAggiorna?.(id, patch)
        setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
      }}
      round={2}
      ruoli={['lupo-mannaro']}
    />
  )
}

test('Berserker sbranato con due lupi alla stessa distanza: il narratore sceglie quale muore', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Bruno', ruoloSlug: 'berserker', vivo: true, condizioni: [] },
    { id: '3', nome: 'Ezio', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<BrancoConStato iniziali={giocatori} onAggiorna={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Bruno' }))
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.objectContaining({ vivo: false }))
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
  // l'uscita non è evidenziata e un messaggio dice chi verrà trasformato
  expect(screen.getByRole('button', { name: 'Sbrana normalmente' })).not.toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Sbrana normalmente' })).not.toHaveClass('chip--trasformato')
  expect(screen.getByText(/Anna verrà trasformato in Lupo Mannaro/)).toBeInTheDocument()
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
  render(<BrancoConStato iniziali={giocatori} onAggiorna={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Bruno' }))
  await user.click(screen.getByRole('button', { name: /annulla/i }))

  expect(aggiornaGiocatore).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ vivo: false }))
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

// stato reale (usePartita) con il giro completo trasforma/sbrana
function montaConStato(iniziali, ruoli = RUOLI_BRANCO_LUPI) {
  const stato = {}
  const completi = iniziali.map((g) => ({ condizioni: [], poteriUsati: [], usiNotte: [], storiaRuoli: [], ...g }))
  function Prova() {
    stato.p = usePartita()
    return (
      <AzioneBrancoLupi
        giocatori={stato.p.giocatori}
        aggiornaGiocatore={stato.p.aggiornaGiocatore}
        annullaMorte={stato.p.annullaMorte}
        round={2}
        ruoli={ruoli}
      />
    )
  }
  localStorage.setItem('meltable-wolves-partita', JSON.stringify(completi))
  render(
    <StrictMode>
      <Prova />
    </StrictMode>,
  )
  return (id) => stato.p.giocatori.find((g) => g.id === id)
}

test('Progenitore trasforma il Berserker e poi "Sbrana normalmente": il bersaglio si valuta come Berserker (parità dei lupi), non col ruolo già trasformato', async () => {
  const user = userEvent.setup()
  const g = montaConStato([
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true },
    { id: '2', nome: 'Bruno', ruoloSlug: 'berserker', vivo: true },
    { id: '3', nome: 'Ezio', ruoloSlug: 'lupo-mannaro-progenitore', vivo: true },
  ])
  await user.click(screen.getByRole('button', { name: 'Bruno' }))
  await user.click(screen.getByRole('button', { name: 'Dario' })) // parità: muore Dario
  await user.click(screen.getByRole('button', { name: 'Il Progenitore trasforma Bruno in Lupo Mannaro' }))
  expect(g('2')).toMatchObject({ ruoloSlug: 'lupo-mannaro', vivo: true })
  expect(g('1').vivo).toBe(true)

  await user.click(screen.getByRole('button', { name: 'Sbrana normalmente' }))
  expect(screen.getByText(/due lupi alla stessa distanza/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Ezio' }))
  expect(g('2')).toMatchObject({ ruoloSlug: 'berserker', vivo: false })
  expect(g('3').vivo).toBe(false)
  expect(g('1').vivo).toBe(true)
  localStorage.clear()
})

test('con la vendetta del Cucciolo il Progenitore sceglie QUALE vittima trasformare: l\'altra resta sbranata, e si può tornare indietro', async () => {
  const user = userEvent.setup()
  const g = montaConStato([
    { id: 'C', nome: 'Cuc', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true },
    { id: '2', nome: 'Carlo', ruoloSlug: 'villico', vivo: true },
    { id: '3', nome: 'Dario', ruoloSlug: 'lupo-mannaro-progenitore', vivo: true },
    { id: '4', nome: 'Elia', ruoloSlug: 'villico', vivo: true },
  ])
  await user.click(screen.getByRole('button', { name: 'Cuc' }))
  await user.click(screen.getByRole('button', { name: 'Carlo' }))
  expect(g('C').vivo).toBe(false)
  expect(g('2').vivo).toBe(false)

  await user.click(screen.getByRole('button', { name: 'Il Progenitore trasforma Carlo in Lupo Mannaro' }))
  expect(g('2')).toMatchObject({ ruoloSlug: 'lupo-mannaro', vivo: true })
  expect(g('C').vivo).toBe(false) // l'altra vittima resta sbranata
  // finché una vittima è trasformata non si propone di trasformare anche l'altra
  expect(screen.queryByRole('button', { name: /trasforma Cuc/ })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Sbrana normalmente' }))
  expect(g('2')).toMatchObject({ ruoloSlug: 'villico', vivo: false })
  expect(g('C').vivo).toBe(false)
  localStorage.clear()
})

test('dopo un ricaricamento a metà passo i morsi si ricostruiscono dallo stato: la vittima resta visibile e si può deselezionare', async () => {
  const user = userEvent.setup()
  const ingresso = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  const giocatori = [
    { ...ingresso[0], vivo: false, causaMorte: 'notte', mortoNotte: 2, mortoDa: 'branco' },
    { ...ingresso[1], usiNotte: ['branco-lupi-sbrana'] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneBrancoLupi
      giocatori={giocatori}
      giocatoriIngresso={ingresso}
      vivoAIngresso={(g) => ingresso.find((x) => x.id === g.id).vivo}
      aggiornaGiocatore={aggiornaGiocatore}
      round={2}
      ruoli={['lupo-mannaro']}
    />,
  )
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', expect.objectContaining({ vivo: true, mortoNotte: undefined }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { usiNotte: [] })
})

test('Ubriaco sbranato: avviso subito e riga di registro (si scrive con Avanti)', async () => {
  const user = userEvent.setup()
  const impostaEventiAvanti = vi.fn()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Ugo', ruoloSlug: 'ubriaco', vivo: true, condizioni: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} impostaEventiAvanti={impostaEventiAvanti} round={2} ruoli={['lupo-mannaro']} />)
  await user.click(screen.getByRole('button', { name: 'Ugo' }))
  expect(screen.getByText(/Ugo è l'Ubriaco: il branco sarà stordito la prossima notte/)).toBeInTheDocument()
  expect(impostaEventiAvanti).toHaveBeenLastCalledWith('branco', ["L'Ubriaco Ugo è stato sbranato: il branco sarà stordito la prossima notte."])
})

describe('Mimo × Progenitore: poteri di trasformazione separati', () => {
  const RUOLI = ['lupo-mannaro-progenitore']
  const mk = (usatoProg, usatoMimo) => [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro-progenitore', vivo: true, condizioni: [], usiNotte: [], poteriUsati: usatoProg ? ['progenitore-trasforma'] : [], storiaRuoli: ['lupo-mannaro-progenitore'] },
    { id: '3', nome: 'Mia', ruoloSlug: 'lupo-mannaro-progenitore', vivo: true, condizioni: [], usiNotte: [], poteriUsati: usatoMimo ? ['progenitore-trasforma'] : [], storiaRuoli: ['mimo', 'lupo-mannaro-progenitore'], legame: { tipo: 'mimo', targetId: '2' } },
  ]

  async function trasforma(giocatoriIniziali) {
    const user = userEvent.setup()
    let giocatori = giocatoriIniziali
    const aggiornaGiocatore = vi.fn((id, patch) => {
      giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
    })
    const impostaEventiAvanti = vi.fn()
    const el = () => <AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={RUOLI} impostaEventiAvanti={impostaEventiAvanti} />
    const { rerender } = render(el())
    await user.click(screen.getByRole('button', { name: 'Anna' }))
    rerender(el())
    await user.click(screen.getByRole('button', { name: /progenitore trasforma anna/i }))
    rerender(el())
    return { giocatori, impostaEventiAvanti }
  }

  test('se il Progenitore ha già usato il suo potere, trasforma il Mimo (e viceversa); l\'uso si segna solo su chi trasforma', async () => {
    const { giocatori } = await trasforma(mk(true, false))
    expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('lupo-mannaro')
    expect(giocatori.find((g) => g.id === '3').poteriUsati).toEqual(['progenitore-trasforma'])
    expect(giocatori.find((g) => g.id === '2').poteriUsati).toEqual(['progenitore-trasforma'])
  })

  test('se il Mimo ha già usato il suo potere, il Progenitore vero può ancora trasformare', async () => {
    const { giocatori } = await trasforma(mk(false, true))
    expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('lupo-mannaro')
    expect(giocatori.find((g) => g.id === '2').poteriUsati).toEqual(['progenitore-trasforma'])
  })

  test('entrambi liberi: trasforma il Progenitore vero, il Mimo conserva il suo; la trasformazione lascia una voce nel registro', async () => {
    const { giocatori, impostaEventiAvanti } = await trasforma(mk(false, false))
    expect(giocatori.find((g) => g.id === '2').poteriUsati).toEqual(['progenitore-trasforma'])
    expect(giocatori.find((g) => g.id === '3').poteriUsati).toEqual([])
    expect(impostaEventiAvanti).toHaveBeenLastCalledWith('branco', ['Il Progenitore Dario trasforma Anna in Lupo Mannaro.'])
  })

  test('nessun pulsante se entrambi hanno già trasformato', () => {
    render(<AzioneBrancoLupi giocatori={mk(true, true)} aggiornaGiocatore={() => {}} round={2} ruoli={RUOLI} />)
    expect(screen.queryByRole('button', { name: /progenitore trasforma/i })).not.toBeInTheDocument()
  })
})

test('il Progenitore non può trasformare un lupo (né se stesso): nessun pulsante e il potere resta intatto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Luca', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro-progenitore', vivo: true, condizioni: [], usiNotte: [], poteriUsati: [] },
  ]
  render(<AzioneBrancoLupi giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} ruoli={['lupo-mannaro', 'lupo-mannaro-progenitore']} />)

  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(screen.queryByRole('button', { name: /progenitore trasforma/i })).not.toBeInTheDocument()
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', { poteriUsati: ['progenitore-trasforma'] })
})
