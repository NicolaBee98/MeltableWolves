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

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['ipnotizzato'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: ['ipnotizzato'] })
})

test('senza escludiAttore, l\'attore compare tra i propri candidati (es. il Sacerdote può scegliersi come uno dei due innamorati)', () => {
  const conSacerdote = [...giocatori, { id: '4', nome: 'Piero', ruoloSlug: 'sacerdote', vivo: true, condizioni: [], usiNotte: [] }]
  render(
    <AzioneCondizioneDoppia
      giocatori={conSacerdote}
      aggiornaGiocatore={() => {}}
      condizione="innamorato"
      etichetta="Chi unire"
      ruoloSlugAttore="sacerdote"
    />,
  )
  expect(screen.getByRole('button', { name: 'Piero' })).toBeInTheDocument()
})

test('con escludiAttore, l\'attore non compare tra i propri candidati (il Pifferaio non può ipnotizzare se stesso)', () => {
  const conPifferaio = [...giocatori, { id: '4', nome: 'Piero', ruoloSlug: 'pifferaio', vivo: true, condizioni: [], usiNotte: [] }]
  render(
    <AzioneCondizioneDoppia
      giocatori={conPifferaio}
      aggiornaGiocatore={() => {}}
      condizione="ipnotizzato"
      etichetta="Chi ipnotizzare"
      ruoloSlugAttore="pifferaio"
      escludiAttore
    />,
  )
  expect(screen.queryByRole('button', { name: 'Piero' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})

test('la coppia scelta resta modificabile: le chip restano tutte cliccabili anche a coppia già completa', async () => {
  const user = userEvent.setup()
  const conPifferaioUsato = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['ipnotizzato'], note: '' },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: ['ipnotizzato'], note: '' },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '4', nome: 'Piero', ruoloSlug: 'pifferaio', vivo: true, condizioni: [], usiNotte: ['pifferaio'] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneDoppia
      giocatori={conPifferaioUsato}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="ipnotizzato"
      etichetta="Chi ipnotizzare"
      ruoloSlugAttore="pifferaio"
      escludiAttore
    />,
  )
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')

  // deseleziona Marco e sceglie Luca al suo posto
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: [] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { condizioni: ['ipnotizzato'] })
})
