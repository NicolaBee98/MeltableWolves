import { StrictMode, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlbaPanel } from './AlbaPanel'

test('mostra i giocatori morti nella notte appena conclusa, non quelli di notti precedenti', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, mortoNotte: 2, causaMorte: 'notte', ruoloSlug: 'villico' },
    { id: '2', nome: 'Marco', vivo: false, mortoNotte: 1, causaMorte: 'notte', ruoloSlug: 'villico' },
    { id: '3', nome: 'Luca', vivo: true, ruoloSlug: 'villico' },
  ]
  render(<AlbaPanel giocatori={giocatori} round={2} onVaiAlVoto={() => {}} />)

  expect(screen.getByText('Anna')).toBeInTheDocument()
  expect(screen.queryByText('Marco')).not.toBeInTheDocument()
  expect(screen.queryByText('Luca')).not.toBeInTheDocument()
})

test('con una condizione di vittoria mostra il messaggio e il tasto "Concludi partita"', async () => {
  const user = userEvent.setup()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '2', nome: 'Marco', vivo: false, mortoNotte: 2, causaMorte: 'notte', ruoloSlug: 'lupo-mannaro', condizioni: [] },
  ]
  const onConcludiPartita = vi.fn()
  render(
    <AlbaPanel giocatori={giocatori} round={2} onVaiAlVoto={() => {}} onConcludiPartita={onConcludiPartita} />,
  )

  expect(screen.getByText(/vince il villaggio/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Concludi partita' }))
  expect(onConcludiPartita).toHaveBeenCalled()
})

test('senza condizioni di vittoria non mostra "Concludi partita"', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '2', nome: 'Luca', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '3', nome: 'Marco', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
  ]
  render(<AlbaPanel giocatori={giocatori} round={2} onVaiAlVoto={() => {}} />)
  expect(screen.queryByRole('button', { name: 'Concludi partita' })).not.toBeInTheDocument()
})

test('non mostra chi è morto sul rogo o per morte improvvisa, solo le morti notturne', () => {
  const giocatori = [
    { id: '1', nome: 'Dario', vivo: false, mortoNotte: 2, causaMorte: 'notte', ruoloSlug: 'villico' },
    { id: '2', nome: 'Carlo', vivo: false, mortoNotte: 2, causaMorte: 'rogo', ruoloSlug: 'villico' },
    { id: '3', nome: 'Elena', vivo: false, mortoNotte: 2, causaMorte: 'colpo', ruoloSlug: 'villico' },
  ]
  render(<AlbaPanel giocatori={giocatori} round={2} onVaiAlVoto={() => {}} />)

  expect(screen.getByText('Dario')).toBeInTheDocument()
  expect(screen.queryByText('Carlo')).not.toBeInTheDocument()
  expect(screen.queryByText('Elena')).not.toBeInTheDocument()
})

test('mostra un annuncio di vittoria se una fazione ha vinto', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', condizioni: [] },
    { id: '2', nome: 'Marco', vivo: false, ruoloSlug: 'lupo-mannaro', condizioni: [], mortoNotte: 1, causaMorte: 'notte' },
  ]
  render(<AlbaPanel giocatori={giocatori} round={1} onVaiAlVoto={() => {}} />)
  expect(screen.getByText(/vince il villaggio/i)).toBeInTheDocument()
})

test('mostra un messaggio se nessuno è morto questa notte', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico' }]
  render(<AlbaPanel giocatori={giocatori} round={1} onVaiAlVoto={() => {}} />)
  expect(screen.getByText(/nessuno è morto questa notte/i)).toBeInTheDocument()
})

test('mostra gli annunci derivati (es. belati del pastore)', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'pastore' },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'lupo-mannaro' },
  ]
  render(<AlbaPanel giocatori={giocatori} round={1} onVaiAlVoto={() => {}} />)
  expect(screen.getByText('Si sentono dei belati.')).toBeInTheDocument()
})

test('il pulsante Vai al voto chiama onVaiAlVoto', async () => {
  const user = userEvent.setup()
  const onVaiAlVoto = vi.fn()
  render(<AlbaPanel giocatori={[]} round={1} onVaiAlVoto={onVaiAlVoto} />)
  await user.click(screen.getByRole('button', { name: 'Vai al voto' }))
  expect(onVaiAlVoto).toHaveBeenCalled()
})

test('non mostra mai il pulsante Morte Improvvisa: di notte non si può dichiarare', () => {
  render(<AlbaPanel giocatori={[]} round={1} onVaiAlVoto={() => {}} />)
  expect(screen.queryByRole('button', { name: /morte improvvisa/i })).not.toBeInTheDocument()
})

