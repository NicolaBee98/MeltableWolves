import { useState } from 'react'
import { aggiornaTuttiConRuolo } from '../../../data/effettiNotte'

// il potere è "per tutta la partita" (una volta sola): se era già stato
// usato PRIMA di arrivare a questo passo (una notte precedente), resta
// bloccato per sempre. Ma se lo usiamo ORA, deve restare comunque
// modificabile finché non si preme "Avanti" (principio generale, vedi
// AzioneStrega/AzioneChupacabra): la scelta va quindi scattata una volta
// sola all'ingresso nel passo (poteriUsatiAllIngresso), non ricalcolata a
// ogni render — altrimenti il click stesso la farebbe scomparire subito.
export function AzioneAddolorata({ giocatori, aggiornaGiocatore, round }) {
  // NON si può più cercare "chi ha ruoloSlug 'addolorata'" per sapere se il
  // potere è già stato usato: lo scambio cambia proprio quel ruoloSlug, quindi
  // dopo averlo usato nessuno lo tiene più. Il marcatore 'addolorata-scambio'
  // in poteriUsati resta invece sul giocatore qualunque sia il suo ruolo attuale.
  const giaSwappato = (g) => (g.poteriUsati ?? []).includes('addolorata-scambio')
  const [giaUsatoAllIngresso] = useState(() => giocatori.some(giaSwappato))
  const vittima = giocatori.find((g) => g.causaMorte === 'rogo' && g.mortoNotte === round)
  // il ruolo ORIGINALE della vittima, catturato all'ingresso: dopo lo
  // scambio vittima.ruoloSlug diventa 'addolorata' (è uno SCAMBIO, non una
  // copia, vedi scambia() sotto), quindi serve un riferimento stabile a "che
  // ruolo aveva prima" per poterlo ripristinare con "Annulla scambio"
  const [ruoloOriginaleVittima] = useState(() => vittima?.ruoloSlug)
  const scambiato = giocatori.some(giaSwappato)

  if (giaUsatoAllIngresso) {
    return <p>Potere già utilizzato in questa partita.</p>
  }

  if (!vittima) {
    return <p>Nessuna vittima al rogo questa notte: nessuna azione disponibile.</p>
  }

  // è uno SCAMBIO (pag. 21), non una copia: l'Addolorata prende il ruolo
  // della vittima, e la vittima diventa "Addolorata" a sua volta — così se
  // qualcuno la resuscita in seguito, torna con i poteri dell'Addolorata,
  // non con quelli del suo vecchio ruolo che non ha più. Se il Mimo sta
  // imitando l'Addolorata (stesso ruoloSlug, vedi AzioneMimo.jsx), lo
  // scambio va scritto su entrambi: altrimenti il Mimo resterebbe
  // "addolorata" per sempre anche dopo che la vera Addolorata ha già
  // cambiato identità.
  function scambia() {
    aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'addolorata', (g) => ({
      ruoloSlug: ruoloOriginaleVittima,
      poteriUsati: [...(g.poteriUsati ?? []), 'addolorata-scambio'],
    }))
    aggiornaGiocatore(vittima.id, {
      ruoloSlug: 'addolorata',
      storiaRuoli: [...(vittima.storiaRuoli ?? []), 'addolorata'],
    })
  }

  // un secondo click annulla lo scambio su ENTRAMBI i lati: torna
  // "addolorata" solo chi l'ha davvero fatto adesso (marcato da
  // 'addolorata-scambio'), e la vittima torna al suo ruolo originale
  function annullaScambio() {
    giocatori
      .filter((g) => g.ruoloSlug === ruoloOriginaleVittima && giaSwappato(g))
      .forEach((g) =>
        aggiornaGiocatore(g.id, {
          ruoloSlug: 'addolorata',
          poteriUsati: (g.poteriUsati ?? []).filter((p) => p !== 'addolorata-scambio'),
        }),
      )
    aggiornaGiocatore(vittima.id, {
      ruoloSlug: ruoloOriginaleVittima,
      storiaRuoli: (vittima.storiaRuoli ?? []).filter((s) => s !== 'addolorata'),
    })
  }

  return (
    <div className="azione-addolorata">
      <p>Scambiare il ruolo con quello di {vittima.nome} (vittima del rogo)?</p>
      <button type="button" aria-pressed={scambiato} onClick={scambiato ? annullaScambio : scambia}>
        {scambiato ? 'Annulla scambio' : 'Scambia'}
      </button>
    </div>
  )
}
