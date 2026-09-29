import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NightSequencer } from './NightSequencer'
import { useNotte } from '../../state/useNotte'

function NightSequencerConNotte(props) {
  const notte = useNotte()
  return <NightSequencer {...props} {...notte} />
}

beforeEach(() => {
  localStorage.clear()
})

test('senza alcun ruolo selezionato mostra un messaggio', () => {
  render(<NightSequencerConNotte ruoliSelezionati={[]} giocatori={[]} aggiornaGiocatore={() => {}} />)
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('mostra "Torna ai giocatori" solo al primo passo della prima notte, prima di qualunque azione', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'veggente', condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  const onTornaAiGiocatori = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['veggente']}
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      onTornaAiGiocatori={onTornaAiGiocatori}
    />,
  )

  await user.click(screen.getByRole('button', { name: /torna ai giocatori/i }))
  expect(onTornaAiGiocatori).toHaveBeenCalled()
})

test('senza onTornaAiGiocatori non mostra "Torna ai giocatori"', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'veggente', condizioni: [] }]
  render(
    <NightSequencerConNotte ruoliSelezionati={['veggente']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )
  expect(screen.queryByRole('button', { name: /torna ai giocatori/i })).not.toBeInTheDocument()
})

test('una volta avanzati oltre il primo passo, "Torna ai giocatori" non è più disponibile', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'veggente', condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['veggente']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      onTornaAiGiocatori={() => {}}
    />,
  )
  expect(screen.getByRole('button', { name: /torna ai giocatori/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(screen.queryByRole('button', { name: /torna ai giocatori/i })).not.toBeInTheDocument()
})

test('un mazzo di solo Villico non mostra alcun passo: si va dritti all\'alba e Anna diventa Villico da sola', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [] }]
  const aggiornaGiocatore = vi.fn()
  render(
    <NightSequencerConNotte ruoliSelezionati={['villico']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />,
  )
  expect(screen.queryByRole('heading', { name: /assegna i ruoli rimanenti/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: "Vai all'alba" }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'villico', storiaRuoli: ['villico'] })
})

test('assegna comunque il Villico a fine notte anche quando "assegna i ruoli rimanenti" non compare mai (mazzo senza villico esplicito)', async () => {
  // scenario del bug: un mazzo di soli ruoli con passo dedicato (qui solo
  // Mimo) più più giocatori di quanti ruoli espliciti — "villico" non è mai
  // in ruoliSelezionati, quindi il passo "assegna-restanti" non esiste, ma i
  // giocatori avanzati devono comunque ricevere un ruolo a fine notte
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '3', nome: 'Elena', vivo: true, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <NightSequencerConNotte ruoliSelezionati={['mimo', 'veggente']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />,
  )

  expect(screen.queryByRole('heading', { name: /assegna i ruoli rimanenti/i })).not.toBeInTheDocument()

  while (screen.queryByRole('button', { name: 'Avanti' })) {
    await user.click(screen.getByRole('button', { name: 'Avanti' }))
  }
  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { ruoloSlug: 'villico', storiaRuoli: ['villico'] })
})

test('non forza il Villico a fine notte se un altro ruolo del mazzo non è ancora stato assegnato a nessuno (es. Spilungone)', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Elena', vivo: true, condizioni: [] }]
  const aggiornaGiocatore = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['villico', 'spilungone']}
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
    />,
  )

  await user.click(screen.getByRole('button', { name: "Vai all'alba" }))

  expect(aggiornaGiocatore).not.toHaveBeenCalledWith('1', expect.objectContaining({ ruoloSlug: 'villico' }))
})

test('mostra il primo passo e i giocatori assegnati a quel ruolo', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('heading', { name: /mimo \(sara\)/i })).toBeInTheDocument()
})

