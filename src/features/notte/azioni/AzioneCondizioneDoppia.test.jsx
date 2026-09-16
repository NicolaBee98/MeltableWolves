import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneCondizioneDoppia } from './AzioneCondizioneDoppia'

const giocatori = [
  { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
]

test('conferma applica la condizione a entrambi i bersagli scelti', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneDoppia
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="ipnotizzato"
      etichetta="Chi ipnotizzare"
    />,
  )

  await user.click(screen.getByRole('checkbox', { name: 'Anna' }))
  await user.click(screen.getByRole('checkbox', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['ipnotizzato'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['ipnotizzato'] })
})
