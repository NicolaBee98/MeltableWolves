import { useState } from 'react'
import { ROLES } from '../../../data/roles'
import { segnaUsoStanotte, aggiornaTuttiConRuolo } from '../../../data/effettiNotte'
import { ruoliAssegnabili } from '../../../data/assegnazione'
import { RUOLI_RIVELAZIONE_ALLA_MORTE } from '../../../data/nightSteps'

// Fantasma Onnisciente e Suocera (RUOLI_RIVELAZIONE_ALLA_MORTE) non sono mai
// la carta segreta in mano a un giocatore vivo: si ricevono solo alla morte.
// Il Borgomastro non è nemmeno una carta a sé: è un titolo assegnato per
// elezione sopra il ruolo già posseduto (pag. 13), "questo giocatore
// mantiene comunque il ruolo assegnatogli all'inizio della partita". Nessuno
// dei tre può quindi essere la risposta a "che carta tiene in mano?".
const RUOLI_NON_CARTA_SEGRETA = [...RUOLI_RIVELAZIONE_ALLA_MORTE, 'borgomastro']

function nomeRuolo(ruoloSlug) {
  return ROLES.find((r) => r.slug === ruoloSlug)?.nome ?? 'ruolo sconosciuto'
}

// Usato da Cartomante (bersaglio vivo, "alternativa al Veggente" ma rivela
// il ruolo intero) e Medium (bersaglio morto, il "vecchio ruolo").
export function AzioneRivelaRuolo({
  giocatori,
  aggiornaGiocatore,
  round,
  ruoloSlugAttore,
  etichettaAttore,
  bersaglio,
  ruoliSelezionati = [],
  quantita = {},
}) {
  // se il bersaglio non ha ancora un ruolo noto all'app (nessuno step
  // dedicato l'ha ancora assegnato), il narratore vede comunque la carta
  // fisica: gliela si chiede per assegnarla subito, invece di registrare
  // "ruolo sconosciuto" — il potere fa guadagnare informazioni anche a lui
  const [targetInAttesaDiRuolo, setTargetInAttesaDiRuolo] = useState(null)
  const ruoli = [ruoloSlugAttore]
  const potere = `${ruoloSlugAttore}-indagine`
  const attore = giocatori.find((g) => g.ruoloSlug === ruoloSlugAttore)
  const candidati = giocatori.filter((g) => (bersaglio === 'morto' ? !g.vivo : g.vivo && g.id !== attore?.id))
  const indagineStanotte = attore?.ultimaIndagine?.notte === round ? attore.ultimaIndagine : null

  function registraIndagine(targetId, ruoloRivelato) {
    if (attore) {
      aggiornaTuttiConRuolo(giocatori, aggiornaGiocatore, ruoloSlugAttore, {
        ultimaIndagine: { targetId, ruoloRivelato, notte: round },
      })
    }
    segnaUsoStanotte(giocatori, aggiornaGiocatore, ruoli, potere)
  }

  function confermaScelta(targetId) {
    const target = giocatori.find((g) => g.id === targetId)
    if (target && !target.ruoloSlug) {
      setTargetInAttesaDiRuolo(targetId)
      return
    }
    registraIndagine(targetId, target?.ruoloSlug)
  }

  function confermaRuoloVisto(ruoloSlug) {
    const target = giocatori.find((g) => g.id === targetInAttesaDiRuolo)
    aggiornaGiocatore(targetInAttesaDiRuolo, {
      ruoloSlug,
      storiaRuoli: [...(target?.storiaRuoli ?? []), ruoloSlug],
    })
    registraIndagine(targetInAttesaDiRuolo, ruoloSlug)
    setTargetInAttesaDiRuolo(null)
  }

  if (targetInAttesaDiRuolo) {
    const target = giocatori.find((g) => g.id === targetInAttesaDiRuolo)
    // qui, a differenza dell'assegnazione automatica di inizio notte, anche
    // il Villico va offerto: il narratore vede la carta fisica in mano, può
    // benissimo essere quella
    const opzioni = ruoliAssegnabili(
      ruoliSelezionati.filter((slug) => !RUOLI_NON_CARTA_SEGRETA.includes(slug)),
      giocatori,
      quantita,
    )
    return (
      <div className="azione-indagine">
        <p>La carta di {target?.nome} è ancora sconosciuta: quale ruolo mostra?</p>
        <div className="scelta-giocatore__chips" role="group" aria-label="Che ruolo era">
          {opzioni.map((slug) => (
            <button key={slug} type="button" className="chip" onClick={() => confermaRuoloVisto(slug)}>
              {nomeRuolo(slug)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (candidati.length === 0) {
    return <p>Nessun bersaglio disponibile.</p>
  }

  // come il Veggente: la chip resta modificabile finché non si preme
  // "Avanti" (vedi AzioneIndagine). Un bersaglio con ruolo GIÀ noto può
  // essere ricambiato liberamente (è solo informativo); uno con ruolo
  // ignoto invece, una volta assegnato tramite il flusso qui sopra, resta
  // assegnato per sempre (è un fatto reale sul giocatore, non solo la
  // scelta dell'attore) anche se in seguito si indaga qualcun altro.
  return (
    <div className="azione-indagine">
      <p>{bersaglio === 'morto' ? 'Chi interrogare (defunto)' : 'Chi indagare'}</p>
      <div className="scelta-giocatore__chips" role="group" aria-label={bersaglio === 'morto' ? 'Chi interrogare (defunto)' : 'Chi indagare'}>
        {candidati.map((g) => (
          <button
            key={g.id}
            type="button"
            className="chip"
            aria-pressed={indagineStanotte?.targetId === g.id}
            onClick={() => confermaScelta(g.id)}
          >
            {g.nome}
          </button>
        ))}
      </div>
      {indagineStanotte && (
        <p className="azione-indagine__esito">
          Mostra a {etichettaAttore} la carta: {nomeRuolo(indagineStanotte.ruoloRivelato)}
        </p>
      )}
    </div>
  )
}
