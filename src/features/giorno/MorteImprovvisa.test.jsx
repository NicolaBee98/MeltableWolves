import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MorteImprovvisa } from './MorteImprovvisa'

const giocatori = [
  { id: '1', nome: 'Anna', vivo: true },
  { id: '2', nome: 'Marco', vivo: false },
]

test('il popup è chiuso di default', () => {
  render(<MorteImprovvisa giocatori={giocatori} onDichiara={vi.fn()} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test("cliccando l'icona si apre il popup con solo i giocatori vivi", async () => {
  const user = userEvent.setup()
  render(<MorteImprovvisa giocatori={giocatori} onDichiara={vi.fn()} />)

  await user.click(screen.getByRole('button', { name: /morte improvvisa/i }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText('Anna')).toBeInTheDocument()
  expect(screen.queryByText('Marco')).not.toBeInTheDocument()
})

test('confermare una scelta chiama onDichiara e chiude il popup', async () => {
  const user = userEvent.setup()
  const onDichiara = vi.fn()
  render(<MorteImprovvisa giocatori={giocatori} onDichiara={onDichiara} />)

  await user.click(screen.getByRole('button', { name: /morte improvvisa/i }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onDichiara).toHaveBeenCalledWith('1')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('il pulsante Salta chiude il popup senza chiamare onDichiara', async () => {
  const user = userEvent.setup()
  const onDichiara = vi.fn()
  render(<MorteImprovvisa giocatori={giocatori} onDichiara={onDichiara} />)

  await user.click(screen.getByRole('button', { name: /morte improvvisa/i }))
  await user.click(screen.getByRole('button', { name: 'Salta' }))

  expect(onDichiara).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
