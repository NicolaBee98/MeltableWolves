import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneLadro } from './AzioneLadro'

test('senza le due carte di scarto impostate mostra un avviso e nessuna scelta', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [] }]
  render(<AzioneLadro giocatori={giocatori} aggiornaGiocatore={() => {}} scartoLadro={[]} />)
  expect(screen.getByText(/imposta le due carte di scarto/i)).toBeInTheDocument()
})

test('propone le due carte di scarto e "Resta Villico" se non sono entrambe lupi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], storiaRuoli: ['ladro'] }]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      scartoLadro={['veggente', 'paladino']}
    />,
  )

  expect(screen.getByText(/veggente e paladino/i)).toBeInTheDocument()
  const restaVillico = screen.getByRole('button', { name: 'Resta Villico' })
  expect(restaVillico).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Veggente' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ruoloSlug: 'veggente',
    storiaRuoli: ['ladro', 'veggente'],
    poteriUsati: ['ladro-scelta'],
  })
})

test('se entrambe le carte sono Lupi Mannari non propone "Resta Villico" (scambio obbligato)', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [] }]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      scartoLadro={['lupo-mannaro', 'lupo-mannaro-capobranco']}
    />,
  )
  expect(screen.queryByRole('button', { name: 'Resta Villico' })).not.toBeInTheDocument()
})

test('con il potere già usato mostra solo il messaggio', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: ['ladro-scelta'] }]
  render(<AzioneLadro giocatori={giocatori} aggiornaGiocatore={() => {}} scartoLadro={['veggente', 'paladino']} />)
  expect(screen.getByText(/il ladro ha già scelto/i)).toBeInTheDocument()
})
