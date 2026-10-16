import { AZIONI_NOTTURNE } from './index'
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

test('la scelta resta modificabile: le chip restano tutte cliccabili e selezionarne un\'altra sposta la condizione', async () => {
  const user = userEvent.setup()
  const conUntoreUsato = [
    { id: '1', nome: 'Untore', ruoloSlug: 'untore', vivo: true, condizioni: [], note: '', usiNotte: ['untore'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: ['unto'], note: '' },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneSingola
      giocatori={conUntoreUsato}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="unto"
      etichetta="Chi ungere"
      ruoloSlugAttore="untore"
    />,
  )
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Luca' })).toHaveAttribute('aria-pressed', 'false')

  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: [] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { condizioni: ['unto'] })
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

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { usiNotte: ['untore'] })
})

test('senza escludiAttore, l\'attore compare tra i propri candidati (es. Untore può ungere se stesso)', () => {
  const conUntore = [
    { id: '1', nome: 'Piero', ruoloSlug: 'untore', vivo: true, condizioni: [], note: '', usiNotte: [] },
    giocatori[1],
  ]
  render(
    <AzioneCondizioneSingola
      giocatori={conUntore}
      aggiornaGiocatore={() => {}}
      condizione="unto"
      etichetta="Chi ungere"
      ruoloSlugAttore="untore"
    />,
  )
  expect(screen.getByRole('button', { name: 'Piero' })).toBeInTheDocument()
})

test('con escludiAttore, l\'attore non compare tra i propri candidati (la Fattucchiera non può inibire se stessa)', () => {
  const conFattucchiera = [
    { id: '1', nome: 'Piero', ruoloSlug: 'fattucchiera', vivo: true, condizioni: [], note: '', usiNotte: [] },
    giocatori[1],
  ]
  render(
    <AzioneCondizioneSingola
      giocatori={conFattucchiera}
      aggiornaGiocatore={() => {}}
      condizione="inibito"
      etichetta="Chi inibire"
      ruoloSlugAttore="fattucchiera"
      escludiAttore
    />,
  )
  expect(screen.queryByRole('button', { name: 'Piero' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test('non mostra il pulsante Salta: questi poteri non sono opzionali', () => {
  const conUntore = [
    { id: '1', nome: 'Piero', ruoloSlug: 'untore', vivo: true, condizioni: [], note: '', usiNotte: [] },
    giocatori[1],
  ]
  render(
    <AzioneCondizioneSingola
      giocatori={conUntore}
      aggiornaGiocatore={() => {}}
      condizione="unto"
      etichetta="Chi ungere"
      ruoloSlugAttore="untore"
    />,
  )

  expect(screen.queryByRole('button', { name: 'Salta' })).not.toBeInTheDocument()
})

test('cliccando di nuovo il bersaglio scelto la condizione si toglie', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Paola', ruoloSlug: 'paladino', vivo: true, condizioni: [], usiNotte: ['paladino'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto'] },
  ]
  render(
    <AzioneCondizioneSingola
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="protetto"
      etichetta="Chi proteggere"
      ruoloSlugAttore="paladino"
    />,
  )
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: [] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { usiNotte: [] })
})

test('Fattucchiera: su chi agisce di giorno avvisa e non applica inibito', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const gs = [
    { id: '1', nome: 'Fatt', ruoloSlug: 'fattucchiera', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Boia', ruoloSlug: 'boia', vivo: true, condizioni: [], note: '' },
  ]
  render(
    <AzioneCondizioneSingola
      giocatori={gs}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="inibito"
      etichetta="Chi inibire"
      ruoloSlugAttore="fattucchiera"
      nonApplicabili={{ boia: 'agisce di giorno' }}
    />,
  )
  await user.click(screen.getByRole('button', { name: 'Boia' }))
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.anything())
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { sceltaNotte: { fattucchiera: '2' } })
})

test('Fattucchiera: avviso non bloccante per chi sceglie la prima notte, solo al round 1', () => {
  const gs = [
    { id: '1', nome: 'Fatt', ruoloSlug: 'fattucchiera', vivo: true, condizioni: [], note: '', sceltaNotte: { fattucchiera: '2' } },
    { id: '2', nome: 'Cav', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], note: '' },
  ]
  const props = {
    giocatori: gs,
    aggiornaGiocatore: () => {},
    condizione: 'inibito',
    etichetta: 'Chi inibire',
    ruoloSlugAttore: 'fattucchiera',
    nonApplicabili: { cavaliere: { motivo: 'sceglie altri giocatori la prima notte', primaNotte: true } },
  }
  const { unmount } = render(<AzioneCondizioneSingola {...props} round={1} />)
  expect(screen.getByText(/Non può inibire Cavaliere: sceglie altri giocatori la prima notte/)).toBeInTheDocument()
  unmount()
  render(<AzioneCondizioneSingola {...props} round={2} />)
  expect(screen.queryByText(/Non può inibire/)).not.toBeInTheDocument()
})

test('Fattucchiera (configurazione reale): la Mucca Mannara non può essere inibita, avviso e nessuna condizione scritta', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const gs = [
    { id: '1', nome: 'Fatt', ruoloSlug: 'fattucchiera', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Mucca', ruoloSlug: 'mucca-mannara', vivo: true, condizioni: [], note: '' },
  ]
  const { props } = AZIONI_NOTTURNE.fattucchiera
  const { rerender } = render(<AzioneCondizioneSingola giocatori={gs} aggiornaGiocatore={aggiornaGiocatore} round={2} {...props} />)
  await user.click(screen.getByRole('button', { name: 'Mucca' }))
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.anything())
  rerender(<AzioneCondizioneSingola giocatori={[{ ...gs[0], sceltaNotte: { fattucchiera: '2' } }, gs[1]]} aggiornaGiocatore={aggiornaGiocatore} round={2} {...props} />)
  expect(screen.getByText(/Non può inibire Mucca Mannara: non può essere inibita/)).toBeInTheDocument()
})
