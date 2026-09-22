import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Libretto } from './Libretto'
import { ROLES } from '../../data/roles'
import { CONDIZIONI } from '../../data/conditions'
import { SEZIONI } from '../../data/libretto'

test('mostra tutte le sezioni, tutti i ruoli e tutte le condizioni', () => {
  render(<Libretto onTornaAllaHome={() => {}} />)
  for (const sezione of SEZIONI) {
    expect(screen.getByRole('heading', { name: sezione.titolo })).toBeInTheDocument()
  }
  for (const ruolo of ROLES) {
    expect(screen.getAllByText(ruolo.nome).length).toBeGreaterThan(0)
  }
  for (const condizione of CONDIZIONI) {
    expect(screen.getAllByText(condizione.nome).length).toBeGreaterThan(0)
  }
})

test('cliccare "Home" chiama onTornaAllaHome', async () => {
  const user = userEvent.setup()
  const onTornaAllaHome = vi.fn()
  render(<Libretto onTornaAllaHome={onTornaAllaHome} />)
  await user.click(screen.getByRole('button', { name: /Home/ }))
  expect(onTornaAllaHome).toHaveBeenCalled()
})
