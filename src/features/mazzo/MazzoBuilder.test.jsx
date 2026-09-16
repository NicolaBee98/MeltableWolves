import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MazzoBuilder } from './MazzoBuilder'

function setup(overrides = {}) {
  const props = {
    numGiocatori: 8,
    ruoliSelezionati: [],
    setNumGiocatori: vi.fn(),
    toggleRuolo: vi.fn(),
    ...overrides,
  }
  render(<MazzoBuilder {...props} />)
  return props
}

test('mostra avviso "nessun lupo mannaro" quando il mazzo è vuoto', () => {
  setup()
  expect(screen.getByText('Nessun lupo mannaro nel mazzo.')).toBeInTheDocument()
})

test('non mostra avvisi lupi quando un ruolo lupi è selezionato in numero sufficiente', () => {
  setup({ numGiocatori: 1, ruoliSelezionati: ['lupo-mannaro'] })
  expect(screen.queryByText('Nessun lupo mannaro nel mazzo.')).not.toBeInTheDocument()
})

test('click su un ruolo chiama toggleRuolo con lo slug corretto', async () => {
  const user = userEvent.setup()
  const { toggleRuolo } = setup()

  await user.click(screen.getByRole('checkbox', { name: 'Villico' }))

  expect(toggleRuolo).toHaveBeenCalledWith('villico')
})

test('cambiare il numero giocatori chiama setNumGiocatori', () => {
  const { setNumGiocatori } = setup()

  const input = screen.getByLabelText('Numero giocatori')
  fireEvent.change(input, { target: { value: '12' } })

  expect(setNumGiocatori).toHaveBeenCalledWith(12)
})