test('il pulsante Avanti passa al passo successivo', async () => {
  const user = userEvent.setup()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText('Mimo')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test('sull\'ultimo passo il pulsante diventa "Notte successiva" e fa ripartire dal primo passo con la notte incrementata', async () => {
  const user = userEvent.setup()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={[]} aggiornaGiocatore={() => {}} />)

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByText('Paladino')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Notte successiva' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(screen.getByText('Notte 2')).toBeInTheDocument()
  expect(screen.getByText('Paladino')).toBeInTheDocument()
})

test("mostra la selezione bersaglio quando il passo ha un'azione automatizzata e il titolare è vivo", () => {
  const giocatori = [
    { id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: true, condizioni: [], note: '', poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], note: '' },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})

test('non mostra la selezione bersaglio se il titolare del ruolo è morto', () => {
  const giocatori = [{ id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: false, condizioni: [], note: '', poteriUsati: [] }]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('Guaritore e Sciacallo Mannaro mostrano la selezione bersaglio anche se il titolare è morto (agiscono "anche da morti")', () => {
  const giocatori = [
    { id: '1', nome: 'Pietro', ruoloSlug: 'guaritore', vivo: false, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: false, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['guaritore']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
  expect(screen.getByText(/☠️ Pietro è morto\/a, ma agisce comunque/)).toBeInTheDocument()
})

test('con promemoriaRuoliMorti attivo, un ruolo morto con potere ricorrente mostra solo l\'avviso col teschio, niente azione vera', () => {
  const giocatori = [{ id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: false, condizioni: [], poteriUsati: [] }]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['paladino']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      promemoriaRuoliMorti
    />,
  )

  expect(screen.getByText(/☠️ chiama comunque pietro/i)).toBeInTheDocument()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Notte successiva' })).toBeInTheDocument()
})

test('con promemoriaRuoliMorti disattivo (default), un ruolo morto con potere ricorrente non compare affatto', () => {
  const giocatori = [{ id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: false, condizioni: [], poteriUsati: [] }]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('non mostra alcuna selezione bersaglio per ruoli senza automazione (5c)', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
})

test('"Notte successiva" rimuove le condizioni protetto e inibito da tutti i giocatori', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: ['protetto', 'unto'], note: '' }]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { condizioni: ['unto'] })
})

// Le conseguenze dei legami (Apprendista/Cavaliere/Figlia dei Lupi) non si
// risolvono più qui a fine notte, ma subito alla morte del bersaglio,
// tramite l'hook generico di usePartita (vedi usePartita.test.js): così
// funzionano anche se il bersaglio muore al rogo, non solo di notte.

test("mostra la selezione bersaglio per l'Apprendista alla prima notte", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'apprendista', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['apprendista']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test("mostra lo scambio per Addolorata quando c'è una vittima al rogo della notte corrente", () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 1 },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['addolorata']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('button', { name: 'Scambia' })).toBeInTheDocument()
})

test('mostra AssegnaRuolo per un passo con un ruolo non ancora assegnato', () => {
  const giocatori = [{ id: '1', nome: 'Steve', ruoloSlug: undefined, vivo: true, condizioni: [] }]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['paladino']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ paladino: 1 }}
    />,
  )
  expect(screen.getByRole('button', { name: 'Steve' })).toBeInTheDocument()
})

test('selezionare un giocatore per un ruolo e premere Avanti lo assegna (commit differito)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Steve', ruoloSlug: undefined, vivo: true, condizioni: [] },
    { id: '2', nome: 'Anna', ruoloSlug: undefined, vivo: true, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['paladino', 'veggente']}
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
      quantita={{ paladino: 1, veggente: 1 }}
    />,
  )

  // prima di selezionare nessuno, "Avanti" è bloccato
  expect(screen.getByRole('button', { name: 'Avanti' })).toBeDisabled()

  await user.click(screen.getByRole('button', { name: 'Steve' }))
  expect(screen.getByRole('button', { name: 'Avanti' })).not.toBeDisabled()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'paladino', storiaRuoli: ['paladino'] })
})

test('un ruolo a potere passivo (es. eremita) è ora assegnabile come un ruolo qualunque', () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: undefined, vivo: true, condizioni: [] }]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['eremita']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ eremita: 1 }}
    />,
  )
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})

test('"Notte successiva" registra gli annunci dell\'alba nel log', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'pastore', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const registraEvento = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['mimo']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      registraEvento={registraEvento}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(registraEvento).toHaveBeenCalledWith('Si sentono dei belati.', 'alba')
})

test('"Notte successiva" azzera usiNotte per far ripartire i poteri della notte', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Piero', ruoloSlug: 'paladino', vivo: true, condizioni: [], usiNotte: ['paladino'] }]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { usiNotte: [] })
})

test('non propone di assegnare ruoli del branco non presenti nel mazzo, e non mostra avvisi se l\'unico ruolo lupo selezionato è già assegnato', () => {
  const giocatori = [
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', nome: 'Fabio', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [] },
  ]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ 'lupo-mannaro': 2 }}
    />,
  )

  expect(screen.queryByText('Nonna')).not.toBeInTheDocument()
  expect(screen.queryByText(/seleziona ancora/i)).not.toBeInTheDocument()
})