test('con il Borgomastro nel mazzo ma nessuno eletto, ricorda di eleggerlo', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico' }]
  render(<AlbaPanel giocatori={giocatori} round={1} ruoliSelezionati={['borgomastro']} onVaiAlVoto={() => {}} />)
  expect(screen.getByText(/deve eleggere un borgomastro/i)).toBeInTheDocument()
})

test('con un Borgomastro vivo non mostra il promemoria', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', eBorgomastro: true }]
  render(<AlbaPanel giocatori={giocatori} round={1} ruoliSelezionati={['borgomastro']} onVaiAlVoto={() => {}} />)
  expect(screen.queryByText(/deve eleggere un borgomastro/i)).not.toBeInTheDocument()
})

test('se il Borgomastro eletto è morto, il promemoria riappare', () => {
  const giocatori = [{ id: '1', nome: 'Anna', vivo: false, ruoloSlug: 'villico', eBorgomastro: true }]
  render(<AlbaPanel giocatori={giocatori} round={1} ruoliSelezionati={['borgomastro']} onVaiAlVoto={() => {}} />)
  expect(screen.getByText(/deve eleggere un borgomastro/i)).toBeInTheDocument()
})

test('senza il Borgomastro nel mazzo non mostra mai il promemoria', () => {
  render(<AlbaPanel giocatori={[]} round={1} ruoliSelezionati={['villico']} onVaiAlVoto={() => {}} />)
  expect(screen.queryByText(/deve eleggere un borgomastro/i)).not.toBeInTheDocument()
})

test('la Suocera si rivela alla morte anche già all\'alba (morte notturna), non solo di giorno', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: false, mortoNotte: 2, causaMorte: 'notte' }]
  const aggiornaGiocatore = vi.fn()
  render(
    <AlbaPanel
      giocatori={giocatori}
      round={2}
      onVaiAlVoto={() => {}}
      aggiornaGiocatore={aggiornaGiocatore}
      ruoliSelezionati={['suocera']}
    />,
  )

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'La Suocera si rivela' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'suocera', storiaRuoli: ['suocera'] })
})

test('Annulla morte giocatore riporta in vita chi era stato dichiarato morto per errore, già all\'alba', async () => {
  const user = userEvent.setup()
  const giocatori = [{ id: '1', nome: 'Anna', vivo: false, mortoNotte: 2, causaMorte: 'notte' }]
  const aggiornaGiocatore = vi.fn()
  render(<AlbaPanel giocatori={giocatori} round={2} onVaiAlVoto={() => {}} aggiornaGiocatore={aggiornaGiocatore} />)

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Annulla morte giocatore' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { vivo: true, causaMorte: undefined, mortoNotte: undefined })
})

test("L'Antico sbranato di notte: l'evento conferma la rivelazione e lo converte in Villico (una vita, nessun potere), lasciando il flag", async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'lantico', storiaRuoli: ['lantico'], anticoSbranatoNotte: 2, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  render(<AlbaPanel giocatori={giocatori} round={2} aggiornaGiocatore={aggiornaGiocatore} onVaiAlVoto={() => {}} />)

  await user.click(screen.getByRole('button', { name: /conferma la rivelazione di anna/i }))

  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', { ruoloSlug: 'villico', storiaRuoli: ['lantico', 'villico'] })
})

test("senza L'Antico sbranato (o già rivelato) non compare l'evento di rivelazione", () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'villico', storiaRuoli: ['lantico', 'villico'], anticoSbranatoNotte: 2, condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'lantico', condizioni: [] },
  ]
  render(<AlbaPanel giocatori={giocatori} round={2} aggiornaGiocatore={() => {}} onVaiAlVoto={() => {}} />)

  expect(screen.queryByRole('button', { name: /conferma la rivelazione/i })).not.toBeInTheDocument()
})

test('Annulla morte all\'alba usa annullaMorte (disfa la catena) più la patch sul giocatore', async () => {
  const user = userEvent.setup()
  const aggiornaGiocatore = vi.fn()
  const annullaMorte = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, causaMorte: 'notte', mortoNotte: 2, ruoloSlug: 'villico', condizioni: [] },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'villico', condizioni: [] },
  ]
  render(
    <AlbaPanel giocatori={giocatori} round={2} aggiornaGiocatore={aggiornaGiocatore} annullaMorte={annullaMorte} onVaiAlVoto={() => {}} />,
  )

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: 'Annulla morte giocatore' }))
  await user.click(screen.getByRole('button', { name: 'Anna' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))

  expect(annullaMorte).toHaveBeenCalledWith('1')
  expect(aggiornaGiocatore).toHaveBeenCalledWith('1', expect.objectContaining({ vivo: true }))
})

