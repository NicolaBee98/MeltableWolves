import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AzioneLadro } from './AzioneLadro'

test('chiede le due carte di scarto tra i ruoli del mazzo, non ancora la scelta del Ladro', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [] }]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={{ ladro: 1, veggente: 1, paladino: 1 }}
    />,
  )
  expect(screen.getByText(/quali due carte sono rimaste fuori/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Resta Villico' })).not.toBeInTheDocument()
  const [select1] = screen.getAllByRole('combobox')
  const opzioni = Array.from(select1.options).map((o) => o.value)
  expect(opzioni).toContain('veggente')
  expect(opzioni).not.toContain('ladro') // il ladro non scarta se stesso
})

test('impostate le due carte, propone la scelta del Ladro e "Resta Villico" se non sono entrambe lupi', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'paladino'] },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={{ ladro: 1, veggente: 1, paladino: 1 }}
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

test('scegliendo una delle due carte, la carta non scelta viene tolta dal mazzo (quantita -1)', async () => {
  const user = userEvent.setup()
  const onCambiaQuantita = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], scartoLadro: ['veggente', 'paladino'] },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={{ ladro: 1, veggente: 1, paladino: 1 }}
      onCambiaQuantita={onCambiaQuantita}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Veggente' }))

  expect(onCambiaQuantita).toHaveBeenCalledWith('paladino', 0)
  expect(onCambiaQuantita).not.toHaveBeenCalledWith('veggente', expect.anything())
})

test('restando Villico, entrambe le carte vengono tolte dal mazzo', async () => {
  const user = userEvent.setup()
  const onCambiaQuantita = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], scartoLadro: ['veggente', 'paladino'] },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={{ ladro: 1, veggente: 1, paladino: 1 }}
      onCambiaQuantita={onCambiaQuantita}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Resta Villico' }))

  expect(onCambiaQuantita).toHaveBeenCalledWith('veggente', 0)
  expect(onCambiaQuantita).toHaveBeenCalledWith('paladino', 0)
})

test('se entrambe le carte sono Lupi Mannari non propone "Resta Villico" (scambio obbligato)', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], scartoLadro: ['lupo-mannaro', 'lupo-mannaro-capobranco'] },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['ladro', 'lupo-mannaro', 'lupo-mannaro-capobranco']}
      quantita={{ ladro: 1, 'lupo-mannaro': 2, 'lupo-mannaro-capobranco': 1 }}
    />,
  )
  expect(screen.queryByRole('button', { name: 'Resta Villico' })).not.toBeInTheDocument()
})

test('un ruolo già assegnato a un altro giocatore (es. dal Mimo) non compare tra le carte scartabili', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, storiaRuoli: ['veggente'] },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={{ ladro: 1, veggente: 1, paladino: 1 }}
    />,
  )
  const [select1] = screen.getAllByRole('combobox')
  const opzioni = Array.from(select1.options).map((o) => o.value)
  expect(opzioni).not.toContain('veggente')
  expect(opzioni).toContain('paladino')
})

test('la carta già scelta nel primo select non è più selezionabile nel secondo (niente doppioni)', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], scartoLadro: ['veggente'] },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={{ ladro: 1, veggente: 1, paladino: 1 }}
    />,
  )
  const [select1, select2] = screen.getAllByRole('combobox')
  expect(Array.from(select1.options).map((o) => o.value)).toContain('veggente')
  expect(Array.from(select2.options).map((o) => o.value)).not.toContain('veggente')
})

test('se il Mimo sta imitando il Ladro (stesso ruoloSlug), la scelta finale si scrive su entrambi, non solo sul primo trovato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], storiaRuoli: ['mimo', 'ladro'], legame: { tipo: 'mimo', targetId: '2' }, scartoLadro: ['veggente', 'paladino'] },
    { id: '2', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'paladino'] },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={{ ladro: 1, veggente: 1, paladino: 1 }}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Resta Villico' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ruoloSlug: 'villico',
    storiaRuoli: ['mimo', 'ladro', 'villico'],
    poteriUsati: ['ladro-scelta'],
  })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', {
    ruoloSlug: 'villico',
    storiaRuoli: ['ladro', 'villico'],
    poteriUsati: ['ladro-scelta'],
  })
})

test('con il potere già usato mostra solo il messaggio', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: ['ladro-scelta'] }]
  render(<AzioneLadro giocatori={giocatori} aggiornaGiocatore={() => {}} ruoliSelezionati={['ladro']} />)
  expect(screen.getByText(/il ladro ha già scelto/i)).toBeInTheDocument()
})
