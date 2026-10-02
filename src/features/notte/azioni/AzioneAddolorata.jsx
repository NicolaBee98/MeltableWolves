import { useState } from 'react'
import { eMimoCopiante } from '../../../data/assegnazione'

const SCAMBIO = 'addolorata-scambio'
const giaSwappato = (g) => (g.poteriUsati ?? []).includes(SCAMBIO)

// Ogni Addolorata (la titolare e il Mimo che la copia) ha il PROPRIO potere e
// lo usa in modo indipendente: un'Addolorata che ha già scambiato lascia
// l'altra Addolorata com'è, finché non scambia a sua volta. Il ruolo della
// vittima non passa mai a due persone: una sola Addolorata scambia con la
// stessa vittima.
export function AzioneAddolorata({ giocatori, aggiornaGiocatore, round }) {
  const vittima = giocatori.find((g) => g.causaMorte === 'rogo' && g.mortoNotte === round)
  // le Addolorate in gioco all'ingresso nel passo: dopo lo scambio non hanno più
  // lo slug 'addolorata', ma devono restare qui per poterlo annullare
  const [attoriIds] = useState(() => giocatori.filter((g) => g.vivo && g.ruoloSlug === 'addolorata').map((g) => g.id))

  if (!vittima) {
    return <p>Nessuna vittima al rogo questa notte: nessuna azione disponibile.</p>
  }

  const attori = attoriIds.map((id) => giocatori.find((g) => g.id === id)).filter(Boolean)
  return (
    <div className="azione-addolorata">
      {attori.map((attore) => (
        <ScambioAddolorata
          key={attore.id}
          attore={attore}
          vittima={vittima}
          conNome={attori.length > 1}
          aggiornaGiocatore={aggiornaGiocatore}
        />
      ))}
    </div>
  )
}

function ScambioAddolorata({ attore, vittima, conNome, aggiornaGiocatore }) {
  // il potere è "per tutta la partita" (una volta sola): se era già stato
  // usato PRIMA di arrivare a questo passo, resta bloccato per sempre. Ma se lo
  // usiamo ORA, deve restare modificabile finché non si preme "Avanti"
  // (principio generale, vedi AzioneStrega/AzioneChupacabra): va quindi
  // catturato una volta sola all'ingresso, non ricalcolato a ogni render.
  const [giaUsatoAllIngresso] = useState(() => giaSwappato(attore))
  // il ruolo ORIGINALE della vittima, catturato all'ingresso: dopo lo
  // scambio vittima.ruoloSlug cambia, quindi serve un riferimento stabile a
  // "che ruolo aveva prima" per poterlo ripristinare con "Annulla scambio"
  const [ruoloOriginaleVittima] = useState(() => vittima.ruoloSlug)
  const scambiato = giaSwappato(attore)
  const nome = conNome ? ` (${attore.nome})` : ''

  if (giaUsatoAllIngresso) {
    return <p>Potere già utilizzato in questa partita{nome}.</p>
  }

  // se un'altra Addolorata ha già scambiato con questa vittima, il suo ruolo è
  // già passato a lei: non può passare anche a questa
  if (!scambiato && vittima.ruoloSlug !== ruoloOriginaleVittima) {
    return <p>Il ruolo di {vittima.nome} è già stato scambiato da un'altra Addolorata{nome}.</p>
  }

  // la vittima di un Mimo diventa un Villico senza poteri, quella della
  // titolare una vera Addolorata (se la resuscitano, torna con i suoi poteri)
  const ruoloVittima = eMimoCopiante(attore) ? 'villico' : 'addolorata'

  // è uno SCAMBIO (pag. 21), non una copia
  function scambia() {
    aggiornaGiocatore(attore.id, {
      ruoloSlug: ruoloOriginaleVittima,
      poteriUsati: [...(attore.poteriUsati ?? []), SCAMBIO],
    })
    aggiornaGiocatore(vittima.id, {
      ruoloSlug: ruoloVittima,
      storiaRuoli: [...(vittima.storiaRuoli ?? []), ruoloVittima],
    })
  }

  // un secondo click annulla lo scambio: l'Addolorata torna tale e la vittima
  // al suo ruolo originale
  function annullaScambio() {
    aggiornaGiocatore(attore.id, {
      ruoloSlug: 'addolorata',
      poteriUsati: (attore.poteriUsati ?? []).filter((p) => p !== SCAMBIO),
    })
    aggiornaGiocatore(vittima.id, {
      ruoloSlug: ruoloOriginaleVittima,
      storiaRuoli: (vittima.storiaRuoli ?? []).slice(0, -1),
    })
  }

  return (
    <div>
      <p>Scambiare il ruolo{nome} con quello di {vittima.nome} (vittima del rogo)?</p>
      <button type="button" aria-pressed={scambiato} onClick={scambiato ? annullaScambio : scambia}>
        {scambiato ? 'Annulla scambio' : 'Scambia'}
      </button>
    </div>
  )
}
