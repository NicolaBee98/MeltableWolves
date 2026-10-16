import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { SfogliaMazzo } from './SfogliaMazzo'

test('il focus entra nel dialogo, Esc chiude e le frecce scorrono le carte', async () => {
  const onChiudi = vi.fn()
  const utente = userEvent.setup()
  render(<SfogliaMazzo onChiudi={onChiudi} />)
  expect(screen.getByRole('dialog')).toHaveFocus()
  expect(screen.getByText(/^1 \//)).toBeInTheDocument()
  await utente.keyboard('{ArrowRight}')
  expect(screen.getByText(/^2 \//)).toBeInTheDocument()
  await utente.keyboard('{ArrowLeft}{ArrowLeft}')
  expect(screen.getByText(/^1 \//)).toBeInTheDocument()
  await utente.keyboard('{Escape}')
  expect(onChiudi).toHaveBeenCalled()
})

test('le frecce sullo slider non fanno scorrere la carta due volte', () => {
  render(<SfogliaMazzo onChiudi={() => {}} />)
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
  expect(screen.getByText(/^1 \//)).toBeInTheDocument() // ci pensa lo slider nativo
})
