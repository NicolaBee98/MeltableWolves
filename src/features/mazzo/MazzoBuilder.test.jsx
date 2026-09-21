import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MazzoBuilder } from './MazzoBuilder'

function setup(overrides = {}) {
  const props = {
    quantita: {},
    setQuantita: vi.fn(),
    ...overrides,
  }
  render(<MazzoBuilder {...props} />)
  return props
}

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
