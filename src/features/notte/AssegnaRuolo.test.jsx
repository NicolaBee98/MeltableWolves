import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssegnaRuolo } from './AssegnaRuolo'

test('cliccare un giocatore lo seleziona (chip attiva) senza assegnarlo subito', async () => {
  const user = userEvent.setup()
  const onCambiaSelezioni = vi.fn()
  const giocatori = [{ id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined }]
  render(
    <AssegnaRuolo
      ruoli={['paladino']}
      giocatori={giocatori}
      quantita={{ paladino: 1 }}
      selezioni={{}}
      onCambiaSelezioni={onCambiaSelezioni}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Steve' }))

  expect(onCambiaSelezioni).toHaveBeenCalledWith({ paladino: ['1'] })
})

test('ricliccare un giocatore già selezionato lo deseleziona', async () => {
  const user = userEvent.setup()
  const onCambiaSelezioni = vi.fn()
  const giocatori = [{ id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined }]
  render(
    <AssegnaRuolo
      ruoli={['paladino']}
      giocatori={giocatori}
      quantita={{ paladino: 1 }}
      selezioni={{ paladino: ['1'] }}
      onCambiaSelezioni={onCambiaSelezioni}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Steve' }))

  expect(onCambiaSelezioni).toHaveBeenCalledWith({ paladino: [] })
})

test('ruolo a capacità 1: scegliere un altro giocatore sostituisce il precedente invece di rifiutare il click', async () => {
  const user = userEvent.setup()
  const onCambiaSelezioni = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined },
    { id: '2', nome: 'Anna', vivo: true, ruoloSlug: undefined },
  ]
  render(
    <AssegnaRuolo
      ruoli={['sacerdote']}
      giocatori={giocatori}
      quantita={{ sacerdote: 1 }}
      selezioni={{ sacerdote: ['1'] }}
      onCambiaSelezioni={onCambiaSelezioni}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onCambiaSelezioni).toHaveBeenCalledWith({ sacerdote: ['2'] })
})

test('ruolo a capacità >1: selezionare oltre la capacità mostra un avviso e non chiama onCambiaSelezioni', async () => {
  const user = userEvent.setup()
  const onCambiaSelezioni = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined },
    { id: '2', nome: 'Anna', vivo: true, ruoloSlug: undefined },
    { id: '3', nome: 'Luca', vivo: true, ruoloSlug: undefined },
  ]
  render(
    <AssegnaRuolo
      ruoli={['guardia']}
      giocatori={giocatori}
      quantita={{ guardia: 2 }}
      selezioni={{ guardia: ['1', '2'] }}
      onCambiaSelezioni={onCambiaSelezioni}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Luca' }))

  expect(onCambiaSelezioni).not.toHaveBeenCalled()
  expect(screen.getByText(/puoi selezionare al massimo 2/i)).toBeInTheDocument()
})

test('resta visibile e modificabile anche a scelta già confermata (giocatore con ruoloSlug già scritto)', async () => {
  const user = userEvent.setup()
  const onRimuovi = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Steve', vivo: true, ruoloSlug: 'veggente' },
    { id: '2', nome: 'Anna', vivo: true, ruoloSlug: undefined },
  ]
  render(
    <AssegnaRuolo
      ruoli={['veggente']}
      giocatori={giocatori}
      quantita={{ veggente: 1 }}
      selezioni={{}}
      onCambiaSelezioni={() => {}}
      onRimuovi={onRimuovi}
    />,
  )

  expect(screen.getByRole('button', { name: 'Steve' })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Steve' }))

  expect(onRimuovi).toHaveBeenCalledWith('1', 'veggente')
})

test('con più varianti di ruolo, un selettore permette di scegliere quale assegnare, mantenendo selezioni separate', async () => {
  const user = userEvent.setup()
  const onCambiaSelezioni = vi.fn()
  const giocatori = [{ id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined }]
  render(
    <AssegnaRuolo
      ruoli={['lupo-mannaro', 'nonna']}
      giocatori={giocatori}
      quantita={{ 'lupo-mannaro': 1, nonna: 1 }}
      selezioni={{}}
      onCambiaSelezioni={onCambiaSelezioni}
    />,
  )

  await user.selectOptions(screen.getByRole('combobox'), 'nonna')
  await user.click(screen.getByRole('button', { name: 'Steve' }))

  expect(onCambiaSelezioni).toHaveBeenCalledWith({ nonna: ['1'] })
})

