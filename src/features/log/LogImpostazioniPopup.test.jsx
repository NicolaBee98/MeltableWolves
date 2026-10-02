import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogImpostazioniPopup } from './LogImpostazioniPopup'

test('il popup è chiuso di default', () => {
  render(<LogImpostazioniPopup eventi={[]} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test("cliccando l'icona si apre il popup, di default sulla tab Impostazioni partita", async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Nuova Partita' })).toBeInTheDocument()
  expect(screen.queryByText(/nessun evento registrato/i)).not.toBeInTheDocument()
})

test('mostra gli eventi nella tab Log partita', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[{ round: 1, messaggio: 'Anna è morto/a' }]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Log partita' }))

  expect(screen.getByText(/anna è morto\/a/i)).toBeInTheDocument()
})

test('Nuova Partita chiede conferma con una UI coerente (non window.confirm) e non fa nulla se annullata', async () => {
  const user = userEvent.setup()
  const onNuovaPartita = vi.fn()
  render(<LogImpostazioniPopup eventi={[]} onNuovaPartita={onNuovaPartita} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))

  expect(screen.getByText(/iniziare una nuova partita/i)).toBeInTheDocument()
  // i giocatori restano: il testo non deve dire che vanno persi
  expect(screen.getByText(/i giocatori restano/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Annulla' }))

  expect(onNuovaPartita).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('Nuova Partita, confermata, chiama onNuovaPartita e chiude il popup', async () => {
  const user = userEvent.setup()
  const onNuovaPartita = vi.fn()
  render(<LogImpostazioniPopup eventi={[]} onNuovaPartita={onNuovaPartita} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Nuova Partita' }))
  await user.click(screen.getByRole('button', { name: 'Sì, ricomincia' }))

  expect(onNuovaPartita).toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('premere Esc chiude il popup e riporta il focus sul pulsante che lo aveva aperto', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  const icona = screen.getByRole('button', { name: 'Registro e impostazioni' })
  await user.click(icona)
  expect(screen.getByRole('dialog')).toBeInTheDocument()

  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(icona).toHaveFocus()
})

test('ricliccare "Registro e impostazioni" chiude il popup, come la (X)', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  const icona = screen.getByRole('button', { name: 'Registro e impostazioni' })
  await user.click(icona)
  expect(screen.getByRole('dialog')).toBeInTheDocument()

  await user.click(icona)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('all\'apertura il focus entra nel dialog', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByRole('dialog')).toHaveFocus()
})

test('la tab Impostazioni partita mostra il checkbox per i ruoli in votazione, coerente col flag ricevuto', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} mostraRuoliInVotazione={false} onCambiaMostraRuoliInVotazione={vi.fn()} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  expect(screen.getByRole('checkbox', { name: /mostra i ruoli durante la votazione/i })).not.toBeChecked()
})

test('attivare il checkbox dei ruoli chiama onCambiaMostraRuoliInVotazione con true', async () => {
  const user = userEvent.setup()
  const onCambiaMostraRuoliInVotazione = vi.fn()
  render(
    <LogImpostazioniPopup
      eventi={[]}
      mostraRuoliInVotazione={false}
      onCambiaMostraRuoliInVotazione={onCambiaMostraRuoliInVotazione}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('checkbox', { name: /mostra i ruoli durante la votazione/i }))

  expect(onCambiaMostraRuoliInVotazione).toHaveBeenCalledWith(true)
})

test('mostra il checkbox delle varianti di icona, coerente col flag ricevuto, e lo aggiorna al click', async () => {
  const user = userEvent.setup()
  const onCambiaVariantiFaccia = vi.fn()
  render(<LogImpostazioniPopup eventi={[]} variantiFaccia={true} onCambiaVariantiFaccia={onCambiaVariantiFaccia} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  const checkbox = screen.getByRole('checkbox', { name: /varianti di icona/i })
  expect(checkbox).toBeChecked()

  await user.click(checkbox)
  expect(onCambiaVariantiFaccia).toHaveBeenCalledWith(false)
})

test('mostra il checkbox per il nome del ruolo tra parentesi, coerente col flag ricevuto, e lo aggiorna al click', async () => {
  const user = userEvent.setup()
  const onCambiaMostraNomeRuolo = vi.fn()
  render(<LogImpostazioniPopup eventi={[]} mostraNomeRuolo={false} onCambiaMostraNomeRuolo={onCambiaMostraNomeRuolo} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  const checkbox = screen.getByRole('checkbox', { name: /nome del ruolo tra parentesi/i })
  expect(checkbox).not.toBeChecked()

  await user.click(checkbox)
  expect(onCambiaMostraNomeRuolo).toHaveBeenCalledWith(true)
})

test('mostra il checkbox per il promemoria dei ruoli morti, coerente col flag ricevuto, e lo aggiorna al click', async () => {
  const user = userEvent.setup()
  const onCambiaPromemoriaRuoliMorti = vi.fn()
  render(
    <LogImpostazioniPopup
      eventi={[]}
      promemoriaRuoliMorti={true}
      onCambiaPromemoriaRuoliMorti={onCambiaPromemoriaRuoliMorti}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  const checkbox = screen.getByRole('checkbox', { name: /richiama di notte i ruoli morti/i })
  expect(checkbox).toBeChecked()

  await user.click(checkbox)
  expect(onCambiaPromemoriaRuoliMorti).toHaveBeenCalledWith(false)
})

test('la durata del timer arrotonda i valori con decimali e non scende sotto 1', async () => {
  const user = userEvent.setup()
  const onCambiaDurataTimer = vi.fn()
  render(<LogImpostazioniPopup eventi={[]} durataTimer={60} onCambiaDurataTimer={onCambiaDurataTimer} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  const input = screen.getByLabelText(/durata timer/i)

  fireEvent.change(input, { target: { value: '1.5' } })
  expect(onCambiaDurataTimer).toHaveBeenLastCalledWith(2)

  fireEvent.change(input, { target: { value: '0' } })
  expect(onCambiaDurataTimer).toHaveBeenLastCalledWith(1)
})

test('la X in alto a destra chiude il popup', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)

  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))
  await user.click(screen.getByRole('button', { name: 'Chiudi' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('il dialog è modale e Tab dall\'ultimo elemento torna al primo (focus trap)', async () => {
  const user = userEvent.setup()
  render(<LogImpostazioniPopup eventi={[]} />)
  await user.click(screen.getByRole('button', { name: 'Registro e impostazioni' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveAttribute('aria-modal', 'true')

  const bottoni = dialog.querySelectorAll('button, input')
  bottoni[bottoni.length - 1].focus()
  await user.tab()
  expect(dialog.contains(document.activeElement)).toBe(true)
  expect(document.activeElement).toBe(bottoni[0])
})
