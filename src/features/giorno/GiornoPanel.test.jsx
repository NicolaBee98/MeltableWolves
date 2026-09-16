import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GiornoPanel } from './GiornoPanel'

function setup(overrides = {}) {
  const props = {
    giocatori: [{ id: '1', nome: 'Anna', vivo: true }],
    voti: {},
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    aggiornaGiocatore: vi.fn(),
    ...overrides,
  }
  render(<GiornoPanel {...props} />)
  return props
}

test('dichiarare una morte sul colpo chiama aggiornaGiocatore con vivo:false', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
})

test('dichiarare morte sul rogo chiama aggiornaGiocatore con vivo:false', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup({ voti: { 1: 3 } })

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false })
})
