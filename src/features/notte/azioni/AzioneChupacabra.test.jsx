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

test('la scelta resta modificabile: cambiare bersaglio annulla la morte del precedente', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Luca', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' },
    { id: '3', nome: 'Gino', ruoloSlug: 'chupacabra', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    vivo: true,
    causaMorte: undefined,
    mortoNotte: undefined,
    mortoDa: undefined,
  })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', {
    vivo: false,
    causaMorte: 'notte',
    mortoNotte: 2,
    mortoDa: 'chupacabra',
  })
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

test('nessunLupoVivo è calcolato sullo stato PRIMA del colpo: dopo aver ucciso l\'ultimo lupo, cambiare bersaglio su un non-lupo non uccide', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Chiara', ruoloSlug: 'chupacabra', vivo: true, condizioni: [] },
    { id: '2', nome: 'Lia', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const annullaMorte = vi.fn((id) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, vivo: true } : g))
  })
  const props = () => ({ giocatori, aggiornaGiocatore, annullaMorte, round: 2 })
  const { rerender } = render(<AzioneChupacabra {...props()} />)

  await user.click(screen.getByRole('button', { name: 'Lia' }))
  rerender(<AzioneChupacabra {...props()} />)
  expect(giocatori[1].vivo).toBe(false)

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rerender(<AzioneChupacabra {...props()} />)

  expect(annullaMorte).toHaveBeenCalledWith('2')
  expect(giocatori[2].vivo).toBe(true)
  expect(screen.getByText(/anna non è un lupo/i)).toBeInTheDocument()
})

test('punta un non-lupo con lupi ancora vivi: messaggio "caccia fallita"', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Chiara', ruoloSlug: 'chupacabra', vivo: true, condizioni: [] },
    { id: '2', nome: 'Lia', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(screen.getByText(/la caccia del chupacabra fallisce/i)).toBeInTheDocument()
})

test('il Gallo Mannaro non conta come lupo: sceglierlo (con un lupo vero ancora vivo) fa fallire la caccia', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Gallo', ruoloSlug: 'gallo-mannaro', vivo: true, condizioni: [] },
    { id: '2', nome: 'Lupo', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Gino', ruoloSlug: 'chupacabra', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(<AzioneChupacabra giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Gallo' }))

  expect(screen.getByText(/non è un lupo/i)).toBeInTheDocument()
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('1', expect.objectContaining({ vivo: false }))
})
