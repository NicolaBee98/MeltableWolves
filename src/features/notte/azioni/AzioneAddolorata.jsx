import { useState } from 'react'
import { eMimoCopiante, conRuolo } from '../../../data/assegnazione'
import { patchEredita, LEGAMI_PRIMA_NOTTE } from '../../../data/risoluzioneNotte'

const SCAMBIO = 'addolorata-scambio'
const giaSwappato = (g) => (g.poteriUsati ?? []).includes(SCAMBIO)
// campi che lo scambio può toccare: salvati all'ingresso per poterlo annullare
const CAMPI_SCAMBIO = ['ruoloSlug', 'storiaRuoli', 'poteriUsati', 'legame', 'legameMimo']
const campiScambio = (g) => Object.fromEntries(CAMPI_SCAMBIO.map((k) => [k, g[k]]))

// Ogni Addolorata (la titolare e il Mimo che la copia) ha il PROPRIO potere e
// lo usa in modo indipendente: un'Addolorata che ha già scambiato lascia
// l'altra Addolorata com'è, finché non scambia a sua volta. Il ruolo della
// vittima non passa mai a due persone: una sola Addolorata scambia con la
// stessa vittima.
// Vittima del rogo di oggi: anche il Cavaliere che si è immolato al rogo vale come vittima
// (il bruciato si è salvato, il Cavaliere è morto al suo posto).
export function AzioneAddolorata({ giocatori, aggiornaGiocatore, round, ereditaScelte = true }) {
  const vittima =
    giocatori.find((g) => g.causaMorte === 'rogo' && g.mortoNotte === round) ??
    giocatori.find((g) => g.causaMorte === 'sacrificio' && g.sacrificioDa === 'rogo' && g.sacrificioRogoRound === round)
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
          giocatori={giocatori}
          conNome={attori.length > 1}
          ereditaScelte={ereditaScelte}
          aggiornaGiocatore={aggiornaGiocatore}
        />
      ))}
    </div>
  )
}

function ScambioAddolorata({ attore, vittima, conNome, aggiornaGiocatore, ereditaScelte, giocatori }) {
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
  const [originali] = useState(() => ({ attore: campiScambio(attore), vittima: campiScambio(vittima) }))
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

  // è uno SCAMBIO (pag. 21), non una copia. L'Addolorata prende il ruolo con le SUE
  // scelte: poteri già usati dal morto passano come usati; il legame di Apprendista/
  // Cavaliere/Figlia non ancora attivato passa solo se l'impostazione lo consente
  // (mai dal Cavaliere immolato); altrimenti il ruolo arriva "scarico". Una vittima
  // di ruolo ignoto lascia un Villico: l'Addolorata non resta senza carta.
  function scambia() {
    const campo = attore.legame?.tipo === 'mimo' ? 'legameMimo' : 'legame'
    const eredita = ruoloOriginaleVittima
      ? patchEredita(giocatori, attore, campo, vittima, { conLegame: ereditaScelte && vittima.causaMorte !== 'sacrificio' })
      : { ruoloSlug: 'villico', storiaRuoli: conRuolo(attore.storiaRuoli, 'villico') }
    // il campo legame si scrive solo per i ruoli che ne hanno uno (non sporca gli altri)
    if (!LEGAMI_PRIMA_NOTTE.includes(ruoloOriginaleVittima)) delete eredita[campo]
    aggiornaGiocatore(attore.id, {
      ...eredita,
      poteriUsati: [...new Set([...(eredita.poteriUsati ?? attore.poteriUsati ?? []), SCAMBIO])],
    })
    // la vittima non tiene più il legame del vecchio ruolo (se resuscitata non deve agire)
    const legameVittima = ['legame', 'legameMimo'].filter((k) => vittima[k]?.tipo === ruoloOriginaleVittima)
    aggiornaGiocatore(vittima.id, {
      ruoloSlug: ruoloVittima,
      // la storia deve contenere anche il ruolo che la vittima aveva prima (può mancare
      // se lo aveva ereditato o assegnato senza storia)
      storiaRuoli: conRuolo(conRuolo(vittima.storiaRuoli, ruoloOriginaleVittima), ruoloVittima),
      ...Object.fromEntries(legameVittima.map((k) => [k, null])),
    })
  }

  // un secondo click annulla lo scambio: l'Addolorata torna tale e la vittima
  // al suo ruolo originale (con legami, storia e poteri com'erano all'ingresso)
  function annullaScambio() {
    aggiornaGiocatore(attore.id, originali.attore)
    aggiornaGiocatore(vittima.id, originali.vittima)
  }

  return (
    <div>
      <p>Scambiare il ruolo{nome} con quello di {vittima.nome} (vittima del rogo)?</p>
      {!ruoloOriginaleVittima && (
        <p className="avviso">⚠️ Il ruolo di {vittima.nome} è ignoto: chi scambia diventa Villico.</p>
      )}
      <button type="button" aria-pressed={scambiato} onClick={scambiato ? annullaScambio : scambia}>
        {scambiato ? 'Annulla scambio' : 'Scambia'}
      </button>
    </div>
  )
}
