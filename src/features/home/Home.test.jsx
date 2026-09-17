import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Home } from './Home'

test('mostra i tre pulsanti principali e l\'icona impostazioni', () => {
  render(<Home onNuovaPartita={() => {}} />)
  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Regolamento' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mazzo' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Impostazioni' })).toBeInTheDocument()
})

test('Regolamento, Mazzo e Impostazioni sono disabilitati (non ancora implementati)', () => {
  render(<Home onNuovaPartita={() => {}} />)
  expect(screen.getByRole('button', { name: 'Regolamento' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Mazzo' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Impostazioni' })).toBeDisabled()
})

test('cliccare Nuova Partita chiama onNuovaPartita', async () => {
  const user = userEvent.setup()
  const onNuovaPartita = vi.fn()
  render(<Home onNuovaPartita={onNuovaPartita} />)
  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  expect(onNuovaPartita).toHaveBeenCalled()
})
