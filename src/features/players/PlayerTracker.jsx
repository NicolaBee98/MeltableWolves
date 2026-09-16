import { ROLES } from '../../data/roles'
import { CONDIZIONI } from '../../data/conditions'
import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

export function PlayerTracker({ giocatori, addGiocatore, toggleVivo, setCondizioni, setNote }) {
  return (
    <section className="player-tracker">
      <AddPlayerForm onAdd={addGiocatore} />
      <div className="player-tracker__list">
        {giocatori.map((giocatore) => (
          <PlayerCard
            key={giocatore.id}
            giocatore={giocatore}
            ruolo={ROLES.find((r) => r.slug === giocatore.ruoloSlug)}
            condizioniDisponibili={CONDIZIONI}
            onToggleVivo={toggleVivo}
            onChangeCondizioni={setCondizioni}
            onChangeNote={setNote}
          />
        ))}
      </div>
    </section>
  )
}
