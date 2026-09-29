import { segnaUsoStanotte, aggiornaTuttiConRuolo } from '../../../data/effettiNotte'

const RUOLI = ['cortigiana']
const POTERE = 'cortigiana-visita'

// come il Veggente: la chip scelta resta modificabile finché non si preme
// "Avanti" (visitaNotturna vive solo per la notte in corso, risolviCortigiana
// la azzera a fine notte, quindi è sicuro derivarne la selezione corrente)
export function AzioneCortigiana({ giocatori, aggiornaGiocatore }) {
  const cortigiana = giocatori.find((g) => g.ruoloSlug === 'cortigiana')
  const candidati = giocatori.filter((g) => g.vivo && g.id !== cortigiana?.id)

  function confermaScelta(targetId) {
    if (cortigiana) {
      aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, 'cortigiana', { visitaNotturna: targetId })
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, RUOLI, POTERE)
  }

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  return (
    <div className="scelta-giocatore">
      <p>Chi visita la Cortigiana</p>
      <div className="scelta-giocatore__chips" role="group" aria-label="Chi visita la Cortigiana">
        {candidati.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={cortigiana?.visitaNotturna === g.id}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
    </div>
  )
}
