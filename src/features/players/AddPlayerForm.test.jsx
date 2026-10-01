import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPlayerForm } from './AddPlayerForm'

test('digitare un nome e premere Invio chiama onAdd con il nome', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm onAdd={onAdd} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'Marco{Enter}')

  expect(onAdd).toHaveBeenCalledWith('Marco')
})

test("svuota il campo dopo l'aggiunta", async () => {
  const user = userEvent.setup()
  render(<AddPlayerForm onAdd={() => {}} />)

  const input = screen.getByPlaceholderText('Nome giocatore')
  await user.type(input, 'Marco{Enter}')

  expect(input).toHaveValue('')
})

test('non chiama onAdd se il nome è vuoto', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm onAdd={onAdd} />)

  await user.click(screen.getByRole('button', { name: 'Aggiungi' }))

  expect(onAdd).not.toHaveBeenCalled()
})

test('un nome già presente (anche con maiuscole diverse) non viene aggiunto e mostra un avviso', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddPlayerForm onAdd={onAdd} nomiEsistenti={['Marco']} />)

  await user.type(screen.getByPlaceholderText('Nome giocatore'), 'marco{Enter}')

  expect(onAdd).not.toHaveBeenCalled()
  expect(screen.getByRole('alert')).toHaveTextContent(/già un giocatore/)
})
