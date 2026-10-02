import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import { tieni } from '../../test/tieni'
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

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

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

  tieni(screen.getByRole('button', { name: /Vai all'alba/ }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'villico', storiaRuoli: ['villico'] })
})

test('assegna comunque il Villico a fine notte anche quando "assegna i ruoli rimanenti" non compare mai (mazzo senza villico esplicito)', async () => {
  // scenario del bug: un mazzo di soli ruoli con passo dedicato (qui solo
  // Mimo) più più giocatori di quanti ruoli espliciti — "villico" non è mai
  // in ruoliSelezionati, quindi il passo "assegna-restanti" non esiste, ma i
  // giocatori avanzati devono comunque ricevere un ruolo a fine notte
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'veggente', vivo: true, condizioni: [], storiaRuoli: ['mimo', 'veggente'], legame: { tipo: 'mimo', targetId: '2' } },
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
  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('3', { ruoloSlug: 'villico', storiaRuoli: ['villico'] })
})

test('se resta un solo giocatore senza ruolo e un solo altro ruolo del mazzo ancora da assegnare, con esattamente un posto libero, lo assegna d\'ufficio (nessuna vera scelta possibile, non ha senso lasciarlo misterioso)', async () => {
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

  tieni(screen.getByRole('button', { name: /Vai all'alba/ }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'spilungone', storiaRuoli: ['spilungone'] })
})

test('non forza nessun ruolo se restano PIÙ giocatori senza ruolo di quanti posti liberi ha l\'unico altro ruolo pendente (scelta ancora reale)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Elena', vivo: true, condizioni: [] },
    { id: '2', nome: 'Bruno', vivo: true, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['villico', 'spilungone']}
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
    />,
  )

  tieni(screen.getByRole('button', { name: /Vai all'alba/ }))

  expect(aggiornaGiocatore).not.toHaveBeenCalled()
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
  expect(screen.getByRole('button', { name: /È giorno nel villaggio/ })).toBeInTheDocument()

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

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
  expect(screen.getByRole('button', { name: /È giorno nel villaggio/ })).toBeInTheDocument()
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

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

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

test('cambiare chi interpreta l\'Apprendista resetta il legame (maestro) precedente: non deve "ricordare" un abbinamento di un giro precedente', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: 'a', nome: 'Anna', vivo: true, condizioni: [] },
    { id: 'b', nome: 'Bruno', vivo: true, condizioni: [] },
    { id: 'c', nome: 'Carla', vivo: true, condizioni: [] },
    { id: 'd', nome: 'Dino', vivo: true, condizioni: [] },
  ]
  const { rerender } = render(
    <NightSequencerConNotte ruoliSelezionati={['apprendista']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />,
  )
  const rrender = () =>
    rerender(
      <NightSequencerConNotte ruoliSelezionati={['apprendista']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />,
    )

  // Anna apprendista, Carla maestra
  await user.click(within(screen.getByRole('group', { name: 'Chi ha questa carta' })).getByRole('button', { name: 'Anna' }))
  rrender()
  await user.click(within(screen.getByRole('group', { name: 'Chi seguire come maestro' })).getByRole('button', { name: 'Carla' }))
  rrender()
  expect(giocatori.find((g) => g.id === 'a').legame).toEqual({ tipo: 'apprendista', targetId: 'c' })

  // cambio idea: Bruno apprendista invece di Anna — nessun maestro pre-selezionato
  await user.click(within(screen.getByRole('group', { name: 'Chi ha questa carta' })).getByRole('button', { name: 'Bruno' }))
  rrender()
  expect(giocatori.find((g) => g.id === 'a').legame).toBeUndefined()
  expect(
    within(screen.getByRole('group', { name: 'Chi seguire come maestro' })).queryByRole('button', { pressed: true }),
  ).not.toBeInTheDocument()

  // Bruno apprendista, Dino maestro
  await user.click(within(screen.getByRole('group', { name: 'Chi seguire come maestro' })).getByRole('button', { name: 'Dino' }))
  rrender()
  expect(giocatori.find((g) => g.id === 'b').legame).toEqual({ tipo: 'apprendista', targetId: 'd' })

  // torno su Anna: non deve ricomparire né il vecchio A->C né il B->D di Bruno
  await user.click(within(screen.getByRole('group', { name: 'Chi ha questa carta' })).getByRole('button', { name: 'Anna' }))
  rrender()
  expect(giocatori.find((g) => g.id === 'b').legame).toBeUndefined()
  expect(
    within(screen.getByRole('group', { name: 'Chi seguire come maestro' })).queryByRole('button', { pressed: true }),
  ).not.toBeInTheDocument()
})

test('il Chupacabra non mostra mai il promemoria del legame "è il suo maestro" (era un ruolo con legame in un giro precedente)', () => {
  const giocatori = [
    {
      id: '1',
      nome: 'Elio',
      ruoloSlug: 'chupacabra',
      vivo: true,
      condizioni: [],
      // legame residuo di un ruolo precedente (es. un Apprendista di cui
      // Elio ha "ereditato" la carta): non deve confondersi col Chupacabra
      legame: { tipo: 'apprendista', targetId: '2' },
    },
    { id: '2', nome: 'Fabio', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['chupacabra']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByText(/è il suo maestro/i)).not.toBeInTheDocument()
  expect(screen.getByRole('group', { name: 'Il Chupacabra caccia' })).toBeInTheDocument()
})

test('un ruolo "ogni notte" (es. Addolorata) mostra il picker "chi ha questa carta" solo la prima notte: dalla notte 2 il titolare è fisso e la sua illustrazione compare una volta sola', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Sara', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [] }]
  const { container } = render(
    <NightSequencerConNotte ruoliSelezionati={['addolorata']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )

  expect(screen.getByRole('group', { name: 'Chi ha questa carta' })).toBeInTheDocument()

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

  expect(screen.queryByRole('group', { name: 'Chi ha questa carta' })).not.toBeInTheDocument()
  expect(container.querySelectorAll('.ruolo-illustrazione')).toHaveLength(1)
})

test('col legame stabilito, il Cavaliere mostra "È pronto a sacrificarsi per X" (soggetto l\'attore, non il bersaglio)', () => {
  const giocatori = [
    { id: '1', nome: 'Fabio', ruoloSlug: 'cavaliere', vivo: true, condizioni: [], legame: { tipo: 'cavaliere', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['cavaliere']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText('🔗 È pronto a sacrificarsi per Marco.')).toBeInTheDocument()
})

test('un ruolo a titolare singolo con carta già distribuita a inizio partita (es. Cavaliere) non mostra l\'illustrazione due volte già alla prima notte', () => {
  const giocatori = [
    { id: '1', nome: 'Fabio', ruoloSlug: 'cavaliere', vivo: true, condizioni: [] },
    { id: '2', nome: 'Gino', ruoloSlug: undefined, vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte ruoliSelezionati={['cavaliere']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )

  expect(screen.getByRole('group', { name: 'Chi ha questa carta' })).toBeInTheDocument()
  expect(container.querySelectorAll('.ruolo-illustrazione')).toHaveLength(1)
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

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

  expect(registraEvento).toHaveBeenCalledWith('Si sentono dei belati.', 'alba')
})

test('"Notte successiva" azzera usiNotte per far ripartire i poteri della notte', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Piero', ruoloSlug: 'paladino', vivo: true, condizioni: [], usiNotte: ['paladino'] }]
  const aggiornaGiocatore = vi.fn()
  render(<NightSequencerConNotte ruoliSelezionati={['mimo']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />)

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

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
  expect(screen.getByRole('button', { name: /È giorno nel villaggio/ })).not.toBeDisabled()
  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))
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

test('"Indietro" senza azione sul passo corrente torna al passo precedente RIAPRENDOLO da zero (stato d\'ingresso ripristinato, di nuovo modificabile)', async () => {
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

  // Indietro dal Veggente (intatto): torna al Paladino riaperto da zero,
  // protezione tolta e scelta di nuovo disponibile
  await user.click(screen.getByRole('button', { name: 'Indietro' }))
  rerender(<NightSequencerConNotte {...props()} />)
  expect(screen.getByRole('heading', { name: /paladino/i })).toBeInTheDocument()
  expect(giocatori.find((g) => g.id === '1').condizioni).not.toContain('protetto')
  expect(
    within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Pietro' }),
  ).toHaveAttribute('aria-pressed', 'false')
})

// harness con stato reale (giocatori e quantita in useState, come in App) per i
// test sul passo ancorato all'id: ogni azione scrive davvero. `stato` espone
// sempre l'ultimo stato renderizzato; `rerender` resta per leggibilità (no-op)
function creaHarness(giocatoriIniziali, ruoliSelezionati, quantitaIniziale = {}, extra = {}) {
  const stato = {}
  function Harness() {
    const [giocatori, setGiocatori] = useState(giocatoriIniziali)
    const [quantita, setQuantita] = useState(quantitaIniziale)
    stato.giocatori = giocatori
    stato.quantita = quantita
    return (
      <NightSequencerConNotte
        ruoliSelezionati={ruoliSelezionati}
        giocatori={giocatori}
        quantita={quantita}
        aggiornaGiocatore={(id, patch) => setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))}
        impostaGiocatori={setGiocatori}
        onCambiaQuantita={(slug, n) => setQuantita((prev) => ({ ...prev, [slug]: n }))}
        {...extra}
      />
    )
  }
  const { container } = render(<Harness />)
  return { stato, container, rerender: () => {} }
}
const creaHarnessConContainer = creaHarness

test('la Strega che uccide il Veggente (un passo precedente che sparisce) non fa saltare la schermata né il Branco', async () => {
  localStorage.setItem('meltable-wolves-notte', JSON.stringify({ round: 2, stepIndex: 0 }))
  const user = userEvent.setup()
  const h = creaHarness(
    [
      { id: '1', nome: 'Vera', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
      { id: '2', nome: 'Sara', ruoloSlug: 'strega', vivo: true, condizioni: [], poteriUsati: [] },
      { id: '3', nome: 'Lia', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    ],
    ['veggente', 'strega', 'lupo-mannaro'],
  )

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  h.rerender()
  expect(screen.getByRole('heading', { name: /strega/i })).toBeInTheDocument()

  await user.click(within(screen.getByRole('group', { name: 'Chi uccidere' })).getByRole('button', { name: 'Vera' }))
  h.rerender()
  // il passo del Veggente non c'è più, ma la schermata resta quella della Strega
  expect(screen.getByRole('heading', { name: /strega/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  h.rerender()
  expect(screen.getByRole('heading', { name: /branco dei lupi/i })).toBeInTheDocument()
})

test('il Ladro che sceglie una carta (cambia ruolo) resta sul proprio passo e Avanti non salta il successivo; Indietro ripristina anche le carte scartate', async () => {
  const user = userEvent.setup()
  const h = creaHarness(
    [
      { id: '1', nome: 'Luca', ruoloSlug: 'ladro', vivo: true, condizioni: [], poteriUsati: [], storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'paladino'] },
      { id: '2', nome: 'Anna', vivo: true, condizioni: [] },
    ],
    ['ladro', 'veggente', 'paladino', 'medium'],
    { ladro: 1, veggente: 1, paladino: 1, medium: 1 },
  )

  await user.click(within(screen.getByRole('group', { name: 'Cosa sceglie il Ladro' })).getByRole('button', { name: 'Veggente' }))
  h.rerender()
  expect(h.stato.giocatori[0].ruoloSlug).toBe('veggente')
  expect(h.stato.quantita.paladino).toBe(0)
  // il Ladro non è più 'ladro' ma il passo e la sua azione restano
  expect(screen.getByRole('heading', { name: /ladro/i })).toBeInTheDocument()
  expect(screen.getByRole('group', { name: 'Cosa sceglie il Ladro' })).toBeInTheDocument()

  // "Indietro" (passo modificato) lo riapre da zero: ruolo e carte ripristinati, una volta sola
  await user.click(screen.getByRole('button', { name: 'Indietro' }))
  h.rerender()
  expect(h.stato.giocatori[0].ruoloSlug).toBe('ladro')
  expect(h.stato.quantita.paladino).toBe(1)
  expect(h.stato.quantita.veggente).toBe(1)

  await user.click(within(screen.getByRole('group', { name: 'Cosa sceglie il Ladro' })).getByRole('button', { name: 'Veggente' }))
  h.rerender()
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  h.rerender()
  // il passo dopo il Ladro è il Medium (steps: ladro, medium, veggente), non saltato
  expect(screen.getByRole('heading', { name: /medium/i })).toBeInTheDocument()
})

test('Addolorata: dopo "Scambia" il passo resta e "Annulla scambio" è raggiungibile', async () => {
  localStorage.setItem('meltable-wolves-notte', JSON.stringify({ round: 2, stepIndex: 0 }))
  const user = userEvent.setup()
  const h = creaHarness(
    [
      { id: '1', nome: 'Ada', ruoloSlug: 'addolorata', vivo: true, condizioni: [], poteriUsati: [], storiaRuoli: ['addolorata'] },
      { id: '2', nome: 'Rosa', ruoloSlug: 'paladino', vivo: false, condizioni: [], causaMorte: 'rogo', mortoNotte: 2, storiaRuoli: ['paladino'] },
    ],
    ['addolorata', 'paladino'],
  )

  await user.click(screen.getByRole('button', { name: 'Scambia' }))
  h.rerender()
  expect(h.stato.giocatori[0].ruoloSlug).toBe('paladino')
  expect(screen.getByRole('button', { name: 'Annulla scambio' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Annulla scambio' }))
  h.rerender()
  expect(h.stato.giocatori[0].ruoloSlug).toBe('addolorata')
  expect(screen.getByRole('button', { name: 'Scambia' })).toBeInTheDocument()
})

test('Mimo: Avanti dopo aver scelto la carta del bersaglio non salta il passo successivo', async () => {
  const user = userEvent.setup()
  const h = creaHarness(
    [
      { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], storiaRuoli: ['mimo'], legame: { tipo: 'mimo', targetId: '2' } },
      { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    ],
    ['mimo', 'paladino', 'veggente'],
  )

  await user.click(within(screen.getByRole('group', { name: 'Che carta ha il bersaglio del Mimo' })).getByRole('button', { name: 'Veggente' }))
  h.rerender()
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  h.rerender()

  expect(h.stato.giocatori.map((g) => g.ruoloSlug)).toEqual(['veggente', 'veggente'])
  // steps: mimo, paladino, veggente: il successivo è il Paladino
  expect(screen.getByRole('heading', { name: /paladino/i })).toBeInTheDocument()
})

test('Indietro riapre un passo con Strega già usata: la pozione è di nuovo scegliibile, non "già utilizzata"', async () => {
  localStorage.setItem('meltable-wolves-notte', JSON.stringify({ round: 2, stepIndex: 0 }))
  const user = userEvent.setup()
  const h = creaHarness(
    [
      { id: '1', nome: 'Sara', ruoloSlug: 'strega', vivo: true, condizioni: [], poteriUsati: [] },
      { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
      { id: '3', nome: 'Chiara', ruoloSlug: 'chupacabra', vivo: true, condizioni: [], usiNotte: [] },
    ],
    ['strega', 'chupacabra'],
  )

  await user.click(within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Anna' }))
  h.rerender()
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  h.rerender()
  expect(screen.getByRole('heading', { name: /chupacabra/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Indietro' }))
  h.rerender()
  expect(screen.getByRole('heading', { name: /strega/i })).toBeInTheDocument()
  expect(screen.queryByText(/pozione vitale già utilizzata/i)).not.toBeInTheDocument()
  expect(h.stato.giocatori[0].poteriUsati).toEqual([])
  expect(h.stato.giocatori[1].condizioni).toEqual([])
  expect(
    within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: 'Anna' }),
  ).toHaveAttribute('aria-pressed', 'false')
})

test('alla fine della notte la Cortigiana uccisa è già considerata negli annunci dell\'alba (stato aggiornato, non lo snapshot vecchio)', async () => {
  localStorage.setItem('meltable-wolves-notte', JSON.stringify({ round: 2, stepIndex: 1 }))
  const user = userEvent.setup()
  const registraEvento = vi.fn()
  // il Pastore sente i belati solo se un lupo gli è accanto: con la
  // Cortigiana ancora viva in mezzo no, una volta morta sì
  const h = creaHarness(
    [
      { id: '1', nome: 'Paolo', ruoloSlug: 'pastore', vivo: true, condizioni: [] },
      { id: '2', nome: 'Cora', ruoloSlug: 'cortigiana', vivo: true, condizioni: [], visitaNotturna: '3' },
      { id: '3', nome: 'Lia', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    ],
    ['cortigiana', 'lupo-mannaro'],
    {},
    { registraEvento },
  )

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

  expect(h.stato.giocatori.find((g) => g.id === '2').vivo).toBe(false)
  expect(registraEvento).toHaveBeenCalledWith('Si sentono dei belati.', 'alba')
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

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))

  expect(onNotteConclusa).toHaveBeenCalled()
})

test('il Mimo compare anche nel passo del ruolo che sta imitando', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'paladino', storiaRuoli: ['mimo', 'paladino'], legame: { tipo: 'mimo', targetId: '2' }, vivo: true, condizioni: [] },
    { id: '2', nome: 'Marco', ruoloSlug: 'paladino', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['paladino']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByRole('heading', { name: /paladino \(sara, marco\)/i })).toBeInTheDocument()
})

test('il Mimo non compare in un passo del ruolo che NON sta imitando', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'veggente', storiaRuoli: ['mimo', 'veggente'], legame: { tipo: 'mimo', targetId: '2' }, vivo: true, condizioni: [] },
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

  tieni(screen.getByRole('button', { name: /Vai all'alba/ }))
  expect(onNotteConclusa).toHaveBeenCalled()
})

test("con la notte bloccata senza Bardo mostra l'avviso generico (la maledizione de L'Antico non blocca la notte: filtra solo i poteri del villaggio)", () => {
  const giocatori = [{ id: '1', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [], notteBloccataFinoA: 1 }]
  render(<NightSequencerConNotte ruoliSelezionati={['villico']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.getByText(/questa notte non si svolge\./i)).toBeInTheDocument()
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

test('il passo "Lupo Mannaro" mostra già le illustrazioni di tutto il branco riconosciuto finora (es. il Cucciolo) e cambia la domanda in "Seleziona i lupi mannari rimanenti"', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Gino', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', nome: 'Elsa', vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro', 'cucciolo-di-lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ 'lupo-mannaro': 1 }}
    />,
  )

  // primo passo: il Cucciolo (già assegnato, si limita a mostrarsi); il
  // secondo è "Lupo Mannaro", dove restano da assegnare solo i Lupi generici
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByRole('heading', { name: /^lupo mannaro/i })).toBeInTheDocument()

  // il Cucciolo compare già tra le illustrazioni...
  const illustrazioni = container.querySelectorAll('img.night-sequencer__illustrazione')
  expect([...illustrazioni].some((img) => img.src.includes('Cucciolo_di_Lupo_Mannaro.svg'))).toBe(true)
  // ...ma non è tra le chip assegnabili qui (il suo passo dedicato è già passato)
  expect(screen.queryByRole('button', { name: 'Gino' })).not.toBeInTheDocument()
  expect(screen.getByText(/seleziona i lupi mannari rimanenti/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Elsa' })).toBeInTheDocument()
})

test('selezionare più Lupi Mannari generici (ancora solo pendenti, non confermati) li mostra tutti insieme nella riga delle illustrazioni, non più separati dall\'illustrazione generica di AssegnaRuolo', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Gino', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', nome: 'Elsa', vivo: true, condizioni: [] },
    { id: '3', nome: 'Franco', vivo: true, condizioni: [] },
    { id: '4', nome: 'Greta', vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro', 'cucciolo-di-lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ 'lupo-mannaro': 3 }}
    />,
  )
  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  // questo passo mostra già il branco al completo (ruoliMostraCoinvolti):
  // l'illustrazione generica di AssegnaRuolo resta sempre nascosta qui,
  // anche con un solo Lupo Mannaro selezionato, mai una seconda riga separata
  await user.click(screen.getByRole('button', { name: 'Elsa' }))
  expect(container.querySelector('.assegna-ruolo__illustrazione')).not.toBeInTheDocument()
  expect(container.querySelectorAll('img.night-sequencer__illustrazione')).toHaveLength(4) // Cucciolo + 3 lupi attesi, già tutti presenti

  // un secondo Lupo Mannaro (ancora pendente, Avanti non premuto): si
  // aggiunge alla stessa riga, sempre un ritratto a testa
  await user.click(screen.getByRole('button', { name: 'Franco' }))
  expect(container.querySelector('.assegna-ruolo__illustrazione')).not.toBeInTheDocument()
  expect(container.querySelectorAll('img.night-sequencer__illustrazione')).toHaveLength(4) // invariato: la riga è già completa

  await user.click(screen.getByRole('button', { name: 'Greta' }))
  expect(container.querySelectorAll('img.night-sequencer__illustrazione')).toHaveLength(4) // invariato
})

test('i Lupi Mannari selezionati (pendenti) usano illustrazioni diverse Lupo_Mannaro_1..N, una per ciascuno', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Elsa', vivo: true, condizioni: [] },
    { id: '2', nome: 'Franco', vivo: true, condizioni: [] },
    { id: '3', nome: 'Greta', vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ 'lupo-mannaro': 3 }}
    />,
  )
  // già tutti presenti all'ingresso, senza dipendere dai click
  const src = [...container.querySelectorAll('img.night-sequencer__illustrazione')].map((img) => img.src.split('/').pop())
  expect(src).toEqual(['Lupo_Mannaro_1.svg', 'Lupo_Mannaro_2.svg', 'Lupo_Mannaro_3.svg'])
})

test('Veggente copiato dal Mimo: selezionare/deselezionare le chip di "Chi ha questa carta?" non cambia le illustrazioni a figura intera (calcolate all\'ingresso nel passo)', async () => {
  const user = userEvent.setup()
  const { container } = creaHarnessConContainer(
    [
      { id: '1', nome: 'Sara', ruoloSlug: 'veggente', vivo: true, condizioni: [], storiaRuoli: ['mimo', 'veggente'], legame: { tipo: 'mimo', targetId: '2' } },
      { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [], storiaRuoli: ['veggente'] },
    ],
    ['veggente'],
    { veggente: 2 },
  )
  const immagini = () =>
    [...container.querySelectorAll('img.night-sequencer__illustrazione, img.assegna-ruolo__illustrazione')].map((img) => img.src.split('/').pop())
  const prima = immagini()
  expect(prima).toEqual(['Mimo.svg', 'Veggente.svg'])

  const chip = (nome) => within(screen.getByRole('group', { name: 'Chi ha questa carta' })).getByRole('button', { name: nome })
  await user.click(chip('Marco'))
  expect(immagini()).toEqual(prima)
  // il Mimo non è un titolare della carta: nessuna chip per lui
  expect(within(screen.getByRole('group', { name: 'Chi ha questa carta' })).queryByRole('button', { name: 'Sara' })).not.toBeInTheDocument()
  await user.click(chip('Marco'))
  expect(immagini()).toEqual(prima)
})

test('la Strega che usa la pozione mortale su se stessa: fino ad Avanti il passo non mostra la sua morte (titolo, illustrazione, azione restano)', async () => {
  localStorage.setItem('meltable-wolves-notte', JSON.stringify({ round: 2, stepIndex: 0 }))
  const user = userEvent.setup()
  const { container, stato } = creaHarnessConContainer(
    [
      { id: '1', nome: 'Sara', ruoloSlug: 'strega', vivo: true, condizioni: [], poteriUsati: [] },
      { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    ],
    ['strega'],
  )

  await user.click(within(screen.getByRole('group', { name: 'Chi uccidere' })).getByRole('button', { name: 'Sara' }))
  expect(stato.giocatori[0].vivo).toBe(false)

  expect(screen.getByRole('heading', { name: /strega \(sara\)/i }).textContent).not.toMatch(/☠/)
  expect(screen.queryByText(/chiama comunque/i)).not.toBeInTheDocument()
  expect(container.querySelectorAll('img.night-sequencer__illustrazione')).toHaveLength(1)
  // l'azione resta, la scelta si può ancora ripensare
  await user.click(within(screen.getByRole('group', { name: 'Chi uccidere' })).getByRole('button', { name: 'Sara' }))
  expect(stato.giocatori[0].vivo).toBe(true)
})

test('"Branco dei Lupi" (dove il branco si riconosce e sceglie la vittima insieme) non mostra mai chip per riassegnare l\'identità: ogni Lupo Mannaro è già stato assegnato nei passi precedenti', async () => {
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
  expect(screen.getByRole('heading', { name: /branco dei lupi/i })).toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Chi ha questa carta' })).not.toBeInTheDocument()
  // le chip qui sono per scegliere la vittima ("Il branco sbrana"), non per
  // riassegnare chi è Dario/Elsa: l'identità non è più in discussione
  expect(screen.getByRole('group', { name: 'Il branco sbrana' })).toBeInTheDocument()
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
  // Lupi Mannari "generici"; il terzo è "Branco dei Lupi", dove tutti e tre
  // si risvegliano insieme (il branco si riconosce mentre sceglie la vittima)
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByRole('heading', { name: /branco dei lupi/i })).toBeInTheDocument()

  const illustrazioni = container.querySelectorAll('img.night-sequencer__illustrazione')
  expect(illustrazioni).toHaveLength(3)
  const src = [...illustrazioni].map((img) => img.src)
  expect(src.some((s) => s.includes('Lupo_Mannaro_1.svg'))).toBe(true)
  expect(src.some((s) => s.includes('Lupo_Mannaro_2.svg'))).toBe(true)
  expect(src.some((s) => s.includes('Cucciolo_di_Lupo_Mannaro.svg'))).toBe(true)
})

test('con un branco numeroso tutte le illustrazioni hanno la STESSA altezza, qualunque sia il ruolo', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Gino', ruoloSlug: 'cucciolo-di-lupo-mannaro', vivo: true, condizioni: [] },
    { id: '2', nome: 'Ada', vivo: true, condizioni: [] },
    { id: '3', nome: 'Bea', vivo: true, condizioni: [] },
    { id: '4', nome: 'Ciro', vivo: true, condizioni: [] },
    { id: '5', nome: 'Dan', vivo: true, condizioni: [] },
    { id: '6', nome: 'Ele', vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro', 'cucciolo-di-lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ 'lupo-mannaro': 5 }}
    />,
  )
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  for (const nome of ['Ada', 'Bea', 'Ciro', 'Dan', 'Ele']) {
    await user.click(screen.getByRole('button', { name: nome }))
  }

  const immagini = [...container.querySelectorAll('img.night-sequencer__illustrazione')]
  expect(immagini).toHaveLength(6)
  // stessa altezza per tutti, qualunque sia il ruolo (viewBox diversi)
  for (const img of immagini) expect(img.style.height).toBe(immagini[0].style.height)
})

test('quando il Mimo imita un ruolo che agisce, compare la sua illustrazione accanto a quella del vero titolare (mai una seconda copia del ruolo imitato per il Mimo stesso)', () => {
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'veggente', vivo: true, condizioni: [], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', ruoloSlug: 'veggente', vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte ruoliSelezionati={['veggente']} giocatori={giocatori} aggiornaGiocatore={() => {}} />,
  )

  const illustrazioni = container.querySelectorAll('img.night-sequencer__illustrazione')
  const src = [...illustrazioni].map((img) => img.src)
  // Sara (il Mimo) mostra solo la propria faccia, non anche una seconda
  // illustrazione da Veggente: resta visivamente se stessa, il vero
  // titolare (Marco) è l'unico a mostrare il ruolo imitato
  expect(src.filter((s) => s.includes('Mimo.svg'))).toHaveLength(1)
  expect(src.filter((s) => s.includes('Veggente.svg'))).toHaveLength(1)
})

test('il Mimo che copia un ruolo non ancora assegnato: scegliere la carta resta sul passo "Mimo" (niente salto improvviso al passo del ruolo copiato) finché non si preme Avanti', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
  ]
  const aggiornaGiocatore = vi.fn()
  render(
    <NightSequencerConNotte
      ruoliSelezionati={['mimo', 'cucciolo-di-lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={aggiornaGiocatore}
    />,
  )

  const chipCucciolo = screen.getByRole('button', { name: 'Cucciolo di Lupo Mannaro' })
  await user.click(chipCucciolo)

  // niente salto al passo "Cucciolo di Lupo Mannaro": si resta su "Mimo",
  // la chip scelta è marcata attiva, e nessun giocatore è stato ancora toccato
  expect(screen.getByRole('heading', { name: /^mimo/i })).toBeInTheDocument()
  expect(chipCucciolo).toHaveAttribute('aria-pressed', 'true')
  expect(aggiornaGiocatore).not.toHaveBeenCalled()

  // solo premendo Avanti la scelta diventa reale, per entrambi
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', {
    ruoloSlug: 'cucciolo-di-lupo-mannaro',
    storiaRuoli: ['cucciolo-di-lupo-mannaro'],
  })
  expect(aggiornaGiocatore).toHaveBeenCalledWith('2', {
    ruoloSlug: 'cucciolo-di-lupo-mannaro',
    storiaRuoli: ['cucciolo-di-lupo-mannaro'],
  })
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

test('la Fattucchiera non blocca mai se stessa: se la sua attuale titolare porta ancora la condizione "inibito" (residuo di un cambio di "chi ha questa carta"), le chip di "chi inibire" restano comunque disponibili', () => {
  const giocatori = [
    { id: '1', nome: 'Caio', ruoloSlug: 'fattucchiera', vivo: true, condizioni: ['inibito'], poteriUsati: [] },
    { id: '2', nome: 'Anna', ruoloSlug: 'villico', vivo: true, condizioni: [] },
  ]
  render(<NightSequencerConNotte ruoliSelezionati={['fattucchiera']} giocatori={giocatori} aggiornaGiocatore={() => {}} />)

  expect(screen.queryByText(/il potere è inibito questa notte dalla fattucchiera/i)).not.toBeInTheDocument()
  expect(screen.getByRole('group', { name: 'Chi inibire' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
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

  tieni(screen.getByRole('button', { name: /È giorno nel villaggio/ }))
  rerender(<NightSequencerConNotte {...props()} />)

  const ruoli = giocatori.map((g) => g.ruoloSlug).sort()
  expect(ruoli).toEqual(['guardia', 'guardia', 'guardia-mannara'])
})

test('il Chupacabra che sbrana l\'unico Lupo Mannaro rimasto non perde la scelta appena fatta: il passo non deve rimontare solo perché uno dei passi precedenti (branco-lupi) sparisce dall\'elenco', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: '1', nome: 'Chuck', ruoloSlug: 'chupacabra', vivo: true, condizioni: [], usiNotte: [] },
    { id: '2', nome: 'Dario', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], usiNotte: [] },
    { id: '3', nome: 'Anna', vivo: true, condizioni: [] },
  ]
  const props = () => ({
    ruoliSelezionati: ['chupacabra', 'lupo-mannaro'],
    giocatori,
    aggiornaGiocatore,
    quantita: { chupacabra: 1, 'lupo-mannaro': 1 },
  })
  const { rerender } = render(<NightSequencerConNotte {...props()} />)
  const rrender = () => rerender(<NightSequencerConNotte {...props()} />)

  // avanza fino al passo del Chupacabra (dopo lupo-mannaro e branco-lupi)
  while (!screen.queryByRole('heading', { name: /chupacabra/i })) {
    await user.click(screen.getByRole('button', { name: 'Avanti' }))
    rrender()
  }

  await user.click(within(screen.getByRole('group', { name: 'Il Chupacabra caccia' })).getByRole('button', { name: 'Dario' }))
  rrender()

  expect(giocatori.find((g) => g.id === '2').vivo).toBe(false)
  // niente remount: restiamo sullo stesso passo, con Dario ancora visibile
  // (morto ma appena scelto) e marcato, non sparito con la scelta persa
  expect(screen.getByRole('heading', { name: /chupacabra/i })).toBeInTheDocument()
  const chipDario = within(screen.getByRole('group', { name: 'Il Chupacabra caccia' })).getByRole('button', { name: 'Dario' })
  expect(chipDario).toHaveAttribute('aria-pressed', 'true')

  // e la scelta resta modificabile come da principio generale: cambiare
  // bersaglio deve ancora poter risuscitare Dario
  await user.click(within(screen.getByRole('group', { name: 'Il Chupacabra caccia' })).getByRole('button', { name: 'Anna' }))
  rrender()
  expect(giocatori.find((g) => g.id === '2').vivo).toBe(true)
})

test('Ladro: dopo aver scelto chi ha la carta e premuto Avanti, la domanda "Chi ha questa carta?" non si ripete: si passa al passo dopo', async () => {
  const user = userEvent.setup()
  creaHarness(
    [
      { id: '1', nome: 'Anna', vivo: true, condizioni: [] },
      { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    ],
    ['ladro', 'medium'],
    { ladro: 1, medium: 1 },
  )

  await user.click(within(screen.getByRole('group', { name: 'Chi ha questa carta' })).getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByRole('heading', { name: /medium/i })).toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Cosa sceglie il Ladro' })).not.toBeInTheDocument()
  // la domanda ora è per il Medium (Anna è già il Ladro, non è più candidata)
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
})

test('un ruolo con quantità 0 (tolto dal mazzo) non compare tra le scelte "chi ha questa carta", nemmeno la prima notte', () => {
  creaHarness(
    [
      { id: '1', nome: 'Anna', ruoloSlug: 'veggente', vivo: true, condizioni: [], storiaRuoli: ['veggente'] },
      { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    ],
    ['veggente'],
    { veggente: 0 },
  )
  expect(screen.queryByRole('group', { name: 'Chi ha questa carta' })).not.toBeInTheDocument()
})

test('riassegnare la Strega da Anna a Bruno dopo una pozione ripulisce Anna (poteriUsati/usiNotte) e non dà a Bruno un potere consumato', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn((id, patch) => {
    giocatori = giocatori.map((g) => (g.id === id ? { ...g, ...patch } : g))
  })
  let giocatori = [
    { id: 'a', nome: 'Anna', vivo: true, condizioni: [], ruoloSlug: 'strega', storiaRuoli: ['strega'] },
    { id: 'b', nome: 'Bruno', vivo: true, condizioni: [] },
  ]
  const el = () => (
    <NightSequencerConNotte ruoliSelezionati={['strega']} giocatori={giocatori} aggiornaGiocatore={aggiornaGiocatore} />
  )
  const { rerender } = render(el())
  const chips = () => within(screen.getByRole('group', { name: 'Chi ha questa carta' }))
  // l'azione scrive sul titolare (come farebbe una pozione usata)
  aggiornaGiocatore('a', { poteriUsati: ['strega-pozione'], usiNotte: ['strega'] })
  rerender(el())
  await user.click(chips().getByRole('button', { name: 'Bruno' }))
  rerender(el())
  const anna = giocatori.find((g) => g.id === 'a')
  expect(anna.ruoloSlug).toBeUndefined()
  expect(anna.poteriUsati).toBeUndefined()
  expect(anna.usiNotte).toBeUndefined()
})

test('Ladro dopo un refresh a metà passo: il passo si riapre dall\'ingresso salvato, la scelta già fatta è mostrata e modificabile (niente "già scelto")', async () => {
  const user = userEvent.setup()
  const prima = { id: '1', nome: 'Luca', ruoloSlug: 'ladro', vivo: true, condizioni: [], poteriUsati: [], storiaRuoli: ['ladro'], scartoLadro: ['veggente', 'paladino'] }
  const quantitaIngresso = { ladro: 1, veggente: 1, paladino: 1, medium: 1 }
  localStorage.setItem(
    'meltable-wolves-notte',
    JSON.stringify({ round: 1, stepIndex: 0, ingresso: { round: 1, id: 'ladro', giocatori: [prima], quantita: quantitaIngresso, titolari: ['1'] } }),
  )
  // stato persistito DOPO la scelta del Veggente (il Ladro non è più 'ladro')
  creaHarness(
    [{ ...prima, ruoloSlug: 'veggente', poteriUsati: ['ladro-scelta'], storiaRuoli: ['ladro', 'veggente'] }],
    ['ladro', 'veggente', 'paladino', 'medium'],
    { ladro: 1, veggente: 1, paladino: 0, medium: 1 },
  )

  expect(screen.getByRole('heading', { name: /ladro/i })).toBeInTheDocument()
  expect(screen.queryByText(/il ladro ha già scelto/i)).not.toBeInTheDocument()
  const chip = within(screen.getByRole('group', { name: 'Cosa sceglie il Ladro' })).getByRole('button', { name: 'Veggente' })
  expect(chip).toHaveAttribute('aria-pressed', 'true')
  await user.click(chip)
  expect(chip).toHaveAttribute('aria-pressed', 'false')
})

test('il passo delle Guardie mostra insieme Guardia_1, Guardia_2 e la Guardia Mannara (in coda, senza legarle ai giocatori)', () => {
  const giocatori = [1, 2, 3].map((n) => ({ id: String(n), nome: `G${n}`, vivo: true, condizioni: [] }))
  const { container } = render(
    <NightSequencerConNotte
      ruoliSelezionati={['guardia', 'guardia-mannara']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ guardia: 2, 'guardia-mannara': 1 }}
    />,
  )
  const src = [...container.querySelectorAll('img.night-sequencer__illustrazione')].map((i) => i.src.split('/').pop())
  expect(src).toEqual(['Guardia_1.svg', 'Guardia_2.svg', 'Guardia_Mannara.svg'])
  expect(container.querySelector('.assegna-ruolo__illustrazione')).not.toBeInTheDocument()
})

test('gli ipnotizzati dal Pifferaio con ruolo nascosto usano i Villici comuni in sequenza; col ruolo noto (o rivelato) quello reale', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Pif', vivo: true, ruoloSlug: 'pifferaio', condizioni: [] },
    { id: '2', nome: 'A', vivo: true, condizioni: ['ipnotizzato'] },
    { id: '3', nome: 'B', vivo: true, condizioni: ['ipnotizzato'] },
    { id: '4', nome: 'C', vivo: true, ruoloSlug: 'veggente', condizioni: ['ipnotizzato'] },
  ]
  const props = { ruoliSelezionati: ['pifferaio', 'veggente'], aggiornaGiocatore: () => {}, round: 2, stepIndex: 0 }
  const { container, rerender } = render(<NightSequencerConNotte {...props} giocatori={giocatori} />)
  // arriva al passo degli ipnotizzati
  while (!screen.queryByRole('heading', { name: /ipnotizzati/i })) {
    await user.click(screen.getByRole('button', { name: 'Avanti' }))
  }
  const tutti = () => [...container.querySelectorAll('img.night-sequencer__illustrazione')].map((i) => i.src.split('/').pop())
  expect(tutti()).toEqual(['Villico_1.svg', 'Villico_2.svg', 'Veggente.svg'])

  // il ruolo di A viene rivelato: l'illustrazione diventa quella reale
  rerender(
    <NightSequencerConNotte
      {...props}
      giocatori={giocatori.map((g) => (g.id === '2' ? { ...g, ruoloSlug: 'nano' } : g))}
    />,
  )
  expect(tutti()).toEqual(['Nano.svg', 'Villico_1.svg', 'Veggente.svg'])
})

test('Mimo che copia i Lupi: appare come Mimo nel branco e non occupa un posto dei titolari (nessun messaggio in conflitto)', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Sara', ruoloSlug: 'lupo-mannaro', vivo: true, condizioni: [], storiaRuoli: ['mimo', 'lupo-mannaro'], legame: { tipo: 'mimo', targetId: '2' } },
    { id: '2', nome: 'Elsa', vivo: true, condizioni: [] },
    { id: '3', nome: 'Franco', vivo: true, condizioni: [] },
    { id: '4', nome: 'Greta', vivo: true, condizioni: [] },
  ]
  const { container } = render(
    <NightSequencerConNotte
      ruoliSelezionati={['lupo-mannaro']}
      giocatori={giocatori}
      aggiornaGiocatore={() => {}}
      quantita={{ 'lupo-mannaro': 2 }}
    />,
  )

  const src = () => [...container.querySelectorAll('img.night-sequencer__illustrazione')].map((i) => i.src)
  expect(src().filter((s) => s.includes('Mimo.svg'))).toHaveLength(1)
  expect(src().filter((s) => s.includes('Lupo_Mannaro_'))).toHaveLength(2)
  // la chip del Mimo non c'è: due posti liberi per i veri lupi
  expect(screen.queryByRole('button', { name: 'Sara' })).not.toBeInTheDocument()
  expect(screen.getByText(/seleziona 2 giocatori in più/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Elsa' }))
  expect(screen.getByText(/seleziona ancora 1 giocatore prima di continuare/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Franco' }))
  expect(screen.queryByText(/seleziona ancora/i)).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Greta' }))
  expect(screen.getByText(/al massimo 2 giocatori/i)).toBeInTheDocument()
})

test('Paladino e Mimo che lo copia (scelta di ogni notte): un\'unica scelta condivisa, valida per entrambi', async () => {
  localStorage.setItem('meltable-wolves-notte', JSON.stringify({ round: 2, stepIndex: 0 }))
  const user = userEvent.setup()
  const { stato } = creaHarness(
    [
      { id: '1', nome: 'Paolo', ruoloSlug: 'paladino', vivo: true, condizioni: [], storiaRuoli: ['paladino'] },
      { id: '2', nome: 'Mia', ruoloSlug: 'paladino', vivo: true, condizioni: [], storiaRuoli: ['mimo', 'paladino'], legame: { tipo: 'mimo', targetId: '1' } },
      { id: '3', nome: 'Pietro', ruoloSlug: 'villico', vivo: true, condizioni: [] },
      { id: '4', nome: 'Rita', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    ],
    ['paladino'],
    { paladino: 2 },
  )
  // un solo gruppo di scelta, non uno per titolare
  expect(screen.queryByRole('group', { name: /scelta di/i })).not.toBeInTheDocument()
  const chip = (nome) => within(screen.getByRole('group', { name: 'Chi proteggere' })).getByRole('button', { name: nome })
  const protetti = () => stato.giocatori.filter((g) => g.condizioni.includes('protetto')).map((g) => g.nome)

  await user.click(chip('Pietro'))
  expect(protetti()).toEqual(['Pietro'])
  expect(stato.giocatori.slice(0, 2).map((g) => g.usiNotte)).toEqual([['paladino'], ['paladino']])
  await user.click(chip('Rita'))
  expect(protetti()).toEqual(['Rita'])
})

test('Apprendista e Mimo che lo copia: ognuno ha il proprio maestro, senza toccare il legame di imitazione', async () => {
  const user = userEvent.setup()
  const { stato } = creaHarness(
    [
      { id: '1', nome: 'Anna', ruoloSlug: 'apprendista', vivo: true, condizioni: [], storiaRuoli: ['apprendista'] },
      { id: '2', nome: 'Mia', ruoloSlug: 'apprendista', vivo: true, condizioni: [], storiaRuoli: ['mimo', 'apprendista'], legame: { tipo: 'mimo', targetId: '1' } },
      { id: '3', nome: 'Pietro', ruoloSlug: 'villico', vivo: true, condizioni: [] },
      { id: '4', nome: 'Rita', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    ],
    ['apprendista'],
    { apprendista: 2 },
  )
  const chip = (attore, nome) =>
    within(within(screen.getByRole('group', { name: `Scelta di ${attore}` })).getByRole('group', { name: 'Chi seguire come maestro' })).getByRole('button', { name: nome })

  await user.click(chip('Anna', 'Pietro'))
  await user.click(chip('Mia', 'Rita'))
  expect(stato.giocatori[0].legame).toEqual({ tipo: 'apprendista', targetId: '3' })
  expect(stato.giocatori[1]).toMatchObject({ legame: { tipo: 'mimo', targetId: '1' }, legameMimo: { tipo: 'apprendista', targetId: '4' } })

  await user.click(chip('Mia', 'Rita'))
  expect(stato.giocatori[1].legameMimo).toBeUndefined()
  expect(stato.giocatori[0].legame).toEqual({ tipo: 'apprendista', targetId: '3' })
})

test('Sacerdote e Mimo che lo copia: ognuno unisce la propria coppia, sciogliere la sua non tocca quella dell\'altro', async () => {
  const user = userEvent.setup()
  const { stato } = creaHarness(
    [
      { id: '1', nome: 'Sam', ruoloSlug: 'sacerdote', vivo: true, condizioni: [], storiaRuoli: ['sacerdote'] },
      { id: '2', nome: 'Mia', ruoloSlug: 'sacerdote', vivo: true, condizioni: [], storiaRuoli: ['mimo', 'sacerdote'], legame: { tipo: 'mimo', targetId: '1' } },
      { id: '3', nome: 'Pietro', ruoloSlug: 'villico', vivo: true, condizioni: [] },
      { id: '4', nome: 'Rita', ruoloSlug: 'villico', vivo: true, condizioni: [] },
    ],
    ['sacerdote'],
    { sacerdote: 2 },
  )
  const chip = (attore, nome) =>
    within(within(screen.getByRole('group', { name: `Scelta di ${attore}` })).getByRole('group', { name: 'Chi unire (due giocatori)' })).getByRole('button', { name: nome })
  const innamorati = () => stato.giocatori.filter((g) => g.condizioni.includes('innamorato')).map((g) => g.nome)

  await user.click(chip('Sam', 'Pietro'))
  await user.click(chip('Sam', 'Rita'))
  await user.click(chip('Mia', 'Pietro'))
  await user.click(chip('Mia', 'Sam'))
  expect(innamorati()).toEqual(['Sam', 'Pietro', 'Rita'])

  // il Mimo scioglie la sua coppia: Pietro resta innamorato (scelto anche da Sam), Sam no
  await user.click(chip('Mia', 'Sam'))
  expect(innamorati()).toEqual(['Pietro', 'Rita'])
})

test('Mimo: Avanti senza aver scelto la carta lo converte in Villico, senza legame (il "percorso 2" non esiste)', async () => {
  const user = userEvent.setup()
  const h = creaHarness(
    [
      { id: '1', nome: 'Sara', ruoloSlug: 'mimo', vivo: true, condizioni: [], storiaRuoli: ['mimo'], legame: { tipo: 'mimo', targetId: '2' } },
      { id: '2', nome: 'Marco', vivo: true, condizioni: [] },
    ],
    ['mimo', 'paladino'],
  )

  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(h.stato.giocatori[0]).toMatchObject({ ruoloSlug: 'villico', storiaRuoli: ['mimo', 'villico'] })
  expect(h.stato.giocatori[0].legame).toBeUndefined()
  expect(h.stato.giocatori[1].ruoloSlug).toBeUndefined()
})

test('Mimo: se il narratore toglie la carta al bersaglio, il Mimo non tiene una carta "stale" (torna da scegliere)', async () => {
  const user = userEvent.setup()
  const h = creaHarness(
    [
      { id: '1', nome: 'Sara', ruoloSlug: 'paladino', vivo: true, condizioni: [], storiaRuoli: ['mimo', 'paladino'], legame: { tipo: 'mimo', targetId: '2' } },
      { id: '2', nome: 'Marco', ruoloSlug: 'paladino', vivo: true, condizioni: [], storiaRuoli: ['paladino'] },
      { id: '3', nome: 'Elena', vivo: true, condizioni: [] },
    ],
    ['mimo', 'paladino'],
  )

  const chi = () => within(screen.getByRole('group', { name: 'Chi ha questa carta' }))
  // la chip del Mimo non c'è nella schermata del ruolo imitato
  expect(chi().queryByRole('button', { name: 'Sara' })).not.toBeInTheDocument()
  await user.click(chi().getByRole('button', { name: 'Marco' }))
  expect(h.stato.giocatori[0]).toMatchObject({ ruoloSlug: 'mimo', storiaRuoli: ['mimo'] })
})

test('Ladro che sceglie la carta Mimo (tra le due in più): dopo il suo passo si torna al passo del Mimo per scegliere chi copiare', async () => {
  const user = userEvent.setup()
  const h = creaHarness(
    [
      { id: '1', nome: 'Anna', ruoloSlug: 'ladro', vivo: true, condizioni: [], poteriUsati: [], storiaRuoli: ['ladro'], scartoLadro: ['mimo', 'paladino'] },
      { id: '2', nome: 'Bob', ruoloSlug: 'veggente', vivo: true, condizioni: [], storiaRuoli: ['veggente'] },
    ],
    ['mimo', 'ladro', 'veggente', 'paladino'],
    { mimo: 1, ladro: 1, veggente: 1, paladino: 1 },
  )

  // il Mimo non è assegnato a nessun giocatore: si può passare oltre
  await user.click(screen.getByRole('button', { name: 'Avanti' }))
  expect(screen.getByRole('heading', { name: /ladro/i })).toBeInTheDocument()

  await user.click(within(screen.getByRole('group', { name: 'Cosa sceglie il Ladro' })).getByRole('button', { name: 'Mimo' }))
  expect(h.stato.giocatori[0].ruoloSlug).toBe('mimo')
  await user.click(screen.getByRole('button', { name: 'Avanti' }))

  expect(screen.getByRole('heading', { name: /^mimo \(anna\)/i })).toBeInTheDocument()
  expect(screen.getByText('Chi imitare')).toBeInTheDocument()
})
