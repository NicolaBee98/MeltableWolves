import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NightSequencer } from './NightSequencer'
import { useNotte } from '../../state/useNotte'

function NightSequencerConNotte(props) {
  const notte = useNotte()
  return <NightSequencer {...props} {...notte} />
}

beforeEach(() => {
  localStorage.clear()
})

test('senza ruoli con azione notturna mostra un messaggio', () => {
  render(<NightSequencerConNotte ruoliSelezionati={['villico']} giocatori={[]} aggiornaGiocatore={() => {}} />)
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('mostra il primo passo e i giocatori assegnati a quel ruolo', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()
  expect(screen.getByText('Sara')).toBeInTheDocument()
})

test('il pulsante Avanti passa al passo successivo', async () => {
  const user = userEvent.setup()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test('sull\'ultimo passo il pulsante diventa "Notte successiva" e fa ripartire dal primo passo con la notte incrementata', async () => {
  const user = userEvent.setup()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} aggiornaGiocatore={() => {}} />)

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByText('Paladino')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Notte successiva' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(screen.getByText('Notte 2')).toBeInTheDocument()
  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test("mostra la selezione bersaglio quando il passo ha un'azione automatizzata e il titolare è vivo", () => {
  const giocatori = [
    { id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: true, condizioni: [], note: '', poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('combobox')).toBeInTheDocument()
})

test('non mostra la selezione bersaglio se il titolare del ruolo è morto', () => {
  const giocatori = [{ id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: false, condizioni: [], note: '', poteriUsati: [] }]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('non mostra alcuna selezione bersaglio per ruoli senza automazione (5c)', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('"Notte successiva" rimuove le condizioni protetto e inibito da tutti i giocatori', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto', 'unto'], note: '' }]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['unto'] })
})

test('"Notte successiva" applica le conseguenze dei legami (apprendista eredita il ruolo del maestro)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [], legame: { tipo: 'apprendista', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'veggente', legame: null })
})

test("mostra la selezione bersaglio per l'Apprendista alla prima notte", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['apprendista']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('combobox')).toBeInTheDocument()
})

test("mostra lo scambio per Addolorata quando c'è una vittima al rogo della notte corrente", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 1 },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['addolorata']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('button', { name: 'Scambia' })).toBeInTheDocument()
})
