import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogImpostazioniPopup } from './LogImpostazioniPopup'

test('il popup è chiuso di default', () => {
  render(<LogImpostazioniPopup eventi={[]} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test("cliccando l'icona si apre il popup, di default sulla tab Log partita", async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText(/nessun evento registrato/i)).toBeInTheDocument()
})

test('mostra gli eventi nella tab Log partita', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[{ round: 1, messaggio: 'Anna è morto/a' }]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByText(/anna è morto\/a/i)).toBeInTheDocument()
})

test('la tab Impostazioni partita mostra il pulsante Nuova Partita e nasconde il log', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} onNuovaPartita={vi.fn()} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Impostazioni partita' }))

  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()
  expect(screen.queryByText(/nessun evento registrato/i)).not.toBeInTheDocument()
})

test('Nuova Partita chiede conferma e non fa nulla se annullata', async () => {
  const user = userEvent.setup()
  const onNuovaPartita = vi.fn()
  vi.spyOn(window, 'confirm').mockReturnValue(false)
  render(<LogImpostazioniPopup eventi={[]} onNuovaPartita={onNuovaPartita} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Impostazioni partita' }))
  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))

  expect(onNuovaPartita).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  window.confirm.mockRestore()
})

test('Nuova Partita chiama onNuovaPartita e chiude il popup se confermata', async () => {
  const user = userEvent.setup()
  const onNuovaPartita = vi.fn()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<LogImpostazioniPopup eventi={[]} onNuovaPartita={onNuovaPartita} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Impostazioni partita' }))
  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))

  expect(onNuovaPartita).toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  window.confirm.mockRestore()
})

test('il pulsante Chiudi chiude il popup', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Chiudi' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
