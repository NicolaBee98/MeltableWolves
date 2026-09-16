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
    round: 3,
    ...overrides,
  }
  render(<GiornoPanel {...props} />)
  return props
}

test('dichiarare una morte sul colpo chiama aggiornaGiocatore con causaMorte:colpo', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.selectOptions(screen.getByRole('combobox'), '1')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'colpo' })
})

test('dichiarare morte sul rogo chiama aggiornaGiocatore con causaMorte:rogo e la notte corrente', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup({ voti: { 1: 3 } })

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'rogo', mortoNotte: 3 })
})
