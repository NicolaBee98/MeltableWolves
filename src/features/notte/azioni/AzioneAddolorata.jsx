import { aggiornaTuttiConRuolo } from '../../../data/effettiNotte'

export function AzioneAddolorata({ giocatori, aggiornaGiocatore, round }) {
  const addolorata = giocatori.find((g) => g.ruoloSlug === 'addolorata')
  const poteriUsati = addolorata?.poteriUsati ?? []
  const giaUsato = poteriUsati.includes('addolorata-scambio')
  const vittima = giocatori.find((g) => g.causaMorte === 'rogo' && g.mortoNotte === round)

  if (giaUsato) {
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

  return (
    <div className="azione-addolorata">
      <p>Scambiare il ruolo con quello di {vittima.nome} (vittima del rogo)?</p>
      <button type="button" onClick={scambia}>
        Scambia
      </button>
    </div>
  )
}
