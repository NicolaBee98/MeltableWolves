import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerCard } from './PlayerCard'

const giocatore = { id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [] }

test('mostra solo il nome del giocatore', () => {
  render(<PlayerCard giocatore={giocatore} onRemove={() => {}} />)
  expect(screen.getByText('Marco')).toBeInTheDocument()
})

// jsdom non esegue davvero le transizioni CSS: si simula il "tieni premuto
// fino al riempimento" innescando a mano l'evento che nel browser scatta al
// termine dell'animazione (transitionend), dopo pointerdown.
test('tenere premuto fino al riempimento completo (transitionend) chiama onRemove con l\'id del giocatore', () => {
  const onRemove = vi.fn()
  render(<PlayerCard giocatore={giocatore} onRemove={onRemove} />)

  const bottone = screen.getByRole('button', { name: /tieni premuto per rimuovere marco/i })
  fireEvent.pointerDown(bottone)
  fireEvent.transitionEnd(bottone.querySelector('.player-card__elimina-riempimento'), { propertyName: 'width' })

  expect(onRemove).toHaveBeenCalledWith('1')
})

test('rilasciare prima del riempimento completo non chiama onRemove', () => {
  const onRemove = vi.fn()
  render(<PlayerCard giocatore={giocatore} onRemove={onRemove} />)

  const bottone = screen.getByRole('button', { name: /tieni premuto per rimuovere marco/i })
  fireEvent.pointerDown(bottone)
  fireEvent.pointerUp(bottone)
  // un eventuale transitionend arrivato DOPO il rilascio (es. rimasto in
  // coda) non deve comunque rimuovere il giocatore
  fireEvent.transitionEnd(bottone.querySelector('.player-card__elimina-riempimento'), { propertyName: 'width' })

  expect(onRemove).not.toHaveBeenCalled()
})