test('blocca "Avanti" e mostra un avviso se un ruolo del mazzo non è ancora stato assegnato (e ci sono candidati)', () => {
  const giocatori = [
    { id: '1', nome: 'Steve', ruoloSlug: undefined, vivo: true, condizioni: [] },
    { id: '2', nome: 'Anna', ruoloSlug: undefined, vivo: true, condizioni: [] },
  ]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['paladino', 'veggente']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ paladino: 1, veggente: 1 }}
    />,
  )
  expect(screen.getByText(/seleziona ancora/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Avanti' })).toBeDisabled()
})

test('non blocca "Notte successiva" se non ci sono abbastanza giocatori per completare l\'assegnazione', async () => {
  const user = userEvent.setup()
  // il mazzo chiede 2 Lupi Mannari ma c'è un solo giocatore senza ruolo:
  // è impossibile completare l'assegnazione, non deve restare bloccato per sempre
  const giocatori = [{ id: '1', nome: 'Steve', ruoloSlug: undefined, vivo: true, condizioni: [] }]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ 'lupo-mannaro': 2 }}
    />,
  )
  expect(screen.getByRole('button', { name: 'Notte successiva' })).not.toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))
  // il lupo mannaro non identificato resta tale: nella notte 2 non c'è più
  // nessun passo da mostrare (nessun titolare, nulla da assegnare)
  expect(screen.getByText(/nessun ruolo con azione notturna/i)).toBeInTheDocument()
})

test('non mostra mai il pulsante Morte Improvvisa: di notte non si può dichiarare', () => {
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={[]} aggiornaGiocatore={() => {}} />)
  expect(screen.queryByRole('button', { name: /morte improvvisa/i })).not.toBeInTheDocument()
})

test('"Indietro" durante un\'azione già compiuta la annulla restando sullo stesso passo (es. il branco dopo aver sbranato)', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  const impostaGiocatori = vi.fn((nuovi) => {
    giocatori = nuovi
  })
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const props = () => ({
    ruoliSelezionati: ['paladino', 'veggente'],
    giocatori,
    aggiornaGiocatore,
    impostaGiocatori,
  })

  const { rerender } = render(<NightSequencerConNotte {...props()} />)

  // "Pietro" compare sia nel picker "chi ha questa carta" (AssegnaRuolo,
  // sempre visibile) sia tra i candidati dell'azione stessa (il Paladino può
  // proteggere anche se stesso): serve disambiguare sul gruppo giusto
  await user.click(within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Pietro' }))
  rerender(<NightSequencerConNotte {...props()} />)
  expect(giocatori.find((g) => g.id === '1').condizioni).toContain('protetto')
  expect(screen.getByRole('heading', { name: /paladino/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Indietro' }))
  rerender(<NightSequencerConNotte {...props()} />)

  const ripristinati = impostaGiocatori.mock.calls[0][0]
  expect(ripristinati.find((g) => g.id === '1').condizioni).not.toContain('protetto')
  // resta sul passo del Paladino: non è saltato al passo precedente
  expect(screen.getByRole('heading', { name: /paladino/i })).toBeInTheDocument()
})

test('"Indietro" senza azione sul passo corrente torna al passo precedente mostrando la sua azione già fatta; solo un secondo "Indietro" la annulla', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  const impostaGiocatori = vi.fn((nuovi) => {
    giocatori = nuovi
  })
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const props = () => ({
    ruoliSelezionati: ['paladino', 'veggente'],
    giocatori,
    aggiornaGiocatore,
    impostaGiocatori,
  })

  const { rerender } = render(<NightSequencerConNotte {...props()} />)

  await user.click(within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Pietro' }))
  rerender(<NightSequencerConNotte {...props()} />)

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  rerender(<NightSequencerConNotte {...props()} />)
  expect(screen.getByRole('heading', { name: /veggente/i })).toBeInTheDocument()

  // primo Indietro: torna al passo del Paladino, protetto ancora presente
  await user.click(screen.getByRole('button', { name: 'Indietro' }))
  rerender(<NightSequencerConNotte {...props()} />)
  expect(screen.getByRole('heading', { name: /paladino/i })).toBeInTheDocument()
  expect(giocatori.find((g) => g.id === '1').condizioni).toContain('protetto')

  // secondo Indietro: ora annulla anche l'azione del Paladino
  await user.click(screen.getByRole('button', { name: 'Indietro' }))
  rerender(<NightSequencerConNotte {...props()} />)
  expect(giocatori.find((g) => g.id === '1').condizioni).not.toContain('protetto')
})

test('"Notte successiva" chiama onNotteConclusa', async () => {
  const user = userEvent.setup()
  const onNotteConclusa = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['mimo']}
      giocatori={[]}
      aggiornaGiocatore={() => {}}
      onNotteConclusa={onNotteConclusa}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))

  expect(onNotteConclusa).toHaveBeenCalled()
})

