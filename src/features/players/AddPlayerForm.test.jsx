import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPlayerForm } from './AddPlayerForm'

const roles = [
  { slug: 'villico', nome: 'Villico' },
  { slug: 'veggente', nome: 'Veggente' },
]

test('invia nome e ruolo selezionato al submit', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm roles={roles} onAdd={onAdd} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Marco')
  await user.selectOptions(screen.getByRole('combobox'), 'veggente')
  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(onAdd).toHaveBeenCalledWith('Marco', 'veggente')
})

test('non invia se il nome è vuoto', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm roles={roles} onAdd={onAdd} />)

  await user.click(screen.getByRole('button', { name: /aggiungi/i }))

  expect(onAdd).not.toHaveBeenCalled()
})
