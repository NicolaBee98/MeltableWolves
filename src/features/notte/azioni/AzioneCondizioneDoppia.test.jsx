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

test('la coppia scelta in questa sessione resta modificabile: cambiare un membro sposta la condizione', async () => {
  const user = userEvent.setup()
  const giocatoriBase = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '4', nome: 'Piero', ruoloSlug: 'pifferaio', vivo: true, condizioni: [], usiNotte: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneDoppia
      giocatori={giocatoriBase}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="ipnotizzato"
      etichetta="Chi ipnotizzare"
      ruoloSlugAttore="pifferaio"
      escludiAttore
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  // deseleziona Marco e sceglie Luca al suo posto
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: [] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { condizioni: ['ipnotizzato'] })
})

test('il Pifferaio (ipnotizzato è cumulativo tra notti): scegliere una nuova coppia non toglie la condizione a chi era già ipnotizzato da notti precedenti', async () => {
  const user = userEvent.setup()
  const giaIpnotizzati = [
    { id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['ipnotizzato'], note: '' },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: ['ipnotizzato'], note: '' },
    { id: '3', nome: 'Luca', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '5', nome: 'Sara', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    { id: '4', nome: 'Piero', ruoloSlug: 'pifferaio', vivo: true, condizioni: [], usiNotte: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneDoppia
      giocatori={giaIpnotizzati}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="ipnotizzato"
      etichetta="Chi ipnotizzare"
      ruoloSlugAttore="pifferaio"
      escludiAttore
      escludiGiaCondizionati
    />,
  )
  // chi è già ipnotizzato non è più un candidato (voce 16)
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Marco' })).not.toBeInTheDocument()
  // niente chip pre-selezionata per chi era già ipnotizzato da prima: la
  // scelta di stanotte è indipendente da quella delle notti precedenti
  expect(screen.getByRole('button', { name: 'Luca' })).toHaveAttribute('aria-pressed', 'false')

  await user.click(screen.getByRole('button', { name: 'Luca' }))
  await user.click(screen.getByRole('button', { name: 'Sara' }))

  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('1', expect.anything())
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('2', expect.anything())
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { condizioni: ['ipnotizzato'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('5', { condizioni: ['ipnotizzato'] })
})

test('deselezionare uno dei due dopo la conferma toglie la condizione a chi era nella coppia (stato e UI allineati)', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneDoppia
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="innamorato"
      etichetta="Chi unire"
      ruoloSlugAttore="sacerdote"
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: [] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: [] })
})

test('dopo un ricaricamento a metà passo la coppia del Sacerdote è ricostruita (chip selezionate) e si può sciogliere', async () => {
  const user = userEvent.setup()
  const ingresso = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [], innamoratiCon: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [], innamoratiCon: [] },
    { id: '3', nome: 'Piero', ruoloSlug: 'sacerdote', vivo: true, condizioni: [], usiNotte: [] },
  ]
  const ora = [
    { ...ingresso[0], condizioni: ['innamorato'], innamoratiCon: ['2'] },
    { ...ingresso[1], condizioni: ['innamorato'], innamoratiCon: ['1'] },
    { ...ingresso[2], usiNotte: ['sacerdote'], sceltaNotte: { innamorato: ['1', '2'] } },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneDoppia
      giocatori={ora}
      giocatoriIngresso={ingresso}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="innamorato"
      etichetta="Chi unire"
      ruoloSlugAttore="sacerdote"
      attoreId="3"
    />,
  )
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Anna' }))
  // la coppia è sciolta: niente innamorati rimasti da una scelta di cui la UI non sapeva nulla
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: [] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: [] })
})

