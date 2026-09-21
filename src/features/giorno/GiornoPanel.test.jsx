import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GiornoPanel } from './GiornoPanel'

function setup(overrides = {}) {
  const props = {
    giocatori: [{ id: '1', nome: 'Anna', vivo: true }],
    voti: { 1: 2 },
    fase: 'esito',
    candidatiEsito: ['1'],
    incrementaVoto: vi.fn(),
    decrementaVoto: vi.fn(),
    ricominciaVotazione: vi.fn(),
    vaiAEsito: vi.fn(),
    tornaAlVoto: vi.fn(),
    aggiornaGiocatore: vi.fn(),
    round: 3,
    onProsegui: vi.fn(),
    ...overrides,
  }
  render(<GiornoPanel {...props} />)
  return props
}

test('dichiarare una morte improvvisa dal popup chiama aggiornaGiocatore con causaMorte:colpo', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.click(screen.getByRole('button', { name: /morte improvvisa/i }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'colpo' })
})

test('dichiarare morte sul rogo, dopo la conferma, chiama aggiornaGiocatore con causaMorte:rogo e la notte corrente', async () => {
  const user = userEvent.setup()
  const { aggiornaGiocatore } = setup()

  await user.click(screen.getByRole('button', { name: 'Dichiara morte sul rogo' }))
  await user.click(screen.getByRole('button', { name: 'Sì, è morto' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: false, causaMorte: 'rogo', mortoNotte: 3 })
})

test('il pulsante Prosegui alla notte è disabilitato finché il rogo non è confermato, poi chiama onProsegui', async () => {
  const user = userEvent.setup()
  const { onProsegui } = setup({ giocatori: [{ id: '1', nome: 'Anna', vivo: false }] })

  await user.click(screen.getByRole('button', { name: 'Prosegui alla notte' }))
  expect(onProsegui).toHaveBeenCalled()
})
