import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MazzoGalleria } from './MazzoGalleria'
import { ROLES } from '../../data/roles'

test('mostra una carta per ogni ruolo, raggruppate per fazione', () => {
  render(<MazzoGalleria onTornaAllaHome={() => {}} />)
  for (const ruolo of ROLES) {
    expect(screen.getByRole('img', { name: ruolo.nome })).toBeInTheDocument()
  }
})

test('cliccare "Home" chiama onTornaAllaHome', async () => {
  const user = userEvent.setup()
  const onTornaAllaHome = vi.fn()
  render(<MazzoGalleria onTornaAllaHome={onTornaAllaHome} />)
  await user.click(screen.getByRole('button', { name: /Home/ }))
  expect(onTornaAllaHome).toHaveBeenCalled()
})
