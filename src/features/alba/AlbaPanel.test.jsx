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
