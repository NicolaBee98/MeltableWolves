import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MazzoBuilder } from './MazzoBuilder'

function setup(overrides = {}) {
  const props = {
    numGiocatori: 8,
    quantita: {},
    setNumGiocatori: vi.fn(),
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

test('un ruolo con quantità nel mazzo compare nel box "Nel mazzo" con uno stepper +/-', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { villico: 3 } })

  const riga = screen.getByText('Villico').closest('div')
  await user.click(within(riga).getByText('+'))
  expect(setQuantita).toHaveBeenCalledWith('villico', 4)

  await user.click(within(riga).getByText('-'))
  expect(setQuantita).toHaveBeenCalledWith('villico', 2)
})

test('un ruolo a quantità libera non ancora nel mazzo compare come chip da aggiungere, non come stepper', () => {
  setup({ quantita: { villico: 0 } })
  expect(screen.getByRole('button', { name: 'Villico' })).toBeInTheDocument()
  expect(screen.queryByText('+')).not.toBeInTheDocument()
})

test('cliccare la chip di un ruolo già nel mazzo lo rimuove (torna a quantità 0)', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { paladino: 1 } })

  await user.click(screen.getByRole('button', { name: /paladino/i }))

  expect(setQuantita).toHaveBeenCalledWith('paladino', 0)
})

test('la Guardia si aggiunge in coppia con una chip', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup()

  await user.click(screen.getByRole('button', { name: /guardia \(coppia\)/i }))
  expect(setQuantita).toHaveBeenCalledWith('guardia', 2)
})

test('rimuovere la coppia di Guardie azzera anche la Guardia Mannara', async () => {
  const user = userEvent.setup()
  const { setQuantita } = setup({ quantita: { guardia: 2, 'guardia-mannara': 1 } })

  await user.click(screen.getByRole('button', { name: /guardia \(coppia\)/i }))

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

test('cambiare il numero giocatori chiama setNumGiocatori', () => {
  const { setNumGiocatori } = setup()
  const input = screen.getByLabelText('Numero giocatori')
  fireEvent.change(input, { target: { value: '12' } })
  expect(setNumGiocatori).toHaveBeenCalledWith(12)
})
