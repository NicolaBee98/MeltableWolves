import { render, screen } from '@testing-library/react'
import { LogPartita } from './LogPartita'

test('mostra un messaggio se non ci sono eventi', () => {
  render(<LogPartita eventi={[]} />)
  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})

test('mostra gli eventi raggruppati sotto il numero di notte', () => {
  render(<LogPartita eventi={[{ round: 2, messaggio: 'Anna è morto/a' }]} />)
  expect(screen.getByText('Notte 2')).toBeInTheDocument()
  expect(screen.getByText('Anna è morto/a')).toBeInTheDocument()
})

test('eventi con round diverso vanno in gruppi separati, consecutivi con lo stesso round nello stesso gruppo', () => {
  render(
    <LogPartita
      eventi={[
        { round: 1, messaggio: 'Marco è morto/a' },
        { round: 1, messaggio: 'Luca ha ottenuto la condizione "protetto"' },
        { round: 2, messaggio: 'Anna è morto/a' },
      ]}
    />,
  )
  expect(screen.getAllByText(/^Notte \d$/)).toHaveLength(2)
  expect(screen.getByText('Notte 1')).toBeInTheDocument()
  expect(screen.getByText('Notte 2')).toBeInTheDocument()
})
