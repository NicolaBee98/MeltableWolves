import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceltaGiocatore } from './SceltaGiocatore'

const candidati = [
  { id: '1', nome: 'Anna' },
  { id: '2', nome: 'Marco' },
]

test('cliccare una chip chiama subito onConferma con quell\'id (nessun passo di conferma separato)', async () => {
  const user = userEvent.setup()
  const onConferma = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={onConferma} onSalta={() => {}} etichetta="Scegli" />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(onConferma).toHaveBeenCalledWith('2')
})

test('salta chiama onSalta', async () => {
  const user = userEvent.setup()
  const onSalta = vi.fn()
  render(<SceltaGiocatore candidati={candidati} onConferma={() => {}} onSalta={onSalta} etichetta="Scegli" />)

  await user.click(screen.getByRole('button', { name: 'Salta' }))

  expect(onSalta).toHaveBeenCalled()
})

test('con mostraSalta=false non mostra il pulsante Salta, ma il fallback "Chiudi" a lista vuota resta', () => {
  render(
    <SceltaGiocatore candidati={candidati} onConferma={() => {}} onSalta={() => {}} etichetta="Scegli" mostraSalta={false} />,
  )
  expect(screen.queryByRole('button', { name: 'Salta' })).not.toBeInTheDocument()
})

test('senza candidati mostra un messaggio con un pulsante Chiudi che chiama onSalta', async () => {
  const user = userEvent.setup()
  const onSalta = vi.fn()
  render(<SceltaGiocatore candidati={[]} onConferma={() => {}} onSalta={onSalta} etichetta="Scegli" />)

  expect(screen.getByText(/nessun bersaglio disponibile/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Chiudi' }))
  expect(onSalta).toHaveBeenCalled()
})
