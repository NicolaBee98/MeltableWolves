import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerCard } from './PlayerCard'

const giocatore = { id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [] }

test('mostra solo il nome del giocatore', () => {
  render(<PlayerCard giocatore={giocatore} onRemove={() => {}} />)
  expect(screen.getByText('Marco')).toBeInTheDocument()
})

test('click sul pulsante di rimozione chiama onRemove con l\'id del giocatore', async () => {
  const user = userEvent.setup()
  const onRemove = vi.fn()
  render(<PlayerCard giocatore={giocatore} onRemove={onRemove} />)

  await user.click(screen.getByRole('button', { name: /rimuovi marco/i }))

  expect(onRemove).toHaveBeenCalledWith('1')
})
