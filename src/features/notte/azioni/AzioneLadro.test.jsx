import { render, screen, within } from '@testing-library/react'
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

test('se il Mimo imita il Ladro sceglie dopo di lui, tra le carte rimaste: la scelta del Ladro non tocca il Mimo', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], storiaRuoli: ['mimo', 'ladro'], legame: { tipo: 'mimo', targetId: '2' }, scartoLadro: ['veggente', 'paladino'] },
    { id: '2', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'paladino'] },
  ]
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const props = { aggiornaGiocatore, ruoliSelezionati: ['ladro', 'veggente', 'paladino'], quantita: { ladro: 1, veggente: 1, paladino: 1 } }
  const { rerender } = render(<AzioneLadro giocatori={giocatori} {...props} />)

  // prima il Ladro vero (Anna): il Mimo non ha ancora la sua scelta
  expect(screen.queryByRole('group', { name: 'Cosa sceglie il Mimo' })).not.toBeInTheDocument()
  await user.click(within(screen.getByRole('group', { name: 'Cosa sceglie il Ladro' })).getByRole('button', { name: 'Veggente' }))
  expect(giocatori[1]).toMatchObject({ ruoloSlug: 'veggente', storiaRuoli: ['ladro', 'veggente'] })
  expect(giocatori[0].ruoloSlug).toBe('ladro')

  // poi il Mimo: solo la carta rimasta (Paladino) o Villico
  rerender(<AzioneLadro giocatori={giocatori} {...props} />)
  const gruppoMimo = screen.getByRole('group', { name: 'Cosa sceglie il Mimo' })
  expect(within(gruppoMimo).queryByRole('button', { name: 'Veggente' })).not.toBeInTheDocument()
  await user.click(within(gruppoMimo).getByRole('button', { name: 'Paladino' }))
  expect(giocatori[0]).toMatchObject({ ruoloSlug: 'paladino', storiaRuoli: ['mimo', 'ladro', 'paladino'] })
  expect(giocatori[1].ruoloSlug).toBe('veggente')
})

test('la scelta del Ladro resta modificabile finché non si preme Avanti: cambiare carta rimette in mazzo quella scartata prima', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const onCambiaQuantita = vi.fn((slug, valore) => {
    quantita = { ...quantita, [slug]: valore }
  })
  let quantita = { ladro: 1, veggente: 1, paladino: 1 }
  let giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'paladino'] },
  ]
  const { rerender } = render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={quantita}
      onCambiaQuantita={onCambiaQuantita}
    />,
  )
  const rrender = () =>
    rerender(
      <AzioneLadro
        giocatori={giocatori}
        aggiornaGiocatore={aggiornaGiocatore}
        ruoliSelezionati={['ladro', 'veggente', 'paladino']}
        quantita={quantita}
        onCambiaQuantita={onCambiaQuantita}
      />,
    )

  await user.click(screen.getByRole('button', { name: 'Veggente' }))
  rrender()

  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('veggente')
  expect(quantita.paladino).toBe(0)
  expect(screen.getByRole('button', { name: 'Veggente' })).toHaveAttribute('aria-pressed', 'true')
  // niente messaggio bloccante: resta tutto interattivo
  expect(screen.queryByText(/il ladro ha già scelto/i)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Paladino' }))
  rrender()

  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('paladino')
  expect(giocatori.find((g) => g.id === '1').storiaRuoli).toEqual(['ladro', 'paladino'])
  expect(giocatori.find((g) => g.id === '1').poteriUsati).toEqual(['ladro-scelta'])
  // ora si scarta veggente (la carta non scelta), paladino torna in mazzo
  // (è la carta che il Ladro ha scelto di diventare, non più quella scartata)
  expect(quantita.veggente).toBe(0)
  expect(quantita.paladino).toBe(1)
})

test('con la scelta già fatta (es. dopo un refresh a metà passo) la mostra e resta modificabile, mai "già scelto"', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    {
      id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, poteriUsati: ['ladro-scelta'],
      storiaRuoli: ['ladro', 'veggente'], scartoLadro: ['veggente', 'paladino'],
    },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['ladro', 'veggente', 'paladino']}
      quantita={{ veggente: 1, paladino: 0 }}
    />,
  )
  expect(screen.queryByText(/il ladro ha già scelto/i)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Veggente' })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Veggente' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', expect.objectContaining({ ruoloSlug: 'ladro', poteriUsati: [] }))
})

test('le carte candidate sono i ruoli fisici nel mazzo con quantità residua: Villico incluso, Borgomastro escluso, ruolo a quantità 0 escluso', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [] }]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['ladro', 'villico', 'borgomastro', 'veggente', 'paladino']}
      quantita={{ ladro: 1, villico: 3, borgomastro: 1, veggente: 1, paladino: 0 }}
    />,
  )
  const [select1] = screen.getAllByRole('combobox')
  const opzioni = Array.from(select1.options).map((o) => o.value)
  expect(opzioni).toContain('villico')
  expect(opzioni).toContain('veggente')
  expect(opzioni).not.toContain('borgomastro')
  expect(opzioni).not.toContain('paladino')
})

test('Gallo e Mucca non sono lupi veri: "Resta Villico" resta disponibile', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [], scartoLadro: ['gallo', 'mucca'] },
  ]
  render(
    <AzioneLadro
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      ruoliSelezionati={['ladro', 'gallo', 'mucca']}
      quantita={{ ladro: 1, gallo: 1, mucca: 1 }}
    />,
  )
  expect(screen.getByRole('button', { name: 'Resta Villico' })).toBeInTheDocument()
})

test('cliccando di nuovo la carta scelta si deseleziona: identità, storiaRuoli, poteriUsati e quantità tornano com\'erano', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const onCambiaQuantita = vi.fn()
  const props = {
    aggiornaGiocatore,
    onCambiaQuantita,
    ruoliSelezionati: ['ladro', 'veggente', 'paladino'],
  }
  const scelto = {
    id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, poteriUsati: [],
    storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'paladino'],
  }
  const { rerender } = render(
    <AzioneLadro {...props} giocatori={[scelto]} quantita={{ ladro: 1, veggente: 1, paladino: 1 }} />,
  )
  // il Ladro ha scelto Veggente: Paladino scartato (quantità 0)
  rerender(
    <AzioneLadro
      {...props}
      giocatori={[{ ...scelto, ruoloSlug: 'veggente', poteriUsati: ['ladro-scelta'], storiaRuoli: ['ladro', 'veggente'] }]}
      quantita={{ ladro: 1, veggente: 1, paladino: 0 }}
    />,
  )
  await user.click(screen.getByRole('button', { name: 'Veggente' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'ladro', storiaRuoli: ['ladro'], poteriUsati: [] })
  expect(onCambiaQuantita).toHaveBeenCalledWith('paladino', 1)
})

test('senza un Mimo che imita il Ladro non compare "Cosa sceglie il Mimo" (nemmeno con un secondo Ladro)', () => {
  const scelto = { poteriUsati: ['ladro-scelta'], storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'paladino'] }
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, ...scelto },
    { id: '2', nome: 'Bob', ruoloSlug: 'paladino', vivo: true, ...scelto },
  ]
  render(
    <AzioneLadro giocatori={giocatori} aggiornaGiocatore={() => {}} ruoliSelezionati={['ladro', 'veggente', 'paladino']} quantita={{ ladro: 2 }} />,
  )
  expect(screen.queryByRole('group', { name: 'Cosa sceglie il Mimo' })).not.toBeInTheDocument()
  expect(screen.queryByText(/Mimo, imita il Ladro/)).not.toBeInTheDocument()
})
