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

test('se il bersaglio ha già un ruolo noto, il Mimo lo assume senza dover chiedere nulla, senza pulsante "Annulla" (si deseleziona con la chip)', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true },
  ]
  render(<AzioneMimo giocatori={giocatori} aggiornaGiocatore={() => {}} ruoliSelezionati={['mimo', 'veggente']} />)

  expect(screen.getByText(/il mimo imita marco: ha assunto il ruolo di veggente/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /annulla/i })).not.toBeInTheDocument()
})

test('cliccare di nuovo la chip del bersaglio toglie il legame, in entrambe le fasi (bersaglio con ruolo noto, o ancora da comunicare)', async () => {
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
  await user.click(screen.getByRole('button', { name: 'Marco', pressed: true }))
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
  await user.click(screen.getByRole('button', { name: 'Marco', pressed: true }))
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

test('propone anche Boia, Alchimista, Scemo, Innocente, Suocera e Guardia Mannara, ma mai Mimo, Borgomastro e Fantasma Onnisciente', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true },
  ]
  const ruoli = ['mimo', 'boia', 'alchimista', 'scemo-del-villaggio', 'innocente', 'suocera', 'guardia-mannara', 'borgomastro', 'fantasma-onnisciente']
  render(<AzioneMimo giocatori={giocatori} aggiornaGiocatore={() => {}} ruoliSelezionati={ruoli} quantita={{}} />)

  for (const nome of ['Boia', 'Alchimista', 'Scemo del Villaggio', 'Innocente', 'Suocera', 'Guardia Mannara']) {
    expect(screen.getByRole('button', { name: nome })).toBeInTheDocument()
  }
  for (const nome of ['Mimo', 'Borgomastro', 'Fantasma Onnisciente']) {
    expect(screen.queryByRole('button', { name: nome })).not.toBeInTheDocument()
  }
})

test('cambiare bersaglio azzera la carta già scelta (non si trascina al nuovo bersaglio)', async () => {
  const user = userEvent.setup()
  const onScegliRuoloMimo = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true },
    { id: '3', nome: 'Nina', vivo: true },
  ]
  render(
    <AzioneMimo
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['mimo', 'veggente']}
      quantita={{ veggente: 1 }}
      mimoRuoloScelto="veggente"
      onScegliRuoloMimo={onScegliRuoloMimo}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Nina' }))

  expect(onScegliRuoloMimo).toHaveBeenCalledWith(null)
})
