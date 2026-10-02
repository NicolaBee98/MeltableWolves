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

test('non propone mai Alchimista/Boia/Scemo del Villaggio/Innocente tra le carte: si rivelano solo dal loro evento dedicato, non sono mai una carta segreta da copiare', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  render(
    <AzioneMimo
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['mimo', 'alchimista', 'boia', 'scemo-del-villaggio', 'innocente', 'veggente']}
      quantita={{ alchimista: 1, boia: 1, 'scemo-del-villaggio': 1, innocente: 1, veggente: 1 }}
      mimoRuoloScelto={null}
      onScegliRuoloMimo={() => {}}
    />,
  )

  expect(screen.queryByRole('button', { name: 'Alchimista' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Boia' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Scemo del Villaggio' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Innocente' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Veggente' })).toBeInTheDocument()
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

test('se il bersaglio ha già un ruolo noto, il Mimo lo assume senza dover chiedere nulla, ma resta un\'uscita per cambiare bersaglio', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true },
  ]
  render(<AzioneMimo giocatori={giocatori} aggiornaGiocatore={() => {}} ruoliSelezionati={['mimo', 'veggente']} />)

  expect(screen.getByText(/il mimo imita marco: ha assunto il ruolo di veggente/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /annulla/i })).toBeInTheDocument()
})

test('"Annulla (cambia bersaglio)" toglie il legame, in entrambe le fasi (bersaglio con ruolo noto, o ancora da comunicare)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const onScegliRuoloMimo = vi.fn()
  const giocatoriConRuoloNoto = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true },
  ]
  const { rerender } = render(
    <AzioneMimo
      giocatori={giocatoriConRuoloNoto}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['mimo', 'veggente']}
      onScegliRuoloMimo={onScegliRuoloMimo}
    />,
  )
  await user.click(screen.getByRole('button', { name: /annulla/i }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: undefined })

  const giocatoriSenzaRuoloNoto = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  rerender(
    <AzioneMimo
      giocatori={giocatoriSenzaRuoloNoto}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['mimo', 'veggente']}
      quantita={{ veggente: 1 }}
      mimoRuoloScelto={null}
      onScegliRuoloMimo={onScegliRuoloMimo}
    />,
  )
  await user.click(screen.getByRole('button', { name: /annulla/i }))
  expect(onScegliRuoloMimo).toHaveBeenCalledWith(null)
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: undefined })
})

test('se il bersaglio è la Guardia Mannara il Mimo vede "Guardia": il narratore non sa chi è', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'guardia-mannara', vivo: true },
  ]
  render(<AzioneMimo giocatori={giocatori} aggiornaGiocatore={() => {}} ruoliSelezionati={['mimo']} />)

  expect(screen.getByText(/ha assunto il ruolo di guardia\./i)).toBeInTheDocument()
})

test('cliccando di nuovo la chip del bersaglio scelto la deseleziona: toglie il legame e la carta scelta', async () => {
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
      ruoliSelezionati={['mimo']}
      mimoRuoloScelto="villico"
      onScegliRuoloMimo={onScegliRuoloMimo}
    />,
  )

  const chip = screen.getByRole('button', { name: 'Marco' })
  expect(chip).toHaveAttribute('aria-pressed', 'true')
  await user.click(chip)

  expect(onScegliRuoloMimo).toHaveBeenCalledWith(null)
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { legame: undefined })
})
