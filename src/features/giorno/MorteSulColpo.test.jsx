import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MorteSulColpo } from './MorteSulColpo'

test("conferma chiama onDichiara con l'id del giocatore scelto", async () => {
  const user = userEvent.setup()
  const onDichiara = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true },
    { id: '2', nome: 'Marco', vivo: false },
  ]
  render(<MorteSulColpo giocatori={giocatori} onDichiara={onDichiara} />)

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(onDichiara).toHaveBeenCalledWith('1')
})

test('mostra solo i giocatori vivi come candidati', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true },
    { id: '2', nome: 'Marco', vivo: false },
  ]
  render(<MorteSulColpo giocatori={giocatori} onDichiara={() => {}} />)
  expect(screen.queryByText('Marco')).not.toBeInTheDocument()
})
