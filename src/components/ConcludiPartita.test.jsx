import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConcludiPartita } from './ConcludiPartita'

test('la conferma distingue "Sì, concludi" (pericolosa) da "Annulla" (neutro) e non conclude senza conferma', async () => {
  const user = userEvent.setup()
  const onConcludi = vi.fn()
  render(<ConcludiPartita onConcludi={onConcludi} />)
  await user.click(screen.getByRole('button', { name: 'Concludi partita' }))
  expect(screen.getByRole('button', { name: 'Sì, concludi' })).toHaveClass('concludi-partita__conferma-cta')
  expect(screen.getByRole('button', { name: 'Annulla' })).toHaveClass('concludi-partita__annulla')
  await user.click(screen.getByRole('button', { name: 'Annulla' }))
  expect(onConcludi).not.toHaveBeenCalled()
})
