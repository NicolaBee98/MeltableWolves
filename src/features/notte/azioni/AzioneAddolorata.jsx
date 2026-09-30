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
  const scambiato = giocatori.some(giaSwappato)

  if (giaUsatoAllIngresso) {
    return <p>Potere già utilizzato in questa partita.</p>
  }

  if (!vittima) {
    return <p>Nessuna vittima al rogo questa notte: nessuna azione disponibile.</p>
  }

  // se il Mimo sta imitando l'Addolorata (stesso ruoloSlug, vedi
  // AzioneMimo.jsx), lo scambio va scritto su entrambi: altrimenti il Mimo
  // resterebbe "addolorata" per sempre anche dopo che la vera Addolorata ha
  // già cambiato identità
  function scambia() {
    aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'addolorata', (g) => ({
      ruoloSlug: vittima.ruoloSlug,
      poteriUsati: [...(g.poteriUsati ?? []), 'addolorata-scambio'],
    }))
  }

  // un secondo click annulla lo scambio: torna "addolorata" solo chi
  // l'ha davvero fatto adesso (marcato da 'addolorata-scambio'), non
  // chiunque altro già tenga per conto suo il ruolo di vittima.nome
  function annullaScambio() {
    giocatori
      .filter((g) => g.ruoloSlug === vittima.ruoloSlug && (g.poteriUsati ?? []).includes('addolorata-scambio'))
      .forEach((g) =>
        aggiornaGiocatore(g.id, {
          ruoloSlug: 'addolorata',
          poteriUsati: (g.poteriUsati ?? []).filter((p) => p !== 'addolorata-scambio'),
        }),
      )
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