test('dopo un ricaricamento a metà passo i due ipnotizzati di questa notte sono ricostruiti, quelli di prima restano', async () => {
  const user = userEvent.setup()
  const ingresso = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: ['ipnotizzato'] }, // di una notte precedente
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const ora = [ingresso[0], { ...ingresso[1], condizioni: ['ipnotizzato'] }, { ...ingresso[2], condizioni: ['ipnotizzato'] }]
  const aggiornaGiocatore = vi.fn()
  render(
    <AzioneCondizioneDoppia
      giocatori={ora}
      giocatoriIngresso={ingresso}
      aggiornaGiocatore={aggiornaGiocatore}
      condizione="ipnotizzato"
      etichetta="Chi ipnotizzare"
      ruoloSlugAttore="pifferaio"
    />,
  )
  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', { condizioni: [] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { condizioni: [] })
  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('1', expect.anything())
})

test('Sacerdote con coppia incompleta: avviso non bloccante, sparisce a coppia completa', async () => {
  const user = userEvent.setup()
  render(
    <AzioneCondizioneDoppia
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      condizione="innamorato"
      etichetta="Chi unire"
      ruoloSlugAttore="sacerdote"
    />,
  )
  expect(screen.getByText(/coppia completa/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  expect(screen.getByText(/coppia completa/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  expect(screen.queryByText(/coppia completa/)).not.toBeInTheDocument()
})

test('Pifferaio + Mimo-Pifferaio: una sola scelta di due ipnotizzati in totale, nessuno dei due titolari è candidato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const gruppo = [
    { id: 'p', nome: 'Piero', ruoloSlug: 'pifferaio', vivo: true, condizioni: [], usiNotte: [] },
    { id: 'm', nome: 'Mia', ruoloSlug: 'pifferaio', vivo: true, condizioni: [], usiNotte: [], legame: { tipo: 'mimo', targetId: 'p' } },
    ...giocatori,
  ]
  render(
    <AzioneCondizioneDoppia giocatori={gruppo} aggiornaGiocatore={aggiornaGiocatore} condizione="ipnotizzato" etichetta="Chi ipnotizzare" ruoloSlugAttore="pifferaio" escludiAttore escludiGiaCondizionati />,
  )
  expect(screen.getAllByRole('group')).toHaveLength(1)
  expect(screen.queryByRole('button', { name: 'Mia' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Marco' }))
  await user.click(screen.getByRole('button', { name: 'Luca' }))
  expect(screen.getByText(/al massimo 2/)).toBeInTheDocument()
  expect(aggiornaGiocatore).toHaveBeenCalledWith('p', { usiNotte: ['pifferaio'] })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('m', { usiNotte: ['pifferaio'] })
})

describe('Pifferaio con meno di due bersagli non ipnotizzati', () => {
  const piff = { id: 'p', nome: 'Piero', ruoloSlug: 'pifferaio', vivo: true, condizioni: [], usiNotte: [] }
  const ipno = (id, nome) => ({ id, nome, ruoloSlug: 'villico', vivo: true, condizioni: ['ipnotizzato'] })
  const monta = (gruppo, aggiornaGiocatore) =>
    render(
      <AzioneCondizioneDoppia giocatori={gruppo} aggiornaGiocatore={aggiornaGiocatore} condizione="ipnotizzato" etichetta="Chi ipnotizzare" ruoloSlugAttore="pifferaio" escludiAttore escludiGiaCondizionati />,
    )

  test('con un solo non ipnotizzato rimasto lo si ipnotizza da solo', async () => {
    const user = userEvent.setup()
    const aggiornaGiocatore = vi.fn()
    monta([piff, ipno('1', 'Anna'), ipno('2', 'Bea'), { id: '3', nome: 'Carlo', ruoloSlug: 'villico', vivo: true, condizioni: [] }], aggiornaGiocatore)

    await user.click(screen.getByRole('button', { name: 'Carlo' }))

    expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { condizioni: ['ipnotizzato'] })
    expect(screen.queryByText(/servono almeno due/i)).not.toBeInTheDocument()
  })

  test('senza bersagli il passo è informativo', () => {
    monta([piff, ipno('1', 'Anna')], vi.fn())
    expect(screen.getByText(/nessun giocatore da ipnotizzare/i)).toBeInTheDocument()
  })
})
