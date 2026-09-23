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
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

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
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} round={2} />)

  await user.click(screen.getByRole('button', { name: 'Piero' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ultimaIndagine: { targetId: '2', esito: 'benevola', notte: 2 } })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['accecato'] })
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

test('non permette di indagare una seconda volta nella stessa notte, evitando di sovrascrivere l\'esito', async () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [], usiNotte: ['veggente-indagine'] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(<AzioneIndagine giocatori={giocatori} aggiornaGiocatore={() => {}} round={2} />)

  expect(screen.getByText(/potere già utilizzato questa notte/i)).toBeInTheDocument()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
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
