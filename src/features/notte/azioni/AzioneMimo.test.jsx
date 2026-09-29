import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneMimo } from './AzioneMimo'

test('senza legame propone la scelta del bersaglio da imitare', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  render(<AzioneMimo giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} ruoliSelezionati={['mimo']} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: { tipo: 'mimo', targetId: '2' } })
})

test('con bersaglio scelto ma senza ruolo noto, propone le carte del mazzo (Villico sempre incluso): la scelta resta locale, non tocca i giocatori finché non si preme Avanti', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const onScegliRuoloMimo = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  render(
    <AzioneMimo
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['mimo', 'veggente']}
      quantita={{ veggente: 1 }}
      mimoRuoloScelto={null}
      onScegliRuoloMimo={onScegliRuoloMimo}
    />,
  )

  expect(screen.getByText(/che carta ha davvero Marco/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Veggente' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Villico' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Veggente' }))

  // niente commit qui: il passo "mimo" esiste solo finché il ruoloSlug del
  // Mimo resta 'mimo', quindi la scelta reale (via NightSequencer, sull'Avanti)
  expect(onScegliRuoloMimo).toHaveBeenCalledWith('veggente')
  expect(aggiornaGiocatore).not.toHaveBeenCalled()
})

test('la carta già scelta (mimoRuoloScelto) resta modificabile: la chip corrispondente è marcata attiva', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  render(
    <AzioneMimo
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['mimo', 'veggente']}
      quantita={{ veggente: 1 }}
      mimoRuoloScelto="veggente"
      onScegliRuoloMimo={() => {}}
    />,
  )

  expect(screen.getByRole('button', { name: 'Veggente' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Villico' })).toHaveAttribute('aria-pressed', 'false')
})

test('se il bersaglio ha già un ruolo noto, il Mimo lo assume senza dover chiedere nulla', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true },
  ]
  render(<AzioneMimo giocatori={giocatori} aggiornaGiocatore={() => {}} ruoliSelezionati={['mimo', 'veggente']} />)

  expect(screen.getByText(/il mimo imita marco: ha assunto il ruolo di veggente/i)).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
