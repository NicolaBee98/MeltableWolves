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

test('Tab non avvia l\'eliminazione, Invio sì; il blur la annulla', () => {
  render(<PlayerCard giocatore={giocatore} onRemove={() => {}} />)
  const bottone = screen.getByRole('button', { name: /tieni premuto per rimuovere marco/i })
  const riempimento = bottone.querySelector('.player-card__elimina-riempimento')

  fireEvent.keyDown(bottone, { key: 'Tab' })
  expect(riempimento.style.width).toBe('0%')

  fireEvent.keyDown(bottone, { key: 'Enter' })
  expect(riempimento.style.width).toBe('100%')

  fireEvent.blur(bottone)
  expect(riempimento.style.width).toBe('0%')
})

test('i gestori di drag stanno sulla card (niente maniglia) e il suo pointerdown non avvia l\'eliminazione', () => {
  const onPointerDown = vi.fn()
  render(<PlayerCard giocatore={giocatore} onRemove={() => {}} maniglia={{ onPointerDown }} />)
  expect(screen.queryByText('⋮⋮')).not.toBeInTheDocument()
  fireEvent.pointerDown(screen.getByText('Marco'))
  expect(onPointerDown).toHaveBeenCalled()
  expect(screen.getByRole('button', { name: /tieni premuto/i }).querySelector('.player-card__elimina-riempimento').style.width).toBe('0%')
})
