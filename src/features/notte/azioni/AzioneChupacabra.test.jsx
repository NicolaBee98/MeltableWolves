import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneChupacabra } from './AzioneChupacabra'

test('uccide un bersaglio di fazione lupi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' }]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    vivo: false,
    causaMorte: 'notte',
    mortoNotte: 2,
    mortoDa: 'chupacabra',
  })
})

test('non permette una seconda caccia nella stessa notte', () => {
  const giocatori = [
    { id: '1', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Gino', ruoloSlug: 'chupacabra', vivo: true, condizioni: [], usiNotte: ['chupacabra-caccia'] },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/potere già utilizzato questa notte/i)).toBeInTheDocument()
})

test('non ha effetto su un bersaglio non-lupo se ci sono ancora lupi vivi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})

test('uccide chiunque se non ci sono più lupi vivi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: false, condizioni: [], note: '' },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    vivo: false,
    causaMorte: 'notte',
    mortoNotte: 2,
    mortoDa: 'chupacabra',
  })
})

test('il Nano e il Criceto Malvagio sono immuni al Chupacabra: non compaiono tra i candidati', () => {
  const giocatori = [
    { id: '1', nome: 'Nino', ruoloSlug: 'nano', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Rita', ruoloSlug: 'criceto-malvagio', vivo: true, condizioni: [], note: '' },
    { id: '3', nome: 'Gino', ruoloSlug: 'chupacabra', vivo: true, condizioni: [], note: '' },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)

  expect(screen.queryByRole('button', { name: 'Nino' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Rita' })).not.toBeInTheDocument()
})

test('il Chupacabra non può sbranare se stesso: non compare tra i propri candidati', () => {
  const giocatori = [
    { id: '1', nome: 'Gino', ruoloSlug: 'chupacabra', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)

  expect(screen.queryByRole('button', { name: 'Gino' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})
