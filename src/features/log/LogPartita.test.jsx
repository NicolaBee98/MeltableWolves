import { render, screen } from '@testing-library/react'
import { LogPartita } from './LogPartita'

test('mostra un messaggio se non ci sono eventi', () => {
  render(<LogPartita eventi={[]} />)
  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})

test('mostra gli eventi raggruppati sotto il numero di giorno', () => {
  render(<LogPartita eventi={[{ round: 2, fase: 'notte', messaggio: 'Anna è morto/a' }]} />)
  expect(screen.getByText('Giorno 2')).toBeInTheDocument()
  expect(screen.getByText('Anna è morto/a')).toBeInTheDocument()
})

test('eventi con round diverso vanno in gruppi separati, consecutivi con lo stesso round nello stesso gruppo', () => {
  render(
    <LogPartita
      eventi={[
        { round: 1, fase: 'notte', messaggio: 'Marco è morto/a' },
        { round: 1, fase: 'notte', messaggio: 'Luca ha ottenuto la condizione "protetto"' },
        { round: 2, fase: 'notte', messaggio: 'Anna è morto/a' },
      ]}
    />,
  )
  expect(screen.getAllByText(/^Giorno \d$/)).toHaveLength(2)
  expect(screen.getByText('Giorno 1')).toBeInTheDocument()
  expect(screen.getByText('Giorno 2')).toBeInTheDocument()
})

test('mostra l\'icona corrispondente alla fase di ogni evento (notte/alba/giorno/rogo)', () => {
  render(
    <LogPartita
      eventi={[
        { round: 1, fase: 'notte', messaggio: 'Marco è morto/a di notte' },
        { round: 1, fase: 'alba', messaggio: 'Il villaggio si sveglia' },
        { round: 1, fase: 'rogo', messaggio: 'Anna è morto/a al rogo' },
        { round: 1, fase: 'giorno', messaggio: 'Elena eletta Borgomastro' },
      ]}
    />,
  )
  const icone = document.querySelectorAll('.log-partita__icona-fase')
  expect(icone).toHaveLength(4)
  expect(icone[0].src).toContain('icona_notte')
  expect(icone[1].src).toContain('icona_alba')
  expect(icone[2].src).toContain('icona_rogo')
  expect(icone[3].src).toContain('icona_giorno')
})

test('ogni voce indica la sotto-fase (Notte/Alba/Giorno/Rogo) oltre al titolo del giorno', () => {
  render(
    <LogPartita
      eventi={[
        { round: 1, fase: 'notte', messaggio: 'A' },
        { round: 1, fase: 'alba', messaggio: 'B' },
        { round: 1, fase: 'rogo', messaggio: 'C' },
      ]}
    />,
  )
  expect(screen.getByText('Notte:')).toBeInTheDocument()
  expect(screen.getByText('Alba:')).toBeInTheDocument()
  expect(screen.getByText('Rogo:')).toBeInTheDocument()
})