test("resurrezione: all'apertura dell'Alba il marcatore resuscitaAllAlba porta in vita da solo, senza pulsante, con un promemoria testuale", () => {
  const aggiornaGiocatore = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: false, mortoNotte: 2, causaMorte: 'notte', ruoloSlug: 'villico', condizioni: [], resuscitaAllAlba: 2 },
    { id: '2', nome: 'Marco', vivo: false, mortoNotte: 2, causaMorte: 'notte', ruoloSlug: 'villico', condizioni: [] },
    { id: '3', nome: 'Luca', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
  ]
  render(<AlbaPanel giocatori={giocatori} round={2} aggiornaGiocatore={aggiornaGiocatore} onVaiAlVoto={() => {}} />)

  expect(screen.getByText('Marco')).toBeInTheDocument()
  expect(screen.queryByText('Anna')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /annuncia resurrezione/i })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Vai al voto' })).toBeEnabled()
  expect(aggiornaGiocatore).toHaveBeenCalledTimes(1)
  expect(aggiornaGiocatore).toHaveBeenCalledWith(
    '1',
    expect.objectContaining({ vivo: true, resuscitatoNotte: 2, condizioni: ['resuscitato'], resuscitaAllAlba: undefined }),
  )
})

function AlbaPanelConAntico({ iniziali }) {
  const [giocatori, setGiocatori] = useState(iniziali)
  const aggiornaGiocatore = (id, patch) => setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  return (
    <>
      <AlbaPanel
        giocatori={giocatori}
        round={2}
        aggiornaGiocatore={aggiornaGiocatore}
        quantita={{ lantico: 1 }}
        ruoliSelezionati={['lantico']}
        onVaiAlVoto={() => {}}
      />
      <pre data-testid="stato">{JSON.stringify(giocatori[0])}</pre>
    </>
  )
}

function AlbaConStato({ iniziali }) {
  const [giocatori, setGiocatori] = useState(iniziali)
  const aggiornaGiocatore = (id, patch) => setGiocatori((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  return <AlbaPanel giocatori={giocatori} round={2} aggiornaGiocatore={aggiornaGiocatore} onVaiAlVoto={() => {}} />
}

test('resurrezione: con stato reale e StrictMode resuscita una sola volta e compare il promemoria', () => {
  const iniziali = [
    { id: '1', nome: 'Anna', vivo: false, mortoNotte: 2, causaMorte: 'notte', ruoloSlug: 'villico', condizioni: [], resuscitaAllAlba: 2 },
    { id: '2', nome: 'Luca', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
  ]
  render(
    <StrictMode>
      <AlbaConStato iniziali={iniziali} />
    </StrictMode>,
  )
  expect(screen.getByText('Anna è stato resuscitato.')).toBeInTheDocument()
  expect(screen.getByText('Nessuno è morto questa notte.')).toBeInTheDocument()
})

test("L'Antico sbranato con ruolo ignoto: 'L'Antico si rivela' tra i morti della notte lo riporta in vita da Villico con il flag, e l'alba non lo elenca più tra i morti", async () => {
  const user = userEvent.setup()
  const iniziali = [
    { id: '1', nome: 'Tizio', vivo: false, mortoNotte: 2, causaMorte: 'notte', mortoDa: 'branco', condizioni: [] },
    { id: '2', nome: 'Luca', vivo: true, ruoloSlug: 'lupo-mannaro', condizioni: [] },
  ]
  render(
    <AlbaPanelConAntico iniziali={iniziali} />,
  )
  expect(screen.getByText('Tizio')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /eventi speciali/i }))
  await user.click(screen.getByRole('button', { name: "L'Antico si rivela" }))
  await user.click(screen.getByRole('button', { name: 'Tizio' }))
  await user.click(screen.getByRole('button', { name: /conferma/i }))

  expect(screen.getByText('Nessuno è morto questa notte.')).toBeInTheDocument()
  expect(screen.getByText(/Tizio si è rivelato: è L'Antico/)).toBeInTheDocument()
  expect(JSON.parse(screen.getByTestId('stato').textContent)).toMatchObject({
    vivo: true,
    ruoloSlug: 'villico',
    storiaRuoli: ['lantico', 'villico'],
    anticoSbranatoNotte: 2,
  })
  expect(JSON.parse(screen.getByTestId('stato').textContent).causaMorte).toBeUndefined()
})
