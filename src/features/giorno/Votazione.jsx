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

  if (fase === 'esito') {
    // l'esito si calcola sui candidati congelati al momento di "Vai all'esito",
    // non sui giocatori vivi correnti: altrimenti il rogo di un candidato
    // cambia il pool e può svuotare la lista dei designati (vedi bug: rogo
    // che porta a uno spareggio senza nessuno indicato)
    const { vincitori: designati } = risultatoVotazione(voti, candidatiEsito)
    const morteConfermata = designati.some((id) => giocatori.find((g) => g.id === id)?.vivo === false)

    function confermaMorte(id) {
      onRogo(id)
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

    return (
      <section className="votazione votazione--esito">
        {designati.length === 1 ? (
          <div className="votazione__esito">
            <p>Vittima designata: {giocatori.find((g) => g.id === designati[0])?.nome}</p>
            {daConfermare === designati[0]
              ? renderConferma(designati[0])
              : !morteConfermata && (
                  <button type="button" onClick={() => setDaConfermare(designati[0])}>
                    Dichiara morte sul rogo
                  </button>
                )}
          </div>
        ) : (
          <div className="votazione__spareggio">
            <p>Spareggio tra: {designati.map((id) => giocatori.find((g) => g.id === id)?.nome).join(', ')}</p>
            <TimerSpareggio />
            {!morteConfermata &&
              (daConfermare ? (
                renderConferma(daConfermare)
              ) : (
                <div className="scelta-giocatore__chips" role="group" aria-label="Chi muore nello spareggio">
                  {designati.map((id) => (
                    <button key={id} type="button" className="chip" onClick={() => setDaConfermare(id)}>
                      {giocatori.find((g) => g.id === id)?.nome}
                    </button>
                  ))}
                </div>
              ))}
          </div>
        )}
        <button type="button" onClick={tornaAlVoto}>
          Torna al voto
        </button>
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
    </section>
  )
}