test('un giocatore già selezionato per un\'altra variante non è più candidato', () => {
  const giocatori = [
    { id: '1', nome: 'Steve', vivo: true, ruoloSlug: undefined },
    { id: '2', nome: 'Anna', vivo: true, ruoloSlug: undefined },
  ]
  render(
    <AssegnaRuolo
      ruoli={['lupo-mannaro']}
      giocatori={giocatori}
      quantita={{ 'lupo-mannaro': 2 }}
      selezioni={{ 'lupo-mannaro': ['1'] }}
      onCambiaSelezioni={() => {}}
    />,
  )

  expect(screen.getByRole('button', { name: 'Steve' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Anna' })).toBeInTheDocument()
})

test('non mostra giocatori già con un ruolo assegnato o morti', () => {
  const giocatori = [
    { id: '1', nome: 'Steve', vivo: true, ruoloSlug: 'veggente' },
    { id: '2', nome: 'Anna', vivo: false, ruoloSlug: undefined },
    { id: '3', nome: 'Marco', vivo: true, ruoloSlug: undefined },
  ]
  render(<AssegnaRuolo ruoli={['paladino']} giocatori={giocatori} selezioni={{}} onCambiaSelezioni={() => {}} />)

  expect(screen.queryByRole('button', { name: 'Steve' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Anna' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Marco' })).toBeInTheDocument()
})

test('non renderizza nulla se non ci sono ruoli da assegnare', () => {
  const { container } = render(
    <AssegnaRuolo ruoli={[]} giocatori={[]} selezioni={{}} onCambiaSelezioni={() => {}} />,
  )
  expect(container).toBeEmptyDOMElement()
})

test('Guardia e Guardia Mannara: nessun selettore "che ruolo mostra la carta", si scelgono insieme come un gruppo unico', () => {
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: undefined },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: undefined },
    { id: '3', nome: 'Luca', vivo: true, ruoloSlug: undefined },
  ]
  render(
    <AssegnaRuolo
      ruoli={['guardia-mannara', 'guardia']}
      giocatori={giocatori}
      quantita={{ guardia: 2, 'guardia-mannara': 1 }}
      selezioni={{}}
      onCambiaSelezioni={() => {}}
    />,
  )

  expect(screen.queryByText(/che ruolo mostra la carta/i)).not.toBeInTheDocument()
  expect(screen.getByText(/seleziona 3 giocatori in più/i)).toBeInTheDocument()
})

test('Guardia e Guardia Mannara: selezionare 3 giocatori li mette tutti sotto la stessa chiave "guardia" (la app sceglie da sola chi tradisce)', async () => {
  const user = userEvent.setup()
  const onCambiaSelezioni = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: undefined },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: undefined },
  ]
  render(
    <AssegnaRuolo
      ruoli={['guardia-mannara', 'guardia']}
      giocatori={giocatori}
      quantita={{ guardia: 2, 'guardia-mannara': 1 }}
      selezioni={{ guardia: ['1'] }}
      onCambiaSelezioni={onCambiaSelezioni}
    />,
  )

  await user.click(screen.getByRole('button', { name: 'Marco' }))

  expect(onCambiaSelezioni).toHaveBeenCalledWith({ guardia: ['1', '2'] })
})

test('Guardia e Guardia Mannara: la chip di chi ha già una delle due carte (anche già la traditrice) resta visibile e rimovibile', async () => {
  const user = userEvent.setup()
  const onRimuovi = vi.fn()
  const giocatori = [
    { id: '1', nome: 'Anna', vivo: true, ruoloSlug: 'guardia-mannara' },
    { id: '2', nome: 'Marco', vivo: true, ruoloSlug: 'guardia' },
    { id: '3', nome: 'Luca', vivo: true, ruoloSlug: undefined },
  ]
  render(
    <AssegnaRuolo
      ruoli={['guardia-mannara', 'guardia']}
      giocatori={giocatori}
      quantita={{ guardia: 2, 'guardia-mannara': 1 }}
      selezioni={{}}
      onCambiaSelezioni={() => {}}
      onRimuovi={onRimuovi}
    />,
  )

  expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Marco' })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: 'Anna' }))

  expect(onRimuovi).toHaveBeenCalledWith('1', 'guardia-mannara')
})
