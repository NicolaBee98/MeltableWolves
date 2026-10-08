import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScaricaOffline } from './ScaricaOffline'

test('mostra sempre le istruzioni per iPhone/iPad e Android e la nota sui dati', () => {
  render(<ScaricaOffline onTornaAllaHome={() => {}} />)
  expect(screen.getByRole('heading', { name: /iPhone e iPad/ })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Android/ })).toBeInTheDocument()
  expect(screen.getByText(/Aggiungi alla schermata Home/, { selector: 'strong' })).toBeInTheDocument()
})

test('evidenzia il sistema rilevato dallo userAgent', () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Linux; Android 14) Chrome/120')
  render(<ScaricaOffline onTornaAllaHome={() => {}} />)
  expect(screen.getByText('(il tuo dispositivo)').closest('[data-sistema]')).toHaveAttribute('data-sistema', 'android')
  vi.restoreAllMocks()
})

test('"Torna alla Home" chiama onTornaAllaHome', async () => {
  const onTornaAllaHome = vi.fn()
  render(<ScaricaOffline onTornaAllaHome={onTornaAllaHome} />)
  await userEvent.setup().click(screen.getByRole('button', { name: /Home/ }))
  expect(onTornaAllaHome).toHaveBeenCalled()
})