test('il Mimo compare anche nel passo del ruolo che sta imitando', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', legame: { tipo: 'mimo', targetId: '2' }, vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'paladino', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('heading', { name: /paladino \(sara, marco\)/i })).toBeInTheDocument()
})

test('il Mimo non compare in un passo del ruolo che NON sta imitando', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', legame: { tipo: 'mimo', targetId: '2' }, vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
    { id: '3', nome: 'Elena', ruoloSlug: 'paladino', vivo: true, condizioni: [] },
  ]
  render(
    <NightSequencerConNotte ruoliSelezionati={['paladino', 'veggente']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )

  expect(screen.getByRole('heading', { name: /^paladino \(elena\)$/i })).toBeInTheDocument()
})

test('con la notte bloccata dal Bardo mostra il suo avviso invece dei passi, e "Vai all\'alba" conclude la notte', async () => {
  const user = userEvent.setup()
  const onNotteConclusa = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', ruoloSlug: 'bardo', vivo: true, condizioni: [], notteBloccataFinoA: 1 },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['bardo', 'veggente']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      onNotteConclusa={onNotteConclusa}
    />,
  )

  expect(screen.getByText(/questa notte non si svolge per i poteri del bardo/i)).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /veggente/i })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: "Vai all'alba" }))
  expect(onNotteConclusa).toHaveBeenCalled()
})

test("con la notte bloccata da L'Antico (non più Bardo) mostra l'avviso generico", () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], notteBloccataFinoA: 1 }]
  render(<NightSequencerConNotte ruoliSelezionati={['villico']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/il villaggio è maledetto/i)).toBeInTheDocument()
})

test("l'illustrazione a figura intera del titolare compare anche nelle notti successive alla prima", () => {
  localStorage.setItem('meltable-wolves-notte', JSON.stringify({ round: 2, stepIndex: 0 }))
  const giocatori = [{ id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: true, condizioni: [], poteriUsati: [] }]
  const { container } = render(
    <NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )

  expect(screen.getByText('Notte 2')).toBeInTheDocument()
  const illustrazioni = container.querySelectorAll('img.night-sequencer__illustrazione')
  expect(illustrazioni).toHaveLength(1)
  expect(illustrazioni[0].src).toContain('Paladino.svg')
})

test('"Il branco si riconosce" non mostra mai chip selezionabili: ogni Lupo Mannaro è già stato assegnato nei passi precedenti', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Elsa', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByRole('heading', { name: /il branco si riconosce/i })).toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Chi ha questa carta' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Dario' })).not.toBeInTheDocument()
})

test('quando si sveglia il branco compaiono le illustrazioni di tutti i lupi coinvolti, una per ciascuno', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Elsa', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '3', nome: 'Gino', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro', 'cucciolo-di-lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
    />,
  )

  // primo passo: il Cucciolo si identifica da solo; il secondo assegna i
  // Lupi Mannari "generici"; il terzo è "il branco si riconosce"
  // collettivamente, dove tutti e tre compaiono insieme
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByRole('heading', { name: /il branco si riconosce/i })).toBeInTheDocument()

  const illustrazioni = container.querySelectorAll('img.night-sequencer__illustrazione')
  expect(illustrazioni).toHaveLength(3)
  const src = [...illustrazioni].map((img) => img.src)
  expect(src.some((s) => s.includes('Lupo_Mannaro_1.svg'))).toBe(true)
  expect(src.some((s) => s.includes('Lupo_Mannaro_2.svg'))).toBe(true)
  expect(src.some((s) => s.includes('Cucciolo_di_Lupo_Mannaro.svg'))).toBe(true)
})

test('quando il Mimo imita un ruolo che agisce, compaiono sia la sua illustrazione sia quella del ruolo imitato', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'veggente', vivo: true, condizioni: [], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte ruoliSelezionati={['veggente']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )

  const illustrazioni = container.querySelectorAll('img.night-sequencer__illustrazione')
  const src = [...illustrazioni].map((img) => img.src)
  expect(src.some((s) => s.includes('Mimo.svg'))).toBe(true)
  expect(src.filter((s) => s.includes('Veggente.svg'))).toHaveLength(2)
})

