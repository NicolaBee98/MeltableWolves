import { useState } from 'react'
import { risultatoVotazione } from '../../data/votazione'
import { TimerSpareggio } from './TimerSpareggio'
import { MorteImprovvisa } from './MorteImprovvisa'

export function Votazione({
  giocatori,
  voti,
  fase,
  candidatiEsito = [],
  incrementaVoto,
  decrementaVoto,
  ricominciaVotazione,
  vaiAEsito,
  tornaAlVoto,
  onRogo,
  onMorteImprovvisa,
  onProsegui,
}) {
  const vivi = giocatori.filter((g) => g.vivo)
  const [daConfermare, setDaConfermare] = useState(null)
  // lo Spilungone non può essere messo al rogo (pag. 21): si rivela e basta,
  // niente vittima. Tracciato a parte perché non passa mai da onRogo.
  // ponytail: questo stato locale non si resetta tra un giorno e l'altro
  // (a differenza di voti/fase, che vivono nell'hook useVotazione): se lo
  // stesso Spilungone venisse designato una seconda volta in una notte
  // successiva, l'esito resterebbe comunque corretto (nessuna vittima) ma
  // salterebbe il passo di conferma. Da rivedere se capita davvero in una
  // partita reale.
  const [spilungoneRivelatoId, setSpilungoneRivelatoId] = useState(null)

  if (fase === 'esito') {
    // l'esito si calcola sui candidati congelati al momento di "Vai all'esito",
    // non sui giocatori vivi correnti: altrimenti il rogo di un candidato
    // cambia il pool e può svuotare la lista dei designati (vedi bug: rogo
    // che porta a uno spareggio senza nessuno indicato)
    const { vincitori: designati } = risultatoVotazione(voti, candidatiEsito)
    const morteConfermata =
      designati.some((id) => giocatori.find((g) => g.id === id)?.vivo === false) || spilungoneRivelatoId !== null

    function confermaMorte(id) {
      const target = giocatori.find((g) => g.id === id)
      if (target?.ruoloSlug === 'spilungone') {
        setSpilungoneRivelatoId(id)
      } else {
        onRogo(id)
      }
      setDaConfermare(null)
    }

    function renderConferma(id) {
      const nome = giocatori.find((g) => g.id === id)?.nome
      return (
        <div className="votazione__conferma">
          <p>Confermi che {nome} è morto?</p>
          <button type="button" onClick={() => confermaMorte(id)}>
            Sì, è morto
          </button>
          <button type="button" onClick={() => setDaConfermare(null)}>
            Annulla
          </button>
        </div>
      )
    }

    function renderEsitoDesignato(id) {
      if (spilungoneRivelatoId === id) {
        const nome = giocatori.find((g) => g.id === id)?.nome
        return (
          <p>
            {nome} rivela la propria carta: è lo Spilungone, troppo alto per il rogo. La notte cala senza
            vittime.
          </p>
        )
      }
      if (daConfermare === id) return renderConferma(id)
      if (!morteConfermata) {
        return (
          <button type="button" onClick={() => setDaConfermare(id)}>
            Dichiara morte sul rogo
          </button>
        )
      }
      return null
    }

    return (
      <section className="votazione votazione--esito">
        {designati.length === 1 ? (
          <div className="votazione__esito">
            <p>Vittima designata: {giocatori.find((g) => g.id === designati[0])?.nome}</p>
            {renderEsitoDesignato(designati[0])}
          </div>
        ) : (
          <div className="votazione__spareggio">
            <p>Spareggio tra: {designati.map((id) => giocatori.find((g) => g.id === id)?.nome).join(', ')}</p>
            <TimerSpareggio />
            {spilungoneRivelatoId !== null ? (
              renderEsitoDesignato(spilungoneRivelatoId)
            ) : !morteConfermata ? (
              daConfermare ? (
                renderEsitoDesignato(daConfermare)
              ) : (
                <div className="scelta-giocatore__chips" role="group" aria-label="Chi muore nello spareggio">
                  {designati.map((id) => (
                    <button key={id} type="button" className="chip" onClick={() => setDaConfermare(id)}>
                      {giocatori.find((g) => g.id === id)?.nome}
                    </button>
                  ))}
                </div>
              )
            ) : null}
          </div>
        )}
        {/* una volta confermata la morte, il voto del giorno è chiuso: niente
            "Torna al voto" per evitare una seconda esecuzione lo stesso giorno */}
        {!morteConfermata && (
          <button type="button" onClick={tornaAlVoto}>
            Torna al voto
          </button>
        )}
        <button type="button" onClick={onProsegui} disabled={!morteConfermata}>
          Prosegui alla notte
        </button>
        <MorteImprovvisa giocatori={giocatori} onDichiara={onMorteImprovvisa} />
      </section>
    )
  }

  const { maxVoti } = risultatoVotazione(voti, vivi.map((g) => g.id))

  return (
    <section className="votazione">
      <ul>
        {vivi.map((g) => (
          <li key={g.id}>
            <span>{g.nome}</span>
            <span>{voti[g.id] ?? 0} voti</span>
            <button type="button" onClick={() => decrementaVoto(g.id)}>
              -1
            </button>
            <button type="button" onClick={() => incrementaVoto(g.id)}>
              +1
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={ricominciaVotazione}>
        Ricomincia votazione
      </button>
      {maxVoti > 0 && (
        <button type="button" onClick={() => vaiAEsito(vivi.map((g) => g.id))}>
          Vai all'esito
        </button>
      )}
      <MorteImprovvisa giocatori={giocatori} onDichiara={onMorteImprovvisa} />
    </section>
  )
}
