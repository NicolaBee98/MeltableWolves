import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssegnaRuolo } from './AssegnaRuolo'

test('con un solo ruolo pendente, click su un giocatore lo assegna direttamente', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined }]
  render(<AssegnaRuolo ruoli={['paladino']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Steve' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'paladino', storiaRuoli: ['paladino'] })
})

test('con più ruoli pendenti, un selettore permette di scegliere quale ruolo assegnare', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined }]
  render(<AssegnaRuolo ruoli={['lupo-mannaro', 'nonna']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.selectOptions(screen.getByRole('combobox'), 'nonna')
  await user.click(screen.getByRole('button', { name: 'Steve' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'nonna', storiaRuoli: ['nonna'] })
})

test('se la variante scelta esce dalle opzioni (es. quantità esaurita), non resta selezionata: si ricade sulla prima disponibile', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined },
    { id: '2', nome: 'Anna', vivo: true, ruoloSlug: undefined },
  ]
  const { rerender } = render(
    <AssegnaRuolo ruoli={['lupo-mannaro', 'nonna']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />,
  )

  await user.selectOptions(screen.getByRole('combobox'), 'nonna')

  // "nonna" esaurisce la quantità e sparisce dalle opzioni pendenti
  rerender(<AssegnaRuolo ruoli={['lupo-mannaro']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { ruoloSlug: 'lupo-mannaro', storiaRuoli: ['lupo-mannaro'] })
})

test('non mostra giocatori già con un ruolo assegnato o morti', () => {
  const giocatori = [
    { id: '1', nome: 'Steve', vivo: true, ruoloSlug: 'veggente' },
    { id: '2', nome: 'Anna', vivo: false, ruoloSlug: undefined },
    { id: '3', nome: 'Marco', vivo: true, ruoloSlug: undefined },
  ]
  render(<AssegnaRuolo ruoli={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('button', { name: 'Steve' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test('non renderizza nulla se non ci sono ruoli da assegnare', () => {
  const { container } = render(<AssegnaRuolo ruoli={[]} giocatori={[]} aggiornaGiocatore={() => {}} />)
  expect(container).toBeEmptyDOMElement()
})
