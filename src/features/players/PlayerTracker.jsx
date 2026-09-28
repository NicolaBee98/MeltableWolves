import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

// l'ordine dei giocatori riflette i posti a sedere intorno al tavolo: conta
// per chi ha bisogno di sapere chi siede a fianco a chi (Untore, Pastore,
// Berserker...), quindi il narratore deve poterlo correggere trascinando.
export function PlayerTracker({ giocatori, addGiocatore, removeGiocatore, onRiordina = () => {} }) {
  function handleDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e, targetId) {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === targetId) return

    const sorgente = giocatori.find((g) => g.id === sourceId)
    if (!sorgente) return
    const senzaSorgente = giocatori.filter((g) => g.id !== sourceId)
    const indiceTarget = senzaSorgente.findIndex((g) => g.id === targetId)
    if (indiceTarget === -1) return
    const riordinati = [
      ...senzaSorgente.slice(0, indiceTarget),
      sorgente,
      ...senzaSorgente.slice(indiceTarget),
    ]
    onRiordina(riordinati)
  }

  return (
    <section className="player-tracker">
      <AddPlayerForm onAdd={addGiocatore} />
      <div className="player-tracker__list">
        {giocatori.map((giocatore) => (
          <PlayerCard
            key={giocatore.id}
            giocatore={giocatore}
            onRemove={removeGiocatore}
            onDragStart={(e) => handleDragStart(e, giocatore.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, giocatore.id)}
          />
        ))}
      </div>
    </section>
  )
}
