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

  const [selectVitale] = screen.getAllByRole('combobox')
  const [confermaVitale] = screen.getAllByRole('button', { name: 'Conferma' })

  await user.selectOptions(selectVitale, '2')
  await user.click(confermaVitale)

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['protetto'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['strega-pozione-vitale'] })
})

test('la pozione mortale uccide il bersaglio e marca il potere come usato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(<AzioneStrega giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  const [, selectMortale] = screen.getAllByRole('combobox')
  const [, confermaMortale] = screen.getAllByRole('button', { name: 'Conferma' })

  await user.selectOptions(selectMortale, '2')
  await user.click(confermaMortale)

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { vivo: false, causaMorte: 'notte' })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { poteriUsati: ['strega-pozione-mortale'] })
})

test('nasconde la pozione già usata', () => {
  const giocatoriConPozioneUsata = [{ ...giocatori[0], poteriUsati: ['strega-pozione-vitale'] }, giocatori[1]]
  render(<AzioneStrega giocatori={giocatoriConPozioneUsata} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/pozione vitale già utilizzata/i)).toBeInTheDocument()
  expect(screen.getAllByRole('combobox')).toHaveLength(1)
})
