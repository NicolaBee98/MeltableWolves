import { act, fireEvent, render, screen } from '@testing-library/react'
import { PulsanteTieni } from './PulsanteTieni'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const bottone = () => screen.getByRole('button', { name: /Vai/ })
const passa = (ms) => act(() => vi.advanceTimersByTime(ms))

test('mostra l\'indicazione "tieni premuto" e un click semplice non fa nulla', () => {
  const onConferma = vi.fn()
  render(<PulsanteTieni onConferma={onConferma}>Vai</PulsanteTieni>)
  expect(bottone()).toHaveTextContent('tieni premuto')
  fireEvent.click(bottone())
  passa(2000)
  expect(onConferma).not.toHaveBeenCalled()
})

test('parte solo a riempimento completo; rilasciando prima si azzera', () => {
  const onConferma = vi.fn()
  render(<PulsanteTieni onConferma={onConferma}>Vai</PulsanteTieni>)
  const riempimento = () => bottone().querySelector('.pulsante-tieni__riempimento')

  fireEvent.pointerDown(bottone())
  expect(riempimento().style.width).toBe('100%')
  passa(1000)
  fireEvent.pointerUp(bottone())
  expect(riempimento().style.width).toBe('0px')
  passa(2000)
  expect(onConferma).not.toHaveBeenCalled()

  fireEvent.pointerDown(bottone())
  passa(1200)
  expect(onConferma).toHaveBeenCalledTimes(1)
})

test('da tastiera: Invio/Spazio tenuto per lo stesso tempo (i repeat non riavviano), rilascio anticipato annulla', () => {
  const onConferma = vi.fn()
  render(<PulsanteTieni onConferma={onConferma}>Vai</PulsanteTieni>)

  fireEvent.keyDown(bottone(), { key: 'Enter' })
  passa(1000)
  fireEvent.keyDown(bottone(), { key: 'Enter', repeat: true })
  fireEvent.keyUp(bottone(), { key: 'Enter' })
  passa(2000)
  expect(onConferma).not.toHaveBeenCalled()

  fireEvent.keyDown(bottone(), { key: ' ' })
  passa(1200)
  expect(onConferma).toHaveBeenCalledTimes(1)
})

test('disabilitato non parte', () => {
  const onConferma = vi.fn()
  render(<PulsanteTieni onConferma={onConferma} disabled>Vai</PulsanteTieni>)
  fireEvent.pointerDown(bottone())
  passa(2000)
  expect(onConferma).not.toHaveBeenCalled()
})
