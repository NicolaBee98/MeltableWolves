import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerCard } from './PlayerCard'

const giocatore = { id: '1', nome: 'Marco', ruoloSlug: undefined, vivo: true, condizioni: [] }

test('mostra solo il nome del giocatore', () => {
  render(<PlayerCard giocatore={giocatore} onRemove={() => {}} />)
  expect(screen.getByText('Marco')).toBeInTheDocument()
})

// jsdom non esegue davvero transizioni/animazioni CSS: si simulano a mano
// gli eventi che nel browser scattano al loro termine (transitionend per il
// riempimento, poi animationend per l'uscita), dopo pointerdown.
test('tenere premuto fino al riempimento completo, poi fino alla fine dell\'animazione di uscita, chiama onRemove con l\'id del giocatore', () => {
  const onRemove = vi.fn()
  render(<PlayerCard giocatore={giocatore} onRemove={onRemove} />)

  const bottone = screen.getByRole('button', { name: /tieni premuto per rimuovere marco/i })
  fireEvent.pointerDown(bottone)
  fireEvent.transitionEnd(bottone.querySelector('.player-card__elimina-riempimento'), { propertyName: 'width' })
  expect(onRemove).not.toHaveBeenCalled()

  fireEvent.animationEnd(bottone.closest('article'))

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
