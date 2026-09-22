import { render, screen } from '@testing-library/react'
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

test('un mazzo di solo Villico mostra comunque il passo per assegnarlo ai giocatori', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, condizioni: [] }]
  render(<NightSequencerConNotte ruoliSelezionati={['villico']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)
  expect(screen.getByRole('heading', { name: /assegna i ruoli rimanenti/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})

test('mostra il primo passo e i giocatori assegnati a quel ruolo', () => {
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], note: '' }]
  render(<NightSequencerConNotte ruoliSelezionati={['mimo', 'paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('heading', { name: /mimo/i })).toBeInTheDocument()
  expect(screen.getByText('Sara')).toBeInTheDocument()
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

  expect(registraEvento).toHaveBeenCalledWith('Si sentono dei belati.')
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

test('"Indietro" ripristina lo stato dei giocatori all\'ingresso del passo precedente, riabilitando l\'azione già fatta', async () => {
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

  await user.click(screen.getByRole('button', { name: 'Pietro' }))
  rerender(<NightSequencerConNotte {...props()} />)
  expect(giocatori.find((g) => g.id === '1').condizioni).toContain('protetto')

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  rerender(<NightSequencerConNotte {...props()} />)
  expect(screen.getByRole('heading', { name: /veggente/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Indietro' }))

  const ripristinati = impostaGiocatori.mock.calls[0][0]
  expect(ripristinati.find((g) => g.id === '1').condizioni).not.toContain('protetto')
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
