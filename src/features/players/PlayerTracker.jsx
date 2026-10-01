import { useState } from 'react'
import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

// l'ordine dei giocatori riflette i posti a sedere intorno al tavolo: conta
// per chi ha bisogno di sapere chi siede a fianco a chi (Untore, Pastore,
// Berserker...), quindi il narratore deve poterlo correggere trascinando.
export function PlayerTracker({
  giocatori,
  addGiocatore,
  removeGiocatore,
  onRiordina = () => {},
  onEliminaTutti,
  partitaAvviata = false,
}) {
  const [confermaElimina, setConfermaElimina] = useState(false)
  // aggiungere/rimuovere qualcuno a partita avviata (notte iniziata o ruoli
  // già assegnati) sfasa mazzo, ruoli e posti a sedere: chiede conferma.
  // `versione` rimonta le card dopo un annulla (quella in uscita è già
  // animata fuori dallo schermo).
  const [daConfermare, setDaConfermare] = useState(null)
  const [versione, setVersione] = useState(0)

  function richiediAggiunta(nome) {
    if (partitaAvviata) setDaConfermare({ tipo: 'aggiungi', nome })
    else addGiocatore(nome)
  }

  function richiediRimozione(id) {
    if (partitaAvviata) setDaConfermare({ tipo: 'rimuovi', id, nome: giocatori.find((g) => g.id === id)?.nome })
    else removeGiocatore(id)
  }

  function confermaOperazione() {
    if (daConfermare.tipo === 'aggiungi') addGiocatore(daConfermare.nome)
    else removeGiocatore(daConfermare.id)
    setDaConfermare(null)
  }

  function annullaOperazione() {
    setDaConfermare(null)
    setVersione((v) => v + 1)
  }

  function sposta(indice, delta) {
    const riordinati = [...giocatori]
    const [giocatore] = riordinati.splice(indice, 1)
    riordinati.splice(indice + delta, 0, giocatore)
    onRiordina(riordinati)
  }

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
      <p className="player-tracker__istruzioni">
        Aggiungili nell'ordine in cui sono seduti al tavolo: alcuni ruoli (Untore, Pastore, Berserker...) dipendono da
        chi siede a fianco a chi. Puoi correggere l'ordine in seguito trascinando una card o con le frecce ▲/▼.
      </p>
      <AddPlayerForm onAdd={richiediAggiunta} nomiEsistenti={giocatori.map((g) => g.nome)} />
      {daConfermare && (
        <p className="player-tracker__conferma" role="alert">
          La partita è già avviata: {daConfermare.tipo === 'aggiungi' ? 'aggiungere' : 'rimuovere'} {daConfermare.nome}{' '}
          può sfasare mazzo, ruoli e posti a sedere. Procedere?
          <button type="button" className="player-tracker__conferma-cta" onClick={confermaOperazione}>
            Sì, procedi
          </button>
          <button type="button" onClick={annullaOperazione}>
            Annulla
          </button>
        </p>
      )}
      {giocatori.length === 0 ? (
        <p className="player-tracker__vuoto">Nessun giocatore aggiunto.</p>
      ) : (
        <div className="player-tracker__list">
          {giocatori.map((giocatore, indice) => (
            <PlayerCard
              key={`${giocatore.id}-${versione}`}
              giocatore={giocatore}
              onRemove={richiediRimozione}
              onSu={indice > 0 ? () => sposta(indice, -1) : undefined}
              onGiu={indice < giocatori.length - 1 ? () => sposta(indice, 1) : undefined}
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
            Eliminare tutti i {giocatori.length} giocatori?{partitaAvviata && ' La partita in corso verrà azzerata.'}
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
