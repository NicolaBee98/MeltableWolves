import { render, screen, within } from '@testing-library/react'
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

test('pozione vitale su un bersaglio già protetto (Paladino): cambiando bersaglio la protezione del Paladino non viene tolta', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const g = [
    giocatori[0],
    { ...giocatori[1], condizioni: ['protetto'] },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneStrega giocatori={g} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Anna' }))
  await user.click(within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Luca' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', { condizioni: [] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { condizioni: ['protetto'] })
})

test('la pozione vitale si può non usare: cliccare di nuovo lo stesso bersaglio toglie la protezione e restituisce la pozione', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(<AzioneStrega giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)
  const chip = () => within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Anna' })

  await user.click(chip())
  await user.click(chip())

  expect(chip()).toHaveAttribute('aria-pressed', 'false')
  expect(aggiornaGiocatore).toHaveBeenLastCalledWith('1', { poteriUsati: [] })
})

test('cambiare o togliere il bersaglio della pozione mortale annulla la morte con annullaMorte (catena inclusa)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const annullaMorte = vi.fn()
  render(<AzioneStrega giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} annullaMorte={annullaMorte} round={2} />)
  const chip = () => within(screen.getByRole('group', { name: 'Chi uccidere' })).getByRole('button', { name: 'Anna' })

  await user.click(chip())
  await user.click(chip())

  expect(annullaMorte).toHaveBeenCalledWith('2')
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.objectContaining({ vivo: true }))
  expect(aggiornaGiocatore).toHaveBeenLastCalledWith('1', { poteriUsati: [] })
})

test('Strega e Mimo-Strega hanno pozioni separate: la pozione usata dall\'una non blocca l\'altra', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const due = [
    { id: '1', nome: 'Sara', ruoloSlug: 'strega', vivo: true, condizioni: [], poteriUsati: ['strega-pozione-vitale'] },
    { id: '3', nome: 'Mia', ruoloSlug: 'strega', vivo: true, condizioni: [], poteriUsati: [], legame: { tipo: 'mimo', targetId: '1' } },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  const { unmount } = render(<AzioneStrega giocatori={due} aggiornaGiocatore={aggiornaGiocatore} attoreId="1" />)
  expect(screen.getByText('Pozione vitale già utilizzata in questa partita.')).toBeInTheDocument()
  unmount()

  render(<AzioneStrega giocatori={due} aggiornaGiocatore={aggiornaGiocatore} attoreId="3" />)
  expect(screen.queryByText('Pozione vitale già utilizzata in questa partita.')).not.toBeInTheDocument()
  await user.click(within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Anna' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { poteriUsati: ['strega-pozione-vitale'] })
})
