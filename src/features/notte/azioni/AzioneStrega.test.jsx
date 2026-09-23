import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneStrega } from './AzioneStrega'

const giocatori = [
  { id: '1', nome: 'Strega', ruoloSlug: 'strega', vivo: true, condizioni: [], note: '', poteriUsati: [] },
  { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
]

test('la pozione vitale protegge il bersaglio e marca il potere come usato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(<AzioneStrega giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  const [chipAnnaVitale] = screen.getAllByRole('button', { name: 'Anna' })

  await user.click(chipAnnaVitale)

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['protetto'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['strega-pozione-vitale'] })
})

test('la pozione mortale uccide il bersaglio e marca il potere come usato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(<AzioneStrega giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  const [, chipAnnaMortale] = screen.getAllByRole('button', { name: 'Anna' })

  await user.click(chipAnnaMortale)

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { vivo: false, causaMorte: 'notte', mortoNotte: 2 })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['strega-pozione-mortale'] })
})

test('la pozione mortale uccide anche un bersaglio protetto (la protezione non blocca la pozione mortale)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatoriConProtetto = [giocatori[0], { ...giocatori[1], condizioni: ['protetto'] }]
  render(<AzioneStrega giocatori={giocatoriConProtetto} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  const [, chipAnnaMortale] = screen.getAllByRole('button', { name: 'Anna' })

  await user.click(chipAnnaMortale)

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { vivo: false, causaMorte: 'notte', mortoNotte: 2 })
})

test('avvisa se la pozione vitale non ha effetto perché il bersaglio è già protetto', async () => {
  const user = userEvent.setup()
  const giocatoriConProtetto = [giocatori[0], { ...giocatori[1], condizioni: ['protetto'] }]
  render(<AzioneStrega giocatori={giocatoriConProtetto} aggiornaGiocatore={() => {}} />)

  const [chipAnnaVitale] = screen.getAllByRole('button', { name: 'Anna' })

  await user.click(chipAnnaVitale)

  expect(screen.getByText(/non ha avuto alcun effetto/i)).toBeInTheDocument()
})

test('non mostra pulsanti "Salta" per le pozioni: sono entrambe facoltative senza bisogno di conferma', () => {
  render(<AzioneStrega giocatori={giocatori} aggiornaGiocatore={() => {}} />)
  expect(screen.queryByRole('button', { name: /salta/i })).not.toBeInTheDocument()
})

test('nasconde la pozione già usata', () => {
  const giocatoriConPozioneUsata = [{ ...giocatori[0], poteriUsati: ['strega-pozione-vitale'] }, giocatori[1]]
  render(<AzioneStrega giocatori={giocatoriConPozioneUsata} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/pozione vitale già utilizzata/i)).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Anna' })).toHaveLength(1)
})
