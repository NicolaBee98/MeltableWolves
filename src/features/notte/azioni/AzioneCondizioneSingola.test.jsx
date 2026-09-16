import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneCondizioneSingola } from './AzioneCondizioneSingola'

const giocatori = [
  { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], note: '' },
]

test('conferma applica la condizione al bersaglio scelto', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneSingola
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="unto"
      etichetta="Chi ungere"
    />,
  )

  await user.selectOptions(screen.getByRole('combobox'), '2')
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['unto'] })
})

test('mostra solo i giocatori vivi come candidati', () => {
  const conMorto = [...giocatori, { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: false, condizioni: [], note: '' }]
  render(
    <AzioneCondizioneSingola giocatori={conMorto} aggiornaGiocatore={() => {}} condizione="unto" etichetta="Chi ungere" />,
  )
  expect(screen.queryByText('Luca')).not.toBeInTheDocument()
})
