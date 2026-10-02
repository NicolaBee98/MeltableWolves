import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneIndagine } from './AzioneIndagine'

test('indagare un bersaglio con aura malvagia registra esito malvagia', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={3} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 3 } })
})

test('indagare un bersaglio con aura benevola registra esito benevola', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'paladino', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={1} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 1 } })
})

test('un veggente accecato percepisce sempre aura benevola', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: ['accecato'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} puoEssereAccecato />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 2 } })
})

test('Veggente Mannaro: legge l\'aura come il Veggente ma su un attore diverso', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'veggente-mannaro', vivo: true, condizioni: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneIndagine
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      round={1}
      ruoloSlugAttore="veggente-mannaro"
      etichettaAttore="Veggente Mannaro"
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 1 } })
})

test('indagare il Polpo Mannaro con il Veggente Mannaro non lo acceca (l\'accecamento riguarda solo il Veggente)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Ivo', ruoloSlug: 'veggente-mannaro', vivo: true, condizioni: [] },
    { id: '2', nome: 'Piero', ruoloSlug: 'polpo-mannaro', vivo: true, condizioni: [] },
  ]
  render(
    <AzioneIndagine
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      round={1}
      ruoloSlugAttore="veggente-mannaro"
      etichettaAttore="Veggente Mannaro"
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Piero' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 1 } })
})

test('indagare il Polpo Mannaro acceca il Veggente (in aggiunta a registrare l\'esito)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Piero', ruoloSlug: 'polpo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} puoEssereAccecato />)

  await user.click(screen.getByRole('button', { name: 'Piero' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 2 } })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['accecato'] })
})

test('l\'accecamento da Polpo Mannaro resta modificabile finché non si preme Avanti: ripensare il bersaglio lo annulla di nuovo', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Piero', ruoloSlug: 'polpo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const { rerender } = render(
    <AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} puoEssereAccecato />,
  )
  const rrender = () =>
    rerender(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} puoEssereAccecato />)

  await user.click(screen.getByRole('button', { name: 'Piero' }))
  rrender()
  expect(giocatori.find((g) => g.id === '1').condizioni).toContain('accecato')

  // ripensa il bersaglio: l'accecamento appena provocato va tolto di nuovo,
  // e l'esito del nuovo bersaglio riflette la sua vera aura (non "benevola"
  // forzata da un accecamento che non doveva ancora valere)
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  rrender()
  expect(giocatori.find((g) => g.id === '1').condizioni).not.toContain('accecato')
  expect(giocatori.find((g) => g.id === '1').ultimaIndagine).toEqual({ targetId: '3', esito: 'malvagia', notte: 2 })
})

test('se il Mimo condivide questo ruoloSlug (due giocatori "veggente"), l\'esito si sincronizza su entrambi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Sara', ruoloSlug: 'veggente', vivo: true, condizioni: [], legame: { tipo: 'mimo', targetId: '1' } },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  const esito = { ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 2 } }
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', esito)
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', esito)
})

test('il potere usato senza indagine registrata per questa notte non mostra nessun esito, ma le chip restano cliccabili', async () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [], usiNotte: ['veggente-indagine'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)

  // niente indagine registrata per QUESTA notte (round 2): nessuna chip
  // marcata con un esito. Le chip restano comunque cliccabili (non
  // disabilitate): il narratore può correggere la scelta finché non preme
  // "Avanti", vedi principio generale in NightSequencer.
  expect(screen.getByRole('button', { name: 'Marco' })).not.toBeDisabled()
  expect(screen.queryByText(/aura/i)).not.toBeInTheDocument()
})

test('dopo la conferma mostra subito il responso da dare al Veggente (aura malvagia)', () => {
  const giocatori = [
    {
      id: '1',
      nome: 'Anna',
      ruoloSlug: 'veggente',
      vivo: true,
      condizioni: [],
      usiNotte: ['veggente-indagine'],
      ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 3 },
    },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={() => {}} round={3} />)

  expect(screen.getByText(/aura malvagia/i)).toBeInTheDocument()
})

test('la chip del bersaglio indagato è colorata secondo l\'esito (azzurra benevola, rossa malvagia), le altre no', () => {
  const giocatori = [
    {
      id: '1',
      nome: 'Anna',
      ruoloSlug: 'veggente',
      vivo: true,
      condizioni: [],
      usiNotte: ['veggente-indagine'],
      ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 3 },
    },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={() => {}} round={3} />)

  expect(screen.getByRole('button', { name: 'Marco' })).toHaveClass('chip--malvagia')
  expect(screen.getByRole('button', { name: 'Luca' })).not.toHaveClass('chip--malvagia', 'chip--benevola')
})

test('non mostra il responso di una notte precedente', () => {
  const giocatori = [
    {
      id: '1',
      nome: 'Anna',
      ruoloSlug: 'veggente',
      vivo: true,
      condizioni: [],
      usiNotte: ['veggente-indagine'],
      ultimaIndagine: { targetId: '2', esito: 'malvagia', notte: 1 },
    },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)

  expect(screen.queryByText(/aura malvagia/i)).not.toBeInTheDocument()
})

test('cliccando di nuovo il bersaglio già indagato si annulla: via ultimaIndagine e uso della notte', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [], usiNotte: ['veggente-indagine'], ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 1 } },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={1} />)
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: undefined })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { usiNotte: [] })
})
