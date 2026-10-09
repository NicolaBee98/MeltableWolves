import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MazzoBuilder } from './MazzoBuilder'
import { useMazzo } from '../../state/useMazzo'

function setup(overrides = {}) {
  const props = {
    quantita: {},
    setQuantita: vi.fn(),
    ...overrides,
  }
  render(<MazzoBuilder {...props} />)
  return props
}

test('le chip disponibili restano bianche (senza colore di fazione); nel mazzo hanno il colore della fazione, tranne il Fantasma Onnisciente che ha quello "non distribuita"', async () => {
  const user = userEvent.setup()
  const setQuantita = vi.fn()
  setup({ setQuantita })

  expect(screen.getByRole('button', { name: 'Veggente' })).not.toHaveClass('chip--fazione-villaggio')
  expect(screen.getByRole('button', { name: 'Lupo Mannaro' })).not.toHaveClass('chip--fazione-lupi')
  expect(screen.getByRole('button', { name: 'Fantasma Onnisciente' })).not.toHaveClass('chip--non-distribuita')

  await user.click(screen.getByRole('button', { name: 'Fantasma Onnisciente' }))
  setup({ setQuantita, quantita: { 'fantasma-onnisciente': 1, veggente: 1 } })
  expect(screen.getByRole('button', { name: /fantasma onnisciente ✕/i })).toHaveClass('chip--non-distribuita')
  expect(screen.getByRole('button', { name: /veggente ✕/i })).toHaveClass('chip--fazione-villaggio')
})

test('senza ruoli selezionati il box "Nel mazzo" mostra un messaggio vuoto', () => {
  setup()
  expect(screen.getByText(/nessuna carta selezionata/i)).toBeInTheDocument()
})

test('mostra avviso "nessun lupo mannaro" quando il mazzo è vuoto', () => {
  setup()
  expect(screen.getByText('Nessun lupo mannaro nel mazzo.')).toBeInTheDocument()
})

test('cliccare una chip disponibile chiama setQuantita con 1', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup()

  await user.click(screen.getByRole('button', { name: 'Paladino' }))

  expect(setQuantita).toHaveBeenCalledWith('paladino', 1)
})

test('cliccare un ruolo lo lascia visibile ma disabilitato (in dissolvenza) per un istante, prima di sparire dai disponibili', () => {
  vi.useFakeTimers()
  try {
    setup()

    fireEvent.click(screen.getByRole('button', { name: 'Paladino' }))
    expect(screen.getByRole('button', { name: 'Paladino' })).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByRole('button', { name: 'Paladino' })).not.toBeDisabled()
  } finally {
    vi.useRealTimers()
  }
})

test('cliccare la chip di un ruolo già nel mazzo lo rimuove (torna a quantità 0)', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { paladino: 1 } })

  await user.click(screen.getByRole('button', { name: /paladino/i }))

  expect(setQuantita).toHaveBeenCalledWith('paladino', 0)
})

test('la chip "Villico" resta sempre disponibile e ogni click aggiunge un\'unità', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { villico: 2 } })

  // la chip "Villico" nei disponibili c'è ancora nonostante ce ne siano già 2 nel mazzo
  await user.click(screen.getByRole('button', { name: 'Villico' }))

  expect(setQuantita).toHaveBeenCalledWith('villico', 3)
})

test('nel mazzo ogni unità di Villico compare come chip numerata a sé, ciascuna toglie un\'unità', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { villico: 2 } })

  expect(screen.getByRole('button', { name: /villico 1/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /villico 2/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /villico 1/i }))
  expect(setQuantita).toHaveBeenCalledWith('villico', 1)
})

test('la chip "Guardie" (senza "coppia") aggiunge la coppia', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup()

  await user.click(screen.getByRole('button', { name: 'Guardie' }))
  expect(setQuantita).toHaveBeenCalledWith('guardia', 2)
})

test('nel mazzo la Guardia compare come "Guardia 1"/"Guardia 2", rimuoverne una toglie la coppia e la Guardia Mannara', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { guardia: 2, 'guardia-mannara': 1 } })

  expect(screen.getByRole('button', { name: /guardia 1/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /guardia 2/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /guardia 1/i }))

  expect(setQuantita).toHaveBeenCalledWith('guardia', 0)
  expect(setQuantita).toHaveBeenCalledWith('guardia-mannara', 0)
})

test('la Guardia Mannara è disabilitata finché non ci sono le Guardie', () => {
  setup()
  expect(screen.getByRole('button', { name: /guardia mannara/i })).toBeDisabled()
})

test('la Guardia Mannara si abilita quando le Guardie sono presenti', () => {
  setup({ quantita: { guardia: 2 } })
  expect(screen.getByRole('button', { name: /guardia mannara/i })).not.toBeDisabled()
})

test('il conteggio "Nel mazzo" somma tutte le quantità', () => {
  setup({ quantita: { villico: 2, paladino: 1 } })
  expect(screen.getByText('Nel mazzo (3)')).toBeInTheDocument()
})

test('senza il Ladro nel mazzo non mostra la nota sulle carte extra', () => {
  setup({ quantita: { villico: 2 } })
  expect(screen.queryByText(/due carte in più/i)).not.toBeInTheDocument()
})

test('con il Ladro nel mazzo mostra la nota sulle due carte extra (si scelgono la prima notte, non qui)', () => {
  setup({ quantita: { ladro: 1, villico: 2 } })
  expect(screen.getByText(/due carte in più/i)).toBeInTheDocument()
  expect(screen.getByText('Nel mazzo (3)')).toBeInTheDocument()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('con il Fantasma nel mazzo spiega perché non conta come giocatore (coerente con l\'avviso giocatori)', () => {
  setup({ quantita: { villico: 2, 'fantasma-onnisciente': 1 } })
  expect(screen.getByText(/condizione aggiuntiva/i)).toBeInTheDocument()
  // senza Ladro non cita le sue carte extra
  expect(screen.queryByText(/carte extra del Ladro/i)).not.toBeInTheDocument()
})

test('con Fantasma e Ladro nel mazzo la nota cita le carte extra del Ladro', () => {
  setup({ quantita: { villico: 2, 'fantasma-onnisciente': 1, ladro: 1 } })
  expect(screen.getByText(/due carte in più/i)).toBeInTheDocument()
})

test('con lo stato vero, ogni ruolo (Cortigiana inclusa) esce dai disponibili finita la dissolvenza', () => {
  function Mazzo() {
    const { quantita, setQuantita } = useMazzo()
    return <MazzoBuilder quantita={quantita} setQuantita={setQuantita} />
  }
  vi.useFakeTimers()
  try {
    render(<Mazzo />)
    for (const nome of ['Cortigiana', 'Paladino']) fireEvent.click(screen.getByRole('button', { name: nome }))
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.queryByRole('button', { name: 'Cortigiana' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cortigiana ✕/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Paladino' })).not.toBeInTheDocument()
  } finally {
    vi.useRealTimers()
  }
})

test('il Borgomastro non è nei ruoli aggiungibili; Lupo Mannaro e Villico spariscono dalle disponibili al massimo di copie', () => {
  setup({ quantita: { 'lupo-mannaro': 5, villico: 11 } })
  expect(screen.queryByRole('button', { name: 'Borgomastro' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Lupo Mannaro' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Villico' })).toBeInTheDocument()
})
