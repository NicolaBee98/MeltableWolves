import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './ErrorBoundary'

function ComponenteCheEsplode() {
  throw new Error('boom')
}

// React logga l'errore due volte in console durante il test (dev mode):
// rumore atteso, non un fallimento del test
function nascondiConsoleError() {
  const originale = console.error
  console.error = () => {}
  return () => {
    console.error = originale
  }
}

test('senza errori mostra i figli normalmente', () => {
  render(
    <ErrorBoundary>
      <p>Contenuto normale</p>
    </ErrorBoundary>,
  )
  expect(screen.getByText('Contenuto normale')).toBeInTheDocument()
})

test('un errore di rendering nei figli mostra il messaggio di recupero, non uno schermo bianco', () => {
  const ripristina = nascondiConsoleError()
  render(
    <ErrorBoundary>
      <ComponenteCheEsplode />
    </ErrorBoundary>,
  )

  expect(screen.getByText(/errore imprevisto/i)).toBeInTheDocument()
  expect(screen.getByText(/i dati della partita sono salvati/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Ricarica' })).toBeInTheDocument()
  ripristina()
})

test('il pulsante Ricarica ricarica la pagina', async () => {
  const ripristina = nascondiConsoleError()
  const reload = vi.fn()
  const posizioneOriginale = window.location
  Object.defineProperty(window, 'location', { value: { ...posizioneOriginale, reload }, writable: true })

  const user = userEvent.setup()
  render(
    <ErrorBoundary>
      <ComponenteCheEsplode />
    </ErrorBoundary>,
  )
  await user.click(screen.getByRole('button', { name: 'Ricarica' }))

  expect(reload).toHaveBeenCalled()

  Object.defineProperty(window, 'location', { value: posizioneOriginale, writable: true })
  ripristina()
})
