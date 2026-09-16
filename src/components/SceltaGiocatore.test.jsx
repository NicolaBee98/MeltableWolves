import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceltaGiocatore } from './SceltaGiocatore'

const candidati = [
  { id: '1', nome: 'Anna' },
  { id: '2', nome: 'Marco' },
]

test("conferma chiama onConferma con l'id selezionato", async () => {
  const user = userEvent.setup()
  const onConferma = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={onConferma} onSalta={() => {}} etichetta="Scegli" />)

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onConferma).toHaveBeenCalledWith('2')
})

test('salta chiama onSalta', async () => {
  const user = userEvent.setup()
  const onSalta = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={() => {}} onSalta={onSalta} etichetta="Scegli" />)

  await user.click(screen.getByRole('button', { name: 'Salta' }))

  expect(onSalta).toHaveBeenCalled()
})

test('senza candidati mostra un messaggio', () => {
  render(<SceltaGiocatore candidati={[]} onConferma={() => {}} onSalta={() => {}} etichetta="Scegli" />)
  expect(screen.getByText(/nessun bersaglio disponibile/i)).toBeInTheDocument()
})
