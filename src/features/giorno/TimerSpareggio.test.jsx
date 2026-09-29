import { render, screen, fireEvent, act } from '@testing-library/react'
import { TimerSpareggio } from './TimerSpareggio'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('mostra la durata di default come 01:00', () => {
  render(<TimerSpareggio />)
  expect(screen.getByText('01:00')).toBeInTheDocument()
})

test('avvia fa scendere il tempo rimanente ogni secondo', () => {
  render(<TimerSpareggio />)

  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }))
  act(() => {
    vi.advanceTimersByTime(3000)
  })

  expect(screen.getByText('00:57')).toBeInTheDocument()
})

test('pausa ferma il conto alla rovescia', () => {
  render(<TimerSpareggio />)

  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }))
  act(() => {
    vi.advanceTimersByTime(2000)
  })
  fireEvent.click(screen.getByRole('button', { name: 'Pausa' }))
  act(() => {
    vi.advanceTimersByTime(5000)
  })

  expect(screen.getByText('00:58')).toBeInTheDocument()
})

test('Avvia e Pausa sono lo stesso tasto: dopo una pausa riprende da dove si era fermato, non riparte da capo', () => {
  render(<TimerSpareggio />)

  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }))
  act(() => {
    vi.advanceTimersByTime(10000)
  })
  fireEvent.click(screen.getByRole('button', { name: 'Pausa' }))
  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }))
  act(() => {
    vi.advanceTimersByTime(1000)
  })

  expect(screen.getByText('00:49')).toBeInTheDocument()
})

test('la durata arriva dalle impostazioni (durataSecondi), non da un input nella UI di gioco', () => {
  render(<TimerSpareggio durataSecondi={30} />)

  expect(screen.getByText('00:30')).toBeInTheDocument()
  expect(screen.queryByLabelText('Durata (secondi)')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Avvia' }))
  act(() => {
    vi.advanceTimersByTime(5000)
  })
  fireEvent.click(screen.getByRole('button', { name: 'Azzera' }))

  expect(screen.getByText('00:30')).toBeInTheDocument()
})
