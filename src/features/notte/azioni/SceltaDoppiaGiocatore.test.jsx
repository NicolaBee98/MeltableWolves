import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceltaDoppiaGiocatore } from './SceltaDoppiaGiocatore'

const candidati = [
  { id: '1', nome: 'Anna' },
  { id: '2', nome: 'Marco' },
  { id: '3', nome: 'Luca' },
]

test('il pulsante Conferma è disabilitato finché non sono selezionati due bersagli', async () => {
  const user = userEvent.setup()
  render(<SceltaDoppiaGiocatore candidati={candidati} onConferma={() => {}} onSalta={() => {}} etichetta="Scegli due" />)

  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()

  await user.click(screen.getByRole('checkbox', { name: 'Anna' }))
  expect(screen.getByRole('button', { name: 'Conferma' })).toBeDisabled()

  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  expect(screen.getByRole('button', { name: 'Conferma' })).not.toBeDisabled()
})

test('conferma chiama onConferma con i due id selezionati', async () => {
  const user = userEvent.setup()
  const onConferma = vi.fn()
  render(<SceltaDoppiaGiocatore candidati={candidati} onConferma={onConferma} onSalta={() => {}} etichetta="Scegli due" />)

  await user.click(screen.getByRole('checkbox', { name: 'Anna' }))
  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onConferma).toHaveBeenCalledWith('1', '2')
})

test('non è possibile selezionare più di due bersagli', async () => {
  const user = userEvent.setup()
  render(<SceltaDoppiaGiocatore candidati={candidati} onConferma={() => {}} onSalta={() => {}} etichetta="Scegli due" />)

  await user.click(screen.getByRole('checkbox', { name: 'Anna' }))
  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  await user.click(screen.getByRole('checkbox', { name: 'Luca' }))

  expect(screen.getByRole('checkbox', { name: 'Luca' })).not.toBeChecked()
})
