import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NightSequencer } from './NightSequencer'

beforeEach(() => {
  localStorage.clear()
})

test('senza ruoli con azione notturna mostra un messaggio', () => {
  render(<NightSequencer ruoliSelezionati={['villico']} giocatori={[]} />)
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('mostra il primo passo e i giocatori assegnati a quel ruolo', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' },
  ]
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={giocatori} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()
  expect(screen.getByText('Sara')).toBeInTheDocument()
})

test('il pulsante Avanti passa al passo successivo', async () => {
  const user = userEvent.setup()
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test('sull\'ultimo passo il pulsante diventa "Notte successiva" e fa ripartire dal primo passo con la notte incrementata', async () => {
  const user = userEvent.setup()
  render(<NightSequencer ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} />)

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByText('Paladino')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Notte successiva' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(screen.getByText('Notte 2')).toBeInTheDocument()
  expect(screen.getByText('Paladino')).toBeInTheDocument()
})
