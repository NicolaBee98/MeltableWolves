import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneCondizioneSingola } from './AzioneCondizioneSingola'

const giocatori = [
  { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' },
]

test('conferma applica la condizione al bersaglio scelto e marca il potere usato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneSingola
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="unto"
      etichetta="Chi ungere"
      ruoloSlugAttore="untore"
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['unto'] })
})

test('mostra solo i giocatori vivi come candidati', () => {
  const conMorto = [...giocatori, { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: false, condizioni: [], note: '' }]
  render(
    <AzioneCondizioneSingola
      giocatori={conMorto}
      aggiornaGiocatore={() => {}}
      condizione="unto"
      etichetta="Chi ungere"
      ruoloSlugAttore="untore"
    />,
  )
  expect(screen.queryByText('Luca')).not.toBeInTheDocument()
})

test('nasconde la selezione e mostra un avviso se il potere è già stato usato questa notte', () => {
  const conUntoreUsato = [
    { id: '1', nome: 'Anna', ruoloSlug: 'untore', vivo: true, condizioni: [], note: '', usiNotte: ['untore'] },
    giocatori[1],
  ]
  render(
    <AzioneCondizioneSingola
      giocatori={conUntoreUsato}
      aggiornaGiocatore={() => {}}
      condizione="unto"
      etichetta="Chi ungere"
      ruoloSlugAttore="untore"
    />,
  )
  expect(screen.getByText(/potere già utilizzato questa notte/i)).toBeInTheDocument()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('confermare marca il potere come usato per l\'attore', async () => {
  const user = userEvent.setup()
  const conUntore = [
    { id: '1', nome: 'Piero', ruoloSlug: 'untore', vivo: true, condizioni: [], note: '', usiNotte: [] },
    giocatori[1],
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneSingola
      giocatori={conUntore}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="unto"
      etichetta="Chi ungere"
      ruoloSlugAttore="untore"
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { usiNotte: ['untore'] })
})

test('Salta marca il potere come usato senza applicare alcuna condizione', async () => {
  const user = userEvent.setup()
  const conUntore = [
    { id: '1', nome: 'Piero', ruoloSlug: 'untore', vivo: true, condizioni: [], note: '', usiNotte: [] },
    giocatori[1],
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneSingola
      giocatori={conUntore}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="unto"
      etichetta="Chi ungere"
      ruoloSlugAttore="untore"
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Salta' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { usiNotte: ['untore'] })
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.anything())
})
