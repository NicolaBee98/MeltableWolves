import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerCard } from './PlayerCard'

const giocatore = { id: '1', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [], note: '' }
const ruolo = { slug: 'veggente', nome: 'Veggente', fazione: 'villaggio', notturno: true, testoRegole: '...' }
const condizioniDisponibili = [{ slug: 'ipnotizzato', nome: 'Ipnotizzato', descrizione: '...' }]

test('mostra nome e ruolo del giocatore', () => {
  render(
    <PlayerCard
      giocatore={giocatore}
      ruolo={ruolo}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={() => {}}
      onChangeCondizioni={() => {}}
      onChangeNote={() => {}}
    />,
  )
  expect(screen.getByText('Marco')).toBeInTheDocument()
  expect(screen.getByText('Veggente')).toBeInTheDocument()
})

test('click sul pulsante stato chiama onToggleVivo con l\'id del giocatore', async () => {
  const user = userEvent.setup()
  const onToggleVivo = vi.fn()
  render(
    <PlayerCard
      giocatore={giocatore}
      ruolo={ruolo}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={onToggleVivo}
      onChangeCondizioni={() => {}}
      onChangeNote={() => {}}
    />,
  )
  await user.click(screen.getByRole('button', { name: /vivo/i }))
  expect(onToggleVivo).toHaveBeenCalledWith('1')
})

test('click su una condizione la aggiunge alla lista', async () => {
  const user = userEvent.setup()
  const onChangeCondizioni = vi.fn()
  render(
    <PlayerCard
      giocatore={giocatore}
      ruolo={ruolo}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={() => {}}
      onChangeCondizioni={onChangeCondizioni}
      onChangeNote={() => {}}
    />,
  )
  await user.click(screen.getByRole('button', { name: /ipnotizzato/i }))
  expect(onChangeCondizioni).toHaveBeenCalledWith('1', ['ipnotizzato'])
})

test('scrivere nella textarea chiama onChangeNote', async () => {
  const user = userEvent.setup()
  const onChangeNote = vi.fn()
  render(
    <PlayerCard
      giocatore={giocatore}
      ruolo={ruolo}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={() => {}}
      onChangeCondizioni={() => {}}
      onChangeNote={onChangeNote}
    />,
  )
  await user.type(screen.getByPlaceholderText('Note...'), 'x')
  expect(onChangeNote).toHaveBeenCalledWith('1', 'x')
})

test('mostra "Ruolo non ancora assegnato" se il ruolo non è ancora noto', () => {
  render(
    <PlayerCard
      giocatore={{ ...giocatore, ruoloSlug: undefined }}
      ruolo={undefined}
      condizioniDisponibili={condizioniDisponibili}
      onToggleVivo={() => {}}
      onChangeCondizioni={() => {}}
      onChangeNote={() => {}}
    />,
  )
  expect(screen.getByText('Ruolo non ancora assegnato')).toBeInTheDocument()
})
