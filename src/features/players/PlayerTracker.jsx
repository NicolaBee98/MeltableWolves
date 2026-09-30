import { useState } from 'react'
import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

// l'ordine dei giocatori riflette i posti a sedere intorno al tavolo: conta
// per chi ha bisogno di sapere chi siede a fianco a chi (Untore, Pastore,
// Berserker...), quindi il narratore deve poterlo correggere trascinando.
export function PlayerTracker({ giocatori, addGiocatore, removeGiocatore, onRiordina = () => {}, onEliminaTutti }) {
  const [confermaElimina, setConfermaElimina] = useState(false)

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
      <h3>Giocatori ({giocatori.length})</h3>
      <AddPlayerForm onAdd={addGiocatore} />
      {giocatori.length === 0 ? (
        <p className="player-tracker__vuoto">Nessun giocatore aggiunto.</p>
      ) : (
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
      )}
      {/* i nomi restano da una partita all'altra (stesso gruppo al tavolo,
          vedi resetPartita): questo è l'unico modo esplicito per ripartire
          con persone diverse, quindi chiede conferma come le altre azioni
          distruttive dell'app */}
      {giocatori.length > 0 && onEliminaTutti && (
        confermaElimina ? (
          <p className="player-tracker__conferma">
            Eliminare tutti i {giocatori.length} giocatori?
            <button
              type="button"
              className="player-tracker__conferma-cta"
              onClick={() => {
                onEliminaTutti()
                setConfermaElimina(false)
              }}
            >
              Sì, elimina tutti
            </button>
            <button type="button" onClick={() => setConfermaElimina(false)}>
              Annulla
            </button>
          </p>
        ) : (
          <button type="button" className="player-tracker__elimina-tutti" onClick={() => setConfermaElimina(true)}>
            Elimina tutti i giocatori
          </button>
        )
      )}
    </section>
  )
}
