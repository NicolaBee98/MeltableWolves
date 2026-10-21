import { segnaUsoStanotte, annullaUsoStanotte, aggiornaTuttiConRuolo } from '../../../data/effettiNotte'
import { SceltaGiocatore } from '../../../components/SceltaGiocatore'

const RUOLI = ['cortigiana']
const POTERE = 'cortigiana-visita'

// come il Veggente: la chip scelta resta modificabile finché non si preme
// "Avanti" (visitaNotturna vive solo per la notte in corso, risolviCortigiana
// la azzera a fine notte, quindi è sicuro derivarne la selezione corrente)
export function AzioneCortigiana({ giocatori, aggiornaGiocatore, vivoAIngresso = (g) => g.vivo }) {
  const cortigiana = giocatori.find((g) => g.ruoloSlug === 'cortigiana')
  const candidati = giocatori.filter((g) => vivoAIngresso(g) && g.id !== cortigiana?.id)

  function confermaScelta(targetId) {
    // click sulla chip già scelta: annulla la visita
    if (cortigiana?.visitaNotturna === targetId) {
      aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'cortigiana', { visitaNotturna: null })
      annullaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
      return
    }
    if (cortigiana) {
      aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'cortigiana', { visitaNotturna: targetId })
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  if (candidati.length === 0) {
    return <p>Nessun giocatore da scegliere.</p>
  }

  return (
    <SceltaGiocatore
      candidati={candidati}
      etichetta="Chi visita la Cortigiana"
      selezionatoEsternoId={cortigiana?.visitaNotturna ?? null}
      onConferma={confermaScelta}
      mostraSalta={false}
    />
  )
}
