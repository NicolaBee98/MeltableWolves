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
      ruoloSlugAttore="pifferaio"
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['ipnotizzato'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['ipnotizzato'] })
})

test('nasconde la selezione se il potere è già stato usato questa notte', () => {
  const conPifferaioUsato = [...giocatori, { id: '4', nome: 'Piero', ruoloSlug: 'pifferaio', vivo: true, condizioni: [], usiNotte: ['pifferaio'] }]
  render(
    <AzioneCondizioneDoppia
      giocatori={conPifferaioUsato}
      aggiornaGiocatore={() => {}}
      condizione="ipnotizzato"
      etichetta="Chi ipnotizzare"
      ruoloSlugAttore="pifferaio"
    />,
  )
  expect(screen.getByText(/potere già utilizzato questa notte/i)).toBeInTheDocument()
})