test('la Fattucchiera blocca il potere del bersaglio inibito: nessuna azione mostrata', () => {
  const giocatori = [
    { id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: true, condizioni: ['inibito'], poteriUsati: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/il potere è inibito questa notte dalla fattucchiera/i)).toBeInTheDocument()
  // "chi ha questa carta" (AssegnaRuolo) resta visibile: solo l'azione vera
  // e propria ("chi proteggere") è nascosta dall'inibizione
  expect(screen.queryByRole('group', { name: 'Chi proteggere' })).not.toBeInTheDocument()
})

test('senza inibizione il potere resta disponibile normalmente', () => {
  const giocatori = [
    { id: '1', nome: 'Pietro', ruoloSlug: 'paladino', vivo: true, condizioni: [], poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByText(/inibito/i)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})

test('durante l\'assegnazione del ruolo (chi ha questa carta) non compare la riga di illustrazioni separata (niente doppione con AssegnaRuolo)', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [] }]
  const { container } = render(
    <NightSequencerConNotte ruoliSelezionati={['ladro']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )

  expect(container.querySelector('.night-sequencer__illustrazioni')).not.toBeInTheDocument()
  expect(container.querySelector('.assegna-ruolo__illustrazione')).toBeInTheDocument()
})

test('un titolare morto non compare nella riga di illustrazioni (solo i vivi)', () => {
  const giocatori = [
    { id: '1', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: false, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Elsa', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte ruoliSelezionati={['lupo-mannaro']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )

  const illustrazioni = container.querySelectorAll('img.night-sequencer__illustrazione')
  expect(illustrazioni).toHaveLength(1)
})

test('"Indietro" annulla in un colpo solo TUTTE le modifiche fatte nel passo corrente, non una alla volta (es. Ladro: più campi cambiati in sequenza)', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  const impostaGiocatori = vi.fn((nuovi) => {
    giocatori = nuovi
  })
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const props = () => ({
    ruoliSelezionati: ['ladro', 'veggente', 'paladino'],
    giocatori,
    aggiornaGiocatore,
    impostaGiocatori,
  })

  const { rerender } = render(<NightSequencerConNotte {...props()} />)
  function rr() {
    rerender(<NightSequencerConNotte {...props()} />)
  }

  // 1) assegna l'identità del Ladro ad Anna (pending -> commit al primo campo toccato sotto)
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  rr()
  // 2) imposta entrambe le carte di scarto (due modifiche separate)
  await user.selectOptions(screen.getAllByRole('combobox')[0], 'veggente')
  rr()
  await user.selectOptions(screen.getAllByRole('combobox')[1], 'paladino')
  rr()
  // 3) sceglie la carta finale (altra modifica)
  await user.click(screen.getByRole('button', { name: 'Veggente' }))
  rr()
  expect(giocatori.find((g) => g.id === '1').ruoloSlug).toBe('veggente')

  // un solo "Indietro" deve annullare TUTTO quello fatto sul passo del Ladro,
  // non solo l'ultimo click
  await user.click(screen.getByRole('button', { name: 'Indietro' }))
  rr()

  const ripristinati = impostaGiocatori.mock.calls.at(-1)[0]
  expect(ripristinati.find((g) => g.id === '1').ruoloSlug).toBeUndefined()
  expect(screen.getByRole('heading', { name: /ladro/i })).toBeInTheDocument()
})

test('Guardia e Guardia Mannara: assegnando le tre guardie insieme, l\'app sceglie da sola (a caso) chi tradisce', async () => {
  const user = userEvent.setup()
  let giocatori = [
    { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    { id: '3', nome: 'Luca', vivo: true, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  const props = () => ({
    ruoliSelezionati: ['guardia', 'guardia-mannara'],
    giocatori,
    aggiornaGiocatore,
    quantita: { guardia: 2, 'guardia-mannara': 1 },
  })

  const { rerender } = render(<NightSequencerConNotte {...props()} />)

  expect(screen.queryByText(/che ruolo mostra la carta/i)).not.toBeInTheDocument()

  for (const nome of ['Anna', 'Marco', 'Luca']) {
    await user.click(screen.getByRole('button', { name: nome }))
    rerender(<NightSequencerConNotte {...props()} />)
  }

  await user.click(screen.getByRole('button', { name: 'Notte successiva' }))
  rerender(<NightSequencerConNotte {...props()} />)

  const ruoli = giocatori.map((g) => g.ruoloSlug).sort()
  expect(ruoli).toEqual(['guardia', 'guardia', 'guardia-mannara'])
})
