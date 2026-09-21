import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceltaGiocatore } from './SceltaGiocatore'

const candidati = [
  { id: '1', nome: 'Anna' },
  { id: '2', nome: 'Marco' },
]

test("conferma chiama onConferma con l'id selezionato tramite chip", async () => {
  const user = userEvent.setup()
  const onConferma = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={onConferma} onSalta={() => {}} etichetta="Scegli" />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onConferma).toHaveBeenCalledWith('2')
})

test('il primo candidato è selezionato di default', async () => {
  const user = userEvent.setup()
  const onConferma = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={onConferma} onSalta={() => {}} etichetta="Scegli" />)

  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onConferma).toHaveBeenCalledWith('1')
})

test('cliccare una chip la marca come selezionata e deseleziona le altre', async () => {
  const user = userEvent.setup()
  render(<SceltaGiocatore candidati={candidati} onConferma={() => {}} onSalta={() => {}} etichetta="Scegli" />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'false')
})

test('salta chiama onSalta', async () => {
  const user = userEvent.setup()
  const onSalta = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={() => {}} onSalta={onSalta} etichetta="Scegli" />)

  await user.click(screen.getByRole('button', { name: 'Salta' }))

  expect(onSalta).toHaveBeenCalled()
})

test('senza candidati mostra un messaggio con un pulsante Chiudi che chiama onSalta', async () => {
  const user = userEvent.setup()
  const onSalta = vi.fn()
  render(<SceltaGiocatore candidati={[]} onConferma={() => {}} onSalta={onSalta} etichetta="Scegli" />)

  expect(screen.getByText(/nessun bersaglio disponibile/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Chiudi' }))
  expect(onSalta).toHaveBeenCalled()
})
