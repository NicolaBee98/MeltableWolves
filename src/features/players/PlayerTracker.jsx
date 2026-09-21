import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

export function PlayerTracker({ giocatori, addGiocatore, removeGiocatore }) {
  return (
    <section className="player-tracker">
      <AddPlayerForm onAdd={addGiocatore} />
      <div className="player-tracker__list">
        {giocatori.map((giocatore) => (
          <PlayerCard key={giocatore.id} giocatore={giocatore} onRemove={removeGiocatore} />
        ))}
      </div>
    </section>
  )
}
