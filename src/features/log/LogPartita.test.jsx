import { render, screen } from '@testing-library/react'
import { LogPartita } from './LogPartita'

test('mostra un messaggio se non ci sono eventi', () => {
  render(<LogPartita eventi={[]} />)
  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})

test('mostra gli eventi con il numero di notte', () => {
  render(<LogPartita eventi={[{ round: 2, messaggio: 'Anna è morto/a' }]} />)
  expect(screen.getByText('Notte 2: Anna è morto/a')).toBeInTheDocument()
})
